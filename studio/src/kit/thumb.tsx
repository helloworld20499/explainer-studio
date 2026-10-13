// Thumbnail frame (1280 x 720): picture on the left 60 %, title on the right (max 3 words, capitals, last word in the accent
// colour), series tag top-left, horizontal logo bottom-right. Put one face with a big expression in the picture.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, SANS, SLAB, useFonts} from './lib';
import {Logo, SERIES} from './bookends';

export const ThumbFrame: React.FC<{series?: string; words: string[]; children: React.ReactNode; bg?: string}> = ({series, words, children, bg = C.wall}) => {
  useFonts();
  const sr = series ? SERIES[series] : null;
  const size = words.some((w) => w.length >= 6) ? 100 : 124;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill style={{clipPath: 'polygon(0 0, 790px 0, 690px 720px, 0 720px)', background: bg, overflow: 'hidden'}}>{children}</AbsoluteFill>
      <svg width={1280} height={720} style={{position: 'absolute', inset: 0}}><line x1={790} y1={0} x2={690} y2={720} stroke={C.ink} strokeWidth={8} /></svg>
      {sr && <div style={{position: 'absolute', left: 28, top: 26, background: sr.color, border: `4px solid ${C.ink}`, borderRadius: 34, padding: '6px 24px', fontFamily: SANS, fontWeight: 800, fontSize: 30, color: C.ink}}>{sr.name}</div>}
      <div style={{position: 'absolute', right: 44, top: 0, bottom: 120, width: 520, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end'}}>
        {words.map((w, i) => (
          <div key={i} style={{fontFamily: SLAB, fontWeight: 800, fontSize: size, lineHeight: 1.0, color: i === words.length - 1 ? C.accent : C.ink, textAlign: 'right'}}>{w}</div>
        ))}
      </div>
      <div style={{position: 'absolute', right: 44, bottom: 34}}><Logo kind="horizontal" style={{height: 74}} size={110} /></div>
    </AbsoluteFill>
  );
};
