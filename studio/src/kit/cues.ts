// Word-anchored cues. Load src/episodes/<ep>/words.json (made by scripts/align.py) and ask for the time of a word.
//   const cue = makeCue(words);
//   cue(12, 'grabs')            -> start time (s) of the first "grabs" in line 12
//   cue(12, 'grabs', {nth: 2, edge: 'end', offset: 0.1})
export type Words = {lines: {i: number; start: number; words: {w: string; start: number; end: number}[]}[]};
export const makeCue = (words: Words) => (line: number, word: string, o: {nth?: number; edge?: 'start' | 'end'; offset?: number} = {}) => {
  const L = words.lines.find((l) => l.i === line);
  if (!L) throw new Error(`cue: line ${line} not in words.json`);
  const key = word.toLowerCase().replace(/[^\w']/g, '');
  const hits = L.words.filter((w) => w.w === key);
  const hit = hits[(o.nth ?? 1) - 1];
  if (!hit) throw new Error(`cue: "${word}" (#${o.nth ?? 1}) not found in line ${line}: ${L.words.map((w) => w.w).join(' ')}`);
  return (o.edge === 'end' ? hit.end : hit.start) + (o.offset ?? 0);
};
