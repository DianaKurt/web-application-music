import { Router } from "express";
import { fakerEN_US, fakerDE } from "@faker-js/faker";

import { combineSeed } from "../utils/seed.js";
import { makeRng, rngToInt32 } from "../utils/rng.js";

import { generateSong } from "../generators/songGenerator.js";
import { generateLikes } from "../generators/likesGenerator.js";
import { generateReview } from "../generators/reviewGenerator.js";
import { makeCoverUrl } from "../generators/coverGenerator.js";
import { makeAudioSeed } from "../generators/audioGenerator.js";

const router = Router();

const fakerByLang = {
  "en-US": fakerEN_US,
  "de-DE": fakerDE,
};

router.get("/songs", (req, res) => {
  const lang = req.query.lang || "en-US";
  const userSeed = String(req.query.seed ?? "1");

  const avgLikesRaw = Number(req.query.likes ?? 0);
  const avgLikes = Number.isFinite(avgLikesRaw) ? Math.max(0, Math.min(10, avgLikesRaw)) : 0;

  const pageRaw = Number(req.query.page ?? 1);
  const page = Number.isFinite(pageRaw) ? Math.max(1, Math.floor(pageRaw)) : 1;

  const sizeRaw = Number(req.query.pageSize ?? 10);
  const pageSize = Number.isFinite(sizeRaw) ? Math.max(1, Math.min(50, Math.floor(sizeRaw))) : 10;

  const faker = fakerByLang[lang] ?? fakerEN_US;
  const songs = [];

  for (let i = 0; i < pageSize; i++) {
    const index = (page - 1) * pageSize + i + 1;
    const songSeed = combineSeed(userSeed, page, index);

    // core RNG (titles/artists/etc depend ONLY on core seed)
    const coreRng = makeRng(songSeed + "::core");
    faker.seed(rngToInt32(coreRng));
    const core = generateSong({ faker, rng: coreRng });

    // likes RNG (independent)
    const likesRng = makeRng(songSeed + "::likes");
    const likes = generateLikes({ avgLikes, rng: likesRng });

    // review RNG (independent from likes)
    const reviewRng = makeRng(songSeed + "::review");
    faker.seed(rngToInt32(reviewRng));
    const review = generateReview({ faker, rng: reviewRng });

    const coverUrl = makeCoverUrl({ songSeed, title: core.title, artist: core.artist });
    const audioSeed = makeAudioSeed(songSeed);

    songs.push({
      index,
      ...core,
      likes,
      review,
      coverUrl,
      audioSeed,
    });
  }

  res.json({ songs });
});

export default router;
