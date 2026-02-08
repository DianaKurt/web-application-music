import { escapeHtml } from "./utils.js";
import { state } from "./state.js";

export function renderTable(tableBody, songs, onOpen) {
  tableBody.innerHTML = "";

  songs.forEach(song => {
    const row = document.createElement("tr");
    row.className = "row";

    row.innerHTML = `
      <td></td>
      <td>${song.index}</td>
      <td>${escapeHtml(song.title)}</td>
      <td>${escapeHtml(song.artist)}</td>
      <td>${escapeHtml(song.album)}</td>
      <td>${escapeHtml(song.genre)}</td>
      <td>${song.likes}</td>
    `;

    row.addEventListener("click", () => onOpen(song));
    tableBody.appendChild(row);
  });
}

export function updatePaginationUI(prevBtn, pageBadge) {
  pageBadge.textContent = `Page ${state.page}`;
  prevBtn.disabled = state.page <= 1;
}
