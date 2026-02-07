//обложка (canvas / svg)

export function generateCover({ title, artist, seed }) {
  return `/cover/${seed}.png`;
}
