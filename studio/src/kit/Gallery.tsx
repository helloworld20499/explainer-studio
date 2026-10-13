// Kit gallery: every infographic piece on one screen (composition "kit-gallery"). For checking and for choosing pieces.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, FPS, Mol, Enzyme, SANS, useFonts} from './lib';
import {Bars, BigNumber, Callout, Cloud, Compare, Eye, FlowArrow, Heart, LabGrid, Lungs, Molecule, Orbit, Particles, Planet, ScaleBadge, StepFlow, Sun, Thermometer, WATER, Wave, Portal, MicroBG, SpaceBG} from './science';

const Cell: React.FC<{i: number; name: string; children: React.ReactNode; dark?: boolean}> = ({i, name, children, dark}) => {
  const col = i % 4, row = Math.floor(i / 4);
  return (
    <div style={{position: 'absolute', left: col * 480, top: row * 360, width: 480, height: 360, borderRight: `2px solid ${C.ink}22`, borderBottom: `2px solid ${C.ink}22`, overflow: 'hidden'}}>
      <svg width={480} height={360} viewBox="-640 -480 1280 960">{children}</svg>
      <div style={{position: 'absolute', left: 10, top: 8, fontFamily: SANS, fontWeight: 800, fontSize: 20, color: dark ? '#fff' : C.ink}}>{name}</div>
    </div>
  );
};

export const KitGallery: React.FC = () => {
  useFonts();
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Cell i={0} name="Portal (zoom in)">
        <g transform="translate(-640,-480)"><LabGrid w={1280} h={960} /></g>
        <g transform="translate(-200,40)"><Mol color={C.orange} r={120} /></g>
        <g transform="translate(-640,-480)">
          <Portal t={t} at={0.5} dur={1.6} x={440} y={520}><MicroBG t={t} w={1280} h={960} /></Portal>
        </g>
      </Cell>
      <Cell i={1} name="ScaleBadge + Callout">
        <g transform="translate(-260,-250)"><ScaleBadge t={t} at={0.3} text="× 1,000" sub="zoomed in" /></g>
        <g transform="translate(-120,150)"><Mol color={C.yellow} r={60} /></g>
        <g transform="translate(-120,150)"><Callout t={t} at={0.8} text="a key molecule" dx={260} dy={-160} /></g>
      </Cell>
      <Cell i={2} name="FlowArrow">
        <g transform="translate(-380,0)"><Enzyme color={C.red} r={70} /></g>
        <g transform="translate(380,0)"><Mol color={C.lilac} r={60} /></g>
        <FlowArrow t={t} at={0.4} x1={-280} y1={0} x2={290} y2={0} bend={0.25} color={C.ink} />
      </Cell>
      <Cell i={3} name="StepFlow">
        <g transform="scale(0.85)">
          <StepFlow t={t} times={[0.3, 0.8, 1.3, 1.8]} active={Math.min(3, Math.floor(t / 0.8))} gap={280}
            steps={[{icon: <Mol color={C.yellow} r={30} />, label: 'Step 1'}, {icon: <Enzyme color={C.red} r={36} />, label: 'Step 2'}, {icon: <Mol color={C.lilac} r={30} />, label: 'Step 3'}, {icon: <circle r={28} fill={C.sky} stroke={C.ink} strokeWidth={4} />, label: 'Step 4'}]} />
        </g>
      </Cell>
      <Cell i={4} name="BigNumber">
        <BigNumber t={t} at={0.3} to={2002} dur={1.4} grouping={false} />
        <g transform="translate(0,200)"><BigNumber t={t} at={0.6} to={37} unit="°C" size={90} /></g>
      </Cell>
      <Cell i={5} name="Compare">
        <g transform="scale(0.8)">
          <Compare t={t} at={0.3} w={560} h={600}
            left={{title: 'Option A', node: <Mol color={C.orange} r={100} />, ok: false}}
            right={{title: 'Option B', node: <g><circle r={90} fill="#FFF8EE" stroke={C.ink} strokeWidth={5} /></g>, ok: true}} />
        </g>
      </Cell>
      <Cell i={6} name="Bars">
        <g transform="translate(0,220)"><Bars t={t} at={0.3} unit=" s" items={[{label: 'Cold', value: 60, color: C.blue}, {label: 'Room', value: 30, color: C.orange}, {label: 'Hot', value: 12, color: C.red}]} /></g>
      </Cell>
      <Cell i={7} name="Particles (cold / hot)">
        <g transform="translate(-300,0)"><rect x={-260} y={-260} width={520} height={520} rx={30} fill="#EAF4FB" stroke={C.ink} strokeWidth={5} /><Particles t={t} w={500} h={500} n={14} color={C.blue} speed={0.4} /></g>
        <g transform="translate(300,0)"><rect x={-260} y={-260} width={520} height={520} rx={30} fill="#FDEDE8" stroke={C.ink} strokeWidth={5} /><Particles t={t} w={500} h={500} n={14} color={C.red} speed={2.4} seed={2} /></g>
      </Cell>
      <Cell i={8} name="Molecule + Wave">
        <g transform="translate(0,-170)"><Molecule atoms={WATER[0]} bonds={WATER[1]} spin={t * 20} /></g>
        <g transform="translate(0,200)"><Wave t={t} w={1100} /></g>
      </Cell>
      <Cell i={9} name="Heart + Lungs + Eye">
        <g transform="translate(-380,-60)"><Heart t={t} r={140} /></g>
        <g transform="translate(60,-20) scale(0.9)"><Lungs t={t} rate={20} /></g>
        <g transform="translate(400,40) scale(0.8)"><Eye t={t} water={1} look={Math.sin(t)} /></g>
      </Cell>
      <Cell i={10} name="Space: Sun, Orbit, Planet" dark>
        <g transform="translate(-640,-480)"><SpaceBG t={t} w={1280} h={960} /></g>
        <Sun t={t} r={90} />
        <Orbit t={t} rx={460} ry={200} period={6}><Planet r={50} color={C.blue} /></Orbit>
        <g transform="translate(440,-300)"><Planet r={60} color={C.orange} ring /></g>
      </Cell>
      <Cell i={11} name="Weather + Thermometer">
        <rect x={-640} y={-480} width={1280} height={960} fill="#D9EEF8" />
        <g transform="translate(-200,-120)"><Cloud t={t} rain={1} w={420} /></g>
        <g transform="translate(380,0)"><Thermometer v={0.3 + 0.3 * Math.sin(t)} /></g>
      </Cell>
    </AbsoluteFill>
  );
};
