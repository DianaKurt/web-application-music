import express from "express";
import cors from "cors";
import seedrandom from "seedrandom";
import { fakerEN_US, fakerDE } from "@faker-js/faker";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// раздаём frontend как статику
app.use(express.static(path.join(__dirname, "../frontend")));


const PORT = 4000;

// доступные локали (можно расширять)
const fakerByLang = {
  "en-US": fakerEN_US,
  "de-DE": fakerDE,
};

// seed + page + index → детерминированная строка
function combineSeed(userSeed, page, index) {
  return `${userSeed}::${page}::${index}`;
}

// отдельная функция likes: дробные значения → вероятностно
function generateLikes(avgLikes, rng) {
  const base = Math.floor(avgLikes);
  const frac = avgLikes - base;
  return base + (rng() < frac ? 1 : 0);
}

function clampText(s, max = 28) {
  const str = String(s ?? "");
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

function svgEscape(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

app.get("/api/cover", (req, res) => {
  const seed = String(req.query.seed ?? "cover");
  const title = clampText(req.query.title ?? "Untitled", 26);
  const artist = clampText(req.query.artist ?? "Unknown Artist", 30);

  const rng = seedrandom(seed);

  // яркие, но светлые тона
  const hue1 = Math.floor(rng() * 360);
  const hue2 = (hue1 + 40 + Math.floor(rng() * 80)) % 360;

  const g1 = `hsl(${hue1} 85% 70%)`;
  const g2 = `hsl(${hue2} 85% 68%)`;

  // простой паттерн (детерминированный)
  const cx = 40 + Math.floor(rng() * 220);
  const cy = 40 + Math.floor(rng() * 220);
  const r1 = 90 + Math.floor(rng() * 120);

  const safeTitle = svgEscape(title);
  const safeArtist = svgEscape(artist);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${g1}"/>
      <stop offset="1" stop-color="${g2}"/>
    </linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
  </defs>

  <rect width="512" height="512" rx="28" fill="url(#bg)"/>

  <circle cx="${cx}" cy="${cy}" r="${r1}" fill="rgba(255,255,255,0.35)" filter="url(#soft)"/>
  <circle cx="${512 - cx}" cy="${512 - cy}" r="${Math.floor(r1 * 0.75)}" fill="rgba(255,255,255,0.25)" filter="url(#soft)"/>

  <rect x="28" y="330" width="456" height="154" rx="18" fill="rgba(255,255,255,0.72)"/>

  <text x="52" y="382" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif"
        font-size="30" font-weight="800" fill="#111827">
    ${safeTitle}
  </text>

  <text x="52" y="424" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif"
        font-size="18" font-weight="600" fill="rgba(17,24,39,0.72)">
    ${safeArtist}
  </text>

  <text x="52" y="460" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif"
        font-size="14" font-weight="600" fill="rgba(17,24,39,0.55)">
    Generated cover • seed ${svgEscape(seed)}
  </text>
</svg>`;

  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.send(svg);
});



app.get("/api/songs", (req, res) => {
  const lang = req.query.lang || "en-US";
  const userSeed = String(req.query.seed ?? "1");
  const avgLikes = Number(req.query.likes ?? 0);
  const page = Number(req.query.page ?? 1);

  const limit = 10; // пока фиксируем, потом вынесем параметром

  const faker = fakerByLang[lang] ?? fakerEN_US;

  const songs = [];

  for (let i = 0; i < limit; i++) {
    const index = (page - 1) * limit + i + 1;
    const songSeed = combineSeed(userSeed, page, index);
  
    // core (title/artist/album/genre)
    const coreRng = seedrandom(songSeed + "::core");
    faker.seed((coreRng.int32() >>> 0));
  
    const title = faker.music.songName();
    const artist = coreRng() < 0.5 ? faker.person.fullName() : faker.company.name();
    const album = coreRng() < 0.3 ? "Single" : faker.music.album();
    const genre = faker.music.genre();
  
    // likes (отдельно)
    const likesRng = seedrandom(songSeed + "::likes");
    const likes = generateLikes(avgLikes, likesRng);
  
    // review (отдельно, НЕ зависит от likes)
    const reviewRng = seedrandom(songSeed + "::review");
    faker.seed((reviewRng.int32() >>> 0));
    const review = generateReview(faker, reviewRng);
    const coverUrl =
    `/api/cover?seed=${encodeURIComponent(songSeed)}&title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`;
  
    songs.push({
      index,
      title,
      artist,
      album,
      genre,
      likes,
      review, 
      coverUrl,
    });
  }
  
  res.json({ songs });
});


function generateReview(faker, rng) {
  // делаем "настоящий" текст из слов и шаблонов, не lorem ipsum
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
    const fn = templates[Math.floor(rng() * templates.length)];
    picked.push(fn());
  }

  return picked.join(" ");
}






app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});