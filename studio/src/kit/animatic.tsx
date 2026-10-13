// Animatic overlay for Gate 2: shot number + shot name (top-left), timecode (top-right), current narration line (bottom).
// The animatic is the same episode code with placeholder art and this overlay, so nothing is built twice.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, SANS} from './lib';

export type Shot = {id: string; start: number; name: string};
const tc = (t: number) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;

export const AnimaticOverlay: React.FC<{t: number; shots: Shot[]; lines: {start: number; end: number; text: string; speaker: string}[]}> = ({t, shots, lines}) => {
  const shot = [...shots].reverse().find((s) => t >= s.start);
  const line = lines.find((l) => t >= l.start && t <= l.end);
  const box: React.CSSProperties = {position: 'absolute', background: 'rgba(30,42,68,0.82)', color: '#fff', fontFamily: SANS, fontWeight: 800, borderRadius: 14, padding: '8px 18px', zIndex: 100};
  return (
    <AbsoluteFill style={{zIndex: 100}}>
      {shot && <div style={{...box, left: 24, top: 20, fontSize: 32}}>{shot.id} · {shot.name}</div>}
      <div style={{...box, right: 24, top: 20, fontSize: 32, fontVariantNumeric: 'tabular-nums'}}>{tc(t)}</div>
      {line && <div style={{...box, left: 120, right: 120, bottom: 24, fontSize: 30, fontWeight: 700, textAlign: 'center', background: 'rgba(255,255,255,0.9)', color: C.ink, border: `3px solid ${C.ink}`}}>
        {line.speaker !== 'narrator' ? `${line.speaker.toUpperCase()}: ` : ''}{line.text}</div>}
    </AbsoluteFill>
  );
};
