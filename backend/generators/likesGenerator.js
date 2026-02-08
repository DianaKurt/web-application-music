export function generateLikes({ avgLikes, rng }) {
  const base = Math.floor(avgLikes);
  const frac = avgLikes - base;
  return base + (rng() < frac ? 1 : 0);
}
