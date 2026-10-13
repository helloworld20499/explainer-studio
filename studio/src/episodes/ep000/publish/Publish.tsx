// ep000 publish pieces: thumbnails (1280x720) and the 9:16 Short.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import timeline from '../timeline.json';
import words from '../words.json';
import {C} from '../../../kit/lib';
import {ThumbFrame} from '../../../kit/thumb';
import {SvgLayer} from '../../../kit/stage';
import {Char} from '../../../kit/chars';
import {Sun} from '../../../kit/science';
import {ShortCut, ShortSeg, shortTotal} from '../../../kit/short';
import {EP, Ep000} from '../Main';

const T = timeline as {lines: {i: number; start: number; end: number; text: string; speaker: string}[]};

// Thumbnail A: the buddy looks up at a big sun and a blue sky
export const ThumbA: React.FC = () => (
  <ThumbFrame series="main" words={['WHY', 'IS IT', 'BLUE?']} bg={C.skyDeep}>
    <SvgLayer><g transform="translate(560,150)"><Sun t={0} r={90} /></g></SvgLayer>
    <Char pose="buddy_surprised" x={330} y={760} k={1.1} />
  </ThumbFrame>
);
// Thumbnail B: colour waves
export const ThumbB: React.FC = () => (
  <ThumbFrame series="main" words={['NOT', 'PURPLE?']}>
    <AbsoluteFill>
      <svg width={790} height={720}>
        {['#E2464F', '#F08A3C', '#F4B63F', '#9BBF5A', '#2E9BD6', '#9B7BD0'].map((c, i) => (
          <path key={c} d={`M-20,${130 + i * 90} q100,-60 200,0 t200,0 t200,0 t200,0`} stroke={c} strokeWidth={34} fill="none" strokeLinecap="round" />
        ))}
      </svg>
    </AbsoluteFill>
  </ThumbFrame>
);

// Short: the hook, then the scattering explanation
export const SHORT_SEGS: ShortSeg[] = [
  {src: 0, len: T.lines[1].end + 0.2, focus: [[0, 700], [T.lines[1].start, 1240]]},
  {src: T.lines[4].start - 0.4, len: T.lines[5].end - T.lines[4].start + 1.0, focus: [[0, 1000]]},
];
export const SHORT_TOTAL = shortTotal(SHORT_SEGS);
export const Ep000Short: React.FC = () => (
  <ShortCut ep={EP} segs={SHORT_SEGS} Main={Ep000} series="main" words={words} timeline={T}
    title={<>Why is the sky <span style={{color: C.accent}}>blue?</span></>} />
);
