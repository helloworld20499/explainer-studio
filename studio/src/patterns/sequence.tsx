// Patterns for things that happen in order: CauseChain, Cycle, Steps, Timeline.
import React from 'react';
import type {Look} from '../objlib/Thing';
import {Beats, C, Card, Caption, Flow, Ghost, Item, ItemView, L, LABEL, S, SLAB, Stage, beatIndex, firstAt, labelBox, link, lookOf, textW} from './common';

type Base = {t: number; at: number; beats: Beats; look?: Look; title?: string};
const hiOf = (t: number, b: number, isCur: boolean) => (isCur ? L(t, b, b + 0.3, 0, 1) : 0);

// ---------- CauseChain: A → B → C (each beat adds the next link) ----------
export const CauseChain: React.FC<Base & {items: Item[]}> = ({t, at, beats, look, title, items}) => {
  const n = items.length, gap = Math.min(470, 1400 / Math.max(1, n - 1)), size = Math.min(300, gap * 0.6), lw = gap - 40;
  const cur = beatIndex(t, beats);
  const xs = items.map((_, i) => 960 + (i - (n - 1) / 2) * gap), y = title ? 520 : 480;
  const node = (i: number) => ({x: xs[i], y, size, label: items[i].label, labelWidth: lw});
  const app = (i: number) => (i === 0 ? firstAt(at, beats) : beats[i] ?? 1e9);
  return (
    <Stage t={t} at={at} look={look} title={title}>
      {items.map((_, i) => i > 0 && (
        <Flow key={'f' + i} t={t} at={app(i) - 0.25} {...link(node(i - 1), node(i), i % 2 ? 0.12 : -0.12)} look={look} />
      ))}
      {items.map((_, i) => t < app(i) && <Ghost key={'g' + i} x={xs[i]} y={y} size={size} n={i + 1} o={L(t, at, at + 0.4, 0, 1)} />)}
      {items.map((it, i) => (
        <ItemView key={i} item={it} t={t} x={xs[i]} y={y} size={size} appear={app(i)} hi={hiOf(t, app(i), i === cur)} dim={i < cur ? 0.25 : 0} look={look} uid={`cc${i}`} labelWidth={lw} />
      ))}
    </Stage>
  );
};

// ---------- Cycle: items on a loop, a marker keeps going round ----------
export const Cycle: React.FC<Base & {items: Item[]; center?: Item}> = ({t, at, beats, look, title, items, center}) => {
  const n = items.length, RX = 470, RY = 235, cx = 960, cy = title ? 525 : 500, size = 210, lw = 400;
  const ang = (i: number) => -Math.PI / 2 + (i / n) * Math.PI * 2;
  const pos = (i: number) => [cx + Math.cos(ang(i)) * RX, cy + Math.sin(ang(i)) * RY] as const;
  const node = (i: number) => ({x: pos(i)[0], y: pos(i)[1], size, label: items[i].label, labelWidth: lw});
  const app = (i: number) => (i === 0 ? firstAt(at, beats) : beats[i] ?? 1e9);
  const closeAt = (beats[n - 1] ?? 1e9) + 0.4, cur = beatIndex(t, beats);
  const arrow = (i: number, j: number, when: number) => {
    return <Flow key={`a${i}`} t={t} at={when} {...link(node(i), node(j), -0.18)} dots={false} look={look} />;
  };
  const lap = t > closeAt ? ((t - closeAt) * 0.25) % 1 : -1;
  const ma = -Math.PI / 2 + lap * Math.PI * 2;
  return (
    <Stage t={t} at={at} look={look} title={title}>
      {center && <ItemView item={center} t={t} x={cx} y={cy} size={210} appear={at + 0.1} look={look} uid="cyc-c" />}
      {items.map((_, i) => i > 0 && arrow(i - 1, i, app(i) - 0.25))}
      {n > 2 && arrow(n - 1, 0, closeAt)}
      {lap >= 0 && <circle cx={cx + Math.cos(ma) * RX} cy={cy + Math.sin(ma) * RY} r={18} fill={C.accent} stroke={C.ink} strokeWidth={4} />}
      {items.map((_, i) => { const [x, y] = pos(i); return t < app(i) && <Ghost key={'g' + i} x={x} y={y} size={size} n={i + 1} />; })}
      {items.map((it, i) => {
        const [x, y] = pos(i);
        const near = lap >= 0 ? Math.max(0, 1 - Math.abs(((lap - i / n + 1.5) % 1) - 0.5) * n * 2) : 0;
        return <ItemView key={i} item={it} t={t} x={x} y={y} size={size} appear={app(i)} hi={Math.max(hiOf(t, app(i), i === cur && lap < 0), near)} look={look} uid={`cy${i}`} labelWidth={lw} />;
      })}
    </Stage>
  );
};

// ---------- Steps: a numbered list on the left, the active step big on the right ----------
export const Steps: React.FC<Base & {steps: Item[]}> = ({t, at, beats, look, title, steps}) => {
  const cur = Math.max(0, beatIndex(t, beats));
  const top = title ? 210 : 150, rowH = Math.min(180, 800 / steps.length), rowW = 700;
  return (
    <Stage t={t} at={at} look={look} title={title} drift={0.5}>
      {steps.map((s, i) => {
        const a = i === 0 ? firstAt(at, beats) : beats[i] ?? 1e9, on = t >= a, act = i === cur;
        const y = top + i * rowH + rowH / 2;
        return (
          <g key={i} opacity={on ? 1 : 0.35} transform={`translate(0,${act ? 0 : 0})`}>
            <circle cx={150} cy={y} r={46} fill={act ? C.accent : on ? '#FFFFFF' : '#EFE8DA'} stroke={C.ink} strokeWidth={5} />
            <text x={150} y={y + 18} textAnchor="middle" fontFamily={SLAB} fontWeight={700} fontSize={52} fill={act ? '#fff' : C.ink}>{i + 1}</text>
            {(() => { const fs = Math.min(act ? 58 : 48, (48 * rowW) / Math.max(1, textW(s.label ?? '', 48, true))); return <text x={222} y={y + fs * 0.35} fontFamily={SLAB} fontWeight={700} fontSize={fs} fill={act ? C.accent : C.ink}>{s.label ?? ''}</text>; })()}
            {i < cur && <path d={`M${100},${y} l12,12 l22,-24`} fill="none" stroke="#5BBF6A" strokeWidth={8} strokeLinecap="round" transform="translate(-20,0)" />}
          </g>
        );
      })}
      {steps.map((s, i) => {
        const a = i === 0 ? firstAt(at, beats) : beats[i] ?? 1e9, next = beats[i + 1] ?? 1e9;
        if (t < a || t > next + 0.4) return null;
        const inU = L(t, a, a + 0.4, 0, 1), outU = L(t, next, next + 0.4, 0, 1);
        const x = 1420 + (1 - inU) * 500 - outU * 500;
        return (
          <g key={'big' + i} opacity={Math.min(inU, 1 - outU)}>
            <Card x={x} y={590} w={820} h={720} />
            <ItemView item={{...s, label: undefined}} t={t} x={x} y={520} size={420} appear={a} look={look} uid={`st${i}`} />
            <Caption x={x} y={810} text={s.label ?? ''} size={58} width={740} />
          </g>
        );
      })}
    </Stage>
  );
};

// ---------- Timeline: dated events along an axis; the camera travels with the story ----------
export const Timeline: React.FC<Base & {events: (Item & {date: string})[]}> = ({t, at, beats, look, title, events}) => {
  const gap = 520, axisY = 760, size = 280, iy = axisY - 380, cur = Math.max(0, beatIndex(t, beats));
  const ev = (i: number) => (i === 0 ? firstAt(at, beats) : beats[i] ?? 1e9);
  // camera: centre on the current event (eased between beats)
  const from = Math.max(0, cur - 1), u = cur > 0 ? L(t, ev(cur), ev(cur) + 0.8, 0, 1) : 1;
  const camX = (from + (cur - from) * u) * gap;
  const x0 = 960 - camX;
  const lastX = (events.length - 1) * gap;
  return (
    <Stage t={t} at={at} look={look} title={title} drift={0.4}>
      <g transform={`translate(${x0},0)`}>
        <line x1={-400} x2={lastX + 600} y1={axisY} y2={axisY} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
        <circle cx={camX} cy={axisY} r={14} fill={C.accent} stroke={C.ink} strokeWidth={4} />
        {events.map((e, i) => {
          const a = ev(i), x = i * gap, p = S(t, a);
          if (t < a) return <circle key={i} cx={x} cy={axisY} r={10} fill="#fff" stroke={C.ink} strokeWidth={4} />;
          return (
            <g key={i}>
              <line x1={x} x2={x} y1={axisY} y2={axisY - (axisY - (labelBox(e.label, x, iy, size, LABEL, gap - 60)?.y1 ?? iy + size / 2) - 14) * Math.min(1, p)} stroke={C.ink} strokeWidth={5} />
              <circle cx={x} cy={axisY} r={16} fill={i === cur ? C.accent : '#fff'} stroke={C.ink} strokeWidth={5} />
              <text x={x} y={axisY + 100} textAnchor="middle" fontFamily={SLAB} fontWeight={700} fontSize={72} fill={i === cur ? C.accent : C.ink} opacity={Math.min(1, p)}>{e.date}</text>
              <ItemView item={e} t={t} x={x} y={iy} size={size} appear={a} hi={hiOf(t, a, i === cur)} look={look} uid={`tl${i}`} labelWidth={gap - 60} />
            </g>
          );
        })}
      </g>
    </Stage>
  );
};
