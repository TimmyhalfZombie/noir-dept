import type { Theme } from './theme';

const FLOAT = '[data-ink-float]';

/**
 * Keeps SMIL-animated SVG pieces (e.g. the Services orrery's travelling stars and their
 * 01/02/03 labels) correct while the ink overlay shows the old-theme snapshot.
 *
 * In the snapshot html2canvas renders an SVG as a still image: SMIL animations restart at
 * their first frame and text can't use the page's web fonts, so those pieces would jump and
 * change font at the click. Instead, `[data-ink-float]` groups are left out of the snapshot
 * (capture.ts) and, during the transition, a live copy of their SVG containing only those
 * groups is drawn just above the overlay, on the same SMIL clock as the original. Each group
 * switches to the new theme the moment the ink actually covers it (see followInk), with no
 * fade, so it changes together with the page around it.
 */
export class LiveFloat {
  private constructor(
    private readonly layer: HTMLDivElement,
    private readonly groups: SVGGElement[],
  ) {}

  /** Builds the copies showing `theme` colours, or null when the page has no float groups. */
  static create(theme: Theme): LiveFloat | null {
    const sources = Array.from(document.querySelectorAll<SVGSVGElement>('svg')).filter(
      (svg) => svg.querySelector(FLOAT) && !svg.closest('[data-ink-live]'),
    );
    if (sources.length === 0) return null;

    const docEl = document.documentElement;
    const layer = document.createElement('div');
    layer.className = 'ink-live-ring-layer';
    // data-ink-live: never captured into a snapshot.
    layer.setAttribute('data-ink-live', '');
    layer.setAttribute('aria-hidden', 'true');
    Object.assign(layer.style, {
      width: `${docEl.clientWidth}px`,
      height: `${Math.max(docEl.scrollHeight, docEl.clientHeight)}px`,
    });

    const copies: SVGSVGElement[] = [];
    for (const source of sources) {
      const rect = source.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      const copy = source.cloneNode(true) as SVGSVGElement;
      LiveFloat.keepOnlyFloats(copy);
      LiveFloat.shiftClock(copy, source);
      copy.removeAttribute('class');
      copy.classList.add('ink-live-float');
      // Each group carries its own theme (a data-theme attribute scopes the colour variables).
      copy.querySelectorAll(FLOAT).forEach((group) => group.setAttribute('data-theme', theme));
      Object.assign(copy.style, {
        left: `${rect.left + window.scrollX}px`,
        top: `${rect.top + window.scrollY}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        // Same clipping as the original (an inline SVG clips to its own box).
        overflow: 'hidden',
      });
      layer.appendChild(copy);
      copies.push(copy);
    }
    if (copies.length === 0) return null;

    document.body.appendChild(layer);
    copies.forEach((copy, i) => {
      try {
        // Paused originals (off-screen / reduced motion) stay still; so does the copy.
        if (sources[i].animationsPaused()) copy.pauseAnimations();
      } catch {
        // SMIL control unsupported
      }
    });

    const groups = copies.flatMap((copy) => Array.from(copy.querySelectorAll<SVGGElement>(FLOAT)));
    return new LiveFloat(layer, groups);
  }

  /**
   * Call after every overlay frame: switches each group that the ink now covers to `to`.
   * `isInked(x, y)` tells whether the ink has spread at a viewport point (CSS px).
   * Groups never switch back, so an interrupted transition keeps what's on screen.
   */
  followInk(to: Theme, isInked: (x: number, y: number) => boolean): void {
    for (const group of this.groups) {
      if (group.getAttribute('data-theme') === to) continue;
      const r = group.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      if (isInked(r.left + r.width / 2, r.top + r.height / 2)) group.setAttribute('data-theme', to);
    }
  }

  remove(): void {
    this.layer.remove();
  }

  /**
   * Start the copy's animations where the original's are now. A freshly inserted SVG's clock
   * starts at 0 (and a setCurrentTime() made before it has started can be dropped), so
   * instead each copied animation's `begin` is moved back by the original's elapsed time:
   * at the copy's time 0 it is exactly where the original is, and both advance together.
   */
  private static shiftClock(copy: SVGSVGElement, source: SVGSVGElement): void {
    let elapsed = 0;
    try {
      elapsed = source.getCurrentTime();
    } catch {
      return;
    }
    copy.querySelectorAll('animate, animateMotion, animateTransform, set').forEach((anim) => {
      const begin = anim.getAttribute('begin') ?? '0s';
      const seconds = /^\s*(-?\d*\.?\d+)\s*(ms|s)?\s*$/.exec(begin);
      if (!seconds) return; // event/syncbase begins: leave as is
      const value = parseFloat(seconds[1]) * (seconds[2] === 'ms' ? 0.001 : 1);
      anim.setAttribute('begin', `${(value - elapsed).toFixed(3)}s`);
    });
  }

  /** Strip everything from the copy except <defs> and the float groups (and their ancestors). */
  private static keepOnlyFloats(node: Element): void {
    for (const child of Array.from(node.children)) {
      if (child.tagName.toLowerCase() === 'defs' || child.matches(FLOAT)) continue;
      if (child.querySelector(FLOAT)) {
        LiveFloat.keepOnlyFloats(child);
      } else {
        child.remove();
      }
    }
  }
}
