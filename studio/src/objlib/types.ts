// Object library format (docs/objlib.md). An object is STRUCTURE + ROLES, not a finished picture:
// the renderers (flat, whiteboard) read the same data and draw it in their own way.
// Coordinates are in the object's own box (0..box). Colours are role names (objlib/tokens.ts), never hex values.

export type Kind =
  | 'region'   // a filled area (flat: fill + ink outline; whiteboard: outline drawn by marker + hatch fill)
  | 'line'     // a centre-line stroke (flat: stroke in the role colour; whiteboard: drawn stroke by stroke)
  | 'inkfill'; // a filled shape that IS a line (icon outlines with a baked width). Avoid in new objects.

export type Part = {
  id: string;
  kind: Kind;
  d: string | ((t: number) => string);   // path; a function = the shape itself moves (membrane wobble, flame)
  role?: string;          // colour role; default 'ink' for lines, 'body' for regions
  w?: number;             // line width multiplier (1 = token width)
  outline?: boolean;      // region with ink outline (default true)
  union?: boolean;        // region made of overlapping sub-shapes (cloud, bone): drawn as ONE shape, no inner outlines
  opacity?: number;
  group?: string;         // parts in a group move together (pose)
  clip?: string;          // draw only inside the region part with this id
  when?: string[];        // visible only in these states
};

export type Xf = {x?: number; y?: number; r?: number; s?: number; sx?: number; sy?: number; o?: number};
export type Pose = Record<string, Xf>;   // key = group id, '*' = whole object

export type Category = 'science' | 'space' | 'earth' | 'nature' | 'body' | 'tech' | 'energy' | 'everyday' | 'transport' | 'money' | 'people' | 'symbols';

export type Obj = {
  id: string;
  name: string;
  category: Category;
  tags: string[];                                   // search words (synonyms too)
  source: {kind: 'direct' | 'upgraded' | 'scratch'; lib?: 'tabler' | 'phosphor'; icon?: string; license?: string};
  box: number;                                      // 24 (Tabler), 256 (Phosphor, own drawings)
  parts: Part[];
  pivots?: Record<string, [number, number]>;        // rotation / scale centre per group ('*' = whole object)
  states?: string[];                                // first = default
  pose?: (t: number, state: string, since: number) => Pose;  // idle motion + state changes; t in s, since = s since the state began
  notes?: string;                                   // how to use it (shown in the catalogue)
};

export const pathOf = (p: Part, t: number) => (typeof p.d === 'function' ? p.d(t) : p.d);
