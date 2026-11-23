#!/usr/bin/env node
/**
 * NOIR DEPT. favicon set: "orbit globe" (blank globe, tilted orbit ring, four-point star).
 *
 * Generates, into this folder (/public):
 *   favicon.svg            transparent, switches #0D0D0D / #E5E5E1 with prefers-color-scheme
 *   favicon-16.png         badge, optically thicker strokes
 *   favicon-32.png         badge
 *   apple-touch-icon.png   180×180, square (iOS rounds it)
 *   icon-192.png, icon-512.png
 *   favicon.ico            16×16 + 32×32 (PNG-compressed entries, from the badge PNGs)
 *   favicon-preview.html   the icons on white, #202124 and black tabs
 *
 * Usage (sharp isn't a project dependency, so install it without saving):
 *   npm i --no-save sharp
 *   node public/generate-favicons.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const OUT = __dirname;
const DARK = '#0D0D0D';
const LIGHT = '#E5E5E1';

// ---- Geometry (64-unit space; the output viewBox is cropped around it) ----
const GLOBE = { cx: 32, cy: 32, r: 15 };
// The ring is the widest part and sets the icon's scale: kept close to the globe so the
// globe can be drawn as large as possible in a 16px tab.
const RING = { cx: 32, cy: 32, rx: 22, ry: 7.5, rotate: -20 };
const STAR = { cx: 46.5, cy: 15.5, halfH: 6.5, halfW: 5, inset: 1.2 }; // 13 tall; inset = concavity
const STROKE = 3.5;
/** Gap cut around a shape where another passes in front of it (each side). */
const GAP = 1.5;

const ringTransform = `rotate(${RING.rotate} ${RING.cx} ${RING.cy})`;
const left = `${RING.cx - RING.rx} ${RING.cy}`;
const right = `${RING.cx + RING.rx} ${RING.cy}`;
// Clockwise from the left end passes over the top (back); from the right end, under (front).
const RING_BACK = `M${left}A${RING.rx} ${RING.ry} 0 0 1 ${right}`;
const RING_FRONT = `M${right}A${RING.rx} ${RING.ry} 0 0 1 ${left}`;

const { cx: sx, cy: sy, halfH: a, halfW: b, inset: k } = STAR;
// Concave four-point star: each side is a curve pulled in towards the centre.
const STAR_PATH =
  `M${sx} ${sy - a}Q${sx + k} ${sy - k} ${sx + b} ${sy}` +
  `Q${sx + k} ${sy + k} ${sx} ${sy + a}` +
  `Q${sx - k} ${sy + k} ${sx - b} ${sy}` +
  `Q${sx - k} ${sy - k} ${sx} ${sy - a}Z`;

/**
 * The icon artwork in the 64-unit space. `paint` is either CSS classes (favicon.svg) or
 * fixed colours (badges); `stroke` lets the 16px badge use optically thicker lines.
 */
function artwork({ stroke = STROKE, strokeAttr, fillAttr, idPrefix = '' }) {
  const id = (name) => `${idPrefix}${name}`;
  const cut = stroke + GAP * 2;
  return `
  <defs>
    <mask id="${id('ring-back')}" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
      <rect width="64" height="64" fill="#fff"/>
      <circle cx="${GLOBE.cx}" cy="${GLOBE.cy}" r="${GLOBE.r}" fill="#000"/>
      <path d="${STAR_PATH}" fill="#000" stroke="#000" stroke-width="${GAP * 2}" stroke-linejoin="round"/>
    </mask>
    <mask id="${id('globe-gap')}" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
      <rect width="64" height="64" fill="#fff"/>
      <path d="${RING_FRONT}" transform="${ringTransform}" fill="none" stroke="#000" stroke-width="${cut}" stroke-linecap="round"/>
    </mask>
  </defs>
  <g mask="url(#${id('ring-back')})">
    <path ${strokeAttr} d="${RING_BACK}" transform="${ringTransform}" stroke-width="${stroke}" stroke-linecap="round"/>
  </g>
  <g mask="url(#${id('globe-gap')})">
    <circle ${strokeAttr} cx="${GLOBE.cx}" cy="${GLOBE.cy}" r="${GLOBE.r}" stroke-width="${stroke}" stroke-linecap="round"/>
  </g>
  <path ${strokeAttr} d="${RING_FRONT}" transform="${ringTransform}" stroke-width="${stroke}" stroke-linecap="round"/>
  <path ${fillAttr} d="${STAR_PATH}"/>`;
}

// ---- favicon.svg: transparent, colour follows the browser's light/dark scheme ----
/**
 * Square viewBox centred on the globe (the icon's visual centre, so it doesn't sit low next
 * to the tab title), just large enough to hold the whole artwork plus a small margin.
 */
function tightViewBox(margin = 0.5) {
  const half = halfExtentFromGlobe(STROKE) + margin;
  return [GLOBE.cx - half, GLOBE.cy - half, half * 2, half * 2].map((v) => +v.toFixed(2)).join(' ');
}

const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${tightViewBox()}">
  <style>
    .stroke { fill: none; stroke: ${DARK}; }
    .fill { fill: ${DARK}; }
    @media (prefers-color-scheme: dark) {
      .stroke { stroke: ${LIGHT}; }
      .fill { fill: ${LIGHT}; }
    }
  </style>${artwork({ strokeAttr: 'class="stroke"', fillAttr: 'class="fill"' })}
</svg>
`;

// ---- Badge (PNG/ICO source): solid #0D0D0D square, icon in #E5E5E1 with ~8% padding ----
/** Bounding box of the artwork (incl. stroke) in 64-unit space, used to centre and scale it. */
function artworkBounds(stroke) {
  const t = (RING.rotate * Math.PI) / 180;
  const halfW = Math.hypot(RING.rx * Math.cos(t), RING.ry * Math.sin(t)) + stroke / 2;
  const halfH = Math.hypot(RING.rx * Math.sin(t), RING.ry * Math.cos(t)) + stroke / 2;
  const x0 = Math.min(RING.cx - halfW, GLOBE.cx - GLOBE.r - stroke / 2, sx - b);
  const x1 = Math.max(RING.cx + halfW, GLOBE.cx + GLOBE.r + stroke / 2, sx + b);
  const y0 = Math.min(RING.cy - halfH, GLOBE.cy - GLOBE.r - stroke / 2, sy - a);
  const y1 = Math.max(RING.cy + halfH, GLOBE.cy + GLOBE.r + stroke / 2, sy + a);
  return { x0, y0, w: x1 - x0, h: y1 - y0 };
}

/** Largest distance from the globe's centre to any edge of the artwork. */
function halfExtentFromGlobe(stroke) {
  const box = artworkBounds(stroke);
  return Math.max(
    GLOBE.cx - box.x0,
    box.x0 + box.w - GLOBE.cx,
    GLOBE.cy - box.y0,
    box.y0 + box.h - GLOBE.cy,
  );
}

function badgeSvg(size, { stroke = STROKE, rounded = true } = {}) {
  const PAD = 0.08; // padding each side, as a fraction of the badge size
  // Centred on the globe, like favicon.svg.
  const scale = (size * (1 - PAD * 2)) / (halfExtentFromGlobe(stroke) * 2);
  const tx = size / 2 - GLOBE.cx * scale;
  const ty = size / 2 - GLOBE.cy * scale;
  const radius = rounded ? size * 0.22 : 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${DARK}"/>
  <g transform="translate(${tx.toFixed(3)} ${ty.toFixed(3)}) scale(${scale.toFixed(5)})">${artwork({
    stroke,
    strokeAttr: `fill="none" stroke="${LIGHT}"`,
    fillAttr: `fill="${LIGHT}"`,
  })}
  </g>
</svg>`;
}

const PNGS = [
  // 16px: thicker strokes so ring, globe and star don't blur together.
  { file: 'favicon-16.png', size: 16, stroke: 5 },
  { file: 'favicon-32.png', size: 32 },
  { file: 'apple-touch-icon.png', size: 180, rounded: false },
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
];

/** ICO container with PNG-compressed images (supported by every browser that reads .ico). */
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  const entries = [];
  let offset = 6 + 16 * images.length;
  for (const { size, data } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(e);
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

function previewHtml() {
  const svgFor = (scheme) =>
    'data:image/svg+xml;base64,' +
    Buffer.from(
      FAVICON_SVG.replace('@media (prefers-color-scheme: dark)', scheme === 'dark' ? '@media all' : '@media not all'),
    ).toString('base64');
  const variants = [
    { label: 'favicon.svg (light scheme)', src: () => svgFor('light') },
    { label: 'favicon.svg (dark scheme)', src: () => svgFor('dark') },
    { label: 'PNG badge', src: (s) => (s === 16 ? 'favicon-16.png' : s === 32 ? 'favicon-32.png' : 'icon-192.png') },
  ];
  const tabs = [
    { name: 'White tab', bg: '#FFFFFF', fg: '#1F1F1F' },
    { name: 'Dark-gray tab (#202124)', bg: '#202124', fg: '#E8EAED' },
    { name: 'Black tab', bg: '#000000', fg: '#E8EAED' },
  ];
  const rows = tabs
    .map(
      (tab) => `
  <section>
    <h2>${tab.name}</h2>
    ${variants
      .map(
        (v) => `
    <div class="variant"><span class="label">${v.label}</span>
      ${[16, 32, 64]
        .map(
          (s) => `<div class="tab" style="background:${tab.bg};color:${tab.fg}"><img src="${v.src(s)}" width="${s}" height="${s}" alt=""><span>NOIR DEPT.</span><em>${s}px</em></div>`,
        )
        .join('\n      ')}
    </div>`,
      )
      .join('')}
  </section>`,
    )
    .join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>NOIR DEPT. favicon preview</title>
<style>
  body { margin: 0; padding: 32px; background: #ECECEC; font: 13px/1.4 system-ui, sans-serif; color: #222; }
  h1 { font-size: 16px; margin: 0 0 4px; }
  p { margin: 0 0 24px; color: #555; }
  section { margin-bottom: 28px; }
  h2 { font-size: 13px; margin: 0 0 10px; }
  .variant { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
  .label { width: 190px; color: #555; }
  .tab { display: flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 8px 8px 0 0; min-width: 150px; }
  .tab img { display: block; }
  .tab em { margin-left: auto; font-style: normal; opacity: .55; font-size: 11px; }
</style>
</head>
<body>
<h1>NOIR DEPT. favicon preview</h1>
<p>Browsers pick the SVG's colour from the browser/OS colour scheme (not the tab colour), so both schemes are shown on every tab. Safari and older browsers use the PNG badge.</p>
${rows}
</body>
</html>
`;
}

async function main() {
  fs.writeFileSync(path.join(OUT, 'favicon.svg'), FAVICON_SVG);
  const rendered = {};
  for (const { file, size, stroke, rounded } of PNGS) {
    const svg = badgeSvg(size, { stroke, rounded });
    // Render at 4× then downsample for clean anti-aliasing at small sizes.
    const data = await sharp(Buffer.from(svg), { density: 72 * 4 })
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toBuffer();
    fs.writeFileSync(path.join(OUT, file), data);
    rendered[size] = data;
    console.log(`wrote ${file}`);
  }
  fs.writeFileSync(
    path.join(OUT, 'favicon.ico'),
    buildIco([
      { size: 16, data: rendered[16] },
      { size: 32, data: rendered[32] },
    ]),
  );
  console.log('wrote favicon.ico (16, 32)');
  fs.writeFileSync(path.join(OUT, 'favicon-preview.html'), previewHtml());
  console.log('wrote favicon.svg, favicon-preview.html');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
