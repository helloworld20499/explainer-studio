// Channel intro sting (4 s), outro and logo. The same in every video; brand values come from src/brand.ts.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {BRAND, CAST} from '../brand';
import {C, L, S, SANS, SLAB, wob} from './lib';
import {Char, hasStatic, talkOf} from './chars';
import {SvgLayer} from './stage';

export const SERIES = BRAND.series;

// Logo: the image when public/<path> exists, else the channel name as a word mark.
export const Logo: React.FC<{kind?: 'mark' | 'horizontal'; style?: React.CSSProperties; size?: number}> = ({kind = 'mark', style, size = 120}) => {
  const p = kind === 'mark' ? BRAND.logoMark : BRAND.logoHorizontal;
  if (hasStatic(p)) return <Img src={staticFile(p)} style={style} />;
  return kind === 'mark' ? (
    <div style={{...style, aspectRatio: '1', borderRadius: '50%', background: C.accent, border: `8px solid ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: SLAB, fontWeight: 800, fontSize: size, color: '#fff', boxSizing: 'border-box'}}>{BRAND.name.slice(0, 1)}</div>
  ) : (
    <div style={{...style, fontFamily: SLAB, fontWeight: 800, fontSize: size * 0.5, color: C.ink, whiteSpace: 'nowrap'}}>{BRAND.name}</div>
  );
};

// u = seconds since the sting started (0..4)
export const IntroSting: React.FC<{u: number; series?: string}> = ({u, series}) => {
  const logo = S(u, 0);
  const sr = series ? SERIES[series] : null;
  const iris = L(u, 3.45, 4.0, 0, 1);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <SvgLayer>
        {[...Array(14)].map((_, i) => {
          const a = (i / 14) * Math.PI * 2 + u * 0.4;
          return <circle key={i} cx={960 + Math.cos(a) * 640} cy={470 + Math.sin(a) * 330} r={10 + (i % 3) * 6} fill={[C.yellow, C.sky, C.accent][i % 3]} opacity={0.5 * S(u, i * 0.02)} />;
        })}
      </SvgLayer>
      <div style={{position: 'absolute', left: 960 - 170, top: 150, width: 340, transform: `scale(${logo}) rotate(${(1 - logo) * -25 + wob(u, 0.5, 2)}deg)`}}>
        <Logo kind="mark" style={{width: 340}} size={200} />
      </div>
      <div style={{position: 'absolute', top: 520, width: '100%', textAlign: 'center', fontFamily: SLAB, fontWeight: 800, fontSize: 130, color: C.ink}}>
        {BRAND.name.split('').map((ch, i) => (
          <span key={i} style={{display: 'inline-block', whiteSpace: 'pre', transform: `translateY(${(1 - S(u, 0.55 + i * 0.05)) * 60}px) scale(${S(u, 0.55 + i * 0.05)})`}}>{ch}</span>
        ))}
      </div>
      <div style={{position: 'absolute', top: 700, width: '100%', textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 46, color: C.ink, opacity: L(u, 1.3, 1.7, 0, 1)}}>{BRAND.tagline}</div>
      {sr && (
        <div style={{position: 'absolute', top: 790, width: '100%', textAlign: 'center'}}>
          <span style={{display: 'inline-block', transform: `scale(${S(u, 1.8)})`, background: sr.color, border: `4px solid ${C.ink}`, borderRadius: 40, padding: '8px 30px', fontFamily: SANS, fontWeight: 800, fontSize: 40, color: C.ink}}>{sr.name}</span>
        </div>
      )}
      {iris > 0 && <SvgLayer><circle cx={960} cy={470} r={iris * 1300} fill={C.bg} /><circle cx={960} cy={470} r={iris * 1300} fill="none" stroke={C.ink} strokeWidth={14} /></SvgLayer>}
    </AbsoluteFill>
  );
};

type Line = {i: number; speaker: string; start: number; end: number};
// t = absolute time; a = outro start; lines = timeline lines (for talking);
// endscreen = keep the right side free for YouTube end-screen elements (last 5-20 s)
export const Outro: React.FC<{t: number; a: number; lines: Line[]; next?: string; question?: string; endscreen?: boolean; pressAt?: number; cast?: boolean}> = ({t, a, lines, next = 'Next time: a new big question!', question = 'Got a question?', endscreen, pressAt, cast = true}) => {
  const u = t - a;
  const ids = cast ? Object.keys(CAST) : [];
  const press = pressAt !== undefined ? pressAt - a + 0.5 : 4.2, btnAt = press - 1.0;
  const btn = S(u, btnAt);
  const pressed = u > press;
  const cursorX = L(u, press - 0.9, press - 0.15, 1900, 1505), cursorY = L(u, press - 0.9, press - 0.15, 1100, 555);
  const x0 = endscreen ? 160 : 260, dx = endscreen ? 220 : 280;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <SvgLayer><rect y={930} width={1920} height={150} fill={C.floor} /><line x1={0} x2={1920} y1={930} y2={930} stroke={C.ink} strokeWidth={5} /></SvgLayer>
      {ids.map((id, i) => (
        <Char key={id} pose={`${id}_stand`} x={x0 + i * dx} y={1000 + (1 - S(u, 0.1 + i * 0.08)) * 700 - Math.abs(Math.sin(t * 2 + i)) * 8} k={endscreen ? 0.7 : 0.85} talk={talkOf(lines, id, t)} z={1} />
      ))}
      {ids.length === 0 && (
        <div style={{position: 'absolute', left: endscreen ? 140 : 240, top: 400, width: 420, transform: `scale(${S(u, 0.2)})`}}><Logo kind="mark" style={{width: 420}} size={240} /></div>
      )}
      {!endscreen && (
        <>
          <div style={{position: 'absolute', left: 1330, top: 380, transform: `scale(${btn * (pressed ? 0.94 + 0.06 * S(u, press + 0.1) : 1)})`}}>
            <div style={{background: pressed ? '#9AA3B5' : C.button, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 54, padding: '20px 54px', borderRadius: 60, border: `6px solid ${C.ink}`, boxShadow: '8px 10px 0 rgba(30,42,68,0.2)'}}>
              {pressed ? 'SUBSCRIBED' : 'SUBSCRIBE'}
            </div>
          </div>
          <SvgLayer>
            <g transform={`translate(1800,420) rotate(${pressed ? wob(u, 3, 18 * Math.max(0, 1 - (u - press) / 1.5)) : 0}) scale(${S(u, btnAt + 0.2)})`}>
              <path d="M-26,14 C-26,-24 -14,-38 0,-38 C14,-38 26,-24 26,14 L34,22 L-34,22 Z" fill="#FFC145" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
              <circle cy={30} r={8} fill={C.ink} />
            </g>
            {u > press - 0.9 && u < press + 0.8 && (
              <g transform={`translate(${cursorX},${cursorY}) scale(${u > press && u < press + 0.2 ? 0.85 : 1})`}>
                <path d="M0,0 L0,46 L12,35 L22,56 L31,52 L21,31 L37,31 Z" fill="#fff" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
              </g>
            )}
          </SvgLayer>
          <div style={{position: 'absolute', left: 1300, top: 590 + Math.sin(t * 1.6) * 10, width: 520, height: 292, opacity: L(u, 5.0, 5.5, 0, 1), transform: `rotate(${Math.sin(t * 0.9) * 1.5}deg)`, border: `6px solid ${C.ink}`, borderRadius: 22, background: '#fff',
            fontFamily: SLAB, fontWeight: 800, fontSize: 40, color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 30, boxSizing: 'border-box'}}>{next}</div>
        </>
      )}
      <div style={{position: 'absolute', left: endscreen ? 80 : 120, top: 120, fontFamily: SLAB, fontWeight: 800, fontSize: 64, color: C.ink, opacity: L(u, 0.3, 0.7, 0, 1)}}>{question}</div>
    </AbsoluteFill>
  );
};
