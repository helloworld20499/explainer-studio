// Style tokens for the object library. Objects only name ROLES; this file decides what a role looks like.
// Restyle the whole library by editing these values (or BRAND in src/brand.ts). Never put hex colours in an object file.
import {BRAND} from '../brand';

export type Tokens = {ink: string; lineW: number; roles: Record<string, string>};

// Flat renderer: fill colour per role. lineW = outline width in SCREEN px, the same for every object at every size.
export const FLAT: Tokens = {
  ink: BRAND.colors.ink,
  lineW: 6,
  roles: {
    // generic
    ink: BRAND.colors.ink, body: '#F4B479', body2: '#DDAE74', accent: BRAND.colors.accent, shade: 'rgba(30,42,68,0.16)',
    shine: '#FFFFFF', paper: '#FFFFFF', dark: '#3B4660', gray: '#AEB6C4', metal: '#C9D3E0', metalDark: '#8E9AAD',
    glass: '#EAF4FB', glassOn: '#FFE58F', glow: '#FFD54A', screen: '#BFE3F6', screenOn: '#DFF3FF',
    gold: '#F4B63F', goldDark: '#D9962A', red: '#E2464F', blue: '#2E9BD6', green: '#5BBF6A', yellow: '#F4D03F',
    orange: '#F08A3C', purple: '#9B7BD0', pink: '#F2A7B5', brown: '#8C6A4F', wood: '#DDAE74', woodDark: '#B98549',
    skin: '#F6D2B8', white: '#FFFFFF',
    // nature and space
    sky: '#BFE3F6', water: '#6FBDE6', waterDark: '#2E9BD6', ocean: '#2E9BD6', land: '#9BBF5A', leaf: '#7DBB5A', leafDark: '#4E8C3A',
    bark: '#8C6A4F', rock: '#A7A29A', rockDark: '#7D776E', sand: '#EBD49A', snow: '#F4FAFF', fire: '#F08A3C', fireCore: '#FFD54A',
    lava: '#E2464F', cloud: '#FFFFFF', sun: '#F4B63F', moon: '#E9E4D4', moonDark: '#C9C2AC',
    crust: '#8C6A4F', mantle: '#F08A3C', ocore: '#F4B63F', icore: '#FFF1B8',
    // body
    heart: '#E2464F', heartDark: '#B8323B', vein: '#4A7BD0', lung: '#F2A7B5', lungDark: '#D9798C', brain: '#F4C3C6', brainDark: '#D98F96',
    bone: '#F6F0E2', tooth: '#FFFFFF', gum: '#F08A9A', iris: '#6B8FB5', stomach: '#F2A7B5', muscle: '#E2665F',
    // cells and molecules
    cytoplasm: '#E4EFCB', membrane: '#9BBF5A', nucleus: '#9B7BD0', nucleolus: '#6B4FA8', mito: '#F08A3C',
    virus: '#9B7BD0', bacteria: '#9BBF5A', dna1: '#2E9BD6', dna2: '#E2464F', atomO: '#E2464F', atomH: '#FFFFFF', atomC: '#3B4660', atomN: '#2E9BD6',
  },
};

// Whiteboard renderer: every role maps to one of five dry-erase markers, or 'none' (outline only, no hatching).
export const MARKERS = {black: '#1F2A3A', blue: '#2563B8', red: '#D2373F', green: '#2E8B4E', orange: '#E07B22'};
type M = keyof typeof MARKERS | 'none';
const wb = (blue: string[], red: string[], green: string[], orange: string[], black: string[]) => {
  const m: Record<string, M> = {};
  blue.forEach((r) => (m[r] = 'blue')); red.forEach((r) => (m[r] = 'red')); green.forEach((r) => (m[r] = 'green'));
  orange.forEach((r) => (m[r] = 'orange')); black.forEach((r) => (m[r] = 'black'));
  return m;
};
export const WHITEBOARD = {
  board: '#FAFAF6',
  ink: MARKERS.black,
  lineW: 5.5,
  // roles not listed here draw their outline only (no hatching): dark, metal, paper, white, shine, ...
  marker: wb(
    ['blue', 'glass', 'screen', 'screenOn', 'sky', 'water', 'waterDark', 'ocean', 'vein', 'iris', 'nucleus', 'nucleolus', 'dna1', 'atomN', 'snow'],
    ['accent', 'red', 'heart', 'heartDark', 'lava', 'muscle', 'dna2', 'atomO', 'pink', 'lung', 'lungDark', 'gum', 'stomach', 'brain', 'brainDark'],
    ['green', 'land', 'leaf', 'leafDark', 'membrane', 'cytoplasm', 'bacteria'],
    ['body', 'gold', 'goldDark', 'glow', 'glassOn', 'yellow', 'orange', 'fire', 'fireCore', 'sun', 'mantle', 'ocore', 'icore', 'mito', 'wood', 'sand'],
    ['shade', 'brown', 'bark', 'woodDark', 'rockDark', 'crust', 'purple', 'virus'],
  ) as Record<string, M>,
};
