import { useId, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useMotionVisibility } from '../../hooks/useMotionVisibility';

/**
 * "Woven label" founder portrait with a stitched orbit wrapping around it.
 *
 * Everything lives in one stage with a fixed 580:700 aspect ratio. HTML pieces are placed in
 * percentages of that stage and both SVG layers share viewBox 0 0 580 700, so the frame, the
 * tag and the orbit stay aligned at any size.
 *
 * Layering (bottom to top): back SVG (full orbit + star), photo frame, front SVG (orbit + star
 * clipped to the lower half of the ellipse AND the photo), woven tag + caption. The orbit
 * therefore passes behind the photo at the top and in front of it at the bottom.
 *
 * Vertical text is rotated with transforms (not writing-mode) so the ink theme transition's
 * html2canvas snapshot renders it correctly.
 */

// ---- Stage geometry (viewBox units) ----
const VB_W = 580;
const VB_H = 700;
/** Design reference: the stage is 520px wide on desktop; 1px there = PX viewBox units. */
const REF_W = 520;
const PX = VB_W / REF_W;

const PHOTO = { x: 96, y: 52, w: 400, h: 500 }; // 4:5
const OFFSET = 16 * PX; // offset frame shift (right + down)
const CROP_GAP = 14 * PX; // crop marks: distance from the photo corner
const CROP_LEN = 20 * PX; // crop marks: arm length
const STITCH_INSET = 12; // px, inner stitch line

const TAG = {
  w: 66 * PX,
  h: 206 * PX,
  x: PHOTO.x + PHOTO.w - 66 * PX * 0.6, // overlaps the photo's right edge
  y: PHOTO.y + PHOTO.h * 0.28,
};

const SIDE_TEXT = { cx: 52, top: PHOTO.y, length: PHOTO.h * 0.55 };
const CAPTION_TOP = 596;

const ORBIT = {
  cx: PHOTO.x + PHOTO.w / 2,
  cy: PHOTO.y + PHOTO.h * 0.62,
  rx: 270,
  ry: 78,
  tilt: -14,
};
const ORBIT_PATH = `M ${ORBIT.rx} 0 A ${ORBIT.rx} ${ORBIT.ry} 0 1 1 ${-ORBIT.rx} 0 A ${ORBIT.rx} ${ORBIT.ry} 0 1 1 ${ORBIT.rx} 0`;
const ORBIT_TRANSFORM = `translate(${ORBIT.cx} ${ORBIT.cy}) rotate(${ORBIT.tilt})`;
const STAR_PATH = 'M0 -9Q1.4 -1.4 7 0Q1.4 1.4 0 9Q-1.4 1.4 -7 0Q-1.4 -1.4 0 -9Z';

const LIGHT = '#E5E5E1';

const pctX = (v: number) => `${(v / VB_W) * 100}%`;
const pctY = (v: number) => `${(v / VB_H) * 100}%`;
/** A length in viewBox units, as a size relative to the stage width. */
const cqw = (v: number) => `${(v / VB_W) * 100}cqw`;
/** Reference-px length that scales with the stage (for the tag's internals). */
const u = (px: number) => `calc(var(--u) * ${px})`;

const boxStyle = (x: number, y: number, w: number, h: number): CSSProperties => ({
  position: 'absolute',
  left: pctX(x),
  top: pctY(y),
  width: pctX(w),
  height: pctY(h),
});

/** Text rotated to read bottom-to-top, centred in its (vertical) box. */
const verticalText = (length: string): CSSProperties => ({
  position: 'absolute',
  left: '50%',
  top: '50%',
  width: length,
  transform: 'translate(-50%, -50%) rotate(-90deg)',
  whiteSpace: 'nowrap',
  textAlign: 'center',
});

interface FounderOrbitPortraitProps {
  src: string;
  alt: string;
}

export function FounderOrbitPortrait({ src, alt }: FounderOrbitPortraitProps) {
  const uid = useId().replace(/:/g, '');
  const ids = {
    backPath: `founder-orbit-back-${uid}`,
    frontPath: `founder-orbit-front-${uid}`,
    lowerHalf: `founder-orbit-lower-${uid}`,
    photoClip: `founder-orbit-photo-${uid}`,
  };
  const [failed, setFailed] = useState(false);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const backSvgRef = useRef<SVGSVGElement | null>(null);
  const frontSvgRef = useRef<SVGSVGElement | null>(null);
  const svgRefs = useMemo(() => [backSvgRef, frontSvgRef], []);
  // Pauses the stitches (.motion-paused) and the star (pauseAnimations) off-screen and
  // under prefers-reduced-motion.
  const { isPaused } = useMotionVisibility({ containerRef: stageRef, svgRefs });

  const orbit = (pathId: string, stroke: string, opacity: number, starFill: string) => (
    <g transform={ORBIT_TRANSFORM}>
      <path
        id={pathId}
        d={ORBIT_PATH}
        fill="none"
        stroke={stroke}
        strokeOpacity={opacity}
        strokeWidth={1.2}
        strokeDasharray="6 5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        className="motion-stitch-slow"
      />
      <g>
        <animateMotion dur="14s" repeatCount="indefinite">
          <mpath href={`#${pathId}`} />
        </animateMotion>
        {/* Counter-rotate so the star stays upright on the tilted orbit */}
        <path d={STAR_PATH} fill={starFill} transform={`rotate(${-ORBIT.tilt})`} />
      </g>
    </g>
  );

  const { x: px, y: py, w: pw, h: ph } = PHOTO;
  const crop = (cx: number, cy: number, dx: number, dy: number) =>
    `M${cx + dx * CROP_LEN} ${cy}H${cx}V${cy + dy * CROP_LEN}`;

  return (
    <div
      ref={stageRef}
      // Centred on its column; on desktop it grows 25% past the column into the grid gap.
      className={`relative left-1/2 -translate-x-1/2 w-[92vw] max-w-[640px] lg:w-[125%] ${
        isPaused ? 'motion-paused' : ''
      }`}
      style={
        {
          aspectRatio: `${VB_W} / ${VB_H}`,
          containerType: 'inline-size',
          '--u': `calc(100cqw / ${REF_W})`,
        } as CSSProperties
      }
    >
      {/* 1. BACK: offset frame, crop marks, full orbit + star */}
      <svg
        ref={backSvgRef}
        aria-hidden="true"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        fill="none"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
      >
        <rect
          x={px + OFFSET}
          y={py + OFFSET}
          width={pw}
          height={ph}
          stroke="var(--motion-line)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={[
            crop(px - CROP_GAP, py - CROP_GAP, 1, 1),
            crop(px + pw + CROP_GAP, py - CROP_GAP, -1, 1),
            crop(px - CROP_GAP, py + ph + CROP_GAP, 1, -1),
            crop(px + pw + CROP_GAP, py + ph + CROP_GAP, -1, -1),
          ].join('')}
          stroke="var(--ivory)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        {orbit(ids.backPath, 'var(--motion-line)', 1, 'var(--ivory)')}
      </svg>

      {/* Vertical side text, reads bottom-to-top along the top ~55% of the photo */}
      <div
        aria-hidden="true"
        className="pointer-events-none z-10 max-[420px]:hidden"
        style={boxStyle(SIDE_TEXT.cx - 6, SIDE_TEXT.top, 12, SIDE_TEXT.length)}
      >
        <span
          className="text-[9px] uppercase tracking-[0.45em] text-[var(--motion-line)]"
          style={verticalText(cqw(SIDE_TEXT.length))}
        >
          Wear the past · Keep the style
        </span>
      </div>

      {/* 2. PHOTO FRAME */}
      <div className="z-10 overflow-hidden bg-charcoal" style={boxStyle(px, py, pw, ph)}>
        {failed ? (
          <div aria-label="Founder portrait placeholder" className="h-full w-full bg-charcoal" />
        ) : (
          <img
            src={src}
            alt={alt}
            width={1000}
            height={1250}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover object-[center_20%]"
          />
        )}
        {/* Soft vignette */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(13, 13, 13, 0) 55%, rgba(13, 13, 13, 0.35) 100%)',
          }}
        />
        {/* Inner stitch line */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            inset: `${(STITCH_INSET * PX * 100) / ph}% ${(STITCH_INSET * PX * 100) / pw}%`,
            border: '1px dashed rgba(229, 229, 225, 0.55)',
          }}
        />
      </div>

      {/* 3. FRONT: orbit + star, only the lower half of the ellipse and only over the photo */}
      <svg
        ref={frontSvgRef}
        aria-hidden="true"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        fill="none"
        className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible"
      >
        <defs>
          <clipPath id={ids.lowerHalf}>
            <rect
              transform={ORBIT_TRANSFORM}
              x={-ORBIT.rx - 40}
              y={0}
              width={ORBIT.rx * 2 + 80}
              height={ORBIT.ry + 40}
            />
          </clipPath>
          <clipPath id={ids.photoClip}>
            <rect x={px} y={py} width={pw} height={ph} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${ids.photoClip})`}>
          <g clipPath={`url(#${ids.lowerHalf})`}>{orbit(ids.frontPath, LIGHT, 0.85, LIGHT)}</g>
        </g>
      </svg>

      {/* 4. WOVEN LABEL TAG (light: #0D0D0D / #E5E5E1, dark: inverted) */}
      <div
        aria-hidden="true"
        className="pointer-events-none z-30 bg-ivory text-noir"
        style={boxStyle(TAG.x, TAG.y, TAG.w, TAG.h)}
      >
        <div
          className="absolute border border-dashed border-current opacity-60"
          style={{ inset: u(5) }}
        />
        <div
          className="absolute left-1/2 flex -translate-x-1/2"
          style={{ top: u(14), gap: u(4) }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block rounded-full bg-current"
              style={{ width: u(2.5), height: u(2.5) }}
            />
          ))}
        </div>
        <span
          className="font-serif font-bold uppercase leading-none tracking-[0.08em]"
          style={{ ...verticalText(u(132)), fontSize: u(19), top: '47%' }}
        >
          NOIR DEPT.
        </span>
        <span
          className="absolute inset-x-0 text-center font-sans font-semibold uppercase leading-none tracking-[0.3em]"
          style={{ bottom: u(13), fontSize: u(6), paddingLeft: '0.3em' }}
        >
          Founder
        </span>
      </div>

      {/* Caption */}
      <div
        className="z-30 flex flex-wrap justify-between gap-x-4 gap-y-1 text-[10px] uppercase tracking-[0.32em] text-stone"
        style={{
          position: 'absolute',
          left: pctX(px),
          top: pctY(CAPTION_TOP),
          width: pctX(pw + OFFSET),
        }}
      >
        <span>
          <span className="text-ivory">Fig. 01</span> — The Founder
        </span>
        <span>NOIR DEPT.</span>
      </div>
    </div>
  );
}
