// Adapted from Ink Bleed by Codemure (MIT License)
import gsap from 'gsap';
import { capturePage, documentSize, layoutKey, renderScale } from '../capture/capture';
import { inkParams } from '../gl/params';
import { InkRenderer, type InkFrame, type InkSource } from '../gl/renderer';
import { LiveFloat } from './liveFloat';
import { LiveRing } from './liveRing';
import { applyTheme, getTheme, otherTheme, type Theme } from './theme';
import { ThemeIcon } from './themeIcon';

export interface Point {
  x: number;
  y: number;
}

const EASE = 'power3.out';
const FADE_OUT = 0.35;
const RESIZE_DEBOUNCE_MS = 250;
const SCROLL_IDLE_MS = 300;
const IDLE_FALLBACK_MS = 200;
const IDLE_TIMEOUT_MS = 1500;
const ROUTE_CAPTURE_DELAY_MS = 320;
const IMAGE_WAIT_TIMEOUT_MS = 1500;
const RESIZE_THRESHOLD_PX = 2;
/** CSS cross-fade used without WebGL2, with reduced motion, or before snapshots are ready. */
const CSS_FADE_S = 0.45;

/**
 * Spread shape over time. `growth`: base radius at progress 1 relative to the farthest
 * corner. `cleanupFrom`: fraction of the (linear) duration after which a uniform extra
 * reach slowly eats whatever the noise left behind, so the page is fully covered exactly
 * at the end. `cleanupReach`: that extra reach at t = 1, relative to the farthest corner.
 */
export const SPREAD = { growth: 0.7, cleanupFrom: 0.45, cleanupReach: 0.4, cleanupPow: 2 };

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/** Everything needed to reproduce a transition exactly ("replay last click"). */
export interface ClickRecord {
  point: Point;
  seed: InkFrame['seed'];
  from: Theme;
}

const REPLAY_HOLD_MS = 400;

type ActiveFrame = Omit<InkFrame, 'progress' | 'radius' | 'time' | 'cleanup'>;

type IdleHandle =
  | { type: 'idle'; id: number }
  | { type: 'timeout'; id: number };

/**
 * Orchestrates the theme transition:
 *  1. keeps fresh snapshots of both themes on the GPU (pre-captured during idle time)
 *  2. on toggle, covers the page with the "from" image, flips the live DOM underneath and
 *     spreads the ink; wherever the ink has spread the overlay is transparent, so the real
 *     page (new theme, animations running) shows through. Page animations are never paused.
 *  3. if toggled mid-spread, freezes the frame on screen and spreads the next ink over it
 *  4. falls back to a CSS colour cross-fade without WebGL2, with reduced motion, or before
 *     snapshots are ready
 */
export class InkTransition {
  private readonly renderer: InkRenderer | null;
  private readonly toggleButton: HTMLButtonElement | null;
  private readonly icon: ThemeIcon | null;
  private readonly state = { progress: 0, time: 0 };
  private tween: gsap.core.Tween | null = null;
  private fade: gsap.core.Tween | null = null;
  private frame: ActiveFrame | null = null;
  private cssFadeTimer = 0;
  private replayTimer = 0;
  private last: ClickRecord | null = null;
  /** Live copy of the hero ring drawn above the overlay so it keeps orbiting. */
  private liveRing: LiveRing | null = null;
  /** Live copies of SMIL-animated SVG groups (e.g. orrery stars + labels) above the overlay. */
  private liveFloat: LiveFloat | null = null;
  /** Pending colour switches for `[data-ink-follow]` elements. */
  private followTimers: number[] = [];

  private captureGen = 0;
  private capturing = false;
  private captureQueued = false;
  private scheduleTimer = 0;
  private idleHandle: IdleHandle | null = null;
  private lastScrollAt = 0;
  private lastCapturedSize = documentSize();
  private destroyed = false;

  private readonly onResize: () => void;
  private readonly onScroll: () => void;
  private readonly onVisibilityChange: () => void;
  private readonly onReducedMotionChange: () => void;
  private readonly resizeObserver: ResizeObserver | null = null;

  constructor(canvas: HTMLCanvasElement, toggleButton: HTMLButtonElement | null, opts: { webgl?: boolean } = {}) {
    this.toggleButton = toggleButton;
    this.icon = toggleButton ? new ThemeIcon(toggleButton) : null;
    this.icon?.set(getTheme());

    this.onResize = () => {
      this.renderer?.resize(renderScale());
      if (this.frame) this.draw();
      if (this.hasSignificantSizeChange()) {
        this.scheduleCapture(RESIZE_DEBOUNCE_MS);
      }
    };
    this.onScroll = () => {
      this.lastScrollAt = performance.now();
      // Defer any pending idle capture until 300ms after scrolling stops.
      if (this.idleHandle || this.scheduleTimer) {
        this.cancelScheduledCapture();
        this.scheduleCapture(SCROLL_IDLE_MS);
      }
    };
    this.onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && this.captureQueued) {
        this.scheduleCapture(0);
      }
    };
    this.onReducedMotionChange = () => this.scheduleCapture(0);

    this.renderer = opts.webgl === false ? null : InkRenderer.create(canvas);
    if (!this.renderer) {
      document.documentElement.dataset.ink = 'css';
      return;
    }
    document.documentElement.dataset.ink = 'webgl';

    this.renderer.resize(renderScale());
    this.renderer.watchContext(
      () => this.cancel(),
      () => this.scheduleCapture(0),
    );

    window.addEventListener('resize', this.onResize);
    window.addEventListener('scroll', this.onScroll, { passive: true });
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    // Ignore sub-2px layout jitter from ResizeObserver; never recapture for < 2px changes.
    this.resizeObserver = new ResizeObserver(() => {
      if (!this.hasSignificantSizeChange()) return;
      this.captureQueued = true;
    });
    this.resizeObserver.observe(document.body);
    // Snapshots are skipped under reduced motion; take them if the preference is lifted.
    reducedMotion.addEventListener('change', this.onReducedMotionChange);

    void waitForAssetsReady().then(() => {
      if (!this.destroyed) {
        this.lastCapturedSize = documentSize();
        this.scheduleCapture(0);
      }
    });
  }

  get isWebGL(): boolean {
    return this.renderer !== null;
  }

  get isAnimating(): boolean {
    return this.frame !== null;
  }

  /** The most recent click, for "replay last click". */
  get lastClick(): ClickRecord | null {
    return this.last;
  }

  /**
   * Discards cached snapshots and re-captures after a route change once fonts and images settle.
   */
  invalidate(): void {
    if (this.destroyed) return;
    window.clearTimeout(this.replayTimer);
    this.cancelScheduledCapture();
    this.cancel();
    const gen = ++this.captureGen;
    this.captureQueued = false;
    this.renderer?.clearSnapshots();

    if (!this.renderer || this.renderer.isLost || reducedMotion.matches) return;

    void waitForAssetsReady().then(() => {
      if (this.destroyed || gen !== this.captureGen) return;
      this.lastCapturedSize = documentSize();
      this.scheduleCapture(ROUTE_CAPTURE_DELAY_MS);
    });
  }

  /** Cleans up listeners, observers, timers and animations when unmounted. */
  destroy(): void {
    this.destroyed = true;
    this.captureGen++;
    window.clearTimeout(this.replayTimer);
    window.clearTimeout(this.cssFadeTimer);
    this.cancelScheduledCapture();
    this.cancel();
    this.liveRing?.remove();
    this.liveRing = null;
    this.liveFloat?.remove();
    this.liveFloat = null;
    this.releaseFollowers();
    this.icon?.kill();
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('scroll', this.onScroll);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    reducedMotion.removeEventListener('change', this.onReducedMotionChange);
    this.resizeObserver?.disconnect();
  }

  /**
   * Toggle the theme, spreading from `point` (viewport CSS px) or from the toggle button.
   * `seed` reproduces a previous spread exactly.
   */
  toggle(point?: Point, seed?: InkFrame['seed']): void {
    window.clearTimeout(this.replayTimer);
    // The live DOM always holds the latest target, so this is right even mid-transition.
    const to = otherTheme(getTheme());
    const renderer = this.renderer;
    const scale = renderScale();
    const key = layoutKey(scale);
    const interrupting = this.frame !== null;

    const canAnimate =
      renderer !== null &&
      !renderer.isLost &&
      !reducedMotion.matches &&
      renderer.hasValid(to, key) &&
      (interrupting || renderer.hasValid(getTheme(), key));

    if (!canAnimate || !renderer) {
      this.cancel();
      this.crossFade(to);
      return;
    }

    // Never let a queued idle capture run while transitioning.
    this.cancelScheduledCapture();

    // Interrupted: freeze exactly what is on screen and spread the new ink over it.
    let from: InkSource = getTheme();
    if (interrupting) {
      this.tween?.kill();
      this.fade?.kill();
      this.tween = this.fade = null;
      renderer.resize(scale);
      const frozen = this.currentFrame();
      from = frozen && renderer.freeze(frozen) ? 'composite' : getTheme();
    }

    const center = point ?? this.toggleCenter();
    const maxDist = farthestCorner(center);
    const frameSeed = seed ?? randomSeed();
    this.last = { point: center, seed: frameSeed, from: otherTheme(to) };
    this.frame = { from, to, center, maxDist, seed: frameSeed };
    this.state.progress = 0;
    this.state.time = 0;

    const chromeFrom = this.icon?.readChrome();
    // Before applyTheme: pin [data-ink-follow] elements to the theme being covered.
    this.pinFollowers(otherTheme(to));
    renderer.resize(scale);
    this.draw();
    // Before applyTheme: the copy starts in the theme being covered (reused if interrupted).
    this.liveRing ??= LiveRing.create(otherTheme(to));
    this.liveFloat ??= LiveFloat.create(otherTheme(to));
    // Same task: the overlay (showing "from") and the flipped DOM hit the screen together.
    gsap.set(renderer.canvas, { opacity: 1 });
    renderer.canvas.classList.add('is-active');
    applyTheme(to, this.toggleButton);

    const duration = inkParams.duration;
    this.icon?.morphTo(to, {
      duration,
      ease: EASE,
      timeScale: inkParams.timeScale,
      chromeFrom,
      chromeDelay: this.inkArrival(center, maxDist, this.toggleCenter()) * duration,
    });
    this.liveRing?.setTheme(
      to,
      (this.inkArrival(center, maxDist, this.liveRing.center()) * duration * 1000) / inkParams.timeScale,
    );
    this.followInk(to, center, maxDist, duration);

    this.tween = gsap.to(this.state, {
      progress: 1,
      duration,
      ease: EASE,
      onUpdate: () => {
        // Tween-local seconds: slow motion slows the drift too, so it looks identical.
        this.state.time = this.tween?.time() ?? 0;
        this.draw();
      },
      onComplete: () => this.finish(),
    });
    this.tween.timeScale(inkParams.timeScale);
  }

  /**
   * Re-run the last click: snap back to the theme it started from, hold briefly (a clean
   * first frame for the recording), then spread again with the same point and seed.
   */
  replay(): boolean {
    const last = this.last;
    if (!last) return false;
    window.clearTimeout(this.replayTimer);
    this.cancel();
    this.icon?.kill();
    if (getTheme() !== last.from) {
      applyTheme(last.from, this.toggleButton);
      this.icon?.set(last.from);
    }
    this.replayTimer = window.setTimeout(() => this.toggle(last.point, last.seed), REPLAY_HOLD_MS);
    return true;
  }

  /** Live playback rate (slow motion), applied to a running transition too. */
  setTimeScale(scale: number): void {
    inkParams.timeScale = scale;
    this.tween?.timeScale(scale);
    this.fade?.timeScale(scale);
    this.icon?.setTimeScale(scale);
  }

  private currentFrame(): InkFrame | null {
    if (!this.frame) return null;
    const { progress, time } = this.state;
    const { maxDist } = this.frame;
    const linear = Math.min(1, time / inkParams.duration);
    const ramp = Math.max(0, (linear - SPREAD.cleanupFrom) / (1 - SPREAD.cleanupFrom));
    // Second term only acts in the last ~3% (≈40ms): a guarantee for unlucky seeds so the
    // final frame is exactly the "to" snapshot before the fade (measured residual is 0).
    const cleanup =
      ramp ** SPREAD.cleanupPow * maxDist * SPREAD.cleanupReach + Math.max(0, (linear - 0.97) / 0.03) * maxDist;
    return { ...this.frame, progress, time, radius: progress * maxDist * SPREAD.growth, cleanup };
  }

  private draw(): void {
    const frame = this.currentFrame();
    const renderer = this.renderer;
    if (!renderer || !frame) return;
    renderer.draw(frame);
    // Switch live float copies exactly where the ink has spread in the frame just drawn.
    this.liveFloat?.followInk(frame.to, (x, y) => renderer.alphaAt(x, y) < 0.5);
  }

  private finish(): void {
    const canvas = this.renderer?.canvas;
    this.tween = null;
    if (!canvas) return;
    this.fade = gsap
      .to(canvas, { opacity: 0, duration: FADE_OUT, ease: 'none', onComplete: () => this.hide() })
      .timeScale(inkParams.timeScale);
  }

  private hide(): void {
    this.fade = null;
    this.frame = null;
    this.renderer?.canvas.classList.remove('is-active');
    // The real ring kept spinning underneath on the same clock, so swapping back is seamless.
    this.liveRing?.remove();
    this.liveRing = null;
    this.liveFloat?.remove();
    this.liveFloat = null;
    this.releaseFollowers();
    // Refresh snapshots after theme change completion if needed or queued.
    if (!this.destroyed && this.renderer && !reducedMotion.matches) {
      const key = layoutKey(renderScale());
      const needsCapture =
        this.captureQueued ||
        !this.renderer.hasValid('light', key) ||
        !this.renderer.hasValid('dark', key);
      if (needsCapture) {
        this.scheduleCapture(0);
      }
    }
  }

  private cancel(): void {
    if (!this.frame) return;
    this.tween?.kill();
    this.fade?.kill();
    this.tween = null;
    this.hide();
  }

  // ---------- Live elements that follow the ink ----------
  //
  // Elements above the overlay (navbar) flip theme instantly, which can leave them on a
  // background still showing the old theme. `[data-ink-follow]` elements instead keep the
  // old theme's colours (a data-theme attribute re-scopes the CSS colour variables) until the
  // ink front reaches their centre, then switch; their own CSS transition eases the change.

  private pinFollowers(from: Theme): void {
    document.querySelectorAll<HTMLElement>('[data-ink-follow]').forEach((el) => {
      // Mid-transition re-toggle: keep whatever the element is showing right now.
      if (!el.hasAttribute('data-theme')) el.setAttribute('data-theme', from);
    });
  }

  private followInk(to: Theme, center: Point, maxDist: number, duration: number): void {
    this.followTimers.forEach((t) => window.clearTimeout(t));
    this.followTimers = [];
    document.querySelectorAll<HTMLElement>('[data-ink-follow]').forEach((el) => {
      const r = el.getBoundingClientRect();
      const at = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      const delayMs = (this.inkArrival(center, maxDist, at) * duration * 1000) / inkParams.timeScale;
      this.followTimers.push(window.setTimeout(() => el.setAttribute('data-theme', to), delayMs));
    });
  }

  private releaseFollowers(): void {
    this.followTimers.forEach((t) => window.clearTimeout(t));
    this.followTimers = [];
    // Back to inheriting the (already applied) page theme.
    document.querySelectorAll('[data-ink-follow][data-theme]').forEach((el) => el.removeAttribute('data-theme'));
  }

  /** Plain CSS colour transition (no WebGL2, reduced motion, or snapshots not ready yet). */
  private crossFade(to: Theme): void {
    const root = document.documentElement;
    const motion = !reducedMotion.matches;
    root.classList.add('theme-fade');
    root.style.setProperty('--theme-fade', `${CSS_FADE_S}s`);
    applyTheme(to, this.toggleButton);
    if (motion) {
      this.icon?.morphTo(to, { duration: CSS_FADE_S * 1.6, ease: 'power2.inOut', timeScale: 1 });
    } else {
      this.icon?.set(to);
    }
    window.clearTimeout(this.cssFadeTimer);
    this.cssFadeTimer = window.setTimeout(() => {
      root.classList.remove('theme-fade');
      if (!this.destroyed && this.renderer && !reducedMotion.matches) {
        this.scheduleCapture(0);
      }
    }, CSS_FADE_S * 1000 + 50);
  }

  /**
   * Fraction of the duration at which the base ink front reaches `target` (the eased
   * radius inverted; slightly early, since the noise lets the front lead).
   */
  private inkArrival(center: Point, maxDist: number, target: Point): number {
    const dist = Math.hypot(target.x - center.x, target.y - center.y);
    if (dist < 28) return 0;
    const p = Math.min(1, dist / (maxDist * SPREAD.growth * 1.15));
    // Inverse of power3.out, capped: the end-of-spread cleanup sweeps the last corners by ~85%.
    return Math.min(0.85, 1 - Math.cbrt(1 - p));
  }

  private toggleCenter(): Point {
    const r = this.toggleButton?.getBoundingClientRect();
    if (!r) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  // ---------- Capture scheduling ----------

  private hasSignificantSizeChange(): boolean {
    const next = documentSize();
    const dw = Math.abs(next.width - this.lastCapturedSize.width);
    const dh = Math.abs(next.height - this.lastCapturedSize.height);
    return dw >= RESIZE_THRESHOLD_PX || dh >= RESIZE_THRESHOLD_PX;
  }

  private cancelScheduledCapture(): void {
    window.clearTimeout(this.scheduleTimer);
    this.scheduleTimer = 0;
    if (this.idleHandle) {
      if (this.idleHandle.type === 'idle' && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(this.idleHandle.id);
      } else if (this.idleHandle.type === 'timeout') {
        window.clearTimeout(this.idleHandle.id);
      }
      this.idleHandle = null;
    }
  }

  private scheduleCapture(delay: number): void {
    if (this.destroyed || !this.renderer || reducedMotion.matches) return;
    this.cancelScheduledCapture();

    const enqueueIdle = () => {
      this.scheduleTimer = 0;
      if (this.destroyed) return;
      if (typeof window.requestIdleCallback === 'function') {
        const id = window.requestIdleCallback(
          () => {
            this.idleHandle = null;
            void this.captureAll();
          },
          { timeout: IDLE_TIMEOUT_MS },
        );
        this.idleHandle = { type: 'idle', id };
      } else {
        const id = window.setTimeout(() => {
          this.idleHandle = null;
          void this.captureAll();
        }, IDLE_FALLBACK_MS);
        this.idleHandle = { type: 'timeout', id };
      }
    };

    if (delay > 0) {
      this.scheduleTimer = window.setTimeout(enqueueIdle, delay);
    } else {
      enqueueIdle();
    }
  }

  private async captureAll(): Promise<void> {
    const renderer = this.renderer;
    if (this.destroyed || !renderer || renderer.isLost || reducedMotion.matches) return;

    // Never capture while the tab/page is hidden.
    if (document.visibilityState !== 'visible') {
      this.captureQueued = true;
      return;
    }

    // Never capture while the user is scrolling; wait 300ms after the last scroll event.
    const sinceScroll = performance.now() - this.lastScrollAt;
    if (this.lastScrollAt > 0 && sinceScroll < SCROLL_IDLE_MS) {
      this.captureQueued = true;
      this.scheduleCapture(Math.ceil(SCROLL_IDLE_MS - sinceScroll));
      return;
    }

    // Capturing blocks the main thread; never do it mid-animation (or mid CSS fade, which
    // would bake half-transitioned colours into the snapshot).
    if (
      this.capturing ||
      this.frame ||
      document.documentElement.classList.contains('theme-fade')
    ) {
      this.captureQueued = true;
      return;
    }

    const scale = renderScale();
    const key = layoutKey(scale);
    const current = getTheme();
    const themes: Theme[] = [current, otherTheme(current)].filter((t) => !renderer.hasValid(t, key));
    this.captureQueued = false;
    if (themes.length === 0) return;

    const gen = ++this.captureGen;
    this.capturing = true;
    try {
      for (const theme of themes) {
        // Re-check visibility, scroll, and transition state before capturing the second theme.
        if (
          this.destroyed ||
          gen !== this.captureGen ||
          document.visibilityState !== 'visible' ||
          this.frame
        ) {
          this.captureQueued = true;
          return;
        }
        if (this.lastScrollAt > 0 && performance.now() - this.lastScrollAt < SCROLL_IDLE_MS) {
          this.captureQueued = true;
          return;
        }

        const snap = await capturePage(theme, scale, renderer.maxTextureSize);
        if (this.destroyed || gen !== this.captureGen) return;
        if (snap.key !== layoutKey(renderScale())) {
          // Layout changed while capturing; this snapshot is already stale.
          this.captureQueued = true;
          break;
        }
        renderer.upload(snap);
        this.lastCapturedSize = documentSize();
        if (import.meta.env.DEV) {
          console.debug(
            `[ink] captured ${theme} ${snap.canvas.width}×${snap.canvas.height} in ${snap.ms.toFixed(0)}ms`,
          );
        }

        // Yield between the two theme captures via idle callback / macrotask so input stays responsive.
        if (themes.length > 1 && theme === themes[0]) {
          await yieldToIdle();
        }
      }
    } catch (err) {
      console.error('[ink] capture failed', err);
    } finally {
      this.capturing = false;
    }
    if (!this.destroyed && this.captureQueued) {
      const wait =
        this.lastScrollAt > 0
          ? Math.max(RESIZE_DEBOUNCE_MS, Math.ceil(SCROLL_IDLE_MS - (performance.now() - this.lastScrollAt)))
          : RESIZE_DEBOUNCE_MS;
      this.scheduleCapture(wait);
    }
  }
}

function yieldToIdle(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(() => resolve(), { timeout: 400 });
    } else {
      window.setTimeout(resolve, 60);
    }
  });
}

async function waitForAssetsReady(): Promise<void> {
  await document.fonts.ready;

  // Warm any same-origin images (including below-the-fold lazy images) so full-document
  // snapshots include every product and portrait image cleanly.
  const urls = new Set<string>();
  const pending: Promise<void>[] = [];

  for (const img of Array.from(document.images)) {
    const src = img.currentSrc || img.getAttribute('src') || '';
    if (!src || src.startsWith('data:')) continue;
    if (img.complete && img.naturalWidth > 0) continue;

    if (img.loading === 'lazy') {
      if (urls.has(src)) continue;
      urls.add(src);
      pending.push(
        new Promise<void>((resolve) => {
          const probe = new Image();
          probe.onload = () => resolve();
          probe.onerror = () => resolve();
          probe.src = src;
        }),
      );
    } else {
      pending.push(
        new Promise<void>((resolve) => {
          const done = () => {
            img.removeEventListener('load', done);
            img.removeEventListener('error', done);
            resolve();
          };
          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
        }),
      );
    }
  }

  if (pending.length === 0) return;
  await Promise.race([
    Promise.all(pending),
    new Promise<void>((resolve) => window.setTimeout(resolve, IMAGE_WAIT_TIMEOUT_MS)),
  ]);
}

function farthestCorner(p: Point): number {
  const w = document.documentElement.clientWidth;
  const h = document.documentElement.clientHeight;
  return Math.max(Math.hypot(p.x, p.y), Math.hypot(w - p.x, p.y), Math.hypot(p.x, h - p.y), Math.hypot(w - p.x, h - p.y)) + 4;
}

function randomSeed(): InkFrame['seed'] {
  return { x: Math.random() * 64 - 32, y: Math.random() * 64 - 32, angle: Math.random() * Math.PI * 2 };
}
