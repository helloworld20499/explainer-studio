// Characters. <Char pose="host_point" x y /> draws the real pose image when it exists, else a placeholder figure.
//   real image:  public/_work/<ep>/assets/<pose>.png  or  public/_work/lib/<pose>.png  (made by scripts/prep_assets.py
//                from episodes/<ep>-*/assets/ and brand/characters/library/)
//   placeholder: a simple coloured figure with the pose name, so animatics work before any image exists.
// Position: (x, y) = bottom centre of the figure (feet), in the 1920x1080 world.
// Pose names: <character id>_<pose>. The character id must be a key of CAST in src/brand.ts.
import React from 'react';
import {Img, getStaticFiles, staticFile, useCurrentFrame} from 'remotion';
import {CAST} from '../brand';
import {C, SANS} from './lib';

// k = image height relative to the standing height (arms up > 1, sitting < 1). Register new poses here or per episode.
type PoseDef = {k?: number};
const POSES: Record<string, PoseDef> = {};
export const registerPoses = (p: Record<string, PoseDef>) => Object.assign(POSES, p);
// Default pose vocabulary for every cast member (make the images one time, use them in every video).
export const DEFAULT_POSES: Record<string, PoseDef> = {
  stand: {}, side: {}, blink: {}, talk: {}, point: {}, think: {}, surprised: {}, laugh: {}, walk: {}, sit: {k: 0.8}, hold: {}, shrug: {}, cheer: {k: 1.08},
};
for (const id of Object.keys(CAST)) for (const [p, d] of Object.entries(DEFAULT_POSES)) POSES[`${id}_${p}`] = d;
export const POSE_NAMES = () => Object.keys(POSES);

let EP = '';
export const setEpisode = (ep: string) => { EP = ep; };
let files: Set<string> | null = null;
const has = (name: string) => {
  if (!files) files = new Set(getStaticFiles().map((f) => f.name));
  return files.has(name);
};
export const hasStatic = (name: string) => has(name);
export const realSrc = (name: string): string | null => {
  for (const p of [`_work/${EP}/assets/${name}.png`, `_work/lib/${name}.png`]) if (has(p)) return p;
  return null;
};
export const hasReal = (name: string) => realSrc(name) !== null;

const whoOf = (pose: string) => {
  const id = Object.keys(CAST).find((k) => pose.startsWith(k + '_'));
  if (!id) throw new Error(`Char: pose "${pose}" does not start with a CAST id (${Object.keys(CAST).join(', ')})`);
  return id;
};

const Placeholder: React.FC<{who: string; pose: string; h: number; flip?: boolean}> = ({who, pose, h, flip}) => {
  const col = CAST[who].color, w = h * 0.42, head = h * 0.13;
  return (
    <svg width={w + 20} height={h} viewBox={`${-w / 2 - 10} ${-h} ${w + 20} ${h}`} style={{overflow: 'visible', display: 'block'}}>
      <rect x={-w * 0.36} y={-h * 0.72} width={w * 0.72} height={h * 0.5} rx={w * 0.3} fill={col} stroke={C.ink} strokeWidth={6} />
      <rect x={-w * 0.25} y={-h * 0.26} width={w * 0.18} height={h * 0.26} rx={10} fill={col} stroke={C.ink} strokeWidth={6} />
      <rect x={w * 0.07} y={-h * 0.26} width={w * 0.18} height={h * 0.26} rx={10} fill={col} stroke={C.ink} strokeWidth={6} />
      <circle cy={-h * 0.72 - head * 1.05} r={head} fill="#FFE9D6" stroke={C.ink} strokeWidth={6} />
      <text y={-h * 0.48} transform={flip ? 'scale(-1,1)' : undefined} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={Math.max(18, w * 0.13)} fill={C.ink}>{pose.slice(who.length + 1)}</text>
    </svg>
  );
};

export type CharProps = {
  pose: string; x: number; y: number;
  k?: number;            // extra scale (1 = normal size)
  flip?: boolean;        // mirror (face the other way)
  rot?: number;          // degrees, around the feet
  o?: number;            // opacity
  talk?: number;         // 0..1 talking energy (small squash and stretch)
  z?: number;            // z-index
};

export const Char: React.FC<CharProps> = ({pose, x, y, k = 1, flip, rot = 0, o = 1, talk = 0, z}) => {
  const who = whoOf(pose);
  const def = POSES[pose] ?? {};
  const frame = useCurrentFrame();
  // blink: standing poses swap to <who>_blink for 4 frames, about every 3.5 s, different phase per character
  const ph = (who.charCodeAt(0) * 37) % 107;
  const blinking = pose === `${who}_stand` && (frame + ph) % 107 < 4 && hasReal(`${who}_blink`);
  const real = blinking ? realSrc(`${who}_blink`) : realSrc(pose);
  const h = CAST[who].height * (def.k ?? 1) * k;
  const sq = 1 + 0.018 * talk;
  const style: React.CSSProperties = {position: 'absolute', left: x, top: y - h, height: h, opacity: o, zIndex: z,
    transform: `translateX(-50%) scaleX(${(flip ? -1 : 1) / Math.sqrt(sq)}) scaleY(${sq}) rotate(${rot}deg)`, transformOrigin: '50% 100%'};
  return real ? <Img src={staticFile(real)} style={style} /> : <div style={style}><Placeholder who={who} pose={pose} h={h} flip={flip} /></div>;
};

// talking energy for a speaker at time t (from timeline.json lines): 0 when silent
export const talkOf = (lines: {speaker: string; start: number; end: number}[], who: string, t: number) => {
  const l = lines.find((x) => x.speaker === who && t >= x.start && t <= x.end);
  if (!l) return 0;
  return Math.abs(Math.sin((t - l.start) * Math.PI * 4.2)) * Math.min(1, (t - l.start) * 6, (l.end - t) * 6);
};
