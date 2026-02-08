const API_URL = "/api/songs";

export async function fetchSongs({ lang, seed, likes, page, pageSize }) {
  const params = new URLSearchParams({
    lang,
    seed,
    likes: String(likes),
    page: String(page),
    pageSize: String(pageSize),
  });

  const res = await fetch(`${API_URL}?${params}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
