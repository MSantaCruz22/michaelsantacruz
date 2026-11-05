import { getToken, refreshAndStore } from "./instagram-lib.mjs";

// Runs weekly on Netlify. Refreshes the long-lived Instagram token and
// stores the new one in Netlify Blobs so the feed keeps working.
export default async () => {
  const token = await getToken();
  if (!token) {
    return new Response("Instagram token is not set yet.", { status: 200 });
  }
  const refreshed = await refreshAndStore(token);
  if (!refreshed) {
    return new Response("Token refresh did not complete. The current token was left in place.", {
      status: 200,
    });
  }
  return new Response("Instagram token refreshed.", { status: 200 });
};
