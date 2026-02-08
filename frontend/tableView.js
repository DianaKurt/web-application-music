import { escapeHtml } from "./utils.js";
import { toggleRowDetails } from "./detailsModal.js";

export function renderTable(tableBody, songs) {
  tableBody.innerHTML = "";

  songs.forEach(song => {
    const row = document.createElement("tr");
    row.className = "row";

    row.innerHTML = `
      <td class="cell-expand" title="Expand">▾</td>
      <td>${song.index}</td>
      <td>${escapeHtml(song.title)}</td>
      <td>${escapeHtml(song.artist)}</td>
      <td>${escapeHtml(song.album)}</td>
      <td>${escapeHtml(song.genre)}</td>
      <td>${song.likes}</td>
    `;

    row.querySelector(".cell-expand").addEventListener("click", (e) => {
      e.stopPropagation();
      toggleRowDetails(row, song);
    });

    // optional: click row to expand too
    row.addEventListener("click", () => toggleRowDetails(row, song));

    tableBody.appendChild(row);
  });
}

export function updatePaginationUI(prevBtn, pageBadge, page) {
  pageBadge.textContent = `Page ${page}`;
  prevBtn.disabled = page <= 1;
}
