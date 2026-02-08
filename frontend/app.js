import { fetchSongs } from "./api.js";
import { state } from "./state.js";
import { renderTable, updatePaginationUI } from "./tableView.js";
import { resetGallery, appendGalleryBatch, createGalleryObserver } from "./galleryView.js";
import { closeExpanded } from "./detailsModal.js";
import { debounce, randomSeed64 } from "./utils.js";
import { exportZip } from "./exportZip.js";

// UI
const langEl = document.getElementById("lang");
const seedEl = document.getElementById("seed");
const likesEl = document.getElementById("likes");
const viewEl = document.getElementById("view");

const tableBody = document.getElementById("songs-table");
const prevBtn = document.getElementById("prev-page");
const nextBtn = document.getElementById("next-page");
const pageBadge = document.getElementById("page-badge");

const galleryEl = document.getElementById("gallery");
const sentinelEl = document.getElementById("sentinel");

const tableWrap = document.querySelector(".table-wrap");
const paginationWrap = document.querySelector(".pagination");

const randomSeedBtn = document.getElementById("random-seed");
const exportZipBtn = document.getElementById("export-zip");

let isLoadingGallery = false;
let lastTableSongs = [];

async function loadTable() {
  const data = await fetchSongs({
    lang: langEl.value,
    seed: seedEl.value,
    likes: likesEl.value,
    page: state.page,
    pageSize: state.pageSize,
  });

  lastTableSongs = data.songs;

  renderTable(tableBody, data.songs);
  updatePaginationUI(prevBtn, pageBadge, state.page);
}

async function loadGalleryNext() {
  if (isLoadingGallery) return;
  isLoadingGallery = true;

  const data = await fetchSongs({
    lang: langEl.value,
    seed: seedEl.value,
    likes: likesEl.value,
    page: state.galleryPage,
    pageSize: state.pageSize,
  });

  appendGalleryBatch(galleryEl, data.songs, () => {});
  state.galleryPage += 1;
  isLoadingGallery = false;
}

function applyViewMode() {
  closeExpanded();

  if (state.viewMode === "table") {
    tableWrap.style.display = "";
    paginationWrap.style.display = "";
    galleryEl.style.display = "none";
    sentinelEl.style.display = "none";
    loadTable();
  } else {
    tableWrap.style.display = "none";
    paginationWrap.style.display = "none";
    galleryEl.style.display = "";
    sentinelEl.style.display = "";
    resetGallery(galleryEl);
    window.scrollTo({ top: 0, behavior: "smooth" });
    loadGalleryNext();
  }
}

function reload() {
  closeExpanded();
  if (state.viewMode === "table") {
    loadTable();
  } else {
    resetGallery(galleryEl);
    window.scrollTo({ top: 0, behavior: "smooth" });
    loadGalleryNext();
  }
}

const debouncedReload = debounce(reload, 250);

// events
viewEl.addEventListener("change", () => {
  state.viewMode = viewEl.value;
  state.page = 1;
  applyViewMode();
});

[langEl, seedEl, likesEl].forEach(el => {
  el.addEventListener("input", () => {
    state.page = 1;
    debouncedReload();
  });
});

prevBtn.addEventListener("click", () => {
  if (state.page > 1) {
    closeExpanded();
    state.page -= 1;
    loadTable();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

nextBtn.addEventListener("click", () => {
  closeExpanded();
  state.page += 1;
  loadTable();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

randomSeedBtn.addEventListener("click", () => {
  closeExpanded();
  seedEl.value = randomSeed64();
  state.page = 1;
  reload();
});

exportZipBtn.addEventListener("click", async () => {
  // export current table page (быстро и понятно)
  try {
    exportZipBtn.disabled = true;
    exportZipBtn.textContent = "Exporting...";
    await exportZip(lastTableSongs);
  } catch (e) {
    console.error(e);
    alert("Export failed (see console).");
  } finally {
    exportZipBtn.disabled = false;
    exportZipBtn.textContent = "Export ZIP";
  }
});

createGalleryObserver(sentinelEl, loadGalleryNext);

// init
applyViewMode();
