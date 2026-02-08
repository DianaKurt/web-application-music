export function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function formatParagraphs(text) {
  if (!text) return "<p class='cell-muted'>No review yet.</p>";

  const safe = escapeHtml(text);
  const parts = safe.split(/\n+/g).filter(Boolean);

  if (parts.length <= 1) return `<p>${safe}</p>`;
  return parts.map(p => `<p>${p}</p>`).join("");
}
// 64-bit
export function randomSeed64() {
  // 64-bit str in Number limit
  if (window.crypto?.getRandomValues) {
    const buf = new Uint32Array(2);
    window.crypto.getRandomValues(buf);
    // 2*32bit in 16-str
    return (
      buf[0].toString(16).padStart(8, "0") +
      buf[1].toString(16).padStart(8, "0")
    );
  }

  // fallback without crypto 
  const a = Math.floor(Math.random() * 2 ** 32) >>> 0;
  const b = Math.floor(Math.random() * 2 ** 32) >>> 0;
  return a.toString(16).padStart(8, "0") + b.toString(16).padStart(8, "0");

}
export function debounce(fn, ms = 250) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

