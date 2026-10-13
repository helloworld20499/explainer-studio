// Patterns that put two things side by side: BeforeAfter, Compare, MythFact, Analogy, ScaleLadder.
import React from 'react';
import type {Look} from '../objlib/Thing';
import {Beats, C, Caption, Card, Flow, Ghost, Item, ItemView, L, S, SLAB, Stage, TextBlock, Verdict, beatIndex, firstAt} from './common';
import {textW} from '../kit/lib';

type Base = {t: number; at: number; beats: Beats; look?: Look; title?: string};

const Tag: React.FC<{x: number; y: number; text: string; color: string; s?: number}> = ({x, y, text, color, s = 1}) => {
  const w = textW(text, 40, true) + text.length * 3 + 64;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x={-w / 2} y={-36} width={w} height={72} rx={36} fill={color} stroke={C.ink} strokeWidth={5} />
      <text y={14} textAnchor="middle" fontFamily={SLAB} fontWeight={700} fontSize={40} fill="#fff" letterSpacing={3}>{text}</text>
    </g>
  );
};

// ---------- BeforeAfter: the same thing in two states (or two things), "after" arrives on the second beat ----------
export const BeforeAfter: React.FC<Base & {before: Item; after: Item; labels?: [string, string]}> = ({t, at, beats, look, title, before, after, labels = ['BEFORE', 'AFTER']}) => {
  const a0 = firstAt(at, beats), a1 = beats[1] ?? 1e9, y = title ? 600 : 560;
  return (
    <Stage t={t} at={at} look={look} title={title}>
      <Card x={510} y={y} w={780} h={720} s={S(t, a0)} />
      <Tag x={510} y={y - 340} text={labels[0]} color="#7D8699" s={S(t, a0 + 0.1)} />
      <ItemView item={before} t={t} x={510} y={y - 60} size={420} appear={a0} dim={t > a1 ? 0.3 : 0} look={look} uid="ba0" labelSize={58} labelWidth={700} />
      <Flow t={t} at={a1 - 0.3} x1={915} y1={y} x2={1005} y2={y} w={10} dots={false} look={look} />
      {t < a1 && <Ghost x={1410} y={y - 60} size={420} n="?" o={L(t, at, at + 0.4, 0, 1)} />}
      {t >= a1 && <Card x={1410} y={y} w={780} h={720} s={S(t, a1)} />}
      {t >= a1 && <Tag x={1410} y={y - 340} text={labels[1]} color={C.accent} s={S(t, a1 + 0.1)} />}
      <ItemView item={{...after, stateAt: after.stateAt ?? a1}} t={t} x={1410} y={y - 60} size={420} appear={a1} hi={L(t, a1, a1 + 0.4, 0, 1)} look={look} uid="ba1" labelSize={58} labelWidth={700} />
    </Stage>
  );
};

// ---------- Compare: two options, values as bars, then a verdict ----------
type Side = Item & {value?: number; valueLabel?: string; ok?: boolean};
export const Compare: React.FC<Base & {left: Side; right: Side; unit?: string}> = ({t, at, beats, look, title, left, right, unit = ''}) => {
  const a = [firstAt(at, beats), beats[1] ?? 1e9, beats[2] ?? 1e9];
  const max = Math.max(left.value ?? 1, right.value ?? 1);
  const side = (s: Side, x: number, ap: number, k: number) => {
    const g = L(t, ap + 0.3, ap + 1.1, 0, 1), bh = s.value !== undefined ? 380 * (s.value / max) * g : 0;
    return (
      <g>
        <ItemView item={{...s, label: undefined}} t={t} x={x - 170} y={560} size={360} appear={ap} look={look} uid={`cmp${k}`} />
        <Caption x={x - 170} y={810} text={s.label ?? ''} size={60} width={380} o={t >= ap ? 1 : 0} />
        {s.value !== undefined && t >= ap && (
          <g>
            <line x1={x + 50} x2={x + 290} y1={850} y2={850} stroke={C.ink} strokeWidth={6} />
            <rect x={x + 95} y={850 - bh} width={150} height={bh} rx={14} fill={k === 0 ? '#2E9BD6' : C.accent} stroke={C.ink} strokeWidth={5} />
            <text x={x + 170} y={826 - bh} textAnchor="middle" fontFamily={SLAB} fontWeight={700} fontSize={64} fill={C.ink}>{s.valueLabel ?? `${Math.round(s.value * g)}${unit}`}</text>
          </g>
        )}
        {s.ok !== undefined && <Verdict t={t} at={a[2] + k * 0.15} x={x - 170} y={330} ok={s.ok} />}
      </g>
    );
  };
  return (
    <Stage t={t} at={at} look={look} title={title}>
      <line x1={960} x2={960} y1={190} y2={940} stroke={C.ink} strokeWidth={4} strokeDasharray="14 14" opacity={0.4} />
      <text x={960} y={590} textAnchor="middle" fontFamily={SLAB} fontWeight={700} fontSize={100} fill={C.ink} opacity={L(t, a[1], a[1] + 0.3, 0, 1)}>vs</text>
      {side(left, 560, a[0], 0)}
      {t < a[1] && <Ghost x={1350} y={560} size={360} n="?" o={L(t, at, at + 0.4, 0, 1)} />}
      {side(right, 1520, a[1], 1)}
    </Stage>
  );
};

// ---------- MythFact: a common belief, crossed out, then the real answer ----------
export const MythFact: React.FC<Base & {myth: string; fact: string; item?: Item}> = ({t, at, beats, look, title, myth, fact, item}) => {
  const a0 = firstAt(at, beats), bust = beats[1] ?? 1e9, fa = beats[2] ?? bust + 0.6;
  const shake = t > bust && t < bust + 0.4 ? Math.sin((t - bust) * 70) * 10 * (1 - (t - bust) / 0.4) : 0;
  const mx = L(t, fa, fa + 0.5, 960, 500), ms = L(t, fa, fa + 0.5, 1, 0.8);
  return (
    <Stage t={t} at={at} look={look} title={title}>
      <g transform={`translate(${mx + shake},540) scale(${ms * S(t, a0)}) rotate(-3) translate(-960,-540)`} opacity={t > bust ? 0.75 : 1}>
        <Card x={960} y={560} w={860} h={480} fill="#FFF6E9" />
        <Tag x={960} y={330} text="MYTH" color="#7D8699" />
        <TextBlock x={960} y={570} text={myth} size={70} width={740} font={SLAB} weight={700} />
        {t > bust && <line x1={600} x2={1320} y1={570} y2={570} stroke="#E2464F" strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - L(t, bust, bust + 0.3, 0, 1)} />}
      </g>
      <Verdict t={t} at={bust} x={mx + 380 * ms} y={320} ok={false} size={110} />
      {t >= fa && (
        <g transform={`translate(${L(t, fa, fa + 0.5, 1700, 1400)},570) scale(${S(t, fa)}) translate(-1400,-570)`}>
          <Card x={1400} y={570} w={860} h={700} />
          <Tag x={1400} y={230} text="FACT" color="#5BBF6A" />
          {item && <ItemView item={item} t={t} x={1400} y={440} size={260} appear={fa + 0.2} look={look} uid="mf" />}
          <TextBlock x={1400} y={item ? 730 : 570} text={fact} size={item ? 54 : 66} width={760} font={SLAB} weight={700} />
        </g>
      )}
    </Stage>
  );
};

// ---------- Analogy: "A is like B" — two things, a ≈ sign, and what they share ----------
export const Analogy: React.FC<Base & {a: Item; b: Item; shared?: string}> = ({t, at, beats, look, title, a, b, shared}) => {
  const a0 = firstAt(at, beats), a1 = beats[1] ?? 1e9, a2 = beats[2] ?? 1e9;
  const pulse = 1 + 0.08 * Math.sin(t * 4);
  return (
    <Stage t={t} at={at} look={look} title={title}>
      <ItemView item={a} t={t} x={500} y={400} size={420} appear={a0} look={look} uid="an0" labelSize={62} labelWidth={640} />
      {t >= a1 && <text x={960} y={460} textAnchor="middle" fontFamily={SLAB} fontWeight={700} fontSize={190 * S(t, a1) * pulse} fill={C.accent}>≈</text>}
      <ItemView item={b} t={t} x={1420} y={400} size={420} appear={a1 + 0.2} look={look} uid="an1" labelSize={62} labelWidth={640} />
      {shared && t >= a2 && (
        <g opacity={L(t, a2, a2 + 0.4, 0, 1)}>
          <path d="M300,760 Q960,860 1620,760" fill="none" stroke={C.ink} strokeWidth={6} strokeDasharray="16 14" />
          <Caption x={960} y={880} text={shared} size={62} width={1500} hi={1} />
        </g>
      )}
    </Stage>
  );
};

// ---------- ScaleLadder: each step is N times bigger; the camera zooms out and the old thing shrinks away ----------
export const ScaleLadder: React.FC<Base & {steps: (Item & {ratio?: number})[]}> = ({t, at, beats, look, title, steps}) => {
  const cur = Math.max(0, beatIndex(t, beats));
  const BIG = 500, cx = 1080, base = title ? 840 : 820;
  return (
    <Stage t={t} at={at} look={look} title={title} drift={0.3}>
      <line x1={120} x2={1800} y1={base} y2={base} stroke={C.ink} strokeWidth={6} />
      {steps.map((s, i) => {
        const a = i === 0 ? firstAt(at, beats) : beats[i] ?? 1e9;
        if (t < a || i < cur - 1) return null;
        // size of step i: BIG while it is the newest, then shrinks by the next step's ratio
        let size = BIG, x = cx;
        if (i === cur - 1) {
          const ratio = steps[cur].ratio ?? 10, u = L(t, beats[cur], beats[cur] + 1.0, 0, 1);
          size = BIG / (1 + (ratio - 1) * u);
          x = cx - (BIG / 2 + 60 + size / 2) * u;   // slides left so the new, bigger thing has room
        }
        const appear = i === cur ? L(t, a, a + 0.6, 0, 1) : 1;
        return (
          <g key={i} opacity={size < 8 ? 0 : 1}>
            <g transform={`translate(${x},${base}) scale(${appear}) translate(${-x},${-base})`}>
              <ItemView item={{...s, label: undefined}} t={t} x={x} y={base - size / 2} size={size} appear={a} look={look} uid={`sl${i}`} />
            </g>
            {i === cur && <Caption x={x} y={base + 66} text={s.label ?? ''} size={60} o={L(t, a + 0.3, a + 0.6, 0, 1)} />}
          </g>
        );
      })}
      {cur > 0 && steps[cur].ratio && (
        <g transform={`translate(480,330) scale(${S(t, beats[cur] + 0.3)})`}>
          <rect x={-170} y={-72} width={340} height={144} rx={30} fill="#fff" stroke={C.ink} strokeWidth={6} />
          <text y={30} textAnchor="middle" fontFamily={SLAB} fontWeight={700} fontSize={88} fill={C.accent}>×{steps[cur].ratio!.toLocaleString('en-US')}</text>
        </g>
      )}
    </Stage>
  );
};
