export function generateSong({ faker, rng }) {
  const artist = rng() < 0.5 ? faker.person.fullName() : faker.company.name();
  const album = rng() < 0.3 ? "Single" : faker.music.album();

  return {
    title: faker.music.songName(),
    artist,
    album,
    genre: faker.music.genre(),
  };
}
