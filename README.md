# Michael Santa Cruz

Single-page site for Michael Santa Cruz. Netlify builds it from this repo with no extra setup.

## Edit content

All copy, links, shows, bands, lessons text, and the contact form live in [`content/site.mjs`](content/site.mjs).

- Confirmed details are already filled in: his Instagram, Flotilla, Jake Thistle, Lake House Recording Studios, and the tour note (`tours.label` / `tours.bases`, currently Available for tours, NYC / LA).
- The hero photo is `photo` in that file. The sized files live in `public/images/` (`michael-drumming-800.webp`, `1200.webp`, `1600.webp`, and a JPEG fallback).
- `placeholder: true`, `introIsPlaceholder`, and an empty `href` show a visible **Placeholder** state. They are not real credits, dates, or links.
- Shows: edit `performances.items`. Set `placeholder` to `false` when a row is real. `timing` is `Upcoming` or `Past`.
- Gallery captions and alt text are `gallery.items`. The photo credit is `gallery.credit`.
- Instagram buttons and the optional widget id are `instagram` in that same file. See below for the live feed.
- Other socials and email stay blank until you have a real URL. A mailto link works for email: `mailto:you@domain.com`.
- When the live domain exists, set `seo.siteUrl` (no trailing slash) so the canonical URL, share image, and sitemap use it.
- The contact heading and the main buttons both use `contact.label`.

## Local preview

```bash
npm run build
npm run preview
```

Open http://localhost:4173

`npm test` rebuilds the site and checks that the page, form, and confirmed links are present. If you intentionally change the tagline, the contact heading, or a confirmed link, update the matching line in `scripts/check.mjs`.

## Deploy

Connect the GitHub repo to Netlify. [`netlify.toml`](netlify.toml) sets the build command (`npm run build`) and the publish directory (`dist`).

The contact form is a [Netlify Form](https://docs.netlify.com/forms/setup/) named `contact`. After the first deploy, submissions show up in the site’s Forms dashboard. The form is in the built HTML, so Netlify detects it without a plugin.

Choosing **Private lessons** as the reason — or using the lessons button, which selects it — marks the note as a drum-lesson inquiry.

## Live Instagram feed

Instagram does not offer a public feed that a website can read on its own. Until a feed is connected, the page shows his photos in a scrolling strip. Each photo links to [instagram.com/mikeysantacruz](https://www.instagram.com/mikeysantacruz/). That is the fallback, not an error.

Two ways to turn on the real, auto-updating posts:

### Path A — quicker, a Behold or LightWidget feed

1. Open [behold.so](https://behold.so) or [lightwidget.com](https://lightwidget.com) and sign in with the Instagram account **@mikeysantacruz**.
2. Create a feed of the latest posts and copy the feed id (Behold) or widget id (LightWidget).
3. In `content/site.mjs`, find `instagram` and set one of these:
   - Behold: `provider: "behold"` and `feedId: "the-id-you-copied"`
   - LightWidget: `provider: "lightwidget"` and `feedId: "the-id-you-copied"`
   - Or set `feedId` to a full `https://` embed address and leave `provider` blank.
4. Commit and push. Netlify rebuilds the site. The buttons **Follow @mikeysantacruz** and **Message me on Instagram** stay either way.

### Path B — preferred, Instagram’s own API on Netlify

This needs the Instagram account to be a **Professional** account (Creator or Business). Personal accounts cannot use the API.

1. In the Instagram app, open Settings and activity, then Account type and tools, and switch to a professional account. Creator is enough.
2. Go to [developers.facebook.com](https://developers.facebook.com), create an app, and add **Instagram** → **Instagram API with Instagram login**.
3. Add the Instagram tester or connect @mikeysantacruz, then complete the login flow and generate a **long-lived access token**. Meta’s guide for that screen is [Instagram API with Instagram login](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/get-started).
4. In Netlify, open this site, then **Project configuration → Environment variables**. Add:
   - Key: `INSTAGRAM_ACCESS_TOKEN`
   - Value: the long-lived token
   - Scopes: the same value for builds and functions
5. Trigger a new deploy (**Deploys → Trigger deploy → Deploy site**).
6. The page calls `/.netlify/functions/instagram`, which reads the token, asks Instagram for the latest posts, and caches them for about 30 minutes. The strip then scrolls those posts instead of the photo fallback.

The token lasts about 60 days. A scheduled function, `instagram-refresh`, runs every Monday and asks Instagram for a fresh token. It stores that new token in Netlify Blobs, so you do not paste a new one each month as long as the first token was still valid when the refresh ran. If the feed ever goes blank, repeat steps 3–5 with a new token.

Leave `provider` and `feedId` empty when you use Path B. If both a widget and a token are set, the widget is what the page shows.

## Layout

- `content/site.mjs` — copy, links, gallery text, and the Instagram widget id
- `src/styles.css` — visual design
- `src/main.js` — lessons button, contact form, photo lightbox, and the scrolling feed
- `scripts/build.mjs` — writes the static site to `dist/`
- `netlify/functions/` — Instagram fetch and weekly token refresh
- `public/` — favicon, share image, fonts, and photos
