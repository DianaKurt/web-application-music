export function buildSongGraph(audioSeed) {
  if (!window.Tone) throw new Error("Tone.js not loaded");

  const seedrandomFn = window.seedrandom || (window.Math && window.Math.seedrandom);
  if (!seedrandomFn) throw new Error("seedrandom not loaded");

  const rng = seedrandomFn(String(audioSeed));

  const bpm = 85 + Math.floor(rng() * 66);
  Tone.Transport.bpm.value = bpm;
  Tone.Transport.timeSignature = [4, 4];

  const synthLead = new Tone.PolySynth(Tone.Synth, {
    volume: -10,
    oscillator: { type: rng() < 0.5 ? "triangle" : "sine" },
    envelope: { attack: 0.01, decay: 0.12, sustain: 0.2, release: 0.25 },
  }).toDestination();

  const synthBass = new Tone.MonoSynth({
    volume: -8,
    oscillator: { type: "square" },
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.2 },
  }).toDestination();

  const hat = new Tone.NoiseSynth({
    volume: -18,
    noise: { type: "white" },
    envelope: { attack: 0.001, decay: 0.05, sustain: 0 },
  }).toDestination();

  const kick = new Tone.MembraneSynth({
    volume: -6,
    pitchDecay: 0.02,
    octaves: 6,
    envelope: { attack: 0.001, decay: 0.18, sustain: 0.01, release: 0.1 },
  }).toDestination();

  // harmony
  const roots = ["C", "D", "E", "F", "G", "A", "B"];
  const root = roots[Math.floor(rng() * roots.length)];
  const minor = rng() < 0.55;

  const rootMidiMap = { C: 60, D: 62, E: 64, F: 65, G: 67, A: 69, B: 71 };
  const rootMidi = rootMidiMap[root] ?? 60;

  const intervals = minor ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
  const scaleMidi = intervals.map(i => rootMidi + i);

  const progMajor = [[0,4,7],[7,11,14],[9,12,16],[5,9,12]];
  const progMinor = [[0,3,7],[8,12,15],[3,7,10],[10,14,17]];
  const chordProg = (minor ? progMinor : progMajor).map(ch => ch.map(x => rootMidi + x));

  const barsPerLoop = 2;
  const midiToNote = (m) => Tone.Frequency(m, "midi").toNote();

  function pickLeadNote() {
    if (rng() < 0.25) return null;
    const octaveUp = rng() < 0.2 ? 12 : 0;
    const m = scaleMidi[Math.floor(rng() * scaleMidi.length)] + octaveUp;
    return midiToNote(m);
  }

  function chordForBar(bar) {
    return chordProg[bar % chordProg.length].map(midiToNote);
  }

  const parts = [];

  const chordPart = new Tone.Part((time, chord) => {
    synthLead.triggerAttackRelease(chord, "1n", time);
  }, []);
  for (let bar = 0; bar < barsPerLoop; bar++) chordPart.add(`${bar}:0:0`, chordForBar(bar));
  chordPart.loop = true;
  chordPart.loopEnd = `${barsPerLoop}m`;
  parts.push(chordPart);

  const bassPart = new Tone.Part((time, note) => {
    synthBass.triggerAttackRelease(note, "8n", time);
  }, []);
  for (let bar = 0; bar < barsPerLoop; bar++) {
    const rootNote = chordForBar(bar)[0];
    bassPart.add(`${bar}:0:0`, rootNote);
    bassPart.add(`${bar}:2:0`, rootNote);
  }
  bassPart.loop = true;
  bassPart.loopEnd = `${barsPerLoop}m`;
  parts.push(bassPart);

  const leadPart = new Tone.Part((time, note) => {
    if (!note) return;
    synthLead.triggerAttackRelease(note, "8n", time);
  }, []);
  for (let bar = 0; bar < barsPerLoop; bar++) {
    for (let beat = 0; beat < 4; beat++) {
      leadPart.add(`${bar}:${beat}:0`, pickLeadNote());
      leadPart.add(`${bar}:${beat}:2`, pickLeadNote());
    }
  }
  leadPart.loop = true;
  leadPart.loopEnd = `${barsPerLoop}m`;
  parts.push(leadPart);

  const drumPart = new Tone.Part((time, type) => {
    if (type === "kick") kick.triggerAttackRelease("C1", "8n", time);
    if (type === "hat") hat.triggerAttackRelease("16n", time);
  }, []);
  for (let bar = 0; bar < barsPerLoop; bar++) {
    drumPart.add(`${bar}:0:0`, "kick");
    drumPart.add(`${bar}:2:0`, "kick");
    for (let beat = 0; beat < 4; beat++) drumPart.add(`${bar}:${beat}:2`, "hat");
  }
  drumPart.loop = true;
  drumPart.loopEnd = `${barsPerLoop}m`;
  parts.push(drumPart);

  return { bpm, parts };
}
