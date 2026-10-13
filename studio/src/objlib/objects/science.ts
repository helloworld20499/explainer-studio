// Science: atoms, molecules, life. All own drawings (256 box).
import type {Obj} from '../types';
import {blob, capsule, circle, lines, pop, smooth, wave} from './_shapes';

// ---------- atom ----------
const orbitPt = (u: number, th: number): [number, number] => {
  const x = 100 * Math.cos(u), y = 34 * Math.sin(u);
  return [128 + x * Math.cos(th) - y * Math.sin(th), 128 + x * Math.sin(th) + y * Math.cos(th)];
};
const ORBITS = [0, Math.PI / 3, (2 * Math.PI) / 3];
const orbitPath = (th: number) => smooth(Array.from({length: 24}, (_, i) => orbitPt((i / 24) * Math.PI * 2, th)));
const NUC: [number, number, string][] = [[112, 118, 'n'], [144, 118, 'p'], [128, 104, 'p'], [112, 140, 'p'], [144, 140, 'n'], [128, 152, 'n'], [128, 128, 'p']];
export const atom: Obj = {
  id: 'atom', name: 'Atom', category: 'science', tags: ['atom', 'electron', 'proton', 'neutron', 'nucleus', 'physics', 'chemistry', 'matter'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    ...ORBITS.map((th, i) => ({id: `o${i}`, kind: 'line' as const, w: 0.55, d: orbitPath(th)})),
    {id: 'neutrons', kind: 'region', role: 'gray', w: 0.6, d: NUC.filter((n) => n[2] === 'n').map(([x, y]) => circle(x, y, 15)).join(' ')},
    {id: 'protons', kind: 'region', role: 'red', w: 0.6, d: NUC.filter((n) => n[2] === 'p').map(([x, y]) => circle(x, y, 15)).join(' ')},
    {id: 'electrons', kind: 'region', role: 'blue', w: 0.7, d: (t) => ORBITS.map((th, i) => {
      const [x, y] = orbitPt(t * (2.2 + i * 0.4) + i * 2.1, th);
      return circle(x, y, 10);
    }).join(' ')},
  ],
  pivots: {'*': [128, 128]},
  states: ['idle', 'excited'],
  pose: (t, st) => ({'*': {s: st === 'excited' ? 1 + 0.03 * Math.sin(t * 20) : 1}}),
  notes: 'Electrons orbit continuously. States idle/excited (vibrates).',
};

// ---------- water molecule ----------
export const molecule: Obj = {
  id: 'molecule', name: 'Water molecule (H₂O)', category: 'science', tags: ['molecule', 'water', 'H2O', 'chemistry', 'bond', 'oxygen', 'hydrogen'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'bonds', kind: 'line', role: 'metalDark', w: 2.6, d: 'M128,150 L48,84 M128,150 L208,84'},
    {id: 'h1', kind: 'region', role: 'atomH', group: 'h1', d: circle(48, 84, 30)},
    {id: 'h2', kind: 'region', role: 'atomH', group: 'h2', d: circle(208, 84, 30)},
    {id: 'o', kind: 'region', role: 'atomO', d: circle(128, 150, 50)},
    {id: 'shine', kind: 'line', role: 'shine', w: 1, d: 'M98,134 A32,32 0 0 1 114,116'},
  ],
  states: ['idle', 'heat'],
  pose: (t, st) => {
    const a = st === 'heat' ? 5 : 1.5, f = st === 'heat' ? 9 : 1.2;
    return {h1: {x: wave(t, f, a), y: wave(t, f, a, 0.25)}, h2: {x: wave(t, f, a, 0.5), y: wave(t, f, a, 0.75)}, '*': {r: st === 'heat' ? wave(t, 4, 3) : wave(t, 0.2, 4)}};
  },
  notes: 'States idle/heat (vibrates faster). For other molecules copy and change atoms and roles.',
};

// ---------- DNA ----------
const helix = (t: number, ph: number) => smooth(Array.from({length: 22}, (_, i) => {
  const y = 12 + i * 11;
  return [128 + 62 * Math.sin(y * 0.034 + t * 1.6 + ph), y] as [number, number];
}), false);
const rungs = (t: number, odd: number) => lines(Array.from({length: 11}, (_, i) => i).filter((i) => i % 2 === odd).map((i) => {
  const y = 22 + i * 21;
  return [128 + 62 * Math.sin(y * 0.034 + t * 1.6), y, 128 + 62 * Math.sin(y * 0.034 + t * 1.6 + Math.PI), y] as [number, number, number, number];
}));
export const dna: Obj = {
  id: 'dna', name: 'DNA', category: 'science', tags: ['DNA', 'gene', 'genetics', 'heredity', 'helix', 'biology', 'code of life'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'r1', kind: 'line', role: 'dna1', w: 1.3, d: (t) => rungs(t, 0)},
    {id: 'r2', kind: 'line', role: 'dna2', w: 1.3, d: (t) => rungs(t, 1)},
    {id: 's1', kind: 'line', w: 1.8, d: (t) => helix(t, 0)},
    {id: 's2', kind: 'line', w: 1.8, d: (t) => helix(t, Math.PI)},
  ],
  notes: 'Turns continuously.',
};

// ---------- virus ----------
const SPIKES = Array.from({length: 12}, (_, i) => (i / 12) * Math.PI * 2);
export const virus: Obj = {
  id: 'virus', name: 'Virus', category: 'science', tags: ['virus', 'germ', 'infection', 'disease', 'flu', 'immune system'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'spikes', kind: 'line', w: 0.9, group: 'spin', d: lines(SPIKES.map((a) => [128 + Math.cos(a) * 62, 128 + Math.sin(a) * 62, 128 + Math.cos(a) * 92, 128 + Math.sin(a) * 92]))},
    {id: 'knobs', kind: 'region', role: 'red', w: 0.7, group: 'spin', d: SPIKES.map((a) => circle(128 + Math.cos(a) * 98, 128 + Math.sin(a) * 98, 11)).join(' ')},
    {id: 'body', kind: 'region', role: 'virus', group: 'spin', d: (t) => blob(128, 128, 64, 2, t, 0.5)},
    {id: 'spots', kind: 'region', role: 'purple', outline: false, opacity: 0.5, group: 'spin', d: circle(108, 112, 10) + ' ' + circle(146, 138, 14) + ' ' + circle(118, 152, 7)},
    {id: 'shine', kind: 'line', role: 'shine', w: 1, group: 'spin', d: 'M92,104 A40,40 0 0 1 110,84'},
  ],
  pivots: {spin: [128, 128]},
  states: ['idle', 'attack'],
  pose: (t, st, since) => ({spin: {r: t * (st === 'attack' ? 40 : 8), s: st === 'attack' ? 1 + 0.15 * pop(since) : 1 + 0.03 * Math.sin(t * 2)}}),
  notes: 'Slowly turns. State attack (bigger, spins faster).',
};

// ---------- bacterium ----------
const flagella = (t: number) => [0, 1, 2].map((k) => smooth(Array.from({length: 8}, (_, i) => {
  const x = 196 + i * 8, y = 112 + k * 16 + Math.sin(i * 0.9 - t * 9 + k) * 7;
  return [x, y] as [number, number];
}), false)).join(' ');
export const bacterium: Obj = {
  id: 'bacterium', name: 'Bacterium', category: 'science', tags: ['bacteria', 'bacterium', 'germ', 'microbe', 'gut', 'infection', 'probiotic'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'flag', kind: 'line', w: 0.6, d: flagella},
    {id: 'body', kind: 'region', role: 'bacteria', d: capsule(124, 128, 132, 46)},
    {id: 'inner', kind: 'line', role: 'leafDark', w: 0.6, d: 'M80,128 C100,112 124,144 146,124 C158,114 168,132 176,128'},
    {id: 'dots', kind: 'region', role: 'leafDark', outline: false, opacity: 0.6, d: circle(74, 116, 6) + ' ' + circle(170, 142, 5) + ' ' + circle(112, 146, 4)},
    {id: 'shine', kind: 'line', role: 'shine', w: 0.9, d: 'M70,104 H120'},
  ],
  pivots: {'*': [128, 128]},
  pose: (t) => ({'*': {r: -12 + wave(t, 0.3, 4), x: wave(t, 0.25, 8)}}),
  notes: 'Swims gently (flagella wave).',
};

// ---------- animal cell ----------
const DOTS = [[70, 90], [84, 160], [150, 84], [190, 112], [168, 196], [124, 200], [196, 168], [62, 132], [138, 168], [100, 72]]
  .map(([x, y]) => circle(x, y, 4.5)).join(' ');
const MITO = 'M-28,0 a14,14 0 0 1 14,-14 h28 a14,14 0 0 1 0,28 h-28 a14,14 0 0 1 -14,-14 Z';
export const cell: Obj = {
  id: 'cell', name: 'Animal cell', category: 'science', tags: ['cell', 'biology', 'life', 'nucleus', 'mitochondria', 'body', 'tissue'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'membrane', kind: 'region', role: 'cytoplasm', w: 1.3, d: (t) => blob(128, 128, 104, 4, t, 0.3, 20)},
    {id: 'inner', kind: 'line', role: 'membrane', w: 0.8, d: (t) => blob(128, 128, 94, 4, t, 0.3, 20)},
    {id: 'dots', kind: 'region', role: 'membrane', outline: false, opacity: 0.6, d: DOTS},
    {id: 'nucleus', kind: 'region', role: 'nucleus', d: (t) => blob(110, 120, 34, 2, t * 0.8, 1.7, 12)},
    {id: 'nucleolus', kind: 'region', role: 'nucleolus', outline: false, d: circle(104, 114, 11)},
    {id: 'm1', kind: 'region', role: 'mito', w: 0.8, group: 'm1', d: MITO},
    {id: 'c1', kind: 'line', w: 0.55, group: 'm1', d: 'M-20,0 l6,-7 l6,7 l6,-7 l6,7 l6,-7 l6,7'},
    {id: 'm2', kind: 'region', role: 'mito', w: 0.8, group: 'm2', d: MITO},
    {id: 'c2', kind: 'line', w: 0.55, group: 'm2', d: 'M-20,0 l6,-7 l6,7 l6,-7 l6,7 l6,-7 l6,7'},
  ],
  pivots: {m1: [0, 0], m2: [0, 0]},
  pose: (t) => ({
    m1: {x: 176 + Math.sin(t * 0.9) * 6, y: 150 + Math.cos(t * 0.7) * 5, r: 25 + Math.sin(t * 0.6) * 8},
    m2: {x: 98 + Math.cos(t * 0.8) * 6, y: 182 + Math.sin(t * 1.1) * 4, r: -20 + Math.cos(t * 0.5) * 8},
  }),
  notes: 'The membrane wobbles and the mitochondria drift.',
};

export const SCIENCE = [atom, molecule, dna, virus, bacterium, cell];
