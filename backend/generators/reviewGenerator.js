export function generateReview({ faker, rng }) {
  const templates = [
    () => `A ${faker.word.adjective()} ${faker.music.genre()} track with ${faker.word.adjective()} energy.`,
    () => `The ${faker.word.noun()} feels ${faker.word.adjective()} and ${faker.word.adjective()} throughout.`,
    () => `Great for ${faker.word.verb()}ing late at night — the groove is ${faker.word.adjective()}.`,
    () => `The hook is ${faker.word.adjective()}, and the rhythm is surprisingly ${faker.word.adjective()}.`,
    () => `Not perfect, but the vibe is ${faker.word.adjective()} and the melody is ${faker.word.adjective()}.`,
  ];

  const sentenceCount = 2 + Math.floor(rng() * 3); // 2..4
  const picked = [];

  for (let i = 0; i < sentenceCount; i++) {
    picked.push(templates[Math.floor(rng() * templates.length)]());
  }

  return picked.join(" ");
}
