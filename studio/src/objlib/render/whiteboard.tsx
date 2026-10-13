// Whiteboard renderer: the same object data, drawn live with dry-erase markers.
// - lines and region outlines draw on stroke by stroke (in part order);
// - every region first "keeps the board clean" behind it (knock-out), so later parts hide earlier ones;
// - region fills become hatching (or solid marker for dark roles) that sweeps in after all the line work;
// - inkfill parts (icon shapes with a baked line width) have no centre line: they are wiped in.
import React from 'react';
import type {Obj, Part} from '../types';
import {pathOf} from '../types';
import {MARKERS, WHITEBOARD} from '../tokens';
import {Place, clamp01, defaultRole, visibleParts, xfString} from './common';

const STROKE = 0.32, GAP = 0.13, FILL = 0.35;
const LIGHT = ['shine', 'paper', 'white', 'cloud', 'snow', 'glass', 'tooth', 'bone', 'atomH'];
const SOLID = ['dark', 'ink'];   // regions in these roles are coloured in solid black marker

export const drawTime = (obj: Obj, state?: string) => {
  const ps = visibleParts(obj, state ?? obj.states?.[0] ?? 'default');
  return ps.length * GAP + STROKE + ps.filter((p) => p.kind === 'region').length * GAP * 0.6 + FILL;
};

export const WhiteboardObj: React.FC<{obj: Obj; t: number; state?: string; since?: number; x: number; y: number; size: number; uid: string; start?: number}> = ({obj, t, state, since = 99, x, y, size, uid, start = -100}) => {
  const st = state ?? obj.states?.[0] ?? 'default';
  const pose = obj.pose?.(t, st, since) ?? {};
  const k = size / obj.box;
  const lw = WHITEBOARD.lineW / k;
  const parts = visibleParts(obj, st);
  const byId = Object.fromEntries(obj.parts.map((p) => [p.id, p]));
  const fillOf = (p: Part): {c: string; solid: boolean} | null => {
    const r = defaultRole(p);
    if (SOLID.includes(r)) return {c: MARKERS.black, solid: true};
    const m = WHITEBOARD.marker[r];
    return m && m !== 'none' ? {c: MARKERS[m], solid: false} : null;
  };
  const lineOf = (p: Part) => {
    if (p.kind === 'region') return MARKERS.black;
    const r = defaultRole(p), m = WHITEBOARD.marker[r] ?? (LIGHT.includes(r) ? 'none' : 'black');
    return m === 'none' ? null : MARKERS[m];
  };
  // schedule: line work part by part, then fills
  const s0: Record<string, number> = {}, sf: Record<string, number> = {};
  parts.forEach((p, i) => (s0[p.id] = start + i * GAP));
  let fi = 0;
  parts.forEach((p) => { if (p.kind === 'region') sf[p.id] = start + parts.length * GAP + STROKE + fi++ * GAP * 0.6; });
  const clips = [...new Set(parts.map((p) => p.clip).filter(Boolean))] as string[];
  const hatchColors = [...new Set(parts.map((p) => fillOf(p)).filter((f) => f && !f.solid).map((f) => f!.c))];
  const gap = 9 / k;
  const wipe = (id: string, q: number) => (
    <clipPath id={`${uid}-w-${id}`}><rect x={-obj.box} y={-obj.box} width={obj.box + 3 * obj.box * q} height={3 * obj.box} /></clipPath>
  );
  return (
    <Place obj={obj} x={x} y={y} size={size} whole={pose['*']} style={{mixBlendMode: 'multiply'}}>
      <defs>
        <filter id={`${uid}-wob`} x={-0.2 * obj.box} y={-0.2 * obj.box} width={1.4 * obj.box} height={1.4 * obj.box} filterUnits="userSpaceOnUse">
          <feTurbulence type="fractalNoise" baseFrequency={k / 55} numOctaves={2} seed={uid.length * 7} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={4 / k} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {hatchColors.map((c) => (
          <pattern key={c} id={`${uid}-h-${c.slice(1)}`} patternUnits="userSpaceOnUse" width={gap} height={gap} patternTransform="rotate(-38)">
            <line x1={0} y1={0} x2={0} y2={gap} stroke={c} strokeWidth={2.6 / k} opacity={0.5} />
          </pattern>
        ))}
        {clips.map((c) => <clipPath key={c} id={`${uid}-clip-${c}`}><path d={pathOf(byId[c], t)} /></clipPath>)}
        {parts.map((p) => (
          <React.Fragment key={p.id}>
            {wipe(`k${p.id}`, clamp01((t - s0[p.id]) / STROKE))}
            {p.kind === 'region' && wipe(`f${p.id}`, clamp01((t - sf[p.id]) / FILL))}
          </React.Fragment>
        ))}
      </defs>
      <g filter={`url(#${uid}-wob)`} opacity={0.93}>
        {parts.map((p) => {
          if (t < s0[p.id]) return null;
          const g = p.group ? pose[p.group] : undefined;
          const d = pathOf(p, t);
          const q = clamp01((t - s0[p.id]) / STROKE);
          const els: React.ReactNode[] = [];
          const lc = lineOf(p);
          const stroke = (w: number) => lc && <path key="o" d={d} fill="none" stroke={lc} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - q} />;
          if (p.kind === 'region') {
            const knock = <g key="k" clipPath={`url(#${uid}-w-k${p.id})`}><path d={d} fill={WHITEBOARD.board} /></g>;
            const f = fillOf(p);
            const fill = f && t >= sf[p.id] ? (
              <g key="f" clipPath={`url(#${uid}-w-f${p.id})`} opacity={f.solid ? 0.85 : Math.min(1, (p.opacity ?? 1) * 2)}>
                <path d={d} fill={f.solid ? f.c : `url(#${uid}-h-${f.c.slice(1)})`} />
              </g>
            ) : null;
            const out = p.outline === false ? null : stroke(lw * (p.w ?? 1) * (p.union ? 2 : 1));
            // union: outline first, knock-out and fill on top hide the inner lines; normal: knock-out, fill, outline
            els.push(...(p.union ? [out, knock, fill] : [knock, fill, out]));
          } else if (p.kind === 'line') {
            els.push(stroke(lw * (p.w ?? 1)));
          } else if (lc) {
            els.push(<g key="i" clipPath={`url(#${uid}-w-k${p.id})`}><path d={d} fill={lc} /></g>);
          }
          return (
            <g key={p.id} clipPath={p.clip ? `url(#${uid}-clip-${p.clip})` : undefined}>
              <g transform={xfString(obj, p.group ?? '', g)} opacity={g?.o ?? 1}>{els}</g>
            </g>
          );
        })}
      </g>
    </Place>
  );
};
