export function generateLikes({ avgLikes, rng }) {
  if(avgLikes <= 0) return 0;
  if(avgLikes >= 10) return 10;

  const base = Math.floor(avgLikes);
  const frac = avgLikes - base;
  return base + (rng() < frac ? 1 : 0);
}
