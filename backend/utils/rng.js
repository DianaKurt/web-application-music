import seedrandom from "seedrandom";

export function makeRng(seedStr) {
  return seedrandom(seedStr);
}

export function rngToInt32(rng) {
  // faker.seed waiting number
  return (rng.int32() >>> 0);
}
