import { fetchSongs } from "./api.js";
import { state } from "./state.js";
import { renderTable, updatePaginationUI } from "./tableView.js";
import { resetGallery, appendGalleryBatch, createGalleryObserver } from "./galleryView.js";
import { openDetails, closeDetails } from "./detailsModal.js";
import { debounce, randomSeed64 } from "./utils.js";



// UI
const langEl = document.getElementById("lang");
const seedEl = document.getElementById("seed");
const likesEl = document.getElementById("likes");

const tableBody = document.getElementById("songs-table");
const prevBtn = document.getElementById("prev-page");
const nextBtn = document.getElementById("next-page");
const pageBadge = document.getElementById("page-badge");

const viewEl = document.getElementById("view");
const galleryEl = document.getElementById("gallery");
const sentinelEl = document.getElementById("sentinel");

const tableWrap = document.querySelector(".table-wrap");
const paginationWrap = document.querySelector(".pagination");
const randomSeedBtn = document.getElementById("random-seed");




let isLoadingGallery = false;

async function loadTable() {
  const data = await fetchSongs({
    lang: langEl.value,
    seed: seedEl.value,
    likes: likesEl.value,
    page: state.page,
    pageSize: state.pageSize,
  });

  renderTable(tableBody, data.songs, openDetails);
  updatePaginationUI(prevBtn, pageBadge);
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

  appendGalleryBatch(galleryEl, data.songs, openDetails);
  state.galleryPage += 1;
  isLoadingGallery = false;
}

function applyViewMode() {
  closeDetails(); 

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
  closeDetails();

  if (state.viewMode === "table") {
    loadTable();
  } else {
    resetGallery(galleryEl);
    window.scrollTo({ top: 0, behavior: "smooth" });
    loadGalleryNext();
  }
}
const debouncedReload = debounce(reload, 250)

// events
viewEl.addEventListener("change", () => {
  state.viewMode = viewEl.value;
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
    closeDetails();
    state.page -= 1;
    loadTable();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

nextBtn.addEventListener("click", () => {
  closeDetails();
  state.page += 1;
  loadTable();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

randomSeedBtn.addEventListener("click", () => {

  closeDetails();
//new seed
  seedEl.value = randomSeed64();
//reset
  state.page = 1;

  if (state.viewMode === "table") {
    loadTable();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    resetGallery(galleryEl);
    window.scrollTo({ top: 0, behavior: "smooth" });
    loadGalleryNext();
  }
});

createGalleryObserver(sentinelEl, loadGalleryNext);

// init
applyViewMode();
