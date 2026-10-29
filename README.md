# Michael Santa Cruz

Single-page site for Michael Santa Cruz. Netlify builds it from this repo with no extra setup.

## Edit content

All copy, links, shows, bands, lessons text, and the contact form live in [`content/site.mjs`](content/site.mjs).

- Confirmed details are already filled in: his Instagram, Flotilla, Jake Thistle, and Lake House Recording Studios.
- `placeholder: true`, `introIsPlaceholder`, and an empty `href` show a visible **Placeholder** state. They are not real credits, dates, or links.
- Shows: edit `performances.items`. Set `placeholder` to `false` when a row is real. `timing` is `Upcoming` or `Past`.
- Instagram posts: put an image in `public/images/`, set `src` (for example `/images/post-1.jpg`) and `alt`, then set `placeholder` to `false`. Or paste an embed into `instagram.embedHtml` to replace the tiles.
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

## Layout

- `content/site.mjs` — the only file you need for copy and links
- `src/styles.css` — visual design
- `src/main.js` — lessons button and form behavior
- `scripts/build.mjs` — writes the static site to `dist/`
- `public/` — favicon, share image, fonts, and future images
