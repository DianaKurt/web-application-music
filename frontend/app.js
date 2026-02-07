const API_URL = "/api/songs";


// UI
const langEl = document.getElementById("lang");
const seedEl = document.getElementById("seed");
const likesEl = document.getElementById("likes");
const tableBody = document.getElementById("songs-table");
const prevBtn = document.getElementById("prev-page");
const nextBtn = document.getElementById("next-page");
const pageBadge = document.getElementById("page-badge");


// state
let page = 1;
const limit = 10;

// === load data from server ===
async function loadSongs() {
  const params = new URLSearchParams({
    lang: langEl.value,
    seed: seedEl.value,
    likes: likesEl.value,
    page: String(page),
    pageSize: String(limit),
  });

  const response = await fetch(`${API_URL}?${params}`);
  const data = await response.json();

  renderTable(data.songs);
}
updatePaginationUI();
function updatePaginationUI() {
  pageBadge.textContent = `Page ${page}`;
  prevBtn.disabled = page <= 1;
}


// === expandable logic ===
let openedRow = null;

function toggleDetails(row, song) {
  if (openedRow === row) {
    closeDetails(row);
    openedRow = null;
    return;
  }

  if (openedRow) closeDetails(openedRow);

  openDetails(row, song);
  openedRow = row;
}

function openDetails(row, song) {
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
          </div>

          <div class="details-audio">
            <span>▶</span>
            <input type="range" min="0" max="100" value="0" />
            <span class="cell-muted">0:00</span>
          </div>

          <div class="details-lyrics">
          ${formatParagraphs(song.review)}
          </div>
        </div>
      </div>
    </td>
  `;

  row.insertAdjacentElement("afterend", detailsRow);
}

function closeDetails(row) {
  const arrow = row.querySelector(".cell-expand");
  if (arrow) arrow.textContent = "▾";

  const next = row.nextElementSibling;
  if (next && next.classList.contains("row-details")) {
    next.remove();
  }
}

// === render table ===
function renderTable(songs) {
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

    row.querySelector(".cell-expand").addEventListener("click", () => {
      toggleDetails(row, song);
    });

    tableBody.appendChild(row);
  });
}

// === helpers ===
function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// === listen change without button ===
[langEl, seedEl, likesEl].forEach(el => {
  el.addEventListener("input", () => {
    page = 1;
    openedRow = null; 
    loadSongs();
  });
});

function formatParagraphs(text) {
  if (!text) return "<p class='cell-muted'>No review yet.</p>";


  const safe = escapeHtml(text);
  const parts = safe.split(/\n+/g).filter(Boolean);


  if (parts.length <= 1) return `<p>${safe}</p>`;

  return parts.map(p => `<p>${p}</p>`).join("");
}

prevBtn.addEventListener("click", () => {
  if (page > 1) {
    page -= 1;
    openedRow = null;
    loadSongs();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

nextBtn.addEventListener("click", () => {
  page += 1;
  openedRow = null;
  loadSongs();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// initial load
loadSongs();
