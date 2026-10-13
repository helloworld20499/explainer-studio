// 9:16 Short (1080 x 1920) cut from the 16:9 episode: title band, a 1080-wide window that follows a focus point,
// karaoke captions from words.json, end card. Audio = the final mix (public/_work/<ep>/mix.wav, copied by publish.sh).
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {BRAND, CAST} from '../brand';
import {C, FPS, L, S, SANS, SLAB, useFonts} from './lib';
import {Logo, SERIES} from './bookends';

export type ShortSeg = {src: number; len: number; focus: [number, number][]};   // focus: [source time, x centre in the 1920 frame]
type Words = {lines: {i: number; start: number; words: {w: string; start: number; end: number}[]}[]};
type Timeline = {lines: {i: number; text: string; speaker: string}[]};
export const END_CARD = 2.5;
export const shortTotal = (segs: ShortSeg[]) => segs.reduce((a, s) => a + s.len, 0) + END_CARD;
const fr = (s: number) => Math.round(s * FPS);

// Karaoke caption: the current line, the spoken word in the accent colour, speaker name above (when there is a cast)
export const Caption: React.FC<{t: number; words: Words; timeline: Timeline; top?: number}> = ({t, words, timeline, top = 1440}) => {
  const ln = words.lines.find((l) => l.words.length && t >= l.start - 0.1 && t <= l.words[l.words.length - 1].end + 0.3);
  if (!ln) return null;
  const tl = timeline.lines.find((x) => x.i === ln.i);
  if (!tl) return null;
  const toks = tl.text.split(/\s+/);
  let k = -1;
  ln.words.forEach((w, j) => { if (t >= w.start) k = j; });
  const who = CAST[tl.speaker];
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top, textAlign: 'center'}}>
      {who && <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 38, color: who.color, letterSpacing: 2, marginBottom: 10}}>{who.name.toUpperCase()}</div>}
      <div style={{fontFamily: SLAB, fontWeight: 800, fontSize: 64, lineHeight: 1.18, color: C.ink}}>
        {toks.map((w, j) => <span key={j} style={{color: j === k ? C.accent : C.ink}}>{w} </span>)}
      </div>
    </div>
  );
};

export const ShortCut: React.FC<{ep: string; segs: ShortSeg[]; Main: React.FC; title: React.ReactNode; series?: string; words: Words; timeline: Timeline}> = ({ep, segs, Main, title, series, words, timeline}) => {
  useFonts();
  const t = useCurrentFrame() / FPS;
  const starts = segs.map((_, i) => segs.slice(0, i).reduce((a, s) => a + s.len, 0));
  const total = shortTotal(segs);
  const si = starts.findIndex((s, i) => t >= s && t < s + segs[i].len);
  const seg = si >= 0 ? segs[si] : null;
  const srcT = seg ? seg.src + (t - starts[si]) : 0;
  const endU = t - (total - END_CARD);
  const focusAt = (sg: ShortSeg, tt: number) => {
    let x = sg.focus[0][1];
    for (const [ft, fx] of sg.focus) if (tt >= ft) x = fx;
    return Math.min(Math.max(x, 540), 1380);
  };
  const sr = series ? SERIES[series] : null;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <div style={{position: 'absolute', top: 90, width: '100%', textAlign: 'center'}}>
        {sr && <span style={{display: 'inline-block', background: sr.color, border: `4px solid ${C.ink}`, borderRadius: 34, padding: '6px 26px', fontFamily: SANS, fontWeight: 800, fontSize: 34, color: C.ink}}>{sr.name}</span>}
        <div style={{fontFamily: SLAB, fontWeight: 800, fontSize: 72, color: C.ink, marginTop: 22, lineHeight: 1.1}}>{title}</div>
      </div>
      <div style={{position: 'absolute', left: 0, top: 400, width: 1080, height: 1000, overflow: 'hidden', borderTop: `6px solid ${C.ink}`, borderBottom: `6px solid ${C.ink}`}}>
        {segs.map((sg, i) => (
          <Sequence key={i} from={fr(starts[i])} durationInFrames={fr(sg.len)}>
            <div style={{position: 'absolute', top: -40, left: 540 - focusAt(sg, si === i ? srcT : sg.src), width: 1920, height: 1080}}>
              <Sequence from={-fr(sg.src)}><Main /></Sequence>
            </div>
            <Audio src={staticFile(`_work/${ep}/mix.wav`)} startFrom={fr(sg.src)} endAt={fr(sg.src + sg.len)} />
          </Sequence>
        ))}
      </div>
      {seg && <Caption t={srcT} words={words} timeline={timeline} />}
      {endU >= 0 && (
        <AbsoluteFill style={{background: C.bg, opacity: L(endU, 0, 0.25, 0, 1)}}>
          <div style={{position: 'absolute', left: 540 - 180, top: 520, width: 360, transform: `scale(${S(endU, 0.1)})`}}><Logo kind="mark" style={{width: 360}} size={220} /></div>
          <div style={{position: 'absolute', top: 960, width: '100%', textAlign: 'center', fontFamily: SLAB, fontWeight: 800, fontSize: 92, color: C.ink}}>{BRAND.name}</div>
          <div style={{position: 'absolute', top: 1090, width: '100%', textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 48, color: C.ink, opacity: L(endU, 0.5, 0.9, 0, 1)}}>Full video on the channel</div>
          <div style={{position: 'absolute', top: 1220, width: '100%', textAlign: 'center'}}>
            <span style={{display: 'inline-block', transform: `scale(${S(endU, 0.9)})`, background: C.button, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 56, padding: '18px 56px', borderRadius: 60, border: `6px solid ${C.ink}`}}>SUBSCRIBE</span>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
