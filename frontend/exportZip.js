// exportZip.js (Offline render -> WAV -> ZIP)
import { buildSongGraph } from "./musicOffline.js";

function safeFileName(s) {
  return String(s)
    .replaceAll(/[\\/:*?"<>|]/g, "_")
    .replaceAll(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

// --- WAV encoder (16-bit PCM) ---
function audioBufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length;

  // interleave
  const interleaved = new Float32Array(length * numChannels);
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      interleaved[i * numChannels + ch] = buffer.getChannelData(ch)[i];
    }
  }

  // 16-bit PCM
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = interleaved.length * bytesPerSample;
  const bufferSize = 44 + dataSize;

  const view = new DataView(new ArrayBuffer(bufferSize));
  let offset = 0;

  function writeString(s) {
    for (let i = 0; i < s.length; i++) view.setUint8(offset++, s.charCodeAt(i));
  }
  function writeUint32(v) { view.setUint32(offset, v, true); offset += 4; }
  function writeUint16(v) { view.setUint16(offset, v, true); offset += 2; }

  writeString("RIFF");
  writeUint32(36 + dataSize);
  writeString("WAVE");

  writeString("fmt ");
  writeUint32(16);
  writeUint16(1); // PCM
  writeUint16(numChannels);
  writeUint32(sampleRate);
  writeUint32(byteRate);
  writeUint16(blockAlign);
  writeUint16(16); // bits

  writeString("data");
  writeUint32(dataSize);

  // samples
  for (let i = 0; i < interleaved.length; i++) {
    let s = Math.max(-1, Math.min(1, interleaved[i]));
    const int16 = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(offset, int16, true);
    offset += 2;
  }

  return new Blob([view.buffer], { type: "audio/wav" });
}

async function renderSongToWav(audioSeed, seconds = 12) {
  if (!window.Tone) throw new Error("Tone.js not loaded");

  const buffer = await Tone.Offline(async ({ transport }) => {
    // построить инструменты/партии в оффлайн-контексте
    const { parts } = buildSongGraph(audioSeed);

    parts.forEach(p => p.start(0));
    transport.start(0);
  }, seconds);

  return audioBufferToWav(buffer);
}

export async function exportZip(songs, { seconds = 12 } = {}) {
  if (!window.JSZip) throw new Error("JSZip not loaded");

  const zip = new JSZip();

  // Экспортируем только то, что есть на текущей странице
  for (const song of songs) {
    const wavBlob = await renderSongToWav(song.audioSeed, seconds);

    const base = `${song.title} — ${song.artist} — ${song.album}`;
    const name = safeFileName(base) + ".wav";
    zip.file(name, wavBlob);
  }

  const outBlob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(outBlob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "songs.zip";
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
