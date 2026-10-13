// ep000 "Why is the sky blue?" — demo episode of the template. Shots follow episodes/ep000-*/storyboard.md.
// All times come from timeline.json / words.json (made by voice.sh; before TTS: timeline.py/align.py --estimate).
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import timeline from './timeline.json';
import words from './words.json';
import {C, FPS, L, S, SANS, At, Arrow, Bubble, Mol, Pill, fadeIO, useFonts, wob} from '../../kit/lib';
import {Char, hasStatic, setEpisode, talkOf} from '../../kit/chars';
import {Cam, Panel, SetBG, SvgLayer} from '../../kit/stage';
import {IntroSting, Outro} from '../../kit/bookends';
import {Bars, BigNumber, Callout, Eye, LabGrid, Particles, Sun, Wave} from '../../kit/science';
import {makeCue} from '../../kit/cues';
import {AnimaticOverlay, Shot} from '../../kit/animatic';
import {CauseChain, Compare, QuestionHook} from '../../patterns';

export const EP = 'ep000';
setEpisode(EP);
type Line = {i: number; scene: string; text: string; speaker: string; start: number; end: number};
const T = timeline as {lines: Line[]; total: number};
const ln = (i: number) => T.lines[i];
const cue = makeCue(words);

const STING_A = ln(1).end + 0.3;              // 4 s intro sting after the hook (pauses.json gives line 1 an extra 4.2 s)
const OUT_A = ln(8).start - 0.4;
export const EP000_TOTAL = T.total;
// Beat sheet: storyboard.md. Patterns (src/patterns) carry most shots; S4/S5 are custom drawings.
export const SHOTS: Shot[] = [
  {id: 'S1', start: 0, name: 'QuestionHook'},
  {id: 'S2', start: ln(1).start - 0.2, name: 'Host: hiding in sunlight'},
  {id: 'S3', start: STING_A, name: 'Intro sting'},
  {id: 'S4', start: STING_A + 4, name: 'Sunlight = all colours (custom)'},
  {id: 'S5', start: ln(4).start - 0.5, name: 'Air scatters blue (custom)'},
  {id: 'S6', start: ln(5).start - 0.3, name: 'Compare: blue vs red'},
  {id: 'S7', start: ln(6).start - 0.4, name: 'CauseChain: why not violet'},
  {id: 'S8', start: ln(7).start - 0.5, name: 'The answer'},
  {id: 'S9', start: OUT_A, name: 'Outro'},
];
const shotAt = (t: number) => [...SHOTS].reverse().find((s) => t >= s.start)!.id;
const RAINBOW = ['#E2464F', '#F08A3C', '#F4B63F', '#9BBF5A', '#2E9BD6', '#9B7BD0'];

// ---------- S1 / S6: studio with the cast ----------
const Studio: React.FC<{t: number; answer?: boolean}> = ({t, answer}) => {
  const z = answer ? L(t, ln(7).start - 0.5, ln(7).end, 1.05, 1.15) : L(t, 0, ln(1).end, 1.0, 1.12);
  const sunAt = cue(1, 'sunlight');
  return (
    <Cam z={z} cx={answer ? 1100 : 960} cy={600}>
      <SetBG />
      {answer && (
        <Panel x={240} y={170} w={620} s={S(t, cue(7, 'blue') - 0.2)} label="scattered blue light">
          <SkyScene t={t} from={cue(7, 'scatters')} id="sky2" />
        </Panel>
      )}
      {!answer && <Char pose="buddy_talk" x={700} y={1000} talk={talkOf(T.lines, 'buddy', t)} />}
      <Char pose={answer ? 'host_point' : 'host_talk'} x={answer ? 1340 : 1240} y={1000} flip={!answer} talk={talkOf(T.lines, 'host', t)} />
      <SvgLayer>
        {!answer && t >= sunAt - 0.1 && <At x={1240} y={170} s={S(t, sunAt) * 0.55}><Sun t={t} r={90} /></At>}
      </SvgLayer>
    </Cam>
  );
};

// ---------- S3: sunlight = all colours, waves ----------
const Light: React.FC<{t: number}> = ({t}) => {
  const split = cue(2, 'colour');
  const beam = L(t, STING_A + 4, STING_A + 4.6, 0, 1);   // the beam is there from the first frame of the shot
  const fan = L(t, split, split + 0.8, 0, 1);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <SvgLayer>
        <LabGrid />
        <At x={250} y={300}><Sun t={t} r={110} /></At>
        <rect x={380} y={280} width={460 * beam} height={40} fill="#fff" stroke={C.ink} strokeWidth={5} />
        <At x={860} y={300} s={S(t, cue(2, 'white'))}><Pill text="white light" size={34} /></At>
        {RAINBOW.map((c, i) => (
          <line key={c} x1={1000} y1={300} x2={1000 + 700 * fan} y2={300 + (i - 2.5) * 50 * fan} stroke={c} strokeWidth={22} strokeLinecap="round" opacity={fan > 0 ? 1 : 0} />
        ))}
        <At x={1450} y={110} s={S(t, split + 0.5)}><Pill text="every colour" size={34} /></At>
        <g opacity={L(t, cue(3, 'red') - 0.2, cue(3, 'red'), 0, 1)}>
          <At x={820} y={680}><Wave t={t} w={1100} wl={360} amp={60} color={C.red} sw={12} /></At>
          <At x={1560} y={680} s={S(t, cue(3, 'long'))}><Pill text="long wave" size={36} color={C.red} /></At>
        </g>
        <g opacity={L(t, cue(3, 'blue') - 0.2, cue(3, 'blue'), 0, 1)}>
          <At x={820} y={900}><Wave t={t} w={1100} wl={120} amp={60} color={C.blue} sw={12} /></At>
          <At x={1560} y={900} s={S(t, cue(3, 'short'))}><Pill text="short wave" size={36} color={C.blue} /></At>
        </g>
      </SvgLayer>
    </AbsoluteFill>
  );
};

// sky with molecules: red passes straight, blue bounces everywhere (also used inside the S6 panel)
const SkyScene: React.FC<{t: number; from?: number; id?: string}> = ({t, from = 0, id = 'sky'}) => {
  const n = 28;
  return (
    <SvgLayer>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.skyDeep} /><stop offset="1" stopColor="#EAF6FC" /></linearGradient></defs>
      <rect width={1920} height={1080} fill={C.sky} /><rect width={1920} height={1080} fill={`url(#${id})`} />
      <At x={960} y={560}><Particles t={t} n={22} w={1500} h={760} r={20} color="#FFFFFF" speed={0.5} face /></At>
      {Array.from({length: n}, (_, i) => {
        const a = (i / n) * Math.PI * 2 + 0.3, u = Math.max(0, t - from - i * 0.08);
        const sp = 0.6 + ((i * 7) % 5) * 0.15, x = 700 + Math.cos(a) * u * 260 * sp, y = 520 + Math.sin(a) * u * 200 * sp;
        return u > 0 && x > -50 && x < 1970 && y > -50 && y < 1130 ? <circle key={i} cx={x} cy={y} r={16} fill={C.blue} stroke={C.ink} strokeWidth={3} /> : null;
      })}
    </SvgLayer>
  );
};

// ---------- S4: scattering ----------
const Scatter: React.FC<{t: number}> = ({t}) => {
  const hit = cue(4, 'bounce');
  return (
    <AbsoluteFill>
      <SkyScene t={t} from={hit} />
      <SvgLayer>
        <At x={170} y={170}><Sun t={t} r={80} /></At>
        <Arrow x1={260} y1={250} x2={1820} y2={980} color={C.red} w={12} p={L(t, cue(4, 'sunlight'), cue(4, 'sunlight') + 1.2, 0, 1)} />
        <At x={1180} y={560}><Callout t={t} at={cue(4, 'molecules')} text="gas molecules" dx={-320} dy={-250} /></At>
        <At x={1500} y={830} s={S(t, cue(4, 'sunlight') + 1)}><Pill text="red: goes straight" size={34} color={C.red} /></At>
        <At x={560} y={900} s={S(t, hit)}><Pill text="blue: bounces everywhere" size={34} color={C.blue} /></At>
        {t > ln(5).start - 0.2 && (
          <g>
            <rect x={1320} y={120} width={500} height={300} rx={30} fill="#fff" stroke={C.ink} strokeWidth={6} opacity={S(t, ln(5).start - 0.2)} />
            <At x={1570} y={250}><BigNumber t={t} at={cue(5, 'six')} to={6} unit="×" dur={0.6} color={C.blue} size={140} /></At>
            <text x={1570} y={385} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={32} fill={C.ink} opacity={L(t, cue(5, 'red'), cue(5, 'red') + 0.3, 0, 1)}>more than red</text>
          </g>
        )}
      </SvgLayer>
    </AbsoluteFill>
  );
};

export const Ep000: React.FC<{voice?: boolean; animatic?: boolean}> = ({voice, animatic}) => {
  useFonts();
  const f = useCurrentFrame();
  const t = f / FPS;
  const shot = shotAt(t);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {shot === 'S1' && <QuestionHook t={t} at={0} beats={[0, 0.3, cue(0, 'blue'), cue(0, 'purple')]} question="Why is the sky blue?" highlight="blue"
        items={[{thing: 'sun'}, {thing: 'cloud'}, {thing: 'earth'}]} />}
      {shot === 'S2' && <Studio t={t} />}
      {shot === 'S3' && <IntroSting u={t - STING_A} series="main" />}
      {shot === 'S4' && <Light t={t} />}
      {shot === 'S5' && <Scatter t={t} />}
      {shot === 'S6' && <Compare t={t} at={ln(5).start - 0.3} title="How much each colour scatters" beats={[ln(5).start - 0.3, cue(5, 'red')]}
        left={{icon: 'wave-sine', role: 'blue', label: 'Blue light', value: 6, valueLabel: 'almost 6×'}} right={{icon: 'wave-sine', role: 'red', label: 'Red light', value: 1, valueLabel: '1×'}} />}
      {shot === 'S7' && <CauseChain t={t} at={ln(6).start - 0.4} title="Then why not violet?" beats={[ln(6).start - 0.4, cue(6, 'sun'), cue(6, 'eyes'), ln(6).end - 0.3]}
        items={[{icon: 'wave-sine', role: 'purple', label: 'Violet scatters most'}, {thing: 'sun', label: 'Less violet in sunlight'}, {thing: 'eye', label: 'Eyes see it less'}, {thing: 'earth', label: 'Sky looks blue'}]} />}
      {shot === 'S8' && <Studio t={t} answer />}
      {shot === 'S9' && <Outro t={t} a={OUT_A} lines={T.lines} next="Next: Why are sunsets orange?" pressAt={ln(9).end} />}
      {voice && T.lines.map((l) => hasStatic(`_work/${EP}/vo/${String(l.i).padStart(2, '0')}.wav`) && (
        <Sequence key={l.i} from={Math.round(l.start * FPS)}><Audio src={staticFile(`_work/${EP}/vo/${String(l.i).padStart(2, '0')}.wav`)} /></Sequence>
      ))}
      {animatic && <AnimaticOverlay t={t} shots={SHOTS} lines={T.lines} />}
    </AbsoluteFill>
  );
};
