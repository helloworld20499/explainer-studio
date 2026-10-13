// Earth, space, weather, plants. Own drawings (256 box).
import type {Obj} from '../types';
import {circle, ease, lines, poly, pop, rrect, smooth, star, wave} from './_shapes';

// ---------- Earth ----------
const LAND = 'M40,70 C60,52 96,56 104,74 C112,92 96,104 100,124 C104,146 86,170 70,160 C56,150 64,128 52,116 C40,104 28,86 40,70 Z ' +
  'M140,100 C156,88 186,92 196,110 C206,128 196,150 180,158 C166,166 170,190 154,196 C140,200 136,178 140,162 C144,146 128,132 132,116 C134,108 136,104 140,100 Z ' +
  'M120,40 C130,34 146,38 144,48 C142,56 126,58 120,52 Z';
const slice = (R: number) => `M128,128 L128,${128 - R} A${R},${R} 0 0 1 ${128 + R},128 Z`;
export const earth: Obj = {
  id: 'earth', name: 'Earth', category: 'earth', tags: ['earth', 'planet', 'world', 'globe', 'geology', 'climate', 'layers', 'core'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'ocean', kind: 'region', role: 'ocean', d: circle(128, 128, 100)},
    {id: 'land', kind: 'region', role: 'land', w: 0.7, group: 'land', clip: 'ocean', d: LAND},
    {id: 'land2', kind: 'region', role: 'land', w: 0.7, group: 'land2', clip: 'ocean', d: LAND},
    {id: 'shade', kind: 'region', role: 'shade', outline: false, clip: 'ocean', d: 'M128,28 A100,100 0 0 1 128,228 A120,120 0 0 0 128,28 Z'},
    {id: 'crust', kind: 'region', role: 'crust', group: 'layers', when: ['inside'], d: slice(100)},
    {id: 'mantle', kind: 'region', role: 'mantle', group: 'layers', when: ['inside'], d: slice(90)},
    {id: 'ocore', kind: 'region', role: 'ocore', group: 'layers', when: ['inside'], d: slice(52)},
    {id: 'icore', kind: 'region', role: 'icore', group: 'layers', when: ['inside'], d: slice(26)},
    {id: 'rim', kind: 'line', d: circle(128, 128, 100), w: 1},
  ],
  pivots: {layers: [128, 128]},
  states: ['spin', 'inside'],
  pose: (t, st, since) => {
    const x = 20 - ((t * 22) % 220);
    return {land: {x}, land2: {x: x + 220}, layers: {s: st === 'inside' ? pop(since) : 0}};
  },
  notes: 'Turns. State inside: a quarter opens and shows crust, mantle, outer and inner core.',
};

// ---------- Sun ----------
export const sun: Obj = {
  id: 'sun', name: 'Sun', category: 'space', tags: ['sun', 'star', 'light', 'heat', 'energy', 'solar', 'day'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'rays', kind: 'region', role: 'orange', w: 0.7, group: 'rays', d: star(128, 128, 12, 118, 76)},
    {id: 'core', kind: 'region', role: 'sun', d: circle(128, 128, 76)},
    {id: 'spots', kind: 'region', role: 'orange', outline: false, opacity: 0.5, d: circle(104, 112, 12) + ' ' + circle(150, 150, 8) + ' ' + circle(156, 104, 6)},
    {id: 'shine', kind: 'line', role: 'shine', w: 1.1, d: 'M84,108 A48,48 0 0 1 108,80'},
  ],
  pivots: {rays: [128, 128]},
  states: ['idle', 'flare'],
  pose: (t, st) => ({rays: {r: t * 10, s: st === 'flare' ? 1.08 + 0.08 * Math.sin(t * 6) : 1 + 0.02 * Math.sin(t * 2)}}),
  notes: 'Rays turn slowly. State flare (rays pulse).',
};

// ---------- Moon ----------
export const moon: Obj = {
  id: 'moon', name: 'Moon', category: 'space', tags: ['moon', 'night', 'phase', 'tide', 'crater', 'space'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'disc', kind: 'region', role: 'moon', d: circle(128, 128, 100)},
    {id: 'craters', kind: 'region', role: 'moonDark', w: 0.5, clip: 'disc', d: circle(92, 96, 18) + ' ' + circle(160, 150, 24) + ' ' + circle(118, 176, 10) + ' ' + circle(170, 84, 9)},
    {id: 'night', kind: 'region', role: 'dark', outline: false, opacity: 0.75, group: 'night', clip: 'disc', d: circle(128, 128, 104)},
    {id: 'rim', kind: 'line', w: 1, d: circle(128, 128, 100)},
  ],
  states: ['full', 'crescent', 'phases'],
  pose: (t, st) => ({night: {x: st === 'full' ? 240 : st === 'crescent' ? -60 : 240 * Math.cos(t * 0.8)}}),
  notes: 'States full/crescent/phases (the shadow moves through all phases).',
};

// ---------- Cloud ----------
const CLOUD = [circle(84, 126, 44), circle(136, 100, 56), circle(186, 132, 38), rrect(52, 128, 170, 48, 24)].join(' ');
const rain = (t: number) => lines(Array.from({length: 9}, (_, i) => {
  const x = 66 + i * 16, u = (t * 1.6 + i * 0.37) % 1, y = 184 + u * 60;
  return [x - 4 * u, y, x - 4 * u - 5, y + 16] as [number, number, number, number];
}));
export const cloud: Obj = {
  id: 'cloud', name: 'Cloud', category: 'earth', tags: ['cloud', 'weather', 'rain', 'storm', 'sky', 'water cycle', 'cloud computing'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'rain', kind: 'line', role: 'blue', w: 0.8, when: ['rain', 'storm'], d: rain},
    {id: 'bolt', kind: 'region', role: 'yellow', w: 0.7, group: 'bolt', when: ['storm'], d: poly([[138, 166], [108, 210], [130, 210], [118, 250], [158, 198], [136, 198], [150, 166]])},
    {id: 'cloud', kind: 'region', role: 'cloud', union: true, when: ['idle', 'rain'], d: CLOUD},
    {id: 'cloudS', kind: 'region', role: 'gray', union: true, when: ['storm'], d: CLOUD},
    {id: 'shade', kind: 'line', role: 'gray', w: 0.6, d: 'M74,162 H196'},
  ],
  pivots: {bolt: [134, 166]},
  states: ['idle', 'rain', 'storm'],
  pose: (t) => ({'*': {x: wave(t, 0.12, 8)}, bolt: {o: (t % 1.7) < 0.25 ? 1 : 0}}),
  notes: 'States idle/rain/storm (grey cloud, rain, lightning flashes). The cloud is one union region.',
};

// ---------- Tree ----------
const CANOPY = [circle(96, 112, 52), circle(148, 84, 58), circle(176, 132, 46), circle(122, 146, 48)].join(' ');
export const tree: Obj = {
  id: 'tree', name: 'Tree', category: 'nature', tags: ['tree', 'forest', 'nature', 'oxygen', 'wood', 'season', 'environment'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'trunk', kind: 'region', role: 'bark', d: 'M112,240 C118,204 120,170 114,140 H146 C140,170 142,204 150,240 Z'},
    {id: 'branch', kind: 'line', role: 'bark', w: 1.3, d: 'M126,170 L98,140 M138,160 L166,132'},
    {id: 'canopy', kind: 'region', role: 'leaf', union: true, group: 'top', when: ['summer'], d: CANOPY},
    {id: 'canopyA', kind: 'region', role: 'orange', union: true, group: 'top', when: ['autumn'], d: CANOPY},
    {id: 'shade', kind: 'region', role: 'shade', outline: false, group: 'top', d: 'M70,150 C96,176 160,178 200,150 C190,170 160,186 128,186 C100,186 80,172 70,150 Z'},
    {id: 'fruit', kind: 'region', role: 'red', w: 0.6, group: 'top', when: ['summer'], d: circle(96, 100, 9) + ' ' + circle(170, 120, 9) + ' ' + circle(140, 66, 8)},
    {id: 'ground', kind: 'line', role: 'leafDark', w: 0.8, d: 'M72,240 H184'},
  ],
  pivots: {top: [128, 200]},
  states: ['summer', 'autumn'],
  pose: (t) => ({top: {r: wave(t, 0.3, 1.6)}}),
  notes: 'Sways. States summer/autumn.',
};

// ---------- Leaf ----------
export const leaf: Obj = {
  id: 'leaf', name: 'Leaf', category: 'nature', tags: ['leaf', 'plant', 'photosynthesis', 'green', 'nature', 'chlorophyll'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'blade', kind: 'region', role: 'leaf', d: 'M128,226 C46,182 44,72 128,22 C212,72 210,182 128,226 Z'},
    {id: 'shade', kind: 'region', role: 'leafDark', outline: false, opacity: 0.45, d: 'M128,226 C210,182 212,72 128,22 C170,80 172,170 128,226 Z'},
    {id: 'veins', kind: 'line', role: 'leafDark', w: 0.8, d: 'M128,40 V230 M128,90 L96,64 M128,90 L160,64 M128,130 L88,100 M128,130 L168,100 M128,170 L92,142 M128,170 L164,142'},
    {id: 'stem', kind: 'line', role: 'leafDark', w: 1.3, d: 'M128,224 V248'},
  ],
  pivots: {'*': [128, 240]},
  pose: (t) => ({'*': {r: -18 + wave(t, 0.35, 5)}}),
  notes: 'Sways from the stem.',
};

// ---------- Sprout in a pot ----------
export const sprout: Obj = {
  id: 'sprout', name: 'Sprout', category: 'nature', tags: ['plant', 'sprout', 'grow', 'growth', 'seed', 'start', 'garden'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'stem', kind: 'line', role: 'leafDark', w: 1.4, group: 'plant', d: 'M128,176 C126,140 132,112 128,84'},
    {id: 'leaves', kind: 'region', role: 'leaf', group: 'plant', d: 'M128,110 C108,86 76,84 60,98 C78,118 108,122 128,110 Z M128,92 C148,66 182,62 198,76 C180,98 150,102 128,92 Z'},
    {id: 'veins', kind: 'line', role: 'leafDark', w: 0.5, group: 'plant', d: 'M124,108 L78,98 M132,90 L180,76'},
    {id: 'pot', kind: 'region', role: 'orange', d: poly([[82, 182], [174, 182], [162, 238], [94, 238]])},
    {id: 'rim', kind: 'region', role: 'orange', d: rrect(72, 166, 112, 22, 6)},
    {id: 'shade', kind: 'region', role: 'shade', outline: false, d: poly([[150, 188], [172, 188], [162, 236], [146, 236]])},
  ],
  pivots: {plant: [128, 176]},
  states: ['idle', 'grow'],
  pose: (t, st, since) => ({plant: {s: st === 'grow' ? ease(since / 1.6) : 1, r: wave(t, 0.4, 2)}}),
  notes: 'State grow: the plant grows out of the pot (about 1.6 s).',
};

// ---------- Volcano ----------
const smoke = (t: number) => Array.from({length: 4}, (_, i) => {
  const u = (t * 0.35 + i / 4) % 1;
  return circle(128 + Math.sin(u * 5 + i) * 14 + u * 30, 70 - u * 60, 10 + u * 16);
}).join(' ');
const lavaBlobs = (t: number) => Array.from({length: 5}, (_, i) => {
  const u = (t * 0.9 + i / 5) % 1, vx = (i - 2) * 46;
  return circle(128 + vx * u, 70 - 150 * u + 170 * u * u, 8);
}).join(' ');
export const volcano: Obj = {
  id: 'volcano', name: 'Volcano', category: 'earth', tags: ['volcano', 'eruption', 'lava', 'magma', 'mountain', 'geology'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'smoke', kind: 'region', role: 'gray', w: 0.6, opacity: 0.85, d: smoke},
    {id: 'blobs', kind: 'region', role: 'lava', w: 0.6, when: ['erupt'], d: lavaBlobs},
    {id: 'mount', kind: 'region', role: 'rock', d: 'M14,238 L96,92 C104,80 152,80 160,92 L242,238 Z'},
    {id: 'shade', kind: 'region', role: 'rockDark', outline: false, opacity: 0.6, d: 'M160,92 L242,238 H176 C170,190 150,140 160,92 Z'},
    {id: 'crater', kind: 'region', role: 'lava', d: 'M98,90 C108,98 148,98 158,90 C150,82 106,82 98,90 Z'},
    {id: 'flow', kind: 'region', role: 'lava', when: ['erupt'], group: 'flow', d: 'M110,94 C100,130 108,150 96,184 C92,196 104,200 108,188 C118,160 120,130 132,96 Z M140,96 C150,120 146,140 158,160 C164,170 172,164 168,154 C160,134 158,116 150,94 Z'},
    {id: 'snow', kind: 'line', role: 'white', w: 0.8, d: 'M88,110 L104,104 M150,104 L168,110'},
  ],
  pivots: {flow: [128, 94]},
  states: ['idle', 'erupt'],
  pose: (t, st, since) => ({flow: {sy: st === 'erupt' ? ease(since) : 0}, '*': {x: st === 'erupt' ? Math.sin(t * 40) * 1.2 : 0}}),
  notes: 'Smoke rises. State erupt: lava flows and blobs fly, the mountain shakes.',
};

// ---------- Fire ----------
const flame = (t: number, s: number, ph: number) => {
  const h = 150 * s + 12 * Math.sin(t * 9 + ph) + 6 * Math.sin(t * 23 + ph), w = 64 * s, sw = 8 * s * Math.sin(t * 7 + ph);
  return `M${128 - w},196 C${128 - w * 1.15},${196 - h * 0.35} ${128 - w * 0.45 + sw},${196 - h * 0.6} ${128 + sw},${196 - h} ` +
    `C${128 + w * 0.45 + sw},${196 - h * 0.6} ${128 + w * 1.15},${196 - h * 0.35} ${128 + w},196 C${128 + w * 0.5},212 ${128 - w * 0.5},212 ${128 - w},196 Z`;
};
export const fire: Obj = {
  id: 'fire', name: 'Fire', category: 'energy', tags: ['fire', 'flame', 'burn', 'heat', 'energy', 'combustion', 'campfire'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'outer', kind: 'region', role: 'fire', d: (t) => flame(t, 1, 0)},
    {id: 'inner', kind: 'region', role: 'fireCore', outline: false, d: (t) => flame(t * 1.2, 0.55, 1.3)},
    {id: 'logs', kind: 'region', role: 'wood', d: poly([[44, 200], [212, 226], [208, 244], [40, 218]]) + ' ' + poly([[212, 200], [44, 226], [48, 244], [216, 218]])},
  ],
  states: ['idle', 'big'],
  pose: (t, st, since) => ({'*': {s: st === 'big' ? 1 + 0.15 * ease(since) : 1}}),
  notes: 'Flickers. State big (grows a little).',
};

// ---------- Water drop ----------
export const drop: Obj = {
  id: 'drop', name: 'Water drop', category: 'earth', tags: ['water', 'drop', 'rain', 'liquid', 'H2O', 'drink', 'water cycle'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'drop', kind: 'region', role: 'water', d: 'M128,22 C150,70 196,112 196,160 A68,68 0 0 1 60,160 C60,112 106,70 128,22 Z'},
    {id: 'shade', kind: 'region', role: 'waterDark', outline: false, opacity: 0.5, d: 'M196,160 A68,68 0 0 1 120,228 C160,212 182,190 186,150 C186,130 180,116 172,100 C186,118 196,138 196,160 Z'},
    {id: 'shine', kind: 'line', role: 'shine', w: 1.2, d: 'M92,150 C92,128 102,110 114,96'},
  ],
  pivots: {'*': [128, 228]},
  pose: (t) => {
    const b = Math.abs(Math.sin(t * 2.4));
    return {'*': {sx: 1 + 0.04 * (1 - b), sy: 1 - 0.04 * (1 - b), y: -10 * b}};
  },
  notes: 'Bounces with a small squash.',
};

// ---------- Snowflake ----------
const ARM = (a: number) => {
  const p = (r: number, da = 0): [number, number] => [128 + Math.cos(a + da) * r, 128 + Math.sin(a + da) * r];
  const [x0, y0] = p(0), [x1, y1] = p(96), [b1x, b1y] = p(56), [c1x, c1y] = p(78, 0.32), [c2x, c2y] = p(78, -0.32), [b2x, b2y] = p(34), [d1x, d1y] = p(50, 0.45), [d2x, d2y] = p(50, -0.45);
  return [[x0, y0, x1, y1], [b1x, b1y, c1x, c1y], [b1x, b1y, c2x, c2y], [b2x, b2y, d1x, d1y], [b2x, b2y, d2x, d2y]] as [number, number, number, number][];
};
export const snowflake: Obj = {
  id: 'snowflake', name: 'Snowflake', category: 'earth', tags: ['snow', 'snowflake', 'cold', 'ice', 'winter', 'freeze', 'crystal'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'arms', kind: 'line', role: 'blue', w: 1.3, d: lines(Array.from({length: 6}, (_, i) => ARM((i / 6) * Math.PI * 2)).flat())},
    {id: 'core', kind: 'region', role: 'snow', w: 0.8, d: star(128, 128, 6, 18, 10)},
  ],
  pivots: {'*': [128, 128]},
  pose: (t) => ({'*': {r: t * 12}}),
  notes: 'Turns slowly.',
};

export const NATURE = [earth, sun, moon, cloud, tree, leaf, sprout, volcano, fire, drop, snowflake];
// silence unused helper warnings in some editors
void smooth;
