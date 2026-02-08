export function combineSeed(userSeed, page, index) {
  return `${userSeed}::${page}::${index}`;
}
