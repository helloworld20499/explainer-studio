// Shared parts for the explanation patterns (docs/patterns.md).
// A pattern = one way of explaining a concept, played on beats (absolute times, usually word cues: cue(line, 'word')).
// Every pattern: shows its subject within 0.3 s of its start, changes something at every beat, and keeps moving
// between beats (object idle motion, flowing arrows, slow camera drift), so the screen is never empty or frozen.
import React from 'react';
import {BRAND} from '../brand';
import {C, L, S, SANS, SLAB, textW} from '../kit/lib';
import {Thing, Pictogram, Look} from '../objlib/Thing';
import {WHITEBOARD} from '../objlib/tokens';

export type Item = {
  thing?: string;          // object library id (src/objlib)
  icon?: string;           // or a Tabler pictogram name
  text?: string;           // or just big text
  state?: string;          // object state
  stateAt?: number;        // time the state starts (for state-change motion)
  label?: string;          // caption under it
  role?: string;           // pictogram colour role
};
export type Beats = number[];

export const lookOf = (look?: Look): Look => look ?? BRAND.render;
export const bgOf = (look: Look) => (look === 'whiteboard' ? WHITEBOARD.board : C.bg);

// index of the last beat that has happened (-1 = none yet)
export const beatIndex = (t: number, beats: Beats) => beats.filter((b) => t >= b).length - 1;
// first beat, pulled to the start so the subject is visible within 0.3 s
export const firstAt = (at: number, beats: Beats) => Math.min(beats[0] ?? at, at + 0.3);

// Full-frame stage: background, slow camera drift, optional title. Children are SVG.
export const Stage: React.FC<{t: number; at: number; look?: Look; title?: string; drift?: number; children: React.ReactNode}> = ({t, at, look, title, drift = 1, children}) => {
  const lk = lookOf(look);
  const u = t - at;
  const z = 1 + 0.035 * drift * Math.min(1, u / 12);
  const dx = 14 * drift * Math.sin(u * 0.12);
  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, background: bgOf(lk)}}>
      {lk === 'flat' && <g opacity={0.35}>{Array.from({length: 18 * 10}, (_, i) => <circle key={i} cx={(i % 18) * 112 + 40} cy={Math.floor(i / 18) * 112 + 40} r={2.2} fill={C.muted} />)}</g>}
      <g transform={`translate(${960 + dx},540) scale(${z}) translate(-960,-540)`}>{children}</g>
      {title && <Title t={t} at={at} text={title} />}
    </svg>
  );
};

// Text sizes shared by all patterns (1920x1080). Big on purpose: text must read on a phone.
// Keep text above y = 930: burned-in subtitles (scripts/subs.py) cover the bottom of the frame.
export const TITLE = 80, LABEL = 50;

export const Title: React.FC<{t: number; at: number; text: string; y?: number}> = ({t, at, text, y = 96}) => {
  const p = S(t, at + 0.05);
  return (
    <g transform={`translate(960,${y}) scale(${p})`} opacity={Math.min(1, p)}>
      <text textAnchor="middle" fontFamily={SLAB} fontWeight={800} fontSize={TITLE} fill={C.ink} y={TITLE * 0.35}>{text}</text>
    </g>
  );
};

// One item (object, pictogram or text) with appear / highlight / dim.
export const ItemView: React.FC<{item: Item; t: number; x: number; y: number; size: number; appear: number; hi?: number; dim?: number; look?: Look; uid: string; labelSize?: number; labelWidth?: number}> = ({item, t, x, y, size, appear, hi = 0, dim = 0, look, uid, labelSize = LABEL, labelWidth}) => {
  const lk = lookOf(look);
  if (t < appear) return null;
  const p = lk === 'whiteboard' ? 1 : S(t, appear);
  const s = p * (1 + 0.08 * hi);
  const since = item.stateAt !== undefined ? t - item.stateAt : 99;
  const state = item.stateAt !== undefined && t < item.stateAt ? undefined : item.state;
  return (
    <g opacity={1 - 0.45 * dim}>
      {hi > 0 && <circle cx={x} cy={y} r={size * 0.62} fill={C.accent} opacity={0.12 * hi} />}
      <g transform={`translate(${x},${y}) scale(${s}) translate(${-x},${-y})`}>
        {item.thing && <Thing id={item.thing} t={t} x={x} y={y} size={size} state={state} since={since} look={lk} start={appear} uid={uid} />}
        {item.icon && <Pictogram name={item.icon} role={item.role} t={t} x={x} y={y} size={size * 0.9} look={lk} start={appear} uid={uid} />}
        {item.text && <text x={x} y={y + size * 0.14} textAnchor="middle" fontFamily={SLAB} fontWeight={800} fontSize={size * 0.42} fill={C.ink}>{item.text}</text>}
      </g>
      {item.label && <Caption x={x} y={labelTop(y, size) + labelSize * 0.5} text={item.label} size={labelSize} width={labelWidth ?? labelW(size)} o={L(t, appear + 0.2, appear + 0.5, 0, 1)} hi={hi} />}
    </g>
  );
};

// Label under an item: in the title font, wrapped to `width`; `y` is the centre of the first line.
export const Caption: React.FC<{x: number; y: number; text: string; size?: number; width?: number; o?: number; hi?: number; color?: string}> = ({x, y, text, size = LABEL, width = 1e9, o = 1, hi = 0, color}) => (
  <text x={x} y={y + size * 0.35} textAnchor="middle" fontFamily={SLAB} fontWeight={700} fontSize={size} fill={color ?? (hi > 0.5 ? C.accent : C.ink)} opacity={o}>
    {wrap(text, size, width, true).map((l, i) => <tspan key={i} x={x} dy={i ? size * 1.08 : 0}>{l}</tspan>)}
  </text>
);

// Label geometry, shared by ItemView and the arrow router below (so arrows never cross a label).
export const labelTop = (y: number, size: number) => y + size * 0.6;
export const labelW = (size: number) => Math.max(320, size * 1.7);
export const labelBox = (label: string | undefined, x: number, y: number, size: number, labelSize = LABEL, width = labelW(size)) => {
  if (!label) return null;
  const ls = wrap(label, labelSize, width, true), w = Math.max(...ls.map((l) => textW(l, labelSize, true)));
  const top = labelTop(y, size);
  return {x0: x - w / 2, x1: x + w / 2, y0: top, y1: top + labelSize * (1 + 1.08 * (ls.length - 1)) + labelSize * 0.1};
};

// Footprint of a placed item: the object's circle plus its label box. Arrows start and end outside it.
export type Node = {x: number; y: number; size: number; label?: string; labelSize?: number; labelWidth?: number};
const inside = (n: Node, px: number, py: number, m: number) => {
  if (Math.hypot(px - n.x, py - n.y) < n.size * 0.5 + m) return true;
  const b = labelBox(n.label, n.x, n.y, n.size, n.labelSize, n.labelWidth);
  return !!b && px > b.x0 - m && px < b.x1 + m && py > b.y0 - m && py < b.y1 + m;
};
// Curve from node A to node B (same bend rule as Flow), cut where it leaves A and enters B.
// Returns props for <Flow>: end points plus the control point of the cut piece.
export const link = (A: Node, B: Node, bend = 0, gap = 30) => {
  const mx = (A.x + B.x) / 2 - (B.y - A.y) * bend, my = (A.y + B.y) / 2 + (B.x - A.x) * bend;
  const pt = (u: number) => [(1 - u) ** 2 * A.x + 2 * (1 - u) * u * mx + u * u * B.x, (1 - u) ** 2 * A.y + 2 * (1 - u) * u * my + u * u * B.y];
  const N = 400;
  let u0 = 0, u1 = 1;
  // footprints are not convex (circle + label box): the arrow starts after the LAST point inside A
  // and ends before the FIRST point inside B, so it can never run through either label
  for (let i = 0; i <= N; i++) { const [px, py] = pt(i / N); if (inside(A, px, py, gap)) u0 = (i + 1) / N; }
  for (let i = N; i >= 0; i--) { const [px, py] = pt(i / N); if (inside(B, px, py, gap)) u1 = (i - 1) / N; }
  if (u1 <= u0) u1 = u0 = 0.5;
  // control point of the piece u0..u1 of a quadratic Bezier
  const [x1, y1] = pt(u0), [x2, y2] = pt(u1);
  const bx = (1 - u0) * mx + u0 * B.x, by = (1 - u0) * my + u0 * B.y;   // control of the piece u0..1
  const v = (u1 - u0) / (1 - u0 || 1);
  const cx = x1 + (bx - x1) * v, cy = y1 + (by - y1) * v;
  return {x1, y1, x2, y2, cx, cy};
};

// a dashed placeholder for something that is coming (keeps the frame full and builds anticipation)
export const Ghost: React.FC<{x: number; y: number; size: number; n?: number | string; o?: number}> = ({x, y, size, n, o = 1}) => (
  <g opacity={0.45 * o}>
    <circle cx={x} cy={y} r={size * 0.42} fill="none" stroke={C.ink} strokeWidth={5} strokeDasharray="14 12" />
    {n !== undefined && <text x={x} y={y + size * 0.12} textAnchor="middle" fontFamily={SLAB} fontWeight={800} fontSize={size * 0.32} fill={C.ink}>{n}</text>}
  </g>
);

// a card (rounded panel) for text: myths, facts, step titles
export const Card: React.FC<{x: number; y: number; w: number; h: number; fill?: string; children?: React.ReactNode; s?: number}> = ({x, y, w, h, fill = '#FFFFFF', children, s = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-w / 2 + 8} y={-h / 2 + 10} width={w} height={h} rx={28} fill={C.ink} opacity={0.1} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={28} fill={fill} stroke={C.ink} strokeWidth={5} />
    {children}
  </g>
);

// wrap text into lines that fit a width
export const wrap = (text: string, size: number, width: number, slab = false) => {
  const words = text.split(' '), out: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? cur + ' ' + w : w;
    if (textW(next, size, slab) > width && cur) { out.push(cur); cur = w; } else cur = next;
  }
  if (cur) out.push(cur);
  return out;
};
export const TextBlock: React.FC<{x: number; y: number; text: string; size?: number; width: number; color?: string; font?: string; weight?: number}> = ({x, y, text, size = 44, width, color = C.ink, font = SANS, weight = 800}) => {
  const ls = wrap(text, size, width);
  return (
    <text x={x} y={y - ((ls.length - 1) * size * 1.18) / 2 + size * 0.35} textAnchor="middle" fontFamily={font} fontWeight={weight} fontSize={size} fill={color}>
      {ls.map((l, i) => <tspan key={i} x={x} dy={i ? size * 1.18 : 0}>{l}</tspan>)}
    </text>
  );
};

// arrow that draws itself from a to b at time `at`, then keeps dots flowing along it
// (cx, cy): explicit control point, e.g. from link(); otherwise it comes from `bend`
export const Flow: React.FC<{t: number; at: number; x1: number; y1: number; x2: number; y2: number; bend?: number; cx?: number; cy?: number; color?: string; w?: number; dots?: boolean; look?: Look}> = ({t, at, x1, y1, x2, y2, bend = 0, cx, cy, color = C.ink, w = 7, dots = true}) => {
  if (t < at) return null;
  const p = L(t, at, at + 0.45, 0, 1);
  const mx = cx ?? (x1 + x2) / 2 - (y2 - y1) * bend, my = cy ?? (y1 + y2) / 2 + (x2 - x1) * bend;
  const pt = (u: number) => [(1 - u) ** 2 * x1 + 2 * (1 - u) * u * mx + u * u * x2, (1 - u) ** 2 * y1 + 2 * (1 - u) * u * my + u * u * y2];
  const [ex, ey] = pt(p), [px, py] = pt(Math.max(0, p - 0.04));
  const ang = Math.atan2(ey - py, ex - px), hs = w * 3.4;
  return (
    <g>
      <path d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
      <polygon points={`${ex},${ey} ${ex - Math.cos(ang - 0.45) * hs},${ey - Math.sin(ang - 0.45) * hs} ${ex - Math.cos(ang + 0.45) * hs},${ey - Math.sin(ang + 0.45) * hs}`} fill={color} />
      {dots && p >= 1 && [0, 0.33, 0.66].map((o) => {
        const u = ((t - at) * 0.55 + o) % 1;
        const [dx, dy] = pt(u * 0.9);
        return <circle key={o} cx={dx} cy={dy} r={w * 1.1} fill={C.accent} />;
      })}
    </g>
  );
};

// big check / cross stamp
export const Verdict: React.FC<{t: number; at: number; x: number; y: number; ok: boolean; size?: number}> = ({t, at, x, y, ok, size = 90}) => {
  if (t < at) return null;
  const s = S(t, at);
  return (
    <g transform={`translate(${x},${y}) scale(${s}) rotate(${(1 - s) * -20})`}>
      <circle r={size * 0.62} fill={ok ? '#5BBF6A' : '#E2464F'} stroke={C.ink} strokeWidth={6} />
      {ok
        ? <path d={`M${-size * 0.3},0 L${-size * 0.08},${size * 0.24} L${size * 0.32},${-size * 0.22}`} fill="none" stroke="#fff" strokeWidth={size * 0.13} strokeLinecap="round" strokeLinejoin="round" />
        : <path d={`M${-size * 0.24},${-size * 0.24} L${size * 0.24},${size * 0.24} M${size * 0.24},${-size * 0.24} L${-size * 0.24},${size * 0.24}`} stroke="#fff" strokeWidth={size * 0.13} strokeLinecap="round" />}
    </g>
  );
};

export {C, L, S, SANS, SLAB, textW};
