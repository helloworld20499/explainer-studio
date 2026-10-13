// Patterns that reveal what is inside or how much: ZoomInto, Cutaway, CountUnits, BigReveal, QuestionHook, FlowNetwork.
import React from 'react';
import type {Look} from '../objlib/Thing';
import {Pictogram} from '../objlib/Thing';
import {Beats, C, Caption, Flow, Item, ItemView, L, S, SLAB, Stage, TextBlock, beatIndex, bgOf, firstAt, link, lookOf} from './common';
import {textW} from '../kit/lib';

type Base = {t: number; at: number; beats: Beats; look?: Look; title?: string};

// ---------- ZoomInto: a lens grows from a spot on the object and opens a smaller world ----------
export const ZoomInto: React.FC<Base & {outer: Item; focus?: [number, number]; inner: Item[]; badge?: string; innerBg?: string}> = ({t, at, beats, look, title, outer, focus = [0.5, 0.5], inner, badge, innerBg = '#E4EFCB'}) => {
  const lk = lookOf(look);
  const a0 = firstAt(at, beats), z = beats[1] ?? 1e9;
  const size = 600, ox = 960, oy = 580, fx = ox + (focus[0] - 0.5) * size, fy = oy + (focus[1] - 0.5) * size;
  const u = L(t, z, z + 1.1, 0, 1, (x) => x * x * (3 - 2 * x)), r = 30 + u * 1400;
  const n = inner.length, gap = Math.min(560, 1680 / Math.max(1, n));
  return (
    <Stage t={t} at={at} look={look} title={u < 0.5 ? title : undefined}>
      <defs><clipPath id="zoom-lens"><circle cx={fx} cy={fy} r={r} /></clipPath></defs>
      {u < 1 && <ItemView item={outer} t={t} x={ox} y={oy} size={size * (1 + u * 1.5)} appear={a0} look={look} uid="zo" />}
      {t >= z - 0.4 && u === 0 && <circle cx={fx} cy={fy} r={30 + 8 * Math.sin(t * 8)} fill="none" stroke={C.accent} strokeWidth={8} />}
      {t >= z && (
        <g clipPath="url(#zoom-lens)">
          <rect x={-200} y={-200} width={2400} height={1500} fill={lk === 'whiteboard' ? bgOf(lk) : innerBg} />
          {Array.from({length: 14}, (_, i) => <circle key={i} cx={(i * 397) % 1920} cy={(i * 251) % 1080} r={30 + (i % 4) * 14} fill="#fff" opacity={0.25} />)}
          {inner.map((it, i) => (
            <ItemView key={i} item={it} t={t} x={960 + (i - (n - 1) / 2) * gap} y={500} size={Math.min(360, gap * 0.68)} appear={(beats[2 + i] ?? z + 0.9 + i * 0.4)} hi={beatIndex(t, beats) === 2 + i ? 1 : 0} look={look} uid={`zi${i}`} labelSize={60} labelWidth={gap - 40} />
          ))}
          <circle cx={fx} cy={fy} r={r} fill="none" stroke={C.ink} strokeWidth={10} />
        </g>
      )}
      {badge && t >= z + 0.6 && (
        <g transform={`translate(${70 + (textW(badge, 72, true) + 80) / 2},150) scale(${S(t, z + 0.6)})`}>
          <rect x={-(textW(badge, 72, true) + 80) / 2} y={-64} width={textW(badge, 72, true) + 80} height={128} rx={30} fill="#fff" stroke={C.ink} strokeWidth={6} />
          <text y={25} textAnchor="middle" fontFamily={SLAB} fontWeight={700} fontSize={72} fill={C.ink}>{badge}</text>
        </g>
      )}
    </Stage>
  );
};

// ---------- Cutaway: open the object (state) and point at its parts one by one ----------
export const Cutaway: React.FC<Base & {item: Item; open?: string; parts: {label: string; fx: number; fy: number}[]}> = ({t, at, beats, look, title, item, open, parts}) => {
  const a0 = firstAt(at, beats), oa = beats[1] ?? 1e9;
  const size = 720, ox = 600, oy = 590, cur = beatIndex(t, beats);
  return (
    <Stage t={t} at={at} look={look} title={title}>
      <ItemView item={{...item, state: open ?? item.state, stateAt: oa, label: undefined}} t={t} x={ox} y={oy} size={size} appear={a0} look={look} uid="cut" />
      {parts.map((p, i) => {
        const a = beats[2 + i] ?? 1e9;
        if (t < a) return null;
        const px = ox + (p.fx - 0.5) * size, py = oy + (p.fy - 0.5) * size;
        const lx = 1140, ly = 270 + i * (620 / Math.max(1, parts.length - 1 || 1));
        const q = L(t, a, a + 0.35, 0, 1), act = cur === 2 + i;
        return (
          <g key={i}>
            <circle cx={px} cy={py} r={12 + (act ? 6 * Math.abs(Math.sin(t * 5)) : 0)} fill={C.accent} stroke={C.ink} strokeWidth={4} />
            <line x1={px} y1={py} x2={px + (lx - 30 - px) * q} y2={py + (ly - py) * q} stroke={C.ink} strokeWidth={5} strokeDasharray="12 9" />
            <g opacity={q} transform={`translate(${lx},${ly})`}>
              <rect x={-10} y={-50} width={textW(p.label, 62, true) + 64} height={100} rx={50} fill={act ? C.accent : '#fff'} stroke={C.ink} strokeWidth={5} />
              <text x={22} y={21} fontFamily={SLAB} fontWeight={700} fontSize={62} fill={act ? '#fff' : C.ink}>{p.label}</text>
            </g>
          </g>
        );
      })}
    </Stage>
  );
};

// ---------- CountUnits: a grid of icons (Isotype); then a share of them lights up ----------
export const CountUnits: React.FC<Base & {total: number; highlight: number; icon?: string; big?: string; caption?: string; cols?: number}> = ({t, at, beats, look, title, total, highlight, icon = 'user', big, caption, cols = 10}) => {
  const a0 = firstAt(at, beats), h = beats[1] ?? 1e9;
  const rows = Math.ceil(total / cols), cell = Math.min(130, 800 / rows, 1040 / cols);
  const gx = 110 + cell / 2, gy = (title ? 560 : 540) - ((rows - 1) * cell) / 2;
  return (
    <Stage t={t} at={at} look={look} title={title} drift={0.5}>
      {Array.from({length: total}, (_, i) => {
        const a = a0 + i * Math.min(0.03, 1.2 / total);
        if (t < a) return null;
        const on = i < highlight && t >= h + i * 0.04;
        const s = S(t, a) * (on ? 1 + 0.15 * Math.max(0, 1 - (t - h - i * 0.04) * 3) : 1);
        const x = gx + (i % cols) * cell, y = gy + Math.floor(i / cols) * cell;
        return (
          <g key={i} transform={`translate(${x},${y}) scale(${s}) translate(${-x},${-y})`}>
            <Pictogram name={icon} role={on ? 'accent' : 'ink'} t={t} x={x} y={y} size={cell * 0.86} look={look} uid={`cu${i}${on ? 'a' : ''}`} />
          </g>
        );
      })}
      {big && t >= h && (
        <g transform={`translate(1500,${(title ? 500 : 480)}) scale(${S(t, h + 0.3)})`}>
          <text textAnchor="middle" y={64} fontFamily={SLAB} fontWeight={700} fontSize={Math.min(200, (200 * 640) / textW(big, 200, true))} fill={C.accent}>{big}</text>
        </g>
      )}
      {caption && t >= h && <TextBlock x={1500} y={700} text={caption} size={60} width={640} font={SLAB} weight={700} />}
    </Stage>
  );
};

// ---------- BigReveal: one number that counts up, with a burst ----------
export const BigReveal: React.FC<Base & {value: number; decimals?: number; unit?: string; caption?: string; item?: Item; grouping?: boolean}> = ({t, at, beats, look, title, value, decimals = 0, unit = '', caption, item, grouping = true}) => {
  const a0 = firstAt(at, beats), c = beats[1] ?? a0 + 0.3;
  const u = L(t, c, c + 1.4, 0, 1, (x) => 1 - (1 - x) ** 3), done = t > c + 1.4;
  const v = (value * u).toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: grouping});
  const nx = item ? 1180 : 960;
  return (
    <Stage t={t} at={at} look={look} title={title}>
      {item && <ItemView item={item} t={t} x={430} y={520} size={480} appear={a0} look={look} uid="br" />}
      {done && Array.from({length: 16}, (_, i) => {
        const a = (i / 16) * Math.PI * 2 + (t - c) * 0.3, k = Math.min(1, (t - c - 1.4) * 3);
        return <line key={i} x1={nx + Math.cos(a) * 260} y1={500 + Math.sin(a) * 200} x2={nx + Math.cos(a) * (260 + 80 * k)} y2={500 + Math.sin(a) * (200 + 60 * k)} stroke={i % 2 ? C.accent : '#F4B63F'} strokeWidth={10} strokeLinecap="round" />;
      })}
      {t >= a0 && (
        <g transform={`translate(${nx},540) scale(${S(t, a0) * (done ? 1 + 0.03 * Math.sin(t * 4) : 1)})`}>
          <text textAnchor="middle" y={70} fontFamily={SLAB} fontWeight={700} fontSize={230} fill={C.ink}>{v}<tspan fontSize={120} fill={C.accent}>{unit}</tspan></text>
        </g>
      )}
      {caption && <Caption x={nx} y={790} text={caption} size={70} width={item ? 1000 : 1500} o={L(t, c + 0.8, c + 1.2, 0, 1)} />}
    </Stage>
  );
};

// ---------- QuestionHook: the big question, key word highlighted, the cast of things floating around ----------
export const QuestionHook: React.FC<Base & {question: string; highlight?: string; items?: Item[]}> = ({t, at, beats, look, title, question, highlight, items = []}) => {
  const a0 = firstAt(at, beats);
  const words = question.split(' ');
  const spots: [number, number][] = [[260, 260], [1660, 260], [260, 840], [1660, 840], [960, 870], [960, 190]];
  return (
    <Stage t={t} at={at} look={look} title={title}>
      {Array.from({length: 8}, (_, i) => {
        const x = (i * 271 + 120) % 1920, y = 1080 - (((t - at) * 60 + i * 140) % 1200);
        return <text key={'q' + i} x={x} y={y} fontFamily={SLAB} fontWeight={800} fontSize={60 + (i % 3) * 20} fill={C.muted} opacity={0.18}>?</text>;
      })}
      {items.map((it, i) => {
        const [x, y] = spots[i % spots.length];
        return <ItemView key={i} item={it} t={t} x={x} y={y + 12 * Math.sin(t * 1.5 + i)} size={250} appear={beats[1 + i] ?? a0 + 0.4 + i * 0.3} look={look} uid={`qh${i}`} labelSize={44} />;
      })}
      <g transform={`translate(960,540) scale(${0.6 + 0.4 * S(t, a0)})`}>
        <text textAnchor="middle" y={44} fontFamily={SLAB} fontWeight={700} fontSize={Math.min(140, (140 * 1200) / textW(question, 140, true))} fill={C.ink}>
          {words.map((w, i) => {
            const hw = highlight && w.toLowerCase().replace(/[^\w]/g, '') === highlight.toLowerCase();
            return <tspan key={i} fill={hw ? C.accent : C.ink}>{w}{i < words.length - 1 ? ' ' : ''}</tspan>;
          })}
        </text>
      </g>
    </Stage>
  );
};

// ---------- FlowNetwork: things connected by flows (energy, money, data, food web) ----------
export const FlowNetwork: React.FC<Base & {nodes: (Item & {id: string; x: number; y: number})[]; edges: [string, string][]; paths?: string[][]; size?: number}> = ({t, at, beats, look, title, nodes, edges, paths = [], size = 220}) => {
  const a0 = firstAt(at, beats), ea = beats[1] ?? a0 + 1, cur = beatIndex(t, beats) - 2;
  const pos = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const active = cur >= 0 ? new Set(paths[cur]?.slice(0, -1).map((id, i) => `${id}>${paths[cur][i + 1]}`)) : new Set<string>();
  const node = (n: Item & {x: number; y: number}) => ({x: n.x, y: n.y, size, label: n.label});
  return (
    <Stage t={t} at={at} look={look} title={title}>
      {edges.map(([a, b], i) => {
        const on = active.has(`${a}>${b}`);
        return <Flow key={i} t={t} at={ea + i * 0.12} {...link(node(pos[a]), node(pos[b]), 0.08)} color={on ? C.accent : C.ink} w={on ? 10 : 6} dots={on || cur < 0} look={look} />;
      })}
      {nodes.map((n, i) => (
        <ItemView key={n.id} item={n} t={t} x={n.x} y={n.y} size={size} appear={a0 + i * 0.12} hi={cur >= 0 && paths[cur]?.includes(n.id) ? 1 : 0} look={look} uid={`fn${n.id}`} />
      ))}
    </Stage>
  );
};

