// Adapted from Ink Bleed by Codemure (MIT License)
import type { Theme } from '../ui/theme';

/**
 * Full-document snapshots of the page in a given theme.
 *
 * We capture the whole document (not just the viewport) so a snapshot stays valid
 * while the user scrolls; the shader picks the visible window using the live scroll
 * offset. The theme is applied to html2canvas' *cloned* document via `onclone`, so the
 * live page never flickers during pre-capture.
 */

export interface Snapshot {
  theme: Theme;
  canvas: HTMLCanvasElement;
  /** Texture pixels per CSS pixel. */
  scale: number;
  /** Layout this snapshot is valid for; see {@link layoutKey}. */
  key: string;
  ms: number;
}

const BACKGROUND: Record<Theme, string> = {
  light: '#F2F1EC',
  dark: '#0D0D0D',
};

const MODERN_COLOR_RE = /oklab|oklch|color-mix/i;
const COLOR_PROPS = [
  'color',
  'backgroundColor',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
  'outlineColor',
  'textDecorationColor',
] as const;

/**
 * Tailwind v4 compiles opacity utilities (e.g. bg-noir/95, text-ivory/90) to
 * `color-mix(in oklab, ...)` / `oklab(...)`, which html2canvas@1.4.1 cannot parse.
 * Resolve only those computed values to `rgba(...)` on the cloned document so capture
 * succeeds cleanly without modifying the live page.
 */
function normalizeModernColors(doc: Document): void {
  const view = doc.defaultView;
  if (!view) return;

  const probe = doc.createElement('canvas');
  probe.width = 1;
  probe.height = 1;
  const ctx = probe.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  const cache = new Map<string, string>();
  const toRgba = (value: string): string => {
    const hit = cache.get(value);
    if (hit !== undefined) return hit;
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillStyle = value;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    const rgba = `rgba(${r}, ${g}, ${b}, ${+(a / 255).toFixed(3)})`;
    cache.set(value, rgba);
    return rgba;
  };

  doc.querySelectorAll<HTMLElement>('*').forEach((el) => {
    const cs = view.getComputedStyle(el);
    for (const prop of COLOR_PROPS) {
      const val = cs[prop];
      if (val && MODERN_COLOR_RE.test(val)) {
        el.style[prop] = toRgba(val);
      }
    }
    const bgImg = cs.backgroundImage;
    if (bgImg && MODERN_COLOR_RE.test(bgImg)) {
      el.style.backgroundImage = bgImg.replace(/(?:oklab|oklch)\([^)]+\)/gi, (match) => toRgba(match));
    }
  });
}

/**
 * html2canvas measures each font's baseline by appending a hidden <div> holding text plus a
 * 1x1 GIF <img> to the LIVE document body and reading the image's offsetTop. Tailwind's
 * preflight makes every img `display: block`, which pushes the probe image onto its own line,
 * so the measured baseline is a full line too low and every word in the snapshot is drawn
 * that much lower than on the page. Restore the inline layout the probe relies on.
 */
const FONT_PROBE_STYLE_ID = 'html2canvas-font-probe-fix';

function ensureFontProbeFix(): void {
  if (document.getElementById(FONT_PROBE_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = FONT_PROBE_STYLE_ID;
  style.textContent = 'body > div > img[src^="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP"]{display:inline!important}';
  document.head.appendChild(style);
}

/**
 * CSS animations frozen during the transition: everything except the live elements drawn
 * above the ink canvas and the hero ring, which keeps spinning (src/ui/liveRing.ts).
 */
export function pageCssAnimations(): CSSAnimation[] {
  if (typeof document.getAnimations !== 'function') return [];
  return document.getAnimations().filter((anim): anim is CSSAnimation => {
    if (!(anim instanceof CSSAnimation)) return false;
    const target = (anim.effect as KeyframeEffect | null)?.target;
    return !(target instanceof Element && target.closest('[data-ink-live], [data-ink-ring]'));
  });
}

/**
 * Frame of every CSS animation baked into the snapshots. The transition seeks the live page to
 * this same frame while the overlay is up, so the snapshot and the page match when it fades.
 */
export const SNAPSHOT_ANIMATION_TIME = 0;

const isCoarsePointer = (): boolean => window.matchMedia('(pointer: coarse)').matches;

/** Device-pixel ratio used for both the snapshots and the overlay canvas. */
export function renderScale(): number {
  const cap = isCoarsePointer() ? 1.5 : 2;
  return Math.min(window.devicePixelRatio || 1, cap);
}

export function documentSize(): { width: number; height: number } {
  const el = document.documentElement;
  return { width: el.clientWidth, height: Math.max(el.scrollHeight, el.clientHeight) };
}

/**
 * Identifies the layout a snapshot depends on. Viewport height is deliberately
 * excluded (mobile URL-bar show/hide changes it without reflowing the document).
 */
export function layoutKey(scale: number): string {
  const { width, height } = documentSize();
  return `${width}x${height}@${scale}`;
}

export async function capturePage(theme: Theme, scale: number, maxTextureSize: number): Promise<Snapshot> {
  const t0 = performance.now();
  const key = layoutKey(scale);
  const { width, height } = documentSize();

  // Never exceed what the GPU can hold; the shader handles scale != canvas DPR.
  const safeScale = Math.min(scale, maxTextureSize / width, maxTextureSize / height);

  // Lazy-loaded: html2canvas is ~200 KB and only needed after first paint.
  const { default: html2canvas } = await import('html2canvas');
  ensureFontProbeFix();

  // html2canvas clones the DOM synchronously inside this call, and for SVG elements it copies
  // the LIVE page's computed styles inline (fills like var(--noir), the ring's rotation...).
  // Setting data-theme on the clone can't recolour those, so the other theme's snapshot would
  // keep this theme's SVG colours. For that synchronous instant only, put the live page in the
  // target theme and every CSS animation on a fixed frame (shared by both snapshots), then
  // restore. Nothing is painted in between, so the swap is never visible.
  const root = document.documentElement;
  const liveTheme = root.dataset.theme;
  const swapTheme = liveTheme !== theme;
  let noTransitions: HTMLStyleElement | null = null;
  if (swapTheme) {
    // Keep the swap from starting colour transitions (Tailwind transition-colors etc.).
    noTransitions = document.createElement('style');
    noTransitions.textContent = '*,*::before,*::after{transition:none!important}';
    document.head.appendChild(noTransitions);
    root.dataset.theme = theme;
  }

  const anims = pageCssAnimations().filter((anim) => anim.currentTime !== null);
  const savedTimes = anims.map((anim) => anim.currentTime);
  anims.forEach((anim) => {
    anim.currentTime = SNAPSHOT_ANIMATION_TIME;
  });
  let rendering: Promise<HTMLCanvasElement>;
  try {
    rendering = html2canvas(document.body, {
      scale: safeScale,
      backgroundColor: BACKGROUND[theme],
      x: 0,
      y: 0,
      width,
      height,
      scrollX: 0,
      scrollY: 0,
      // The clone iframe renders without a scrollbar, so give it the live page's
      // scrollbar-less width; otherwise centred content shifts by half a scrollbar.
      windowWidth: width,
      windowHeight: document.documentElement.clientHeight,
      logging: false,
      useCORS: true,
      onclone: (doc) => {
        doc.documentElement.dataset.theme = theme;

        // Force every scroll-reveal element to its final visible state in the cloned document
        // only, and disable transitions/animations so html2canvas captures a clean static frame.
        const style = doc.createElement('style');
        style.textContent =
          '*,*::before,*::after{transition:none!important;animation:none!important}' +
          '[data-reveal]{opacity:1!important;transform:none!important;visibility:visible!important;filter:none!important}';
        doc.head.appendChild(style);

        doc.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
          el.style.setProperty('opacity', '1', 'important');
          el.style.setProperty('transform', 'none', 'important');
          el.style.setProperty('visibility', 'visible', 'important');
        });

        // Ensure below-the-fold lazy images render into full-document snapshots.
        doc.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
          img.loading = 'eager';
        });

        normalizeModernColors(doc);

        // Live elements above the ink canvas (navbar, grain) stay out of the snapshot.
        // `visibility` (not data-html2canvas-ignore) keeps their boxes in layout so nothing shifts.
        doc.querySelectorAll<HTMLElement>('[data-ink-live]').forEach((el) => {
          el.style.visibility = 'hidden';
        });

        // The hero ring bands are drawn live above the overlay during the transition
        // (src/ui/liveRing.ts), so leave them out of the still image. Removing SVG children
        // doesn't affect layout.
        doc.querySelectorAll('[data-ink-ring-band]').forEach((el) => el.remove());
      },
    });
  } finally {
    anims.forEach((anim, i) => {
      anim.currentTime = savedTimes[i];
    });
    if (swapTheme) {
      if (liveTheme === undefined) delete root.dataset.theme;
      else root.dataset.theme = liveTheme;
      // Recompute styles while transitions are still disabled, so restoring starts none either.
      void document.body.offsetHeight;
      noTransitions?.remove();
    }
  }
  const canvas = await rendering;

  return { theme, canvas, scale: safeScale, key, ms: performance.now() - t0 };
}
