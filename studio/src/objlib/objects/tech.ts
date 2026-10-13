// Technology, energy, lab. Upgraded objects take their silhouette from Phosphor (duotone fill layer) or Tabler (centre lines);
// fills, outlines (token width), moving parts and states are ours. Phosphor Icons and Tabler Icons: MIT (see LICENSES/).
import type {Obj} from '../types';
import {circle, ease, gear, lines, pop, poly, rrect, wave} from './_shapes';

const MIT = 'MIT';

// ---------- light bulb (Phosphor "lightbulb") ----------
const BULB = 'M208,104a79.86,79.86,0,0,1-30.59,62.92A24.29,24.29,0,0,0,168,186v6a8,8,0,0,1-8,8H96a8,8,0,0,1-8-8v-6a24.11,24.11,0,0,0-9.3-19A79.87,79.87,0,0,1,48,104.45C47.76,61.09,82.72,25,126.07,24A80,80,0,0,1,208,104Z';
const RAYS = Array.from({length: 7}, (_, i) => {
  const a = Math.PI * (1.05 + (i / 6) * 0.9), c = Math.cos(a), s = Math.sin(a);
  return `M${128 + c * 108},${104 + s * 108} L${128 + c * 132},${104 + s * 132}`;
}).join(' ');
export const bulb: Obj = {
  id: 'bulb', name: 'Light bulb', category: 'energy', tags: ['idea', 'light', 'bulb', 'electricity', 'invention', 'insight'],
  source: {kind: 'upgraded', lib: 'phosphor', icon: 'lightbulb', license: MIT},
  box: 256,
  parts: [
    {id: 'halo', kind: 'region', role: 'glow', outline: false, opacity: 0.35, d: circle(128, 104, 112), when: ['on'], group: 'rays'},
    {id: 'rays', kind: 'line', role: 'glow', w: 1.1, d: RAYS, when: ['on'], group: 'rays'},
    {id: 'glass', kind: 'region', role: 'glass', when: ['off'], d: BULB},
    {id: 'glassOn', kind: 'region', role: 'glassOn', when: ['on'], d: BULB},
    {id: 'shine', kind: 'line', role: 'shine', w: 1.1, d: 'M150,52 C166,58 178,72 182,90'},
    {id: 'fil', kind: 'line', w: 0.7, when: ['off'], d: 'M112,186 V152 L120,132 L128,152 L136,132 L144,152 V186'},
    {id: 'filOn', kind: 'line', role: 'orange', w: 0.9, when: ['on'], d: 'M112,186 V152 L120,132 L128,152 L136,132 L144,152 V186'},
    {id: 'base', kind: 'region', role: 'metal', d: rrect(90, 200, 76, 20, 6)},
    {id: 'thread', kind: 'line', w: 0.55, d: 'M98,210 H158'},
    {id: 'tip', kind: 'region', role: 'dark', d: 'M108,220 H148 L140,236 H116 Z'},
  ],
  pivots: {rays: [128, 104]},
  states: ['off', 'on'],
  pose: (t, st, since) => (st === 'on' ? {rays: {s: 0.7 + 0.3 * pop(since) + 0.04 * Math.sin(t * 5), o: Math.min(1, since * 4)}} : {}),
  notes: 'States off/on (the rays pop out on "on"). Use for ideas and electricity.',
};

// ---------- smartphone (Phosphor "device-mobile") ----------
export const phone: Obj = {
  id: 'phone', name: 'Smartphone', category: 'tech', tags: ['phone', 'mobile', 'app', 'notification', 'message', 'screen', 'social media'],
  source: {kind: 'upgraded', lib: 'phosphor', icon: 'device-mobile', license: MIT},
  box: 256,
  parts: [
    {id: 'body', kind: 'region', role: 'dark', d: rrect(56, 16, 144, 224, 24)},
    {id: 'screen', kind: 'region', role: 'screen', w: 0.6, d: 'M72,52 H184 V204 H72 Z'},
    {id: 'content', kind: 'line', w: 0.7, group: 'scroll', clip: 'screen', d: 'M88,76 H168 M88,98 H150 M88,120 H162 M88,142 H140 M88,164 H166 M88,186 H146 M88,208 H160 M88,230 H150 M88,252 H164'},
    {id: 'speaker', kind: 'line', role: 'paper', w: 0.8, d: 'M114,34 H142'},
    {id: 'home', kind: 'line', role: 'paper', w: 0.6, d: circle(128, 222, 6)},
    {id: 'bubble', kind: 'region', role: 'paper', when: ['message'], group: 'note', d: rrect(74, 108, 108, 48, 10)},
    {id: 'dot', kind: 'region', role: 'accent', outline: false, when: ['message'], group: 'note', d: circle(96, 132, 8)},
    {id: 'text', kind: 'line', w: 0.55, when: ['message'], group: 'note', d: 'M114,124 H166 M114,140 H150'},
  ],
  pivots: {note: [128, 132], '*': [128, 240]},
  states: ['idle', 'message'],
  pose: (t, st, since) => ({
    scroll: {y: -((t * 18) % 44)},
    note: {s: st === 'message' ? pop(since) : 0},
    '*': {r: st === 'message' && since < 0.6 ? Math.sin(since * 60) * 4 * (1 - since / 0.6) : 0},
  }),
  notes: 'States idle/message (buzz + bubble). The screen content scrolls.',
};

// ---------- laptop (Phosphor "laptop" silhouette) ----------
export const laptop: Obj = {
  id: 'laptop', name: 'Laptop', category: 'tech', tags: ['laptop', 'computer', 'code', 'software', 'work', 'internet'],
  source: {kind: 'upgraded', lib: 'phosphor', icon: 'laptop', license: MIT},
  box: 256,
  parts: [
    {id: 'lid', kind: 'region', role: 'dark', d: rrect(48, 40, 160, 120, 10)},
    {id: 'screen', kind: 'region', role: 'screen', w: 0.6, d: rrect(60, 52, 136, 96, 4)},
    {id: 'text', kind: 'line', w: 0.7, group: 'scroll', clip: 'screen', d: 'M74,70 H150 M74,88 H128 M74,106 H170 M74,124 H140 M74,142 H160 M74,160 H120 M74,178 H150'},
    {id: 'code', kind: 'line', role: 'accent', w: 0.7, group: 'scroll', clip: 'screen', when: ['code'], d: 'M90,88 H128 M100,124 H140 M90,160 H120'},
    {id: 'base', kind: 'region', role: 'metal', d: poly([[30, 160], [226, 160], [244, 188], [12, 188]])},
    {id: 'pad', kind: 'line', w: 0.6, d: 'M108,174 H148'},
  ],
  states: ['idle', 'code'],
  pose: (t, st) => ({scroll: {y: -((t * (st === 'code' ? 40 : 12)) % 36)}}),
  notes: 'States idle/code (red code lines, faster scrolling).',
};

// ---------- server rack (Tabler "server-2") ----------
export const server: Obj = {
  id: 'server', name: 'Server', category: 'tech', tags: ['server', 'data', 'cloud', 'computer', 'internet', 'storage', 'data centre', 'AI'],
  source: {kind: 'upgraded', lib: 'tabler', icon: 'server-2', license: MIT},
  box: 24,
  parts: [
    {id: 'rack1', kind: 'region', role: 'metal', d: 'M3 7a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v2a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-2'},
    {id: 'rack2', kind: 'region', role: 'metal', d: 'M3 15a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v2a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3l0 -2'},
    {id: 'shade', kind: 'region', role: 'shade', outline: false, d: 'M4 10.2 h16 v1.3 h-16z M4 18.2 h16 v1.3 h-16z'},
    {id: 'slot1', kind: 'line', w: 0.8, d: 'M11 8h6'},
    {id: 'slot2', kind: 'line', w: 0.8, d: 'M11 16h6'},
    {id: 'load1', kind: 'line', role: 'accent', w: 0.8, group: 'load1', d: 'M11 8h6', when: ['busy']},
    {id: 'load2', kind: 'line', role: 'accent', w: 0.8, group: 'load2', d: 'M11 16h6', when: ['busy']},
    {id: 'led1', kind: 'region', role: 'green', outline: false, group: 'led1', d: circle(7, 8, 0.9)},
    {id: 'led2', kind: 'region', role: 'green', outline: false, group: 'led2', d: circle(7, 16, 0.9)},
  ],
  pivots: {load1: [11, 8], load2: [11, 16]},
  states: ['idle', 'busy'],
  pose: (t, st) => {
    const f = st === 'busy' ? 9 : 1.5;
    return {
      led1: {o: Math.sin(t * f) > -0.2 ? 1 : 0.15}, led2: {o: Math.sin(t * f + 2) > -0.2 ? 1 : 0.15},
      load1: {sx: 0.15 + 0.85 * Math.abs(Math.sin(t * 2.3))}, load2: {sx: 0.15 + 0.85 * Math.abs(Math.sin(t * 1.7 + 1))},
    };
  },
  notes: 'States idle/busy (fast LEDs, load bars).',
};

// ---------- battery (Tabler "battery" silhouette, own fill) ----------
const LEVEL: Record<string, number> = {full: 1, half: 0.5, low: 0.15};
export const battery: Obj = {
  id: 'battery', name: 'Battery', category: 'energy', tags: ['battery', 'energy', 'charge', 'power', 'storage', 'electric'],
  source: {kind: 'upgraded', lib: 'tabler', icon: 'battery', license: MIT},
  box: 256,
  parts: [
    {id: 'case', kind: 'region', role: 'white', d: rrect(36, 80, 168, 96, 18)},
    {id: 'term', kind: 'region', role: 'dark', d: rrect(204, 108, 18, 40, 6)},
    {id: 'level', kind: 'region', role: 'green', outline: false, group: 'level', when: ['full', 'half', 'charging'], d: rrect(52, 96, 136, 64, 8)},
    {id: 'levelLow', kind: 'region', role: 'red', outline: false, group: 'level', when: ['low'], d: rrect(52, 96, 136, 64, 8)},
    {id: 'bolt', kind: 'region', role: 'yellow', w: 0.7, when: ['charging'], group: 'bolt', d: poly([[132, 88], [100, 134], [124, 134], [116, 168], [154, 118], [130, 118]])},
  ],
  pivots: {level: [52, 128], bolt: [128, 128]},
  states: ['full', 'half', 'low', 'charging'],
  pose: (t, st) => ({
    level: {sx: st === 'charging' ? 0.1 + 0.9 * ((t * 0.5) % 1) : LEVEL[st] ?? 1, o: st === 'low' ? 0.5 + 0.5 * Math.abs(Math.sin(t * 3)) : 1},
    bolt: {s: 1 + 0.06 * Math.sin(t * 6)},
  }),
  notes: 'States full/half/low/charging.',
};

// ---------- gears (own drawing) ----------
export const gears: Obj = {
  id: 'gears', name: 'Gears', category: 'tech', tags: ['gear', 'machine', 'mechanism', 'engineering', 'process', 'work', 'settings'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'g2', kind: 'region', role: 'gold', group: 'g2', d: gear(176, 92, 46, 8, 12)},
    {id: 'h2', kind: 'region', role: 'goldDark', group: 'g2', d: circle(176, 92, 14)},
    {id: 'g1', kind: 'region', role: 'metal', group: 'g1', d: gear(100, 150, 66, 11, 14)},
    {id: 'h1', kind: 'region', role: 'metalDark', group: 'g1', d: circle(100, 150, 22)},
    {id: 'a1', kind: 'region', role: 'paper', w: 0.6, d: circle(100, 150, 8)},
    {id: 'a2', kind: 'region', role: 'paper', w: 0.6, d: circle(176, 92, 6)},
  ],
  pivots: {g1: [100, 150], g2: [176, 92]},
  states: ['run', 'stop'],
  pose: (t, st) => {
    const a = st === 'stop' ? 0 : t * 40;
    return {g1: {r: a}, g2: {r: -a * (11 / 8) + 11}};
  },
  notes: 'Two meshing gears (run/stop). Good for "how a process works".',
};

// ---------- magnet (own drawing) ----------
export const magnet: Obj = {
  id: 'magnet', name: 'Magnet', category: 'science', tags: ['magnet', 'magnetism', 'force', 'attract', 'field', 'physics'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'field', kind: 'line', role: 'blue', w: 0.6, group: 'field', when: ['field'], d: 'M86,78 C92,52 164,52 170,78 M74,78 C72,30 184,30 182,78 M62,78 C52,8 204,8 194,78'},
    {id: 'u', kind: 'region', role: 'red', d: 'M56,80 V160 A72,72 0 0 0 200,160 V80 H160 V160 A32,32 0 0 1 96,160 V80 Z'},
    {id: 'tipL', kind: 'region', role: 'metal', d: 'M56,80 H96 V110 H56 Z'},
    {id: 'tipR', kind: 'region', role: 'metal', d: 'M160,80 H200 V110 H160 Z'},
    {id: 'shine', kind: 'line', role: 'shine', w: 0.9, d: 'M70,124 V156'},
  ],
  pivots: {field: [128, 78]},
  states: ['idle', 'field'],
  pose: (t, st, since) => ({field: {o: st === 'field' ? Math.min(1, since * 3) * (0.6 + 0.4 * Math.abs(Math.sin(t * 2))) : 0, s: 0.9 + 0.1 * ease(since * 2)}, '*': {r: wave(t, 0.3, 2)}}),
  notes: 'States idle/field (field lines appear and pulse).',
};

// ---------- clock (Phosphor "clock" silhouette, moving hands) ----------
const TICKS = Array.from({length: 12}, (_, i) => {
  const a = (i / 12) * Math.PI * 2, r0 = i % 3 ? 84 : 76;
  return [128 + Math.sin(a) * r0, 128 - Math.cos(a) * r0, 128 + Math.sin(a) * 92, 128 - Math.cos(a) * 92] as [number, number, number, number];
});
export const clock: Obj = {
  id: 'clock', name: 'Clock', category: 'everyday', tags: ['clock', 'time', 'hour', 'wait', 'speed', 'deadline', 'history'],
  source: {kind: 'upgraded', lib: 'phosphor', icon: 'clock', license: MIT},
  box: 256,
  parts: [
    {id: 'face', kind: 'region', role: 'paper', w: 1.3, d: circle(128, 128, 104)},
    {id: 'ticks', kind: 'line', w: 0.6, d: lines(TICKS)},
    {id: 'hour', kind: 'line', w: 1.5, group: 'h', d: 'M128,128 L128,84'},
    {id: 'min', kind: 'line', role: 'accent', w: 1.1, group: 'm', d: 'M128,140 L128,52'},
    {id: 'pin', kind: 'region', role: 'dark', d: circle(128, 128, 9)},
  ],
  pivots: {h: [128, 128], m: [128, 128]},
  states: ['tick', 'fast'],
  pose: (t, st) => (st === 'fast' ? {m: {r: t * 720}, h: {r: 60 + t * 60}} : {m: {r: 90 + Math.floor(t) * 6}, h: {r: 60 + t * 0.5}}),
  notes: 'States tick (minute hand ticks once per second) / fast (time-lapse).',
};

// ---------- satellite (own drawing) ----------
export const satellite: Obj = {
  id: 'satellite', name: 'Satellite', category: 'space', tags: ['satellite', 'space', 'orbit', 'signal', 'GPS', 'communication'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'sig', kind: 'line', role: 'blue', w: 0.7, group: 'sig', when: ['send'], d: 'M112,44 A22,22 0 0 1 144,44 M100,32 A38,38 0 0 1 156,32 M88,20 A54,54 0 0 1 168,20'},
    {id: 'strut', kind: 'line', w: 0.8, d: 'M88,128 H168'},
    {id: 'panelL', kind: 'region', role: 'blue', d: rrect(16, 104, 76, 48, 4)},
    {id: 'panelR', kind: 'region', role: 'blue', d: rrect(164, 104, 76, 48, 4)},
    {id: 'grid', kind: 'line', role: 'white', w: 0.4, d: 'M41,104 V152 M66,104 V152 M16,128 H92 M189,104 V152 M214,104 V152 M164,128 H240'},
    {id: 'body', kind: 'region', role: 'gold', d: rrect(100, 96, 56, 64, 8)},
    {id: 'dish', kind: 'region', role: 'metal', d: 'M106,96 A22,22 0 0 1 150,96 Z'},
    {id: 'ant', kind: 'line', w: 0.7, d: 'M128,74 V58'},
    {id: 'led', kind: 'region', role: 'red', outline: false, group: 'led', d: circle(128, 56, 5)},
  ],
  pivots: {sig: [128, 56]},
  states: ['idle', 'send'],
  pose: (t, st, since) => ({'*': {r: wave(t, 0.15, 6), y: wave(t, 0.25, 6)}, led: {o: Math.sin(t * 4) > 0 ? 1 : 0.2},
    sig: {o: st === 'send' ? 0.4 + 0.6 * Math.abs(Math.sin(since * 4)) : 0}}),
  notes: 'States idle/send (signal arcs). Floats gently.',
};

// ---------- rocket (own drawing) ----------
const flame = (t: number, s: number) => {
  const tip = 236 + 14 * Math.sin(t * 31) + 8 * Math.sin(t * 17);
  return `M${128 - 22 * s},184 C${128 - 30 * s},${206} ${128 - 8 * s},${tip - 20} 128,${tip} C${128 + 8 * s},${tip - 20} ${128 + 30 * s},206 ${128 + 22 * s},184 Z`;
};
export const rocket: Obj = {
  id: 'rocket', name: 'Rocket', category: 'space', tags: ['rocket', 'space', 'launch', 'start', 'fast', 'growth', 'mission'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'flame', kind: 'region', role: 'fire', outline: false, when: ['launch'], d: (t) => flame(t, 1)},
    {id: 'flame2', kind: 'region', role: 'fireCore', outline: false, when: ['launch'], d: (t) => flame(t * 1.3 + 1, 0.55)},
    {id: 'finL', kind: 'region', role: 'red', d: poly([[92, 126], [58, 182], [62, 192], [94, 176]])},
    {id: 'finR', kind: 'region', role: 'red', d: poly([[164, 126], [198, 182], [194, 192], [162, 176]])},
    {id: 'nozzle', kind: 'region', role: 'metalDark', d: rrect(106, 172, 44, 16, 4)},
    {id: 'body', kind: 'region', role: 'white', d: 'M128,22 C166,52 172,104 166,176 H90 C84,104 90,52 128,22 Z'},
    {id: 'nose', kind: 'region', role: 'red', d: 'M128,22 C146,36 157,54 161,70 H95 C99,54 110,36 128,22 Z'},
    {id: 'window', kind: 'region', role: 'screen', w: 0.9, d: circle(128, 104, 17)},
    {id: 'shine', kind: 'line', role: 'shine', w: 0.8, d: 'M104,86 C102,110 102,136 106,156'},
    {id: 'finM', kind: 'line', w: 0.7, d: 'M128,150 V176'},
  ],
  states: ['idle', 'launch'],
  pose: (t, st, since) => (st === 'launch' ? {'*': {x: Math.sin(t * 50) * 1.5, y: -(Math.max(0, since - 0.6) ** 2) * 30}} : {'*': {y: wave(t, 0.4, 3)}}),
  notes: 'States idle/launch (flame, shake, then lift-off).',
};

// ---------- magnifier (own drawing on the Tabler "search" idea) ----------
export const magnifier: Obj = {
  id: 'magnifier', name: 'Magnifier', category: 'science', tags: ['magnifier', 'search', 'look closer', 'zoom', 'detail', 'investigate', 'detective'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'handle', kind: 'region', role: 'dark', d: poly([[150, 170], [170, 150], [234, 214], [214, 234]])},
    {id: 'ring', kind: 'region', role: 'metal', d: circle(108, 108, 76)},
    {id: 'glass', kind: 'region', role: 'glass', d: circle(108, 108, 60)},
    {id: 'shine', kind: 'line', role: 'shine', w: 1.2, d: 'M70,96 A40,40 0 0 1 96,70'},
  ],
  states: ['idle', 'scan'],
  pose: (t, st) => (st === 'scan' ? {'*': {x: wave(t, 0.5, 24), y: wave(t, 0.25, 14), r: wave(t, 0.5, 6)}} : {'*': {r: wave(t, 0.3, 4)}}),
  notes: 'States idle/scan (moves around as if searching).',
};

// ---------- flask (own drawing) ----------
const FLASK = 'M106,30 H150 V44 H144 V98 L204,206 C214,224 204,238 186,238 H70 C52,238 42,224 52,206 L112,98 V44 H106 Z';
const liquid = (t: number) => {
  const y = 150, a = 5 * Math.sin(t * 3);
  return `M20,${y + a} C70,${y - 8 - a} 110,${y + 8 + a} 150,${y} S220,${y - 6} 240,${y + a} V250 H20 Z`;
};
const bubbles = (t: number, n: number) => Array.from({length: n}, (_, i) => {
  const u = (t * 0.6 + i / n) % 1, x = 100 + ((i * 37) % 60) + Math.sin(t * 3 + i) * 4, y = 226 - u * 110, r = 4 + (i % 3) * 2;
  return circle(x, y, r * (1 - u * 0.4));
}).join(' ');
export const flask: Obj = {
  id: 'flask', name: 'Lab flask', category: 'science', tags: ['flask', 'chemistry', 'experiment', 'lab', 'reaction', 'science'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'glass', kind: 'region', role: 'glass', d: FLASK},
    {id: 'liquid', kind: 'region', role: 'green', outline: false, clip: 'glass', when: ['idle'], d: liquid},
    {id: 'liquidR', kind: 'region', role: 'purple', outline: false, clip: 'glass', when: ['react'], d: liquid},
    {id: 'surface', kind: 'line', w: 0.5, clip: 'glass', d: (t) => liquid(t).split(' V')[0]},
    {id: 'bub', kind: 'region', role: 'white', w: 0.4, clip: 'glass', when: ['react'], d: (t) => bubbles(t, 9)},
    {id: 'bubIdle', kind: 'region', role: 'white', w: 0.4, clip: 'glass', when: ['idle'], d: (t) => bubbles(t * 0.4, 3)},
    {id: 'rim', kind: 'line', w: 1.2, d: 'M100,30 H156'},
    {id: 'shine', kind: 'line', role: 'shine', w: 1, d: 'M96,128 L74,168'},
  ],
  states: ['idle', 'react'],
  pose: (t, st) => (st === 'react' ? {'*': {r: Math.sin(t * 30) * 1.5}} : {}),
  notes: 'States idle/react (colour change, many bubbles, shaking).',
};

// ---------- padlock (Phosphor "lock" silhouette) ----------
export const lock: Obj = {
  id: 'lock', name: 'Padlock', category: 'tech', tags: ['lock', 'security', 'privacy', 'password', 'safe', 'protect', 'encryption'],
  source: {kind: 'upgraded', lib: 'phosphor', icon: 'lock-simple', license: MIT},
  box: 256,
  parts: [
    {id: 'shackle', kind: 'region', role: 'metal', group: 'shackle', d: 'M80,116 V84 A48,48 0 0 1 176,84 V116 H152 V84 A24,24 0 0 0 104,84 V116 Z'},
    {id: 'body', kind: 'region', role: 'gold', d: rrect(56, 112, 144, 116, 18)},
    {id: 'hole', kind: 'region', role: 'dark', outline: false, d: circle(128, 158, 13) + ' ' + poly([[120, 162], [136, 162], [140, 196], [116, 196]])},
    {id: 'shine', kind: 'line', role: 'shine', w: 0.9, d: 'M76,134 V200'},
  ],
  pivots: {shackle: [164, 116]},
  states: ['locked', 'open'],
  pose: (t, st, since) => (st === 'open' ? {shackle: {y: -26 * ease(since * 3)}} : {}),
  notes: 'States locked/open (the shackle lifts).',
};

// ---------- thermometer (own drawing) ----------
const TEMP: Record<string, number> = {mid: 0.5, hot: 0.95, cold: 0.12};
export const thermometer: Obj = {
  id: 'thermometer', name: 'Thermometer', category: 'science', tags: ['temperature', 'heat', 'cold', 'hot', 'fever', 'climate', 'thermometer'],
  source: {kind: 'scratch'},
  box: 256,
  parts: [
    {id: 'tube', kind: 'region', role: 'white', d: rrect(108, 20, 40, 180, 20)},
    {id: 'level', kind: 'region', role: 'red', outline: false, group: 'level', d: rrect(120, 40, 16, 170, 8)},
    {id: 'bulb', kind: 'region', role: 'red', d: circle(128, 206, 30)},
    {id: 'ticks', kind: 'line', w: 0.5, d: lines([[152, 50, 166, 50], [152, 80, 162, 80], [152, 110, 166, 110], [152, 140, 162, 140], [152, 170, 166, 170]])},
    {id: 'shine', kind: 'line', role: 'shine', w: 0.8, d: 'M114,198 A16,16 0 0 1 122,186'},
  ],
  pivots: {level: [128, 206]},
  states: ['mid', 'hot', 'cold'],
  pose: (t, st, since) => {
    const target = TEMP[st] ?? 0.5;
    const v = st === 'mid' ? target : 0.5 + (target - 0.5) * ease(since * 1.2);
    return {level: {sy: v + 0.01 * Math.sin(t * 2)}};
  },
  notes: 'States mid/hot/cold (the level moves to the new value).',
};

// ---------- Wi-Fi (Tabler "wifi", direct) ----------
const pulse = (t: number, ph: number) => 0.35 + 0.65 * Math.max(0, Math.sin((t * 1.6 - ph) * Math.PI));
export const wifi: Obj = {
  id: 'wifi', name: 'Wi-Fi', category: 'tech', tags: ['wifi', 'signal', 'internet', 'wireless', 'network', 'connection'],
  source: {kind: 'direct', lib: 'tabler', icon: 'wifi', license: MIT},
  box: 24,
  parts: [
    {id: 'dot', kind: 'line', d: 'M12 18l.01 0', w: 1.6, group: 'a0'},
    {id: 'a1', kind: 'line', role: 'blue', d: 'M9.172 15.172a4 4 0 0 1 5.656 0', group: 'a1'},
    {id: 'a2', kind: 'line', role: 'blue', d: 'M6.343 12.343a8 8 0 0 1 11.314 0', group: 'a2'},
    {id: 'a3', kind: 'line', role: 'blue', d: 'M3.515 9.515c4.686 -4.687 12.284 -4.687 17 0', group: 'a3'},
  ],
  states: ['idle', 'weak'],
  pose: (t, st) => (st === 'weak' ? {a2: {o: 0.15}, a3: {o: 0.15}} : {a1: {o: pulse(t, 0.2)}, a2: {o: pulse(t, 0.4)}, a3: {o: pulse(t, 0.6)}}),
  notes: 'Line icon: best as a small symbol. States idle/weak.',
};

export const TECH = [bulb, phone, laptop, server, battery, gears, magnet, clock, satellite, rocket, magnifier, flask, lock, thermometer, wifi];
