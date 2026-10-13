// Shared helpers for all renderers. Pure functions of (object, time, state): no Remotion import here,
// so the same renderers work in Remotion, in a plain web page, or in a still exporter.
import React from 'react';
import type {Obj, Part, Xf} from '../types';

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const xfString = (obj: Obj, group: string, f?: Xf) => {
  if (!f) return undefined;
  const [px, py] = obj.pivots?.[group] ?? [obj.box / 2, obj.box / 2];
  const s = f.s ?? 1, sx = (f.sx ?? 1) * s, sy = (f.sy ?? 1) * s;
  return `translate(${f.x ?? 0},${f.y ?? 0}) translate(${px},${py}) rotate(${f.r ?? 0}) scale(${sx},${sy}) translate(${-px},${-py})`;
};

export const visibleParts = (obj: Obj, state: string) => obj.parts.filter((p) => !p.when || p.when.includes(state));

export const defaultRole = (p: Part) => p.role ?? (p.kind === 'region' ? 'body' : 'ink');

// Places an object: (x, y) = centre, size = on-screen size of the object's box in px.
export const Place: React.FC<{obj: Obj; x: number; y: number; size: number; whole?: Xf; children: React.ReactNode; style?: React.CSSProperties}> = ({obj, x, y, size, whole, children, style}) => {
  const k = size / obj.box;
  return (
    <g transform={`translate(${x - size / 2},${y - size / 2}) scale(${k})`} style={style}>
      <g transform={xfString(obj, '*', whole)} opacity={whole?.o ?? 1}>{children}</g>
    </g>
  );
};
