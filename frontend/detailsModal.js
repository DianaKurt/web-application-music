import { formatParagraphs, escapeHtml } from "./utils.js";
import { playSong, stopSong, isPlaying } from "./music.js";
import { state } from "./state.js";

let timerId = null;

function formatTime(sec) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function startTimer(timeEl) {
  stopTimer(timeEl);
  timerId = window.setInterval(() => {
    if (!window.Tone) return;
    timeEl.textContent = formatTime(Tone.Transport.seconds || 0);
  }, 200);
}

function stopTimer(timeEl) {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  if (timeEl) timeEl.textContent = "0:00";
}

export function closeExpanded() {
  stopSong();
  if (state.openedDetailsRow) state.openedDetailsRow.remove();
  if (state.openedRow) {
    const arrow = state.openedRow.querySelector(".cell-expand");
    if (arrow) arrow.textContent = "▾";
  }
  state.openedRow = null;
  state.openedDetailsRow = null;
}

export function toggleRowDetails(row, song) {
  // same row => close
  if (state.openedRow === row) {
    closeExpanded();
    return;
  }

  // close previous
  closeExpanded();

  // open new
  const arrow = row.querySelector(".cell-expand");
  if (arrow) arrow.textContent = "▴";

  const detailsRow = document.createElement("tr");
  detailsRow.className = "row-details";
  detailsRow.innerHTML = `
    <td colspan="7">
      <div class="details">
        <div class="details-cover">
          <img alt="cover" src="${song.coverUrl}" />
        </div>

        <div class="details-content">
          <div class="details-title">${escapeHtml(song.title)}</div>

          <div class="details-meta">
            from <strong>${escapeHtml(song.album)}</strong> by <strong>${escapeHtml(song.artist)}</strong>
            · <span class="cell-muted">${escapeHtml(song.genre)}</span>
          </div>

          <div class="details-audio">
            <button class="play-btn" type="button">Play</button>
            <span class="cell-muted time">0:00</span>
            <span class="cell-muted bpm"></span>
          </div>

          <div class="details-lyrics">${formatParagraphs(song.review)}</div>
        </div>
      </div>
    </td>
  `;

  row.insertAdjacentElement("afterend", detailsRow);

  const playBtn = detailsRow.querySelector(".play-btn");
  const timeEl = detailsRow.querySelector(".time");
  const bpmEl = detailsRow.querySelector(".bpm");

  playBtn.addEventListener("click", async () => {
    try {
      if (isPlaying()) {
        stopSong();
        stopTimer(timeEl);
        playBtn.textContent = "Play";
        bpmEl.textContent = "";
        return;
      }

      const { bpm } = await playSong(song.audioSeed, { previewSec: 12 });
      playBtn.textContent = "Stop";
      bpmEl.textContent = `BPM ${bpm}`;
      startTimer(timeEl);
    } catch (e) {
      console.error(e);
      stopSong();
      stopTimer(timeEl);
      playBtn.textContent = "Play";
      bpmEl.textContent = "Audio error";
    }
  });

  state.openedRow = row;
  state.openedDetailsRow = detailsRow;
}
