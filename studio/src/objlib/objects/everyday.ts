// Everyday things, money, transport, people. Phosphor (MIT) silhouettes where noted; the rest own drawings.
import type {Obj} from '../types';
import {capsule, circle, ease, lines, poly, pop, rrect, smooth, star, wave} from './_shapes';

// ---------- coin (Phosphor "coin") ----------
const faceY = (x: number) => 104 + 48 * Math.sqrt(Math.max(0, 1 - ((x - 128) / 104) ** 2));
export const coin: Obj = {
  id: 'coin', name: 'Coin', category: 'money', tags: ['money', 'coin', 'price', 'cost', 'economy', 'pay', 'value', 'cash'],
  source: {kind: 'upgraded', lib: 'phosphor', icon: 'coin', license: 'MIT'},
  box: 256,
  parts: [
    {id: 'side', kind: 'region', role: 'goldDark', d: 'M24,104 V152 C24,176 64,200 128,200 S232,176 232,152 V104 C232,128 192,152 128,152 S24,128 24,104 Z'},
    {id: 'grooves', kind: 'line', w: 0.5, d: [44, 70, 98, 128, 158, 186, 212].map((x) => `M${x},${faceY(x) + 6} V${faceY(x) + 40}`).join(' ')},
    {id: 'face', kind: 'region', role: 'gold', d: 'M232,104c0,24-40,48-104,48S24,128,24,104,64,56,128,56,232,80,232,104Z'},
    {id: 'rim', kind: 'line', w: 0.5, d: 'M204,104c0,16-30,32-76,32S52,120,52,104,82,72,128,72,204,88,204,104Z'},
    {id: 'star', kind: 'region', role: 'goldDark', w: 0.6, d: star(128, 104, 5, 32, 13, -Math.PI / 2, 0.55)},
    {id: 'shine', kind: 'line', role: 'shine', w: 0.9, d: 'M64,88 C80,76 104,70 124,68'},
  ],
  pivots: {'*': [128, 128]},
  states: ['idle', 'spin'],
  pose: (t, st) => (st === 'spin' ? {'*': {sx: Math.cos(t * 5), y: -Math.abs(Math.sin(t * 5)) * 10}} : {'*': {y: wave(t, 0.35, 6), r: wave(t, 0.18, 3)}}),
  notes: 'States idle/spin.',
};

// ---------- banknote ----------
export const banknote: Obj = {
  id: 'banknote', name: 'Banknote', category: 'money', tags: ['money', 'cash', 'banknote', 'dollar', 'pay', 'salary', 'economy', 'price'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'note', kind: 'region', role: 'green', d: rrect(20, 70, 216, 116, 10)},
    {id: 'border', kind: 'line', role: 'leafDark', w: 0.5, d: rrect(34, 84, 188, 88, 6)},
    {id: 'seal', kind: 'region', role: 'leaf', w: 0.7, d: circle(128, 128, 32)},
    {id: 'sign', kind: 'line', role: 'leafDark', w: 0.9, d: 'M140,112 C134,104 116,106 116,118 C116,130 140,126 140,138 C140,150 120,152 114,144 M128,100 V156'},
    {id: 'corners', kind: 'region', role: 'leafDark', outline: false, opacity: 0.6, d: circle(54, 104, 7) + ' ' + circle(202, 152, 7)},
  ],
  pivots: {'*': [128, 128]},
  states: ['idle', 'fly'],
  pose: (t, st) => (st === 'fly' ? {'*': {sy: 0.75 + 0.25 * Math.cos(t * 9), r: wave(t, 1.2, 12), y: wave(t, 0.8, 10)}} : {'*': {r: wave(t, 0.2, 2)}}),
  notes: 'States idle/fly (flutters).',
};

// ---------- car ----------
const wheel = (cx: number) => circle(cx, 172, 25);
export const car: Obj = {
  id: 'car', name: 'Car', category: 'transport', tags: ['car', 'drive', 'traffic', 'road', 'transport', 'travel', 'electric car'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'speed', kind: 'line', role: 'gray', w: 0.8, group: 'speed', when: ['drive'], d: 'M4,120 H28 M0,140 H20 M8,160 H26'},
    {id: 'body', kind: 'region', role: 'red', d: 'M26,170 V142 C26,130 34,124 46,122 L80,118 L102,86 C106,80 112,78 120,78 H170 C178,78 184,82 188,88 L208,118 C222,120 232,128 232,142 V170 Z'},
    {id: 'win1', kind: 'region', role: 'glass', w: 0.8, d: poly([[110, 90], [146, 90], [146, 118], [92, 118]])},
    {id: 'win2', kind: 'region', role: 'glass', w: 0.8, d: poly([[154, 90], [176, 90], [196, 118], [154, 118]])},
    {id: 'door', kind: 'line', w: 0.5, d: 'M150,122 V160 M118,136 H130'},
    {id: 'light', kind: 'region', role: 'yellow', w: 0.6, d: circle(224, 138, 7)},
    {id: 'w1', kind: 'region', role: 'dark', group: 'w1', d: wheel(76)},
    {id: 'h1', kind: 'region', role: 'metal', w: 0.6, group: 'w1', d: circle(76, 172, 10)},
    {id: 's1', kind: 'line', role: 'metal', w: 0.6, group: 'w1', d: 'M76,152 V162 M76,182 V192'},
    {id: 'w2', kind: 'region', role: 'dark', group: 'w2', d: wheel(186)},
    {id: 'h2', kind: 'region', role: 'metal', w: 0.6, group: 'w2', d: circle(186, 172, 10)},
    {id: 's2', kind: 'line', role: 'metal', w: 0.6, group: 'w2', d: 'M186,152 V162 M186,182 V192'},
    {id: 'shine', kind: 'line', role: 'shine', w: 0.8, d: 'M44,134 H70'},
  ],
  pivots: {w1: [76, 172], w2: [186, 172]},
  states: ['idle', 'drive'],
  pose: (t, st) => (st === 'drive'
    ? {w1: {r: t * 600}, w2: {r: t * 600}, '*': {y: Math.abs(Math.sin(t * 9)) * -3}, speed: {o: 0.5 + 0.5 * Math.sin(t * 12)}}
    : {w1: {r: 0}, w2: {r: 0}}),
  notes: 'Side view facing right. States idle/drive (wheels turn, speed lines).',
};

// ---------- airplane ----------
export const plane: Obj = {
  id: 'plane', name: 'Airplane', category: 'transport', tags: ['plane', 'airplane', 'flight', 'travel', 'aviation', 'trip', 'fly'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'wingB', kind: 'region', role: 'metalDark', d: poly([[118, 122], [150, 122], [116, 70], [100, 70]])},
    {id: 'body', kind: 'region', role: 'white', d: 'M20,132 C20,118 34,112 50,112 H196 C220,112 238,122 238,132 C238,142 220,152 196,152 H50 C34,152 20,146 20,132 Z'},
    {id: 'tail', kind: 'region', role: 'red', d: poly([[30, 116], [44, 70], [62, 70], [70, 114]])},
    {id: 'wing', kind: 'region', role: 'metal', d: poly([[112, 140], [150, 140], [118, 196], [100, 196]])},
    {id: 'windows', kind: 'region', role: 'screen', w: 0.5, d: [80, 100, 120, 140, 160, 180].map((x) => circle(x, 126, 5)).join(' ')},
    {id: 'cockpit', kind: 'region', role: 'screen', w: 0.6, d: 'M206,118 C220,120 230,126 232,130 H208 Z'},
    {id: 'stripe', kind: 'line', role: 'red', w: 0.7, d: 'M50,142 H200'},
  ],
  pivots: {'*': [128, 132]},
  pose: (t) => ({'*': {y: wave(t, 0.3, 8), r: wave(t, 0.3, 2, 0.25)}}),
  notes: 'Side view facing right; floats.',
};

// ---------- house ----------
export const house: Obj = {
  id: 'house', name: 'House', category: 'everyday', tags: ['house', 'home', 'family', 'building', 'energy at home', 'rent', 'city'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'chimney', kind: 'region', role: 'brown', d: rrect(162, 56, 24, 60, 2)},
    {id: 'walls', kind: 'region', role: 'sand', d: poly([[56, 124], [200, 124], [200, 236], [56, 236]])},
    {id: 'roof', kind: 'region', role: 'red', d: poly([[34, 136], [128, 46], [222, 136]])},
    {id: 'door', kind: 'region', role: 'woodDark', d: rrect(108, 168, 40, 68, 4)},
    {id: 'knob', kind: 'region', role: 'gold', outline: false, d: circle(140, 204, 4)},
    {id: 'win', kind: 'region', role: 'glass', w: 0.8, when: ['day'], d: rrect(70, 152, 30, 30, 3) + ' ' + rrect(156, 152, 30, 30, 3)},
    {id: 'winN', kind: 'region', role: 'glassOn', w: 0.8, when: ['night'], d: rrect(70, 152, 30, 30, 3) + ' ' + rrect(156, 152, 30, 30, 3)},
    {id: 'cross', kind: 'line', w: 0.45, d: 'M85,152 V182 M70,167 H100 M171,152 V182 M156,167 H186'},
  ],
  states: ['day', 'night'],
  notes: 'States day/night (windows light up).',
};

// ---------- factory ----------
const smoke = (t: number, x0: number) => Array.from({length: 3}, (_, i) => {
  const u = (t * 0.3 + i / 3) % 1;
  return circle(x0 + u * 40, 44 - u * 40, 9 + u * 12);
}).join(' ');
export const factory: Obj = {
  id: 'factory', name: 'Factory', category: 'energy', tags: ['factory', 'industry', 'pollution', 'production', 'emissions', 'jobs', 'carbon'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'smoke', kind: 'region', role: 'gray', w: 0.6, when: ['on'], d: (t) => smoke(t, 66) + ' ' + smoke(t + 1.3, 116)},
    {id: 'stacks', kind: 'region', role: 'red', d: rrect(54, 50, 24, 110, 2) + ' ' + rrect(104, 70, 24, 90, 2)},
    {id: 'bands', kind: 'line', role: 'white', w: 0.6, d: 'M56,66 H76 M106,86 H126'},
    {id: 'hall', kind: 'region', role: 'metal', d: poly([[24, 238], [24, 140], [80, 112], [80, 140], [136, 112], [136, 140], [192, 112], [192, 140], [232, 140], [232, 238]])},
    {id: 'win', kind: 'region', role: 'glass', w: 0.6, when: ['off'], d: [44, 92, 140, 188].map((x) => rrect(x, 168, 26, 22, 2)).join(' ')},
    {id: 'winOn', kind: 'region', role: 'glassOn', w: 0.6, when: ['on'], d: [44, 92, 140, 188].map((x) => rrect(x, 168, 26, 22, 2)).join(' ')},
    {id: 'door', kind: 'region', role: 'dark', d: rrect(112, 204, 32, 34, 2)},
  ],
  states: ['on', 'off'],
  notes: 'States on (smoke, lit windows) / off.',
};

// ---------- open book ----------
export const book: Obj = {
  id: 'book', name: 'Book', category: 'everyday', tags: ['book', 'read', 'learn', 'school', 'story', 'history', 'knowledge', 'study'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'cover', kind: 'region', role: 'blue', d: 'M18,74 C56,62 104,64 128,80 C152,64 200,62 238,74 V214 C200,204 152,206 128,222 C104,206 56,204 18,214 Z'},
    {id: 'left', kind: 'region', role: 'paper', d: 'M128,76 C104,60 62,56 30,64 V202 C62,196 104,198 128,214 Z'},
    {id: 'right', kind: 'region', role: 'paper', d: 'M128,76 C152,60 194,56 226,64 V202 C194,196 152,198 128,214 Z'},
    {id: 'text', kind: 'line', role: 'gray', w: 0.6, d: 'M48,96 H110 M48,116 H104 M48,136 H112 M48,156 H96 M146,96 H208 M146,116 H200 M146,136 H210 M146,156 H190'},
    {id: 'page', kind: 'region', role: 'paper', group: 'page', when: ['flip'], d: 'M128,76 C152,60 194,56 226,64 V202 C194,196 152,198 128,214 Z'},
  ],
  pivots: {page: [128, 140]},
  states: ['idle', 'flip'],
  pose: (t, st) => ({page: {sx: st === 'flip' ? Math.cos(((t * 0.8) % 1) * Math.PI) : 1}}),
  notes: 'State flip: pages turn again and again.',
};

// ---------- mug ----------
const steam = (t: number) => [0, 1, 2].map((i) => smooth(Array.from({length: 6}, (_, k) => {
  const y = 84 - k * 14, x = 92 + i * 24 + Math.sin(k * 1.1 - t * 3 + i) * 6;
  return [x, y] as [number, number];
}), false)).join(' ');
export const mug: Obj = {
  id: 'mug', name: 'Mug', category: 'everyday', tags: ['coffee', 'tea', 'mug', 'cup', 'hot drink', 'caffeine', 'morning'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'steam', kind: 'line', role: 'gray', w: 0.8, opacity: 0.8, d: steam},
    {id: 'handle', kind: 'region', role: 'red', d: 'M176,118 C214,114 222,176 176,182 V164 C198,162 198,134 176,136 Z'},
    {id: 'body', kind: 'region', role: 'red', d: 'M56,96 H180 V196 C180,214 166,228 148,228 H88 C70,228 56,214 56,196 Z'},
    {id: 'coffee', kind: 'region', role: 'brown', d: 'M60,96 C80,108 156,108 176,96 C156,86 80,86 60,96 Z'},
    {id: 'shine', kind: 'line', role: 'shine', w: 0.9, d: 'M72,124 V190'},
  ],
  notes: 'Steam rises.',
};

// ---------- hourglass ----------
const GLASS = 'M68,40 H188 C188,96 140,112 136,128 C140,144 188,160 188,216 H68 C68,160 116,144 120,128 C116,112 68,96 68,40 Z';
export const hourglass: Obj = {
  id: 'hourglass', name: 'Hourglass', category: 'everyday', tags: ['time', 'hourglass', 'wait', 'patience', 'deadline', 'history', 'countdown'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'glass', kind: 'region', role: 'glass', d: GLASS},
    {id: 'top', kind: 'region', role: 'sand', outline: false, clip: 'glass', d: (t) => {
      const u = (t / 8) % 1, y = 60 + u * 66;
      return `M40,${y} H216 V130 H40 Z`;
    }},
    {id: 'bottom', kind: 'region', role: 'sand', outline: false, clip: 'glass', d: (t) => {
      const u = (t / 8) % 1, h = 10 + u * 66;
      return `M60,216 L${128 - 70 * Math.min(1, 0.5 + u)},216 L128,${216 - h} L${128 + 70 * Math.min(1, 0.5 + u)},216 Z M40,216 H216 V230 H40 Z`;
    }},
    {id: 'stream', kind: 'line', role: 'sand', w: 0.5, d: 'M128,128 V212'},
    {id: 'frame', kind: 'region', role: 'wood', d: rrect(52, 24, 152, 18, 6) + ' ' + rrect(52, 214, 152, 18, 6)},
    {id: 'rods', kind: 'line', role: 'woodDark', w: 0.8, d: 'M60,42 V214 M196,42 V214'},
  ],
  notes: 'Sand runs down in an 8 s loop.',
};

// ---------- person (generic, faceless-simple, three shirt colours) ----------
const ARM = rrect(-12, -8, 24, 76, 12);   // hangs down from the shoulder at (0,0)
const person = (id: string, shirt: string, hair: string): Obj => ({
  id, name: `Person (${shirt})`, category: 'people', tags: ['person', 'people', 'human', 'user', 'citizen', 'worker', 'customer'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'legs', kind: 'region', role: 'dark', d: rrect(100, 170, 24, 72, 10) + ' ' + rrect(132, 170, 24, 72, 10)},
    {id: 'body', kind: 'region', role: shirt, d: 'M90,110 C90,92 104,86 128,86 C152,86 166,92 166,110 V184 H90 Z'},
    {id: 'armL', kind: 'region', role: shirt, group: 'armL', d: ARM},
    {id: 'armR', kind: 'region', role: shirt, group: 'armR', d: ARM},
    {id: 'head', kind: 'region', role: 'skin', d: circle(128, 54, 32)},
    {id: 'hair', kind: 'region', role: hair, d: 'M96,52 C94,26 116,18 130,20 C150,20 164,34 160,56 C150,40 124,36 104,46 C100,48 98,52 96,52 Z'},
    {id: 'eyes', kind: 'region', role: 'ink', outline: false, d: circle(118, 58, 3.5) + ' ' + circle(140, 58, 3.5)},
    {id: 'smile', kind: 'line', w: 0.45, d: 'M120,70 C126,75 134,75 140,70'},
  ],
  // arm groups: x,y = shoulder; r = angle (0 = hanging down, + swings the hand to the viewer's left)
  pivots: {armL: [0, 0], armR: [0, 0]},
  states: ['idle', 'wave', 'point', 'cheer'],
  pose: (t, st, since) => {
    const a = ease(since * 3), L = {x: 92, y: 100}, R = {x: 164, y: 100};
    if (st === 'wave') return {armL: {...L, r: 12}, armR: {...R, r: -12 - 138 * a + wave(t, 1.6, 18) * a}};
    if (st === 'point') return {armL: {...L, r: 12}, armR: {...R, r: -12 - 78 * a}};
    if (st === 'cheer') return {armL: {...L, r: 12 + 138 * a}, armR: {...R, r: -12 - 138 * a}, '*': {y: -Math.abs(Math.sin(t * 6)) * 10 * a}};
    return {armL: {...L, r: 12 + wave(t, 0.3, 3)}, armR: {...R, r: -12 + wave(t, 0.3, 3, 0.5)}};
  },
  notes: 'Generic person for diagrams. States idle/wave/point/cheer. Three colour versions.',
});
export const personBlue = person('person', 'blue', 'brown');
export const personRed = person('person2', 'red', 'dark');
export const personGreen = person('person3', 'green', 'orange');

export const EVERYDAY = [coin, banknote, car, plane, house, factory, book, mug, hourglass, personBlue, personRed, personGreen];
void pop; void lines;
