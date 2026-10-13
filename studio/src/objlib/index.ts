// Object library registry. Add new object files here. Catalogue: docs/objlib.md and the objlib-* gallery compositions.
import type {Obj} from './types';
import {TECH} from './objects/tech';
import {SCIENCE} from './objects/science';
import {BODY} from './objects/body';
import {NATURE} from './objects/nature';
import {EVERYDAY} from './objects/everyday';

export const OBJECTS: Obj[] = [...SCIENCE, ...BODY, ...NATURE, ...TECH, ...EVERYDAY];

const byId: Record<string, Obj> = Object.fromEntries(OBJECTS.map((o) => [o.id, o]));
export const getObj = (id: string): Obj => {
  const o = byId[id];
  if (!o) throw new Error(`Object library: no object "${id}". Known: ${Object.keys(byId).join(', ')}`);
  return o;
};
// find objects by a word in id, name or tags (for the AI: "what do we have for 'energy'?")
export const findObj = (word: string) => {
  const w = word.toLowerCase();
  return OBJECTS.filter((o) => o.id.includes(w) || o.name.toLowerCase().includes(w) || o.tags.some((t) => t.toLowerCase().includes(w)));
};
export * from './types';
