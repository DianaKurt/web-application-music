# Music Store Generator

A single-page web application that simulates a music store showcase by generating **fake but realistic song data** and **actual playable music** in the browser.

The application is fully deterministic:  
the same seed always produces the same songs, covers, and audio.

---

## Features

### Core Functionality
- Single Page Application (SPA)
- No authentication required
- Server-side data generation (no database)

### Language Support
- English (United States)
- German (Germany)
- Languages are generated independently (no translation reuse)

### Seed-Based Generation
- Custom **64-bit seed**
- Random seed generator
- Same seed → same data across devices and sessions

### Likes System
- Average likes per song: **0–10**
- Fractional values supported (e.g. `3.7`)
- Probabilistic distribution
- Changing likes does **not** affect titles, artists, or albums

---

## UI / UX

### Toolbar
- Language selector
- Seed input
- Random seed button
- Average likes input
- View mode selector

All controls update data **instantly** without page reloads.

### View Modes
#### Table View
- Paginated
- Expandable rows / modal details
- Reset to page 1 on parameter change

#### Gallery View
- Infinite scrolling
- Card-based layout
- Resets scroll position on parameter change

---

## Generated Song Data

Each song includes:
- Sequential index
- Song title
- Artist (band names + personal names)
- Album title or `"Single"`
- Genre
- Likes count
- Review text
- Generated cover image
- Playable audio preview

---

## Audio Generation

- Music is generated **programmatically** using Tone.js
- Deterministic audio output based on seed
- Multiple instruments:
  - Lead synth
  - Bass
  - Drums
- Uses musical scales and chord progressions
- Short preview playback

---

## Cover Generation

- SVG covers generated on the server
- Deterministic colors and patterns
- Correct song title and artist rendered on the cover
- No external images used

---

## Architecture

### Backend
- Node.js + Express
- Faker.js for localized data generation
- Seedrandom for deterministic RNG
- No database (in-memory generation only)

### Frontend
- Vanilla JavaScript (ES Modules)
- No frameworks
- Tone.js for music synthesis
- Dynamic DOM updates

---

## Optional Features
Lyrics display (not implemented)
MP3 export (not implemented)

