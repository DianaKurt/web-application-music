import express from "express";
import cors from "cors";
import seedrandom from "seedrandom";
import path from "path";
import { fileURLToPath } from "url";

import songsRouter from "./routes/songs.js";

const app = express();
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// static frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// api routes
app.use("/api", songsRouter);

// ===== cover route (svg) =====
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

  const hue1 = Math.floor(rng() * 360);
  const hue2 = (hue1 + 40 + Math.floor(rng() * 80)) % 360;

  const g1 = `hsl(${hue1} 85% 70%)`;
  const g2 = `hsl(${hue2} 85% 68%)`;

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
        font-size="30" font-weight="800" fill="#111827">${safeTitle}</text>

  <text x="52" y="424" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif"
        font-size="18" font-weight="600" fill="rgba(17,24,39,0.72)">${safeArtist}</text>

  <text x="52" y="460" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif"
        font-size="14" font-weight="600" fill="rgba(17,24,39,0.55)">
    Generated cover • seed ${svgEscape(seed)}
  </text>
</svg>`;

  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.send(svg);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
