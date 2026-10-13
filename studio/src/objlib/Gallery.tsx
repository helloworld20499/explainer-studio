// Library catalogue pages (compositions "objlib-flat-<n>", "objlib-whiteboard-<n>", "objlib-states").
// Rendered on the user's computer by scripts/render-library.sh into docs/library/.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {OBJECTS} from './index';
import type {Obj} from './types';
import {Thing, Look, Pictogram} from './Thing';
import {WHITEBOARD} from './tokens';
import {C, FPS, SANS, useFonts} from '../kit/lib';

const KCOL: Record<string, string> = {direct: '#7D8699', upgraded: '#2E9BD6', scratch: '#E2464F'};
export const PER_PAGE = 15;   // 5 x 3
export const PAGES = Math.ceil(OBJECTS.length / PER_PAGE);

const Cell: React.FC<{o: Obj; x: number; y: number; t: number; look: Look; state?: string}> = ({o, x, y, t, look, state}) => (
  <g>
    <Thing id={o} t={t} x={x} y={y} size={200} look={look} state={state} uid={`g-${look}-${o.id}-${state ?? ''}`} />
    <text x={x} y={y + 138} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={24} fill={C.ink}>{o.name}{state ? ` · ${state}` : ''}</text>
    <text x={x} y={y + 164} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={16} fill={KCOL[o.source.kind]} letterSpacing={1}>
      {o.id} · {o.source.kind}{o.source.lib ? ` (${o.source.lib})` : ''}{o.states ? ` · ${o.states.length} states` : ''}
    </text>
  </g>
);

export const LibraryPage: React.FC<{page: number; look: Look}> = ({page, look}) => {
  useFonts();
  const t = useCurrentFrame() / FPS + 1.2;
  const items = OBJECTS.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  return (
    <AbsoluteFill style={{background: look === 'whiteboard' ? WHITEBOARD.board : C.bg}}>
      <svg width={1920} height={1080}>
        <text x={40} y={52} fontFamily={SANS} fontWeight={800} fontSize={30} fill={C.ink}>Object library · {look} · page {page + 1}/{PAGES}</text>
        {items.map((o, i) => <Cell key={o.id} o={o} t={t} look={look} x={(i % 5) * 384 + 192} y={Math.floor(i / 5) * 336 + 200} />)}
      </svg>
    </AbsoluteFill>
  );
};

// every object in every state (flat), small
export const StatesPage: React.FC = () => {
  useFonts();
  const t = useCurrentFrame() / FPS + 1.2;
  const cells = OBJECTS.filter((o) => o.states && o.states.length > 1).flatMap((o) => o.states!.slice(1).map((s) => ({o, s})));
  const cols = 8, cw = 1920 / cols, ch = 200;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <svg width={1920} height={1080}>
        <text x={30} y={42} fontFamily={SANS} fontWeight={800} fontSize={26} fill={C.ink}>States (default state is on the library pages)</text>
        {cells.slice(0, 40).map(({o, s}, i) => {
          const x = (i % cols) * cw + cw / 2, y = Math.floor(i / cols) * ch + 140;
          return (
            <g key={o.id + s}>
              <Thing id={o} t={t} x={x} y={y} size={130} state={s} since={1.2} look="flat" uid={`st-${o.id}-${s}`} />
              <text x={x} y={y + 86} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={17} fill={C.ink}>{o.id} · {s}</text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// a sample of the ~5,000 Tabler pictograms through both renderers
const PICTOS = ['users', 'building-factory-2', 'world', 'plant-2', 'car', 'bolt', 'chart-line', 'shield-check', 'clock-hour-4', 'microscope', 'heartbeat', 'school',
  'cloud-rain', 'recycle', 'rocket', 'currency-dollar', 'brain', 'device-laptop', 'map-pin', 'flask', 'paw', 'fish', 'tree', 'sun'];
export const PictogramPage: React.FC = () => {
  useFonts();
  const t = useCurrentFrame() / FPS + 1.2;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <svg width={1920} height={1080}>
        <rect y={560} width={1920} height={520} fill={WHITEBOARD.board} />
        <text x={40} y={52} fontFamily={SANS} fontWeight={800} fontSize={30} fill={C.ink}>Pictograms: any Tabler icon by name (&lt;Pictogram name="rocket" /&gt;) · flat / whiteboard</text>
        {PICTOS.map((n, i) => {
          const x = (i % 12) * 160 + 80, y = Math.floor(i / 12) * 230 + 170;
          return (
            <g key={n}>
              <Pictogram name={n} t={t} x={x} y={y} size={110} look="flat" role={i % 3 === 0 ? 'accent' : 'ink'} />
              <Pictogram name={n} t={t} x={x} y={y + 480} size={110} look="whiteboard" role={i % 3 === 0 ? 'accent' : 'ink'} />
              <text x={x} y={y + 84} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={15} fill={C.ink}>{n}</text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
