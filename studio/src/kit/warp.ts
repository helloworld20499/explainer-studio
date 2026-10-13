// Piecewise-linear time map. pairs = [[newTime, oldTime], ...] in rising order.
// Outside the pairs the clock runs at normal speed.
export const makeWarp = (pairs: [number, number][]) => (t: number) => {
  if (t <= pairs[0][0]) return pairs[0][1] + (t - pairs[0][0]);
  for (let i = 1; i < pairs.length; i++) {
    const [a0, b0] = pairs[i - 1], [a1, b1] = pairs[i];
    if (t <= a1) return b0 + ((t - a0) / (a1 - a0)) * (b1 - b0);
  }
  const [a, b] = pairs[pairs.length - 1];
  return b + (t - a);
};
