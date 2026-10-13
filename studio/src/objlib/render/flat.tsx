// Flat renderer: filled regions with one ink outline width for every object (tokens.lineW, in screen px).
import React from 'react';
import type {Obj} from '../types';
import {pathOf} from '../types';
import {FLAT, Tokens} from '../tokens';
import {Place, defaultRole, visibleParts, xfString} from './common';

export const FlatObj: React.FC<{obj: Obj; t: number; state?: string; since?: number; x: number; y: number; size: number; uid: string; tokens?: Tokens}> = ({obj, t, state, since = 99, x, y, size, uid, tokens = FLAT}) => {
  const st = state ?? obj.states?.[0] ?? 'default';
  const pose = obj.pose?.(t, st, since) ?? {};
  const k = size / obj.box;
  const lw = tokens.lineW / k;
  const parts = visibleParts(obj, st);
  const byId = Object.fromEntries(obj.parts.map((p) => [p.id, p]));
  const clips = [...new Set(parts.map((p) => p.clip).filter(Boolean))] as string[];
  return (
    <Place obj={obj} x={x} y={y} size={size} whole={pose['*']}>
      <defs>
        {clips.map((c) => (
          <clipPath key={c} id={`${uid}-clip-${c}`}>
            <path d={pathOf(byId[c], t)} transform={xfString(obj, byId[c].group ?? '', byId[c].group ? pose[byId[c].group!] : undefined)} />
          </clipPath>
        ))}
      </defs>
      {parts.map((p) => {
        const g = p.group ? pose[p.group] : undefined;
        if (g?.o === 0) return null;
        const col = tokens.roles[defaultRole(p)] ?? defaultRole(p);
        const d = pathOf(p, t);
        const el =
          p.kind === 'region' && p.union ? (
            // union: a double-width outline under the fill; only its outer half stays visible
            <>{p.outline !== false && <path d={d} fill={col} stroke={tokens.ink} strokeWidth={2 * lw * (p.w ?? 1)} strokeLinejoin="round" />}<path d={d} fill={col} /></>
          ) : p.kind === 'region' ? (
            <path d={d} fill={col} stroke={p.outline === false ? 'none' : tokens.ink} strokeWidth={lw * (p.w ?? 1)} strokeLinejoin="round" />
          ) : p.kind === 'line' ? (
            <path d={d} fill="none" stroke={col} strokeWidth={lw * (p.w ?? 1)} strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <path d={d} fill={col} />
          );
        return (
          <g key={p.id} clipPath={p.clip ? `url(#${uid}-clip-${p.clip})` : undefined}>
            <g transform={xfString(obj, p.group ?? '', g)} opacity={(g?.o ?? 1) * (p.opacity ?? 1)}>{el}</g>
          </g>
        );
      })}
    </Place>
  );
};
