import { loadPosts } from "./instagram-lib.mjs";

export default async () => {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "public, max-age=0, s-maxage=1800",
  };
  try {
    const result = await loadPosts();
    if (!result.configured) {
      return Response.json(
        { ok: false, configured: false, posts: [] },
        { headers: { ...headers, "cache-control": "no-store" } },
      );
    }
    if (!result.posts.length) {
      return Response.json(
        { ok: false, configured: true, posts: [] },
        { headers: { ...headers, "cache-control": "no-store" } },
      );
    }
    return Response.json(
      { ok: true, configured: true, source: "instagram", posts: result.posts },
      { headers },
    );
  } catch {
    return Response.json(
      { ok: false, configured: false, posts: [] },
      { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } },
    );
  }
};
