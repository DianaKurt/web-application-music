export function generateSong({ faker, rng }) {
  const title = faker.music.songName();

  const artist = rng() < 0.5
    ? faker.person.fullName()
    : faker.company.name();

  const album = rng() < 0.3
    ? "Single"
    : faker.music.album();

  const genre = faker.music.genre();

  return { title, artist, album, genre };
}
