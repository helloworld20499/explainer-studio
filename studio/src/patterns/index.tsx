// Explanation patterns: one component per way of explaining. Catalogue + when-to-use: docs/patterns.md.
// The demos below are also the "patterns-reel" and "patterns-sheet" compositions (scripts/render-library.sh).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import type {Look} from '../objlib/Thing';
import {C, FPS, SANS, SLAB, useFonts} from '../kit/lib';
import {CauseChain, Cycle, Steps, Timeline} from './sequence';
import {Analogy, BeforeAfter, Compare, MythFact, ScaleLadder} from './compare';
import {BigReveal, CountUnits, Cutaway, FlowNetwork, QuestionHook, ZoomInto} from './reveal';

export {CauseChain, Cycle, Steps, Timeline, Analogy, BeforeAfter, Compare, MythFact, ScaleLadder, BigReveal, CountUnits, Cutaway, FlowNetwork, QuestionHook, ZoomInto};
export * from './common';

type Demo = {name: string; use: string; render: (t: number, look?: Look) => React.ReactElement};
const at = 0;
export const DEMOS: Demo[] = [
  {name: 'QuestionHook', use: 'the opening question', render: (t, look) => <QuestionHook t={t} at={at} look={look} beats={[0, 0.8, 1.4, 2.0]} question="Why do we need sleep?" highlight="sleep" items={[{thing: 'brain'}, {thing: 'moon', state: 'crescent'}, {thing: 'clock', state: 'fast'}]} />},
  {name: 'CauseChain', use: 'A causes B causes C', render: (t, look) => <CauseChain t={t} at={at} look={look} title="How a fever fights germs" beats={[0.2, 1.8, 3.4, 5.0]} items={[{thing: 'virus', label: 'Germs get in'}, {thing: 'brain', state: 'active', label: 'Brain turns up heat'}, {thing: 'thermometer', state: 'hot', stateAt: 3.4, label: 'Fever'}, {thing: 'bacterium', label: 'Germs slow down'}]} />},
  {name: 'Cycle', use: 'a loop that repeats', render: (t, look) => <Cycle t={t} at={at} look={look} title="The water cycle" beats={[0.2, 1.4, 2.6, 3.8]} items={[{thing: 'sun', label: 'Sun heats water'}, {thing: 'cloud', label: 'Vapour makes clouds'}, {thing: 'cloud', state: 'rain', label: 'Rain falls'}, {thing: 'drop', label: 'Water collects'}]} />},
  {name: 'Steps', use: 'how to do something', render: (t, look) => <Steps t={t} at={at} look={look} title="Make your battery last" beats={[0.2, 2.6, 5.0]} steps={[{thing: 'phone', label: 'Lower brightness'}, {thing: 'wifi', state: 'weak', label: 'Turn off what you do not use'}, {thing: 'battery', state: 'charging', label: 'Charge 20 to 80 %'}]} />},
  {name: 'Timeline', use: 'history, an order of events', render: (t, look) => <Timeline t={t} at={at} look={look} title="Inventions" beats={[0.2, 2.0, 3.8, 5.6]} events={[{date: '1879', thing: 'bulb', state: 'on', label: 'Light bulb'}, {date: '1903', thing: 'plane', label: 'First flight'}, {date: '1969', thing: 'rocket', state: 'launch', stateAt: 4.4, label: 'Moon landing'}, {date: '2007', thing: 'phone', label: 'Smartphone'}]} />},
  {name: 'BeforeAfter', use: 'a change over time', render: (t, look) => <BeforeAfter t={t} at={at} look={look} title="Sugar + time" beats={[0.2, 2.4]} before={{thing: 'tooth', label: 'Healthy'}} after={{thing: 'tooth', state: 'cavity', label: 'Cavity'}} />},
  {name: 'Compare', use: 'A vs B with numbers', render: (t, look) => <Compare t={t} at={at} look={look} title="Caffeine in one cup" beats={[0.2, 1.6]} left={{thing: 'mug', label: 'Coffee', value: 95, valueLabel: '95 mg'}} right={{thing: 'leaf', label: 'Tea', value: 47, valueLabel: '47 mg'}} />},
  {name: 'MythFact', use: 'correct a common belief', render: (t, look) => <MythFact t={t} at={at} look={look} beats={[0.2, 2.2, 3.0]} myth="We only use 10 % of our brain." fact="Scans show we use almost all of it, just not all at once." item={{thing: 'brain', state: 'active'}} />},
  {name: 'Analogy', use: 'explain the new with the known', render: (t, look) => <Analogy t={t} at={at} look={look} beats={[0.2, 1.6, 3.2]} a={{thing: 'cell', label: 'A cell'}} b={{thing: 'factory', state: 'on', label: 'A factory'}} shared="Both turn raw materials into products" />},
  {name: 'ScaleLadder', use: 'how big / how small', render: (t, look) => <ScaleLadder t={t} at={at} look={look} title="Tiny, tinier, tiniest" beats={[0.2, 2.4, 4.8]} steps={[{thing: 'virus', label: 'Virus · 0.1 µm'}, {thing: 'bacterium', ratio: 20, label: 'Bacterium · 2 µm'}, {thing: 'cell', ratio: 10, label: 'Human cell · 20 µm'}]} />},
  {name: 'ZoomInto', use: 'what is inside / too small to see', render: (t, look) => <ZoomInto t={t} at={at} look={look} title="One drop of pond water" beats={[0.2, 1.8, 3.1, 3.7, 4.3]} outer={{thing: 'drop'}} focus={[0.5, 0.62]} badge="× 1,000" inner={[{thing: 'bacterium', label: 'Bacteria'}, {thing: 'cell', label: 'Cells'}, {thing: 'virus', label: 'Viruses'}]} />},
  {name: 'Cutaway', use: 'the parts of a thing', render: (t, look) => <Cutaway t={t} at={at} look={look} title="Inside the Earth" beats={[0.2, 1.0, 2.0, 3.0, 4.0, 5.0]} item={{thing: 'earth'}} open="inside" parts={[{label: 'Crust', fx: 0.76, fy: 0.24}, {label: 'Mantle', fx: 0.69, fy: 0.31}, {label: 'Outer core', fx: 0.61, fy: 0.39}, {label: 'Inner core', fx: 0.53, fy: 0.47}]} />},
  {name: 'CountUnits', use: 'a share, "1 in 4"', render: (t, look) => <CountUnits t={t} at={at} look={look} title="One in four" beats={[0.2, 2.4]} total={40} highlight={10} big="1 in 4" caption="10 of these 40 people" cols={8} />},
  {name: 'BigReveal', use: 'one surprising number', render: (t, look) => <BigReveal t={t} at={at} look={look} beats={[0.2, 0.8]} value={384400} unit=" km" caption="from the Earth to the Moon" item={{thing: 'moon'}} />},
  {name: 'FlowNetwork', use: 'where things go (energy, money, data)', render: (t, look) => <FlowNetwork t={t} at={at} look={look} title="Where energy goes" beats={[0.2, 1.2, 3.0, 5.0]}
    nodes={[{id: 'sun', thing: 'sun', x: 300, y: 340, label: 'Sun'}, {id: 'leaf', thing: 'leaf', x: 880, y: 340, label: 'Plants'}, {id: 'p', thing: 'person', x: 1620, y: 340, label: 'People'}, {id: 'fire', thing: 'fire', x: 1340, y: 740, label: 'Wood fire'}]}
    edges={[['sun', 'leaf'], ['leaf', 'p'], ['leaf', 'fire']]} paths={[['sun', 'leaf', 'p'], ['sun', 'leaf', 'fire']]} />},
];

export const SEG = 7.5;
export const REEL_TOTAL = DEMOS.length * SEG;

const Tag: React.FC<{i: number; d: Demo}> = ({i, d}) => (
  <div style={{position: 'absolute', left: 30, bottom: 26, background: C.ink, color: '#fff', borderRadius: 18, padding: '10px 22px', fontFamily: SANS, fontWeight: 800, fontSize: 28}}>
    <span style={{fontFamily: SLAB, color: C.accent}}>{String(i + 1).padStart(2, '0')}</span>&nbsp; {d.name} <span style={{opacity: 0.7, fontWeight: 700}}>— {d.use}</span>
  </div>
);

export const PatternsReel: React.FC<{look?: Look}> = ({look}) => {
  useFonts();
  const t = useCurrentFrame() / FPS;
  const i = Math.min(DEMOS.length - 1, Math.floor(t / SEG));
  return (
    <AbsoluteFill>
      {DEMOS[i].render(t - i * SEG, look)}
      <Tag i={i} d={DEMOS[i]} />
    </AbsoluteFill>
  );
};

// all patterns at one moment (t = 6 s into each), 4 x 4 grid
export const PatternsSheet: React.FC<{look?: Look}> = ({look}) => {
  useFonts();
  return (
    <AbsoluteFill style={{background: '#fff'}}>
      {DEMOS.map((d, i) => (
        <div key={d.name} style={{position: 'absolute', left: (i % 4) * 480, top: Math.floor(i / 4) * 270, width: 480, height: 270, overflow: 'hidden', outline: `2px solid ${C.ink}22`}}>
          <div style={{position: 'absolute', width: 1920, height: 1080, transform: 'scale(0.25)', transformOrigin: '0 0'}}>{d.render(6, look)}</div>
          <div style={{position: 'absolute', left: 8, top: 6, fontFamily: SANS, fontWeight: 800, fontSize: 18, color: C.ink, background: '#ffffffd0', borderRadius: 8, padding: '2px 8px'}}>{i + 1}. {d.name}</div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
