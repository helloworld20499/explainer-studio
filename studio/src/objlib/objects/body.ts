// Human body. Own drawings (256 box), cartoon-anatomical: recognisable, not medical.
import type {Obj} from '../types';
import {circle, ease, pop, rrect, smooth, star, wave} from './_shapes';

// ---------- heart ----------
export const heart: Obj = {
  id: 'heart', name: 'Heart', category: 'body', tags: ['heart', 'body', 'blood', 'pulse', 'health', 'circulation', 'love'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'cava', kind: 'region', role: 'vein', d: rrect(62, 36, 26, 84, 12)},
    {id: 'branches', kind: 'region', role: 'heartDark', w: 0.8, d: rrect(124, 10, 14, 34, 6) + ' ' + rrect(146, 8, 14, 34, 6) + ' ' + rrect(168, 12, 14, 32, 6)},
    {id: 'aorta', kind: 'region', role: 'heartDark', d: 'M98,100 V62 C98,42 112,30 132,30 H180 C190,30 196,38 196,46 C196,54 190,60 180,60 H136 C128,60 124,64 124,72 V100 Z'},
    {id: 'pulm', kind: 'region', role: 'vein', d: 'M132,100 C134,82 146,72 166,72 H200 C210,72 216,80 216,88 C216,96 210,102 200,102 H170 C164,102 160,106 160,112 Z'},
    {id: 'body', kind: 'region', role: 'heart', d: 'M128,238 C72,208 40,164 48,120 C54,86 86,76 112,92 C134,74 186,78 204,114 C218,160 184,208 128,238 Z'},
    {id: 'shade', kind: 'region', role: 'shade', outline: false, d: 'M203,106 C220,156 186,206 128,236 C166,204 192,160 190,118 C189,110 195,104 203,106 Z'},
    {id: 'coronary', kind: 'line', role: 'heartDark', w: 0.75, d: 'M124,100 C112,134 116,172 130,216 M119,142 C102,152 88,162 80,180'},
    {id: 'shine', kind: 'line', role: 'shine', w: 1.1, d: 'M68,122 C70,104 82,94 98,92'},
  ],
  pivots: {'*': [128, 160]},
  states: ['calm', 'fast'],
  pose: (t, st) => {
    const u = ((t * (st === 'fast' ? 140 : 70)) / 60) % 1;
    const b = Math.exp(-u * 9) * Math.sin(Math.min(1, u * 9) * Math.PI) + (u > 0.25 ? 0.45 * Math.exp(-(u - 0.25) * 12) : 0);
    return {'*': {sx: 1 + 0.045 * b, sy: 1 - 0.05 * b}};
  },
  notes: 'Beats (lub-dub). States calm (70 bpm) / fast (140 bpm).',
};

// ---------- brain ----------
const SPARKS = [[70, 70], [196, 76], [214, 150], [52, 160]];
export const brain: Obj = {
  id: 'brain', name: 'Brain', category: 'body', tags: ['brain', 'mind', 'think', 'memory', 'learning', 'neuron', 'idea', 'psychology'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'stem', kind: 'region', role: 'brainDark', d: 'M138,168 H162 L156,226 C154,232 142,232 140,226 Z'},
    {id: 'cereb', kind: 'region', role: 'brainDark', d: smooth([[164, 168], [196, 160], [214, 176], [200, 198], [170, 194]])},
    {id: 'main', kind: 'region', role: 'brain', d: smooth([[38, 138], [46, 96], [80, 58], [130, 46], [182, 54], [216, 86], [224, 126], [208, 158], [176, 170], [140, 172], [100, 178], [64, 170]])},
    {id: 'gyri', kind: 'line', role: 'brainDark', w: 0.7, d: 'M66,120 C80,98 98,124 114,102 C126,86 146,110 160,90 M60,150 C84,134 102,158 124,140 C140,128 164,148 188,128 M108,62 C100,78 116,88 110,104 M168,62 C158,78 176,90 166,108 M200,98 C186,110 200,124 186,140'},
    {id: 'fissure', kind: 'line', role: 'brainDark', w: 0.9, d: 'M112,174 C124,150 150,140 180,142'},
    {id: 'sparks', kind: 'region', role: 'yellow', w: 0.6, group: 'sparks', when: ['active'], d: SPARKS.map(([x, y]) => star(x, y, 4, 15, 5)).join(' ')},
  ],
  pivots: {sparks: [128, 112]},
  states: ['idle', 'active'],
  pose: (t, st, since) => ({sparks: {o: st === 'active' ? (Math.sin(t * 8) > -0.3 ? 1 : 0.2) : 0, s: 0.9 + 0.1 * pop(since)}, '*': {s: 1 + 0.01 * Math.sin(t * 1.5)}}),
  notes: 'States idle/active (thinking sparks flash).',
};

// ---------- lungs ----------
const LUNG_L: [number, number][] = [[114, 100], [112, 200], [94, 228], [56, 224], [36, 192], [38, 132], [60, 92], [92, 78]];
const mirror = (p: [number, number][]) => p.map(([x, y]) => [256 - x, y] as [number, number]);
export const lungs: Obj = {
  id: 'lungs', name: 'Lungs', category: 'body', tags: ['lungs', 'breathe', 'air', 'oxygen', 'respiration', 'smoking', 'health'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'trachea', kind: 'region', role: 'white', d: rrect(117, 16, 22, 84, 9)},
    {id: 'rings', kind: 'line', role: 'gray', w: 0.5, d: 'M119,32 H137 M119,48 H137 M119,64 H137 M119,80 H137'},
    {id: 'left', kind: 'region', role: 'lung', group: 'L', d: smooth(LUNG_L)},
    {id: 'right', kind: 'region', role: 'lung', group: 'R', d: smooth(mirror(LUNG_L))},
    {id: 'bronchi', kind: 'line', role: 'lungDark', w: 1, d: 'M128,96 L100,124 L84,150 M100,124 L94,176 M128,96 L156,124 L172,150 M156,124 L162,176'},
  ],
  pivots: {L: [112, 150], R: [144, 150]},
  states: ['calm', 'fast'],
  pose: (t, st) => {
    const b = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * (st === 'fast' ? 0.8 : 0.25));
    return {L: {sx: 1 + 0.05 * b, sy: 1 + 0.04 * b}, R: {sx: 1 + 0.05 * b, sy: 1 + 0.04 * b}};
  },
  notes: 'Breathe in and out. States calm/fast.',
};

// ---------- eye ----------
const blinkAt = (t: number) => {
  const u = t % 3.6;
  return u < 0.12 ? u / 0.12 : u < 0.26 ? 1 - (u - 0.12) / 0.14 : 0;
};
const ALMOND = 'M24,128 C70,62 186,62 232,128 C186,194 70,194 24,128 Z';
export const eye: Obj = {
  id: 'eye', name: 'Eye', category: 'body', tags: ['eye', 'see', 'vision', 'look', 'light', 'colour', 'watch'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'white', kind: 'region', role: 'white', d: ALMOND},
    {id: 'iris', kind: 'region', role: 'iris', w: 0.8, group: 'iris', clip: 'white', d: circle(128, 128, 44)},
    {id: 'pupil', kind: 'region', role: 'dark', outline: false, group: 'pupil', clip: 'white', d: circle(128, 128, 19)},
    {id: 'glint', kind: 'region', role: 'white', outline: false, group: 'iris', clip: 'white', d: circle(142, 112, 8)},
    {id: 'lid', kind: 'region', role: 'skin', clip: 'white', d: (t) => {
      const yc = 62 + 132 * blinkAt(t);   // lower edge of the lid: 62 = open, 194 = closed
      return `M18,128 C70,62 186,62 238,128 C186,${yc} 70,${yc} 18,128 Z`;
    }},
  ],
  pivots: {pupil: [128, 128]},
  states: ['idle', 'dilate'],
  pose: (t, st, since) => {
    const lx = wave(t, 0.2, 22);
    return {iris: {x: lx}, pupil: {x: lx, s: st === 'dilate' ? 1 + 0.6 * ease(since * 2) : 1}};
  },
  notes: 'Looks around and blinks. State dilate (pupil opens: dark / surprise).',
};

// ---------- tooth ----------
const TOOTH = 'M60,72 C60,40 100,36 128,48 C156,36 196,40 196,72 C196,110 186,128 180,150 L170,222 C166,234 152,232 150,220 L140,170 C136,160 120,160 116,170 L106,220 C104,232 90,234 86,222 L76,150 C70,128 60,110 60,72 Z';
export const tooth: Obj = {
  id: 'tooth', name: 'Tooth', category: 'body', tags: ['tooth', 'teeth', 'dentist', 'sugar', 'cavity', 'enamel', 'brush'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'tooth', kind: 'region', role: 'tooth', d: TOOTH},
    {id: 'shade', kind: 'region', role: 'shade', outline: false, clip: 'tooth', d: 'M196,60 C200,110 186,140 176,160 L166,226 H210 V40 Z'},
    {id: 'cavity', kind: 'region', role: 'dark', w: 0.6, when: ['cavity'], d: 'M140,62 C150,58 160,66 156,78 C152,90 136,88 134,78 C132,70 134,64 140,62 Z'},
    {id: 'crack', kind: 'line', w: 0.5, when: ['cavity'], d: 'M146,88 L140,104 L146,114'},
    {id: 'sparkle', kind: 'region', role: 'yellow', w: 0.5, group: 'spk', when: ['clean'], d: star(80, 52, 4, 16, 5) + ' ' + star(194, 96, 4, 11, 4)},
    {id: 'shine', kind: 'line', role: 'shine', w: 1, d: 'M82,70 C82,58 92,54 102,56'},
  ],
  pivots: {spk: [128, 80]},
  states: ['idle', 'cavity', 'clean'],
  pose: (t) => ({spk: {s: 0.85 + 0.15 * Math.abs(Math.sin(t * 4))}}),
  notes: 'States idle/cavity/clean (sparkles).',
};

// ---------- bone ----------
const BONE = [circle(66, 92, 28), circle(66, 150, 28), circle(190, 92, 28), circle(190, 150, 28), rrect(66, 100, 124, 42, 4)].join(' ');
export const bone: Obj = {
  id: 'bone', name: 'Bone', category: 'body', tags: ['bone', 'skeleton', 'calcium', 'strong', 'fracture', 'body'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'bone', kind: 'region', role: 'bone', union: true, d: BONE},
    {id: 'shade', kind: 'line', role: 'rockDark', w: 0.6, opacity: 0.5, d: 'M84,134 H172'},
  ],
  pivots: {'*': [128, 121]},
  pose: (t) => ({'*': {r: -28 + wave(t, 0.25, 3)}}),
  notes: 'One union region (four circles + a bar) drawn as a single shape.',
};

export const BODY = [heart, brain, lungs, eye, tooth, bone];
