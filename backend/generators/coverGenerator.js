export function makeCoverUrl({ songSeed, title, artist }) {
  return `/api/cover?seed=${encodeURIComponent(songSeed)}&title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`;
}
