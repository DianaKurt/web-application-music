import { escapeHtml, formatParagraphs } from "./utils.js";
import { playSong, stopSong, isPlaying } from "./music.js";

const modalEl = document.getElementById("modal");
const modalBodyEl = document.getElementById("modal-body");

let isOpen = false;
let timerId = null;


export function openDetails(song) {
  modalBodyEl.innerHTML = `
    <div class="modal-details">
      <div class="modal-cover">
        <img alt="cover" src="${song.coverUrl}" />
      </div>

      <div>
        <h2 class="modal-title">${escapeHtml(song.title)}</h2>

        <p class="modal-meta">
          <strong>${escapeHtml(song.artist)}</strong><br/>
          ${escapeHtml(song.album)} · ${escapeHtml(song.genre)} · ❤️ ${song.likes}
        </p>

        <div class="modal-audio">
          <button id="play-btn" type="button">Play</button>
          <span class="cell-muted" id="time-label">0:00</span>
          <span class="cell-muted" id="bpm-label"></span>
        </div>


        <div class="modal-review">
          ${formatParagraphs(song.review)}
        </div>
      </div>
    </div>
  `;

  const playBtn = document.getElementById("play-btn");
  const bpmLabel = document.getElementById("bpm-label");
  const timeLabel = document.getElementById("time-label");

  const audioSeed = song.audioSeed; 

  playBtn.addEventListener("click", async () => {
    if (!audioSeed) return;

    try {
      if (isPlaying()) {
        stopSong();
        stopTimer(timeLabel);
        playBtn.textContent = "Play";
        bpmLabel.textContent = "";
        return;
      }
      const { bpm } = await playSong(audioSeed);
      playBtn.textContent = "Stop";
      bpmLabel.textContent = `BPM ${bpm}`;
      startTimer(timeLabel);
      } catch (e) {
      console.error(e);
      stopSong();
      stopTimer(timeLabel);
      playBtn.textContent = "Play";
      bpmLabel.textContent = "Audio error";
      }
    
  });

  modalEl.classList.add("is-open");
  modalEl.setAttribute("aria-hidden", "false");
  isOpen = true;

  window.addEventListener("keydown", onKeydown);
}

export function closeDetails() {
  if (!isOpen) return;

  stopSong();
  stopTimer(document.getElementById("time-label"));

  modalEl.classList.remove("is-open");
  modalEl.setAttribute("aria-hidden", "true");
  modalBodyEl.innerHTML = "";
  isOpen = false;

  window.removeEventListener("keydown", onKeydown);
}

function onKeydown(e) {
  if (e.key === "Escape") {
    stopSong();
    closeDetails();
  }
}

modalEl.addEventListener("click", (e) => {
  const target = e.target;
  if (target && target.dataset && target.dataset.close) {
    closeDetails();
  }
});

function formatTime(sec) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function startTimer(timeLabelEl) {
  stopTimer(timeLabelEl);

  // Tone глобальный (CDN)
  timerId = window.setInterval(() => {
    if (!window.Tone) return;
    const t = Tone.Transport.seconds || 0;
    timeLabelEl.textContent = formatTime(t);
  }, 200);
}

function stopTimer(timeLabelEl) {
  if (timerId) {
    window.clearInterval(timerId);
    timerId = null;
  }
  if (timeLabelEl) timeLabelEl.textContent = "0:00";
}

