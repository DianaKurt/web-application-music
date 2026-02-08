import { escapeHtml } from "./utils.js";
import { state } from "./state.js";

export function resetGallery(galleryEl) {
  galleryEl.innerHTML = "";
  state.galleryPage = 1;
}

export function appendGalleryBatch(galleryEl, songs, onOpen) {
  const frag = document.createDocumentFragment();

  songs.forEach(song => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="cover">
        <img alt="cover" src="${song.coverUrl}" />
      </div>
      <div class="content">
        <p class="title">${escapeHtml(song.title)}</p>
        <p class="meta">${escapeHtml(song.artist)} · ${escapeHtml(song.album)}</p>
        <p class="meta">${escapeHtml(song.genre)} · ❤️ ${song.likes}</p>
      </div>
    `;

    card.addEventListener("click", () => onOpen(song));
    frag.appendChild(card);
  });

  galleryEl.appendChild(frag);
}

export function createGalleryObserver(sentinelEl, onHitBottom) {
  const observer = new IntersectionObserver((entries) => {
    if (state.viewMode !== "gallery") return;
    if (entries[0].isIntersecting) onHitBottom();
  });

  observer.observe(sentinelEl);
  return observer;
}
