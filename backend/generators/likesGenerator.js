//likes (отдельный RNG)



export function generateLikes(avg, rng) {
  const base = Math.floor(avg);
  return base + (rng() < avg - base ? 1 : 0);
}
