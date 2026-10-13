// <Thing> draws a library object; <Pictogram> draws any of the ~5,000 Tabler icons with the same renderers.
// Both must be inside an <svg>. The renderer comes from BRAND.render unless `look` is given.
import React from 'react';
import {BRAND} from '../brand';
import type {Obj, Pose} from './types';
import {getObj} from './index';
import {FlatObj} from './render/flat';
import {WhiteboardObj} from './render/whiteboard';
import tablerIcons from './tabler-icons.json';   // made by scripts/build-icons.mjs

export type Look = 'flat' | 'whiteboard';

export type ThingProps = {
  id: string | Obj;
  t: number;                 // current time (s)
  x: number; y: number;      // centre
  size: number;              // on-screen size of the object's box (px)
  state?: string;
  since?: number;            // seconds since the state began (for state-change motion)
  look?: Look;
  start?: number;            // whiteboard: time the drawing starts (default: already drawn)
  uid?: string;              // unique id for SVG defs; give one when the same object appears twice at the same place
};

export const Thing: React.FC<ThingProps> = ({id, t, x, y, size, state, since, look = BRAND.render, start, uid}) => {
  const obj = typeof id === 'string' ? getObj(id) : id;
  const u = uid ?? `${obj.id}-${Math.round(x)}-${Math.round(y)}`;
  return look === 'whiteboard'
    ? <WhiteboardObj obj={obj} t={t} state={state} since={since} x={x} y={y} size={size} uid={u} start={start} />
    : <FlatObj obj={obj} t={t} state={state} since={since} x={x} y={y} size={size} uid={u} />;
};

// ---------- Tabler pictograms (MIT, © Paweł Kuna) ----------
const ICONS = tablerIcons as unknown as Record<string, string[]>;
const pictoCache: Record<string, Obj> = {};
export const tablerNames = () => Object.keys(ICONS);
export const pictogram = (name: string, role = 'ink', pose?: (t: number) => Pose): Obj => {
  const key = `${name}|${role}`;
  if (!pictoCache[key]) {
    const ds = ICONS[name];
    if (!ds) throw new Error(`Pictogram: no Tabler icon "${name}" (see https://tabler.io/icons)`);
    pictoCache[key] = {
      id: `tabler-${name}`, name, category: 'symbols', tags: [name], box: 24,
      source: {kind: 'direct', lib: 'tabler', icon: name, license: 'MIT'},
      parts: ds.map((d, i) => ({id: `p${i}`, kind: 'line' as const, role, d})),
      pose: pose ? (t) => pose(t) : undefined,
    };
  }
  return pictoCache[key];
};

export const Pictogram: React.FC<Omit<ThingProps, 'id'> & {name: string; role?: string}> = ({name, role, ...p}) => (
  <Thing id={pictogram(name, role)} {...p} uid={p.uid ?? `pg-${name}-${Math.round(p.x)}-${Math.round(p.y)}`} />
);
