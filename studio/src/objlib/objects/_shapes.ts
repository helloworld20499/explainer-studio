// Path builders for drawing objects in code. All return SVG path strings in the object's box.
const f = (n: number) => +n.toFixed(2);

// clockwise, like rrect: overlapping sub-shapes then fill as a union (non-zero rule)
export const circle = (cx: number, cy: number, r: number) => `M${f(cx - r)},${f(cy)} a${f(r)},${f(r)} 0 1,1 ${f(2 * r)},0 a${f(r)},${f(r)} 0 1,1 ${f(-2 * r)},0 Z`;
export const ellipse = (cx: number, cy: number, rx: number, ry: number) => `M${f(cx - rx)},${f(cy)} a${f(rx)},${f(ry)} 0 1,1 ${f(2 * rx)},0 a${f(rx)},${f(ry)} 0 1,1 ${f(-2 * rx)},0 Z`;
export const rrect = (x: number, y: number, w: number, h: number, r: number) => {
  r = Math.min(r, w / 2, h / 2);
  return `M${f(x + r)},${f(y)} H${f(x + w - r)} A${f(r)},${f(r)} 0 0 1 ${f(x + w)},${f(y + r)} V${f(y + h - r)} A${f(r)},${f(r)} 0 0 1 ${f(x + w - r)},${f(y + h)} H${f(x + r)} A${f(r)},${f(r)} 0 0 1 ${f(x)},${f(y + h - r)} V${f(y + r)} A${f(r)},${f(r)} 0 0 1 ${f(x + r)},${f(y)} Z`;
};
export const poly = (pts: [number, number][], close = true) => 'M' + pts.map(([x, y]) => `${f(x)},${f(y)}`).join(' L') + (close ? ' Z' : '');
// smooth closed curve through points (Catmull-Rom -> cubic Bezier)
export const smooth = (pts: [number, number][], close = true) => {
  const n = pts.length, P = (i: number) => pts[close ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 0; i < (close ? n : n - 1); i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`;
  }
  return d + (close ? ' Z' : '');
};
// wobbly round blob (cells, clouds of particles); t moves the wobble
export const blob = (cx: number, cy: number, r: number, amp: number, t = 0, seed = 0, n = 16) =>
  smooth(Array.from({length: n}, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const rr = r + amp * (Math.sin(3 * a + t * 1.3 + seed) + 0.6 * Math.sin(5 * a - t * 0.9 + seed * 2));
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr] as [number, number];
  }));
export const star = (cx: number, cy: number, n: number, r1: number, r2: number, rot = -Math.PI / 2, sy = 1) =>
  poly(Array.from({length: n * 2}, (_, i) => {
    const a = rot + (i * Math.PI) / n, r = i % 2 ? r2 : r1;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r * sy] as [number, number];
  }));
export const capsule = (cx: number, cy: number, len: number, r: number) =>
  `M${f(cx - len / 2)},${f(cy - r)} H${f(cx + len / 2)} A${f(r)},${f(r)} 0 0 1 ${f(cx + len / 2)},${f(cy + r)} H${f(cx - len / 2)} A${f(r)},${f(r)} 0 0 1 ${f(cx - len / 2)},${f(cy - r)} Z`;
// many separate short lines
export const lines = (segs: [number, number, number, number][]) => segs.map(([a, b, c, d]) => `M${f(a)},${f(b)} L${f(c)},${f(d)}`).join(' ');
export const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p = (a: number) => `${f(cx + Math.cos(a) * r)},${f(cy + Math.sin(a) * r)}`;
  return `M${p(a0)} A${f(r)},${f(r)} 0 ${Math.abs(a1 - a0) > Math.PI ? 1 : 0} ${a1 > a0 ? 1 : 0} ${p(a1)}`;
};
// gear outline with n teeth
export const gear = (cx: number, cy: number, r: number, teeth: number, depth: number) => {
  const pts: [number, number][] = [];
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2, s = (Math.PI * 2) / teeth;
    for (const [da, rr] of [[0, r - depth], [s * 0.18, r - depth], [s * 0.3, r], [s * 0.62, r], [s * 0.74, r - depth]] as [number, number][])
      pts.push([cx + Math.cos(a + da) * rr, cy + Math.sin(a + da) * rr]);
  }
  return poly(pts);
};

// motion helpers
export const pop = (u: number) => (u <= 0 ? 0 : 1 - Math.exp(-u * 7) * Math.cos(u * 13));
export const ease = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
export const wave = (t: number, f = 1, a = 1, ph = 0) => Math.sin((t * f + ph) * Math.PI * 2) * a;
