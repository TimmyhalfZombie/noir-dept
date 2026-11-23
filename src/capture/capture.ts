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
  const canvas = await html2canvas(document.body, {
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
      normalizeModernColors(doc);
      // Live elements (navbar, grain, filtered images) stay out of the snapshot. `visibility`
      // (not data-html2canvas-ignore) keeps their boxes in layout so nothing shifts.
      doc.querySelectorAll<HTMLElement>('[data-ink-live]').forEach((el) => {
        el.style.visibility = 'hidden';
      });
    },
  });

  return { theme, canvas, scale: safeScale, key, ms: performance.now() - t0 };
}
