const GRAPH = "https://graph.instagram.com";
const MEDIA_FIELDS = "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp";
const MEDIA_TTL_MS = 30 * 60 * 1000;

async function blobs() {
  try {
    const { getStore } = await import("@netlify/blobs");
    return getStore("instagram");
  } catch {
    return null;
  }
}

async function readJson(key) {
  try {
    const store = await blobs();
    if (!store) return null;
    return await store.get(key, { type: "json" });
  } catch {
    return null;
  }
}

async function writeJson(key, value) {
  try {
    const store = await blobs();
    if (!store) return false;
    await store.setJSON(key, value);
    return true;
  } catch {
    return false;
  }
}

export async function getToken() {
  const saved = await readJson("token");
  if (saved?.token) return saved.token;
  return process.env.INSTAGRAM_ACCESS_TOKEN || "";
}

export async function refreshAndStore(current) {
  if (!current) return null;
  const url = new URL(`${GRAPH}/refresh_access_token`);
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", current);
  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) return null;
  const saved = await writeJson("token", {
    token: data.access_token,
    refreshedAt: new Date().toISOString(),
    expiresIn: data.expires_in || null,
  });
  return saved ? data.access_token : null;
}

function isAuthError(data) {
  const code = data?.error?.code;
  return code === 190 || code === 102 || code === 463 || code === 467;
}

function mapPost(item) {
  const image = item.media_type === "VIDEO" ? item.thumbnail_url || "" : item.media_url || "";
  if (!image || !item.permalink) return null;
  return {
    id: item.id,
    permalink: item.permalink,
    image,
    caption: String(item.caption || "").slice(0, 180),
    type: item.media_type || "IMAGE",
    timestamp: item.timestamp || "",
  };
}

async function fetchMedia(token) {
  const url = new URL(`${GRAPH}/me/media`);
  url.searchParams.set("fields", MEDIA_FIELDS);
  url.searchParams.set("limit", "12");
  url.searchParams.set("access_token", token);
  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, data };
}

export async function loadPosts() {
  const token = await getToken();
  if (!token) return { configured: false, posts: [] };

  const cached = await readJson("media");
  if (cached?.posts?.length && Date.now() - Date.parse(cached.savedAt || 0) < MEDIA_TTL_MS) {
    return { configured: true, posts: cached.posts };
  }

  let active = token;
  let result = await fetchMedia(active);
  if (!result.ok && isAuthError(result.data)) {
    const refreshed = await refreshAndStore(active);
    if (refreshed) {
      active = refreshed;
      result = await fetchMedia(active);
    }
  }
  if (!result.ok) return { configured: true, posts: [] };

  const posts = (result.data.data || []).map(mapPost).filter(Boolean);
  if (posts.length) {
    await writeJson("media", { savedAt: new Date().toISOString(), posts });
  }
  return { configured: true, posts };
}
