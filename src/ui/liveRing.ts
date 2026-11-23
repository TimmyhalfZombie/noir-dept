import type { Theme } from './theme';

const SVG_NS = 'http://www.w3.org/2000/svg';
/** Mask extent (viewBox units) so the ring's overflow past the SVG box is never clipped. */
const MASK_PAD = 4000;
let uid = 0;

export interface Point {
  x: number;
  y: number;
}

function svgEl<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number> = {},
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, String(value));
  return el;
}

/**
 * The ink overlay is a still snapshot, so anything under it stops moving. This keeps the
 * hero's orbiting ring alive during the transition: the ring bands are left out of the
 * snapshots (capture.ts), and a copy of them, locked to the real ring's animation clock, is
 * drawn just above the overlay. The copy is masked wherever the real ring is hidden on the
 * page (back half behind the core sphere, both halves behind the wordmark letters and the
 * faded descriptor), and its colours move to the new theme as the ink reaches it.
 *
 * Markup contract (PlanetaryRing / HomePage):
 *   svg[data-ink-ring]                     the ring SVG
 *   [data-ink-ring-band="back"|"front"]    the two ring halves
 *   circle[data-ink-ring-core]             the core sphere (occludes the back half)
 *   [data-ink-ring-occluder="text"]        element whose glyphs sit above the ring
 *   [data-ink-ring-occluder="box"]         opaque box above the ring, from
 *                                          `data-ink-ring-occluder-from` (0..1) of its height
 */
export class LiveRing {
  private themeTimer = 0;

  private constructor(
    private readonly layer: HTMLDivElement,
    private readonly root: SVGSVGElement,
    private readonly docCenter: Point,
  ) {}

  /** Builds the layer showing `theme` colours, or returns null when there is no ring. */
  static create(theme: Theme): LiveRing | null {
    const source = document.querySelector<SVGSVGElement>('svg[data-ink-ring]');
    const bands = source ? Array.from(source.querySelectorAll<SVGGElement>('[data-ink-ring-band]')) : [];
    if (!source || bands.length === 0) return null;

    const rect = source.getBoundingClientRect();
    const vb = source.viewBox.baseVal;
    if (!vb || vb.width === 0 || rect.width === 0) return null;
    // Same viewBox and box as the source SVG (aspect preserved), so one uniform scale.
    const scale = rect.width / vb.width;
    const toVb = (x: number, y: number): Point => ({
      x: vb.x + (x - rect.left) / scale,
      y: vb.y + (y - rect.top) / scale,
    });

    const id = ++uid;
    const root = svgEl('svg', {
      viewBox: `${vb.x} ${vb.y} ${vb.width} ${vb.height}`,
      fill: 'none',
      'aria-hidden': 'true',
    });
    root.classList.add('ink-live-ring');
    root.setAttribute('data-theme', theme);
    Object.assign(root.style, {
      left: `${rect.left + window.scrollX}px`,
      top: `${rect.top + window.scrollY}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });

    // ---- Occlusion masks (white = ring visible, black = hidden) ----
    const occluders = LiveRing.occluders(toVb, scale);
    const makeMask = (name: string, extra: SVGElement[] = []) => {
      const mask = svgEl('mask', {
        id: `ink-ring-${name}-${id}`,
        maskUnits: 'userSpaceOnUse',
        maskContentUnits: 'userSpaceOnUse',
        x: vb.x - MASK_PAD,
        y: vb.y - MASK_PAD,
        width: vb.width + MASK_PAD * 2,
        height: vb.height + MASK_PAD * 2,
      });
      mask.appendChild(
        svgEl('rect', {
          x: vb.x - MASK_PAD,
          y: vb.y - MASK_PAD,
          width: vb.width + MASK_PAD * 2,
          height: vb.height + MASK_PAD * 2,
          fill: '#fff',
        }),
      );
      for (const node of [...extra, ...occluders.map((o) => o.cloneNode(true) as SVGElement)]) {
        mask.appendChild(node);
      }
      return mask;
    };

    const core = source.querySelector<SVGCircleElement>('circle[data-ink-ring-core]');
    const coreMask: SVGElement[] = core
      ? [svgEl('circle', { cx: core.cx.baseVal.value, cy: core.cy.baseVal.value, r: core.r.baseVal.value, fill: '#000' })]
      : [];
    const defs = svgEl('defs');
    const frontMask = makeMask('front');
    const backMask = makeMask('back', coreMask);
    defs.append(frontMask, backMask);
    root.appendChild(defs);

    // ---- Ring bands (clip paths, fades and text path resolve to the source's defs) ----
    for (const band of bands) {
      const wrap = svgEl('g', {
        mask: `url(#${band.dataset.inkRingBand === 'back' ? backMask.id : frontMask.id})`,
      });
      wrap.appendChild(band.cloneNode(true));
      root.appendChild(wrap);
    }

    // The ring overflows its SVG box (on phones it is wider than the screen). On the page the
    // hero's overflow-hidden clips it; here a page-wide clipping layer does, so the copy can
    // never widen the document.
    const docEl = document.documentElement;
    const layer = document.createElement('div');
    layer.className = 'ink-live-ring-layer';
    // data-ink-live: never paused by the transition, never captured into a snapshot.
    layer.setAttribute('data-ink-live', '');
    layer.setAttribute('aria-hidden', 'true');
    Object.assign(layer.style, {
      width: `${docEl.clientWidth}px`,
      height: `${Math.max(docEl.scrollHeight, docEl.clientHeight)}px`,
    });
    layer.appendChild(root);
    document.body.appendChild(layer);
    LiveRing.syncClock(source, root);

    return new LiveRing(layer, root, {
      x: rect.left + window.scrollX + rect.width / 2,
      y: rect.top + window.scrollY + rect.height / 2,
    });
  }

  /** Centre of the ring in viewport CSS px. */
  center(): Point {
    return { x: this.docCenter.x - window.scrollX, y: this.docCenter.y - window.scrollY };
  }

  /** Switch the ring's colours to `theme` after `delayMs` (CSS transitions the change). */
  setTheme(theme: Theme, delayMs: number): void {
    window.clearTimeout(this.themeTimer);
    this.themeTimer = window.setTimeout(() => this.root.setAttribute('data-theme', theme), Math.max(0, delayMs));
  }

  remove(): void {
    window.clearTimeout(this.themeTimer);
    this.layer.remove();
  }

  /** Lock each copied spin animation to the source's, so both are always on the same frame. */
  private static syncClock(source: SVGSVGElement, copy: SVGSVGElement): void {
    const sourceSpins = Array.from(source.querySelectorAll('[data-ink-ring-band] .ring-spin'));
    const copySpins = Array.from(copy.querySelectorAll('.ring-spin'));
    sourceSpins.forEach((el, i) => {
      const from = el.getAnimations()[0];
      const to = copySpins[i]?.getAnimations()[0];
      if (!from || !to) return;
      if (from.playState === 'running' && from.startTime !== null) {
        to.startTime = from.startTime;
      } else {
        to.pause();
        to.currentTime = from.currentTime;
      }
    });
  }

  /** Black shapes (viewBox units) for every element drawn above the ring on the page. */
  private static occluders(toVb: (x: number, y: number) => Point, scale: number): SVGElement[] {
    const shapes: SVGElement[] = [];

    document.querySelectorAll<HTMLElement>('[data-ink-ring-occluder="text"]').forEach((el) => {
      const text = el.textContent?.trim();
      if (!text) return;
      const range = document.createRange();
      range.selectNodeContents(el);
      const box = range.getBoundingClientRect();
      // Baseline: an empty inline-block's bottom edge sits on it.
      const probe = document.createElement('span');
      probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
      el.appendChild(probe);
      const baseline = probe.getBoundingClientRect().top;
      probe.remove();

      const cs = getComputedStyle(el);
      const fontSize = parseFloat(cs.fontSize);
      const letterSpacing = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing);
      const origin = toVb(box.left, baseline);
      const node = svgEl('text', {
        x: origin.x,
        y: origin.y,
        fill: '#000',
        stroke: '#000',
        // Slightly fatter than the glyphs so no ring sliver shows along letter edges.
        'stroke-width': 2 / scale,
        'stroke-linejoin': 'round',
        'font-size': fontSize / scale,
        'font-weight': cs.fontWeight,
        'letter-spacing': letterSpacing / scale,
      });
      node.style.fontFamily = cs.fontFamily;
      node.style.fontStyle = cs.fontStyle;
      node.textContent = cs.textTransform === 'uppercase' ? text.toUpperCase() : text;
      shapes.push(node);
    });

    document.querySelectorAll<HTMLElement>('[data-ink-ring-occluder="box"]').forEach((el) => {
      const r = el.getBoundingClientRect();
      const from = Math.min(1, Math.max(0, parseFloat(el.dataset.inkRingOccluderFrom ?? '0') || 0));
      const a = toVb(r.left, r.top + r.height * from);
      const b = toVb(r.right, r.bottom);
      shapes.push(svgEl('rect', { x: a.x, y: a.y, width: b.x - a.x, height: b.y - a.y, fill: '#000' }));
    });

    return shapes;
  }
}
