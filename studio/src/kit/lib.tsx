// Shared basics: colours, fonts, time helpers, simple shapes. Brand values come from src/brand.ts.
import React from 'react';
import {Easing, interpolate, spring, continueRender, delayRender} from 'remotion';
import {BRAND} from '../brand';
import {FONT_CSS} from './fontcss';

export const FPS = 30;
export const C = {...BRAND.colors, ...BRAND.science};
export const SLAB = BRAND.fonts.title;
export const SANS = BRAND.fonts.body;

// ---------- fonts (inlined base64, no network: staticFile font loading can time out in renders) ----------
// Re-renders once the fonts are in, so text measured with textW() uses the real font, not the fallback.
export const useFonts = () => {
  const [h] = React.useState(() => delayRender('fonts', {timeoutInMilliseconds: 60000}));
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    if (!document.getElementById('inline-fonts')) {
      const st = document.createElement('style');
      st.id = 'inline-fonts';
      st.textContent = FONT_CSS;
      document.head.appendChild(st);
    }
    Promise.all([`800 40px ${SLAB}`, `700 40px ${SLAB}`, `800 40px ${SANS}`, `700 40px ${SANS}`].map((f) => document.fonts.load(f)))
      .finally(() => setReady(true));
  }, [h]);
  React.useEffect(() => { if (ready) continueRender(h); }, [ready, h]);
  return ready;
};

// ---------- time helpers (all in absolute seconds) ----------
const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
// L: linear-ish move from x to y between times a and b (eased, clamped)
export const L = (t: number, a: number, b: number, x: number, y: number, ease: (n: number) => number = Easing.inOut(Easing.cubic)) =>
  interpolate(t, [a, b], [x, y], {...CL, easing: ease});
// S: spring 0 -> 1 starting at time `at` (small overshoot = "pop")
export const S = (t: number, at: number, cfg: any = {damping: 13, stiffness: 150, mass: 0.7}) =>
  spring({frame: Math.max(0, (t - at) * FPS), fps: FPS, config: cfg});
export const SS = (t: number, at: number) => S(t, at, {damping: 200, stiffness: 120}); // no overshoot
export const fadeIO = (t: number, a: number, b: number, d = 0.25) => Math.min(L(t, a, a + d, 0, 1), L(t, b - d, b, 1, 0));
export const wob = (t: number, f = 1, a = 1, ph = 0) => Math.sin((t * f + ph) * Math.PI * 2) * a;

// ---------- primitives ----------
type G = {x?: number; y?: number; s?: number; r?: number; o?: number; children?: React.ReactNode};
export const At: React.FC<G> = ({x = 0, y = 0, s = 1, r = 0, o = 1, children}) => (
  <g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`} opacity={o}>{children}</g>
);

// text width in px: measured with the real (inlined) font when a canvas is available, else an estimate
let ctx2d: CanvasRenderingContext2D | null | undefined;
export const textW = (txt: string, size: number, slab = false) => {
  if (ctx2d === undefined) ctx2d = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;
  if (ctx2d) { ctx2d.font = `800 ${size}px ${slab ? SLAB : SANS}`; return ctx2d.measureText(txt).width; }
  return txt.length * size * (slab ? 0.6 : 0.56);
};

export const Pill: React.FC<{text: string; size?: number; color?: string; bg?: string; border?: string}> = ({text, size = 46, color = C.ink, bg = C.white, border = C.ink}) => {
  const w = textW(text, size) + size * 1.3;
  const h = size * 1.75;
  return (
    <g>
      <rect x={-w / 2 + 6} y={-h / 2 + 7} width={w} height={h} rx={h / 2} fill={C.ink} opacity={0.12} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={bg} stroke={border} strokeWidth={4} />
      <text textAnchor="middle" y={size * 0.36} fontFamily={SANS} fontWeight={800} fontSize={size} fill={color}>{text}</text>
    </g>
  );
};

export const Title: React.FC<{text: string; size?: number; color?: string; anchor?: 'middle' | 'start' | 'end'; weight?: number}> = ({text, size = 96, color = C.ink, anchor = 'middle', weight = 800}) => (
  <text textAnchor={anchor} fontFamily={SLAB} fontWeight={weight} fontSize={size} fill={color} y={size * 0.35}>{text}</text>
);

// Round "particle with a face" (molecule, cell, germ, planet buddy...)
export const Mol: React.FC<{color: string; r?: number; eyes?: boolean; look?: number; blink?: number}> = ({color, r = 28, eyes = true, look = 0, blink = 1}) => (
  <g>
    <circle r={r} fill={color} stroke={C.ink} strokeWidth={Math.max(3, r * 0.12)} />
    <ellipse cx={-r * 0.38} cy={-r * 0.42} rx={r * 0.22} ry={r * 0.13} fill="#fff" opacity={0.55} transform={`rotate(-35 ${-r * 0.38} ${-r * 0.42})`} />
    {eyes && (
      <g fill={C.ink}>
        <ellipse cx={-r * 0.25 + look} cy={-r * 0.05} rx={r * 0.1} ry={r * 0.13 * blink} />
        <ellipse cx={r * 0.25 + look} cy={-r * 0.05} rx={r * 0.1} ry={r * 0.13 * blink} />
      </g>
    )}
  </g>
);

export const Spiky: React.FC<{color?: string; r?: number; spin?: number}> = ({color = C.lilac, r = 34, spin = 0}) => {
  const n = 8;
  const pts = Array.from({length: n * 2}, (_, i) => {
    const a = (i / (n * 2)) * Math.PI * 2;
    const rr = i % 2 ? r * 0.55 : r;
    return `${Math.cos(a) * rr},${Math.sin(a) * rr}`;
  }).join(' ');
  return <g transform={`rotate(${spin})`}><polygon points={pts} fill={color} stroke={C.ink} strokeWidth={3.5} strokeLinejoin="round" /></g>;
};

// Pac-Man "worker" (enzyme, machine, eater), facing right (flip with s<0 on parent)
export const Enzyme: React.FC<{color: string; r?: number; mouth?: number; eyes?: boolean}> = ({color, r = 40, mouth = 0.7, eyes = true}) => {
  const a = (Math.max(0.02, mouth) * 38 * Math.PI) / 180;
  const ux = r * Math.cos(a), uy = -r * Math.sin(a);
  const d = `M0,0 L${ux},${uy} A${r},${r} 0 1 0 ${ux},${-uy} Z`;
  return (
    <g>
      <path d={d} fill={color} stroke={C.ink} strokeWidth={Math.max(3, r * 0.1)} strokeLinejoin="round" />
      <ellipse cx={-r * 0.4} cy={-r * 0.45} rx={r * 0.2} ry={r * 0.11} fill="#fff" opacity={0.5} transform={`rotate(-35 ${-r * 0.4} ${-r * 0.45})`} />
      {eyes && <ellipse cx={r * 0.05} cy={-r * 0.48} rx={r * 0.1} ry={r * 0.13} fill={C.ink} />}
    </g>
  );
};

export const Puff: React.FC<{r?: number; o?: number; color?: string; light?: string}> = ({r = 40, o = 0.9, color = C.lilac, light = C.lilacLight}) => (
  <g opacity={o}>
    <circle cx={-r * 0.45} cy={r * 0.1} r={r * 0.6} fill={light} />
    <circle cx={r * 0.45} cy={r * 0.15} r={r * 0.55} fill={light} />
    <circle cx={0} cy={-r * 0.2} r={r * 0.7} fill={light} />
    <circle cx={0} cy={r * 0.05} r={r * 0.42} fill={color} />
  </g>
);

// Straight arrow that draws itself: p = 0..1
export const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; color?: string; w?: number; p?: number; dash?: boolean}> = ({x1, y1, x2, y2, color = C.ink, w = 6, p = 1, dash}) => {
  const ex = x1 + (x2 - x1) * p, ey = y1 + (y2 - y1) * p;
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const hs = w * 3.2;
  if (p <= 0.01) return null;
  return (
    <g>
      <line x1={x1} y1={y1} x2={ex - Math.cos(ang) * hs * 0.6} y2={ey - Math.sin(ang) * hs * 0.6} stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray={dash ? `${w * 2} ${w * 2}` : undefined} />
      <polygon points={`${ex},${ey} ${ex - Math.cos(ang - 0.45) * hs},${ey - Math.sin(ang - 0.45) * hs} ${ex - Math.cos(ang + 0.45) * hs},${ey - Math.sin(ang + 0.45) * hs}`} fill={color} />
    </g>
  );
};

export const Cross: React.FC<{size?: number; p?: number}> = ({size = 80, p = 1}) => (
  <g stroke={C.red} strokeWidth={14} strokeLinecap="round">
    <line x1={-size} y1={-size} x2={-size + 2 * size * Math.min(1, p * 2)} y2={-size + 2 * size * Math.min(1, p * 2)} />
    {p > 0.5 && <line x1={size} y1={-size} x2={size - 2 * size * (p - 0.5) * 2} y2={-size + 2 * size * (p - 0.5) * 2} />}
  </g>
);

export const Drop: React.FC<{r?: number; color?: string}> = ({r = 30, color = C.sky}) => (
  <g>
    <path d={`M0,${-r * 1.8} C${r * 0.6},${-r * 0.8} ${r},${-r * 0.3} ${r},${r * 0.2} A${r},${r} 0 0 1 ${-r},${r * 0.2} C${-r},${-r * 0.3} ${-r * 0.6},${-r * 0.8} 0,${-r * 1.8} Z`} fill={color} stroke={C.ink} strokeWidth={Math.max(3, r * 0.12)} strokeLinejoin="round" />
    <ellipse cx={-r * 0.4} cy={-r * 0.1} rx={r * 0.16} ry={r * 0.3} fill="#fff" opacity={0.7} />
  </g>
);

// Speech bubble
export const Bubble: React.FC<{text: string; size?: number; tail?: 'left' | 'right' | 'down'; color?: string}> = ({text, size = 54, tail = 'down', color = C.ink}) => {
  const w = textW(text, size, true) + size * 1.2;
  const h = size * 1.9;
  const tp = tail === 'down' ? `M-20,${h / 2 - 2} L0,${h / 2 + 36} L24,${h / 2 - 2} Z` : tail === 'left' ? `M${-w / 2 + 2},-14 L${-w / 2 - 36},10 L${-w / 2 + 2},18 Z` : `M${w / 2 - 2},-14 L${w / 2 + 36},10 L${w / 2 - 2},18 Z`;
  return (
    <g>
      <rect x={-w / 2 + 7} y={-h / 2 + 8} width={w} height={h} rx={28} fill={C.ink} opacity={0.12} />
      <path d={tp} fill="#fff" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={28} fill="#fff" stroke={C.ink} strokeWidth={4} />
      {tail === 'down' && <rect x={-18} y={h / 2 - 6} width={40} height={8} fill="#fff" />}
      <text textAnchor="middle" y={size * 0.36} fontFamily={SLAB} fontWeight={800} fontSize={size} fill={color}>{text}</text>
    </g>
  );
};

export const Scene: React.FC<{children: React.ReactNode; bg?: string}> = ({children, bg = C.bg}) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, background: bg}}>{children}</svg>
);

export const mixHex = (a: string, b: string, k: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('');
};
