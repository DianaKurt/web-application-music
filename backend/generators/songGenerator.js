//title, artist, album, genre


export function generateSong({ faker, rng }) {
  return {
    title: faker.music.songName(),
    artist: faker.person.fullName(),
    album: faker.music.album(),
    genre: faker.music.genre(),
  };
}
