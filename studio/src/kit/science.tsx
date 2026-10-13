// Science-world kit: reusable actors and explainer devices for every series.
// All are SVG <g> groups drawn around (0,0); place them with <At x y s>. Times are seconds (t = current time,
// at = start of the move), so they work with word cues: <Callout t={t} at={cue(8, 'sulfur')} ... />.
// Colours: science colours only (C.yellow, C.red, C.blue, C.orange, C.lilac, C.cell, C.sky). One colour = one meaning per episode.
import React from 'react';
import {C, L, S, SANS, SLAB, wob, textW} from './lib';

const ink = C.ink;

// ---------- explainer devices ----------

// Magnifier portal: a lens grows from (x, y) and fills the screen = "zoom into the science world".
// Draw the outside world, then <Portal> over it with the inside world as children.
export const Portal: React.FC<{t: number; at: number; dur?: number; x: number; y: number; children: React.ReactNode}> = ({t, at, dur = 1.0, x, y, children}) => {
  const p = L(t, at, at + dur, 0, 1);
  if (p <= 0) return null;
  const r = 40 + p * 2300;
  const id = `portal${Math.round(at * 100)}`;
  return (
    <g>
      <defs><clipPath id={id}><circle cx={x} cy={y} r={r} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>{children}</g>
      {p < 1 && <circle cx={x} cy={y} r={r} fill="none" stroke={ink} strokeWidth={14} />}
      {p < 0.35 && <line x1={x + r * 0.7} y1={y + r * 0.7} x2={x + r * 0.7 + 90} y2={y + r * 0.7 + 90} stroke={ink} strokeWidth={22} strokeLinecap="round" />}
    </g>
  );
};

// Scale badge: "× 1,000" with a short bar, shown while zooming in.
export const ScaleBadge: React.FC<{t: number; at: number; text: string; sub?: string}> = ({t, at, text, sub}) => {
  const s = S(t, at), w = Math.max(280, textW(text, 54, true) + 70, sub ? textW(sub, 32) + 60 : 0);
  return (
    <g transform={`scale(${s})`}>
      <rect x={-w / 2} y={-56} width={w} height={sub ? 136 : 108} rx={24} fill="#fff" stroke={ink} strokeWidth={4} />
      <text textAnchor="middle" y={16} fontFamily={SLAB} fontWeight={800} fontSize={54} fill={ink}>{text}</text>
      {sub && <text textAnchor="middle" y={60} fontFamily={SANS} fontWeight={700} fontSize={32} fill={C.muted}>{sub}</text>}
    </g>
  );
};

// Callout: a label in a pill with a leader line to the target at (0,0). dx, dy = label offset.
export const Callout: React.FC<{t: number; at: number; text: string; dx?: number; dy?: number; color?: string; size?: number}> = ({t, at, text, dx = 160, dy = -120, color = ink, size = 46}) => {
  const p = L(t, at, at + 0.35, 0, 1);
  const s = S(t, at + 0.15);
  if (p <= 0) return null;
  const w = textW(text, size) + size * 1.2, h = size * 1.7;
  return (
    <g>
      <circle r={9} fill={ink} />
      <line x1={0} y1={0} x2={dx * p} y2={dy * p} stroke={ink} strokeWidth={4} strokeDasharray="10 8" />
      <g transform={`translate(${dx},${dy}) scale(${s})`}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill="#fff" stroke={ink} strokeWidth={4} />
        <text textAnchor="middle" y={size * 0.36} fontFamily={SANS} fontWeight={800} fontSize={size} fill={color}>{text}</text>
      </g>
    </g>
  );
};

// Flow arrow from (x1,y1) to (x2,y2) that draws in, then carries little dots along it.
export const FlowArrow: React.FC<{t: number; at: number; x1: number; y1: number; x2: number; y2: number; color?: string; w?: number; bend?: number; dots?: boolean}> = ({t, at, x1, y1, x2, y2, color = ink, w = 7, bend = 0, dots = true}) => {
  const p = L(t, at, at + 0.6, 0, 1);
  if (p <= 0) return null;
  const mx = (x1 + x2) / 2 - (y2 - y1) * bend, my = (y1 + y2) / 2 + (x2 - x1) * bend;
  const pt = (u: number) => [(1 - u) ** 2 * x1 + 2 * (1 - u) * u * mx + u * u * x2, (1 - u) ** 2 * y1 + 2 * (1 - u) * u * my + u * u * y2];
  const pts = Array.from({length: 41}, (_, i) => pt((i / 40) * p));
  const [ex, ey] = pts[pts.length - 1], [px, py] = pts[pts.length - 2];
  const a = Math.atan2(ey - py, ex - px);
  return (
    <g>
      <polyline points={pts.map((q) => q.join(',')).join(' ')} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" />
      <path d={`M${ex},${ey} L${ex - 26 * Math.cos(a - 0.45)},${ey - 26 * Math.sin(a - 0.45)} L${ex - 26 * Math.cos(a + 0.45)},${ey - 26 * Math.sin(a + 0.45)} Z`} fill={color} />
      {dots && p >= 1 && [0, 0.33, 0.66].map((o, i) => {
        const [dx, dy] = pt(((t - at) * 0.6 + o) % 1);
        return <circle key={i} cx={dx} cy={dy} r={w * 1.1} fill="#fff" stroke={color} strokeWidth={3} />;
      })}
    </g>
  );
};

// Step flow: icons in a row with labels, revealed one by one (times[i] = reveal time of step i).
export const StepFlow: React.FC<{t: number; steps: {icon: React.ReactNode; label: string}[]; times: number[]; gap?: number; active?: number}> = ({t, steps, times, gap = 260, active}) => {
  const total = (steps.length - 1) * gap;
  return (
    <g>
      {steps.map((st, i) => {
        const x = -total / 2 + i * gap;
        const s = S(t, times[i] ?? 1e9);
        const hi = active === i;
        return (
          <g key={i}>
            {i > 0 && s > 0 && <line x1={x - gap + 70} y1={0} x2={x - 70 + (1 - s) * -60} y2={0} stroke={ink} strokeWidth={5} strokeDasharray="12 10" />}
            <g transform={`translate(${x},0) scale(${s * (hi ? 1.12 : 1)})`}>
              <circle r={64} fill="#fff" stroke={hi ? C.orange : ink} strokeWidth={hi ? 8 : 5} />
              {st.icon}
              <text textAnchor="middle" y={108} fontFamily={SANS} fontWeight={800} fontSize={40} fill={ink}>{st.label}</text>
            </g>
          </g>
        );
      })}
    </g>
  );
};

// Big number that counts up: <BigNumber t at to={1500} unit="m" />. Years: grouping={false} (2002, not 2,002).
export const BigNumber: React.FC<{t: number; at: number; to: number; from?: number; dur?: number; unit?: string; size?: number; decimals?: number; color?: string; grouping?: boolean}> = ({t, at, to, from = 0, dur = 1.0, unit = '', size = 150, decimals = 0, color = ink, grouping = true}) => {
  const v = L(t, at, at + dur, from, to, (x) => 1 - (1 - x) ** 3);
  const s = S(t, at);
  return (
    <g transform={`scale(${s})`}>
      <text textAnchor="middle" y={size * 0.35} fontFamily={SLAB} fontWeight={800} fontSize={size} fill={color}>
        {v.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: grouping})}
        <tspan fontSize={size * 0.45} dx={10}>{unit}</tspan>
      </text>
    </g>
  );
};

// Compare: two labelled panels side by side ("A" vs "B"); verdict marks under each.
export const Compare: React.FC<{t: number; at: number; left: {title: string; node: React.ReactNode; ok?: boolean}; right: {title: string; node: React.ReactNode; ok?: boolean}; w?: number; h?: number}> = ({t, at, left, right, w = 640, h = 520}) => {
  const panel = (side: typeof left, x: number, d: number) => {
    const s = S(t, at + d);
    return (
      <g transform={`translate(${x},0) scale(${s})`}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={34} fill="#fff" stroke={ink} strokeWidth={5} />
        <text textAnchor="middle" y={-h / 2 + 70} fontFamily={SLAB} fontWeight={800} fontSize={54} fill={ink}>{side.title}</text>
        <g transform={`translate(0,${30})`}>{side.node}</g>
        {side.ok !== undefined && (
          <g transform={`translate(0,${h / 2 - 50}) scale(${S(t, at + d + 0.6)})`}>
            <circle r={34} fill={side.ok ? C.cell : C.red} stroke={ink} strokeWidth={4} />
            <path d={side.ok ? 'M-14,0 L-3,12 L16,-12' : 'M-12,-12 L12,12 M12,-12 L-12,12'} stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
      </g>
    );
  };
  return <g>{panel(left, -w / 2 - 30, 0)}{panel(right, w / 2 + 30, 0.25)}</g>;
};

// Simple bar comparison (max 5 bars). values in the same unit; label under each bar.
export const Bars: React.FC<{t: number; at: number; items: {label: string; value: number; color: string}[]; h?: number; unit?: string}> = ({t, at, items, h = 380, unit = ''}) => {
  const max = Math.max(...items.map((i) => i.value));
  const bw = 120, gap = 70, total = items.length * bw + (items.length - 1) * gap;
  return (
    <g>
      <line x1={-total / 2 - 30} x2={total / 2 + 30} y1={0} y2={0} stroke={ink} strokeWidth={5} />
      {items.map((it, i) => {
        const x = -total / 2 + i * (bw + gap);
        const p = L(t, at + i * 0.15, at + i * 0.15 + 0.7, 0, 1, (u) => 1 - (1 - u) ** 3);
        const bh = (it.value / max) * h * p;
        return (
          <g key={i}>
            <rect x={x} y={-bh} width={bw} height={bh} rx={14} fill={it.color} stroke={ink} strokeWidth={4} />
            <text x={x + bw / 2} y={-bh - 18} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={44} fill={ink} opacity={p}>{Math.round(it.value * p)}{unit}</text>
            <text x={x + bw / 2} y={48} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={40} fill={ink}>{it.label}</text>
          </g>
        );
      })}
    </g>
  );
};

// ---------- matter ----------

// A swarm of particles in a box; speed 0..3 (temperature). Deterministic per seed.
export const Particles: React.FC<{t: number; n?: number; w?: number; h?: number; r?: number; color?: string; speed?: number; seed?: number; face?: boolean}> = ({t, n = 18, w = 600, h = 400, r = 18, color = C.yellow, speed = 1, seed = 1, face = false}) => {
  const rnd = (i: number, k: number) => {
    const x = Math.sin(i * 12.9898 + k * 78.233 + seed * 37.719) * 43758.5453;
    return x - Math.floor(x);
  };
  const bounce = (p: number, len: number) => {
    const m = ((p % (2 * len)) + 2 * len) % (2 * len);
    return m < len ? m : 2 * len - m;
  };
  return (
    <g>
      {Array.from({length: n}, (_, i) => {
        const vx = (rnd(i, 1) - 0.5) * 160 * speed, vy = (rnd(i, 2) - 0.5) * 160 * speed;
        const x = bounce(rnd(i, 3) * (w - 2 * r) + vx * t, w - 2 * r) - w / 2 + r;
        const y = bounce(rnd(i, 4) * (h - 2 * r) + vy * t, h - 2 * r) - h / 2 + r;
        return (
          <g key={i} transform={`translate(${x},${y})`}>
            <circle r={r} fill={color} stroke={ink} strokeWidth={3} />
            {face && <g fill={ink}><circle cx={-r * 0.3} cy={-r * 0.1} r={r * 0.12} /><circle cx={r * 0.3} cy={-r * 0.1} r={r * 0.12} /></g>}
          </g>
        );
      })}
    </g>
  );
};

// Ball-and-stick molecule. atoms: [x, y, r, color]; bonds: [i, j].
export const Molecule: React.FC<{atoms: [number, number, number, string][]; bonds: [number, number][]; spin?: number}> = ({atoms, bonds, spin = 0}) => (
  <g transform={`rotate(${spin})`}>
    {bonds.map(([i, j], k) => <line key={k} x1={atoms[i][0]} y1={atoms[i][1]} x2={atoms[j][0]} y2={atoms[j][1]} stroke={ink} strokeWidth={10} strokeLinecap="round" />)}
    {atoms.map(([x, y, r, c], k) => (
      <g key={k}><circle cx={x} cy={y} r={r} fill={c} stroke={ink} strokeWidth={4} /><circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.22} fill="#fff" opacity={0.6} /></g>
    ))}
  </g>
);
// Ready-made: water (O blue + 2 H white). Use for "water" only when blue means water in the episode.
export const WATER: [[number, number, number, string][], [number, number][]] = [[[0, 0, 40, C.blue], [-52, 38, 24, '#FFFFFF'], [52, 38, 24, '#FFFFFF']], [[0, 1], [0, 2]]];

// Wave (sound, light, water). wl = wavelength px, amp = amplitude px, speed = px per s.
export const Wave: React.FC<{t: number; w?: number; wl?: number; amp?: number; speed?: number; color?: string; sw?: number}> = ({t, w = 900, wl = 180, amp = 50, speed = 200, color = C.blue, sw = 8}) => {
  const pts = Array.from({length: 121}, (_, i) => {
    const x = -w / 2 + (i / 120) * w;
    return `${x},${Math.sin(((x - speed * t) / wl) * Math.PI * 2) * amp}`;
  });
  return <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />;
};

// ---------- body ----------

export const Heart: React.FC<{t: number; bpm?: number; r?: number}> = ({t, bpm = 70, r = 120}) => {
  const ph = (t * bpm) / 60;
  const beat = Math.max(0, Math.sin((ph % 1) * Math.PI * 2)) ** 6;
  const s = (r / 100) * (1 + beat * 0.08);
  return (
    <g transform={`scale(${s})`}>
      <path d="M0,85 C-60,40 -110,5 -110,-35 C-110,-80 -60,-100 -30,-80 C-15,-70 -5,-55 0,-45 C5,-55 15,-70 30,-80 C60,-100 110,-80 110,-35 C110,5 60,40 0,85 Z" fill={C.red} stroke={ink} strokeWidth={6} strokeLinejoin="round" />
      <path d="M-70,-45 C-60,-65 -40,-70 -25,-60" stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.6} />
    </g>
  );
};

export const Lungs: React.FC<{t: number; rate?: number; r?: number}> = ({t, rate = 15, r = 160}) => {
  const b = (Math.sin((t * rate) / 60 * Math.PI * 2) + 1) / 2;
  const s = (r / 160) * (0.94 + b * 0.1);
  const lobe = 'M-20,-110 C-80,-110 -130,-40 -130,40 C-130,110 -90,140 -50,130 C-25,124 -20,90 -20,40 Z';
  return (
    <g transform={`scale(${s})`}>
      <path d="M0,-170 L0,-100 M0,-100 L-20,-80 M0,-100 L20,-80" stroke={ink} strokeWidth={14} strokeLinecap="round" fill="none" />
      <path d={lobe} fill="#F2A7A0" stroke={ink} strokeWidth={6} />
      <path d={lobe} transform="scale(-1,1)" fill="#F2A7A0" stroke={ink} strokeWidth={6} />
    </g>
  );
};

// Eye, front view (eyeball with iris); tear = 0..1 water layer shine.
export const Eye: React.FC<{t: number; look?: number; blink?: number; color?: string; water?: number}> = ({t, look = 0, blink = 1, color = '#6B8FB5', water = 0}) => (
  <g>
    <path d="M-170,0 Q0,-120 170,0 Q0,120 -170,0 Z" fill="#fff" stroke={ink} strokeWidth={6} />
    <g transform={`scale(1,${blink})`}>
      <circle cx={look * 40} r={58} fill={color} stroke={ink} strokeWidth={5} />
      <circle cx={look * 40} r={26} fill={ink} />
      <circle cx={look * 40 - 18} cy={-18} r={10} fill="#fff" />
    </g>
    {water > 0 && <path d="M-160,4 Q0,-104 160,4" fill="none" stroke={C.sky} strokeWidth={12} opacity={water * (0.6 + 0.4 * Math.abs(wob(t, 0.8)))} />}
  </g>
);

// ---------- space and weather ----------

export const Planet: React.FC<{r?: number; color?: string; ring?: boolean; craters?: boolean; spin?: number}> = ({r = 120, color = C.orange, ring = false, craters = true, spin = 0}) => (
  <g>
    {ring && <ellipse rx={r * 1.8} ry={r * 0.45} fill="none" stroke={ink} strokeWidth={6} transform="rotate(-15)" />}
    <circle r={r} fill={color} stroke={ink} strokeWidth={6} />
    <g transform={`rotate(${spin})`} opacity={0.35}>
      <path d={`M${-r * 0.9},${-r * 0.2} Q0,${-r * 0.4} ${r * 0.9},${-r * 0.1}`} stroke={ink} strokeWidth={5} fill="none" />
      <path d={`M${-r * 0.8},${r * 0.35} Q0,${r * 0.15} ${r * 0.85},${r * 0.4}`} stroke={ink} strokeWidth={5} fill="none" />
      {craters && <><circle cx={-r * 0.4} cy={-r * 0.5} r={r * 0.12} fill={ink} /><circle cx={r * 0.35} cy={r * 0.1} r={r * 0.09} fill={ink} /></>}
    </g>
    {ring && <path d={`M${-r * 1.8 * 0.97},${r * 0.12} A${r * 1.8},${r * 0.45} 0 0 0 ${r * 1.8 * 0.97},${-r * 0.12 - r * 0.45 * 0.5}`} fill="none" stroke={ink} strokeWidth={6} transform="rotate(-15)" />}
  </g>
);

export const Sun: React.FC<{t: number; r?: number}> = ({t, r = 120}) => (
  <g>
    <g transform={`rotate(${t * 12})`}>
      {Array.from({length: 12}, (_, i) => (
        <path key={i} d={`M0,${-r - 18} L${-16},${-r - 70} L${16},${-r - 70} Z`} fill={C.yellow} stroke={ink} strokeWidth={4} transform={`rotate(${i * 30})`} />
      ))}
    </g>
    <circle r={r} fill={C.yellow} stroke={ink} strokeWidth={6} />
  </g>
);

// Something moving on an ellipse orbit around (0,0). period in s.
export const Orbit: React.FC<{t: number; rx?: number; ry?: number; period?: number; phase?: number; children: React.ReactNode}> = ({t, rx = 420, ry = 160, period = 8, phase = 0, children}) => {
  const a = (t / period + phase) * Math.PI * 2;
  return (
    <g>
      <ellipse rx={rx} ry={ry} fill="none" stroke={ink} strokeWidth={4} strokeDasharray="14 12" opacity={0.5} />
      <g transform={`translate(${Math.cos(a) * rx},${Math.sin(a) * ry})`}>{children}</g>
    </g>
  );
};

export const Cloud: React.FC<{w?: number; color?: string; rain?: number; t?: number}> = ({w = 300, color = '#FFFFFF', rain = 0, t = 0}) => {
  const k = w / 300;
  return (
    <g transform={`scale(${k})`}>
      {rain > 0 && Array.from({length: 7}, (_, i) => {
        const y = ((t * 380 + i * 53) % 220) + 40;
        return <line key={i} x1={-110 + i * 36} y1={y} x2={-118 + i * 36} y2={y + 26} stroke={C.blue} strokeWidth={6} strokeLinecap="round" opacity={rain} />;
      })}
      <path d="M-130,40 C-170,40 -170,-20 -120,-20 C-120,-80 -40,-90 -20,-50 C10,-100 100,-90 100,-30 C150,-30 160,40 110,40 Z" fill={color} stroke={ink} strokeWidth={6} strokeLinejoin="round" />
    </g>
  );
};

// Thermometer, value 0..1
export const Thermometer: React.FC<{v: number; h?: number}> = ({v, h = 320}) => (
  <g>
    <rect x={-26} y={-h / 2} width={52} height={h} rx={26} fill="#fff" stroke={ink} strokeWidth={5} />
    <rect x={-12} y={h / 2 - 20 - (h - 40) * v} width={24} height={(h - 40) * v + 20} rx={12} fill={C.red} />
    <circle cy={h / 2 + 20} r={44} fill={C.red} stroke={ink} strokeWidth={5} />
    {[0.25, 0.5, 0.75].map((m) => <line key={m} x1={26} x2={50} y1={h / 2 - 20 - (h - 40) * m} y2={h / 2 - 20 - (h - 40) * m} stroke={ink} strokeWidth={4} />)}
  </g>
);

// ---------- backgrounds ----------

// Soft microscope world: big pale blobs drifting.
export const MicroBG: React.FC<{t: number; color?: string; w?: number; h?: number}> = ({t, color = C.cellLight, w = 1920, h = 1080}) => (
  <g>
    <rect width={w} height={h} fill="#F6F9EC" />
    {Array.from({length: 9}, (_, i) => (
      <circle key={i} cx={(i * 263 + wob(t, 0.05, 40, i * 0.3)) % w} cy={(i * 191) % h + wob(t, 0.07, 30, i)} r={90 + (i % 4) * 40} fill={color} opacity={0.5} />
    ))}
  </g>
);

export const SpaceBG: React.FC<{t: number; w?: number; h?: number}> = ({t, w = 1920, h = 1080}) => (
  <g>
    <rect width={w} height={h} fill="#1E2A44" />
    {Array.from({length: 70}, (_, i) => {
      const x = (i * 431) % w, y = (i * 277) % h;
      return <circle key={i} cx={x} cy={y} r={(i % 3) + 1.5} fill="#FFF7E0" opacity={0.5 + 0.5 * Math.abs(Math.sin(t * 1.3 + i))} />;
    })}
  </g>
);

export const LabGrid: React.FC<{w?: number; h?: number}> = ({w = 1920, h = 1080}) => (
  <g>
    <rect width={w} height={h} fill={C.bg} />
    {Array.from({length: Math.ceil(w / 96) + 1}, (_, i) => <line key={'v' + i} x1={i * 96} x2={i * 96} y1={0} y2={h} stroke="#EADDC6" strokeWidth={2} />)}
    {Array.from({length: Math.ceil(h / 96) + 1}, (_, i) => <line key={'h' + i} y1={i * 96} y2={i * 96} x1={0} x2={w} stroke="#EADDC6" strokeWidth={2} />)}
  </g>
);
