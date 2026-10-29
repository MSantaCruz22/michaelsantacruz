import { createHash } from "node:crypto";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { site } from "../content/site.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function assertSite(data) {
  const reasons = new Set(data.contact.reasons.map((item) => item.value));
  if (!reasons.has(data.lessons.reason)) {
    throw new Error("lessons.reason must match a contact.reasons value");
  }
  if (!reasons.has(data.contact.defaultReason)) {
    throw new Error("contact.defaultReason must match a contact.reasons value");
  }
  if (!data.contact.label || !data.lessons.line || !data.name) {
    throw new Error("name, lessons line, and contact label are required");
  }
  for (const photo of data.gallery.items) {
    if (!photo.alt || !photo.large || !photo.thumb) {
      throw new Error("Each gallery photo needs alt, thumb, and large");
    }
  }
}

function splitName(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return { first: name.trim(), last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

function slug(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function externalAttrs(href, { me = false } = {}) {
  if (!/^https?:/i.test(href)) return "";
  const rel = me ? "me noopener noreferrer" : "noopener noreferrer";
  return ` target="_blank" rel="${rel}"`;
}

function renderNav(data) {
  return data.nav
    .map((item) => {
      const reason =
        item.href === "#contact"
          ? ` data-reason="${esc(data.contact.defaultReason)}"`
          : "";
      return `<a href="${esc(item.href)}"${reason}>${esc(item.label)}</a>`;
    })
    .join("\n          ");
}

function renderChip(link, { me = false } = {}) {
  if (!link.href) {
    return `<li><span class="chip is-placeholder"><span class="tag">${esc(site.placeholderLabel)}</span><span>${esc(link.label)}</span></span></li>`;
  }
  const handle = link.handle
    ? `<span class="chip-handle">${esc(link.handle)}</span>`
    : "";
  const sr = /^https?:/i.test(link.href)
    ? `<span class="sr-only"> (opens in a new tab)</span>`
    : "";
  return `<li><a class="chip" href="${esc(link.href)}"${externalAttrs(link.href, { me })}>${esc(link.label)}${handle}${sr}</a></li>`;
}

function renderShows(block) {
  if (!block.items.length) {
    return `<p class="fine">${esc(block.empty)}</p>`;
  }
  const items = block.items
    .map((show) => {
      const badges = [
        show.placeholder ? `<span class="tag">${esc(site.placeholderLabel)}</span>` : "",
        show.timing ? `<span class="timing">${esc(show.timing)}</span>` : "",
      ]
        .filter(Boolean)
        .join("");
      const title = show.href
        ? `<a href="${esc(show.href)}"${externalAttrs(show.href)}>${esc(show.title)}<span class="sr-only"> (opens in a new tab)</span></a>`
        : esc(show.title);
      return `<li class="show is-${slug(show.timing)}">
            <p class="show-kicker">${badges}</p>
            <h3>${title}</h3>
            <p class="show-meta">${esc(show.date)} · ${esc(show.venue)}</p>
          </li>`;
    })
    .join("\n          ");
  return `<ul class="shows">${items}</ul>`;
}

function renderGallery(gallery) {
  const cards = gallery.items
    .map((photo, index) => {
      const featured = photo.featured ? " is-featured" : "";
      const focus = photo.focus ? ` style="object-position:${esc(photo.focus)}"` : "";
      return `<li class="photo-card${featured}">
          <button type="button" class="photo-open" data-index="${index}" data-full="${esc(photo.large)}" data-alt="${esc(photo.alt)}">
            <img src="${esc(photo.thumb)}" srcset="${esc(photo.srcset)}" sizes="(min-width: 800px) 320px, 70vw" alt="${esc(photo.alt)}" width="${photo.width}" height="${photo.height}" loading="lazy" decoding="async"${focus}>
          </button>
          ${photo.caption ? `<p class="photo-caption">${esc(photo.caption)}</p>` : ""}
        </li>`;
    })
    .join("");
  return `<ul class="photo-strip">${cards}</ul><p class="photo-credit">${esc(gallery.credit)}</p>`;
}

function fallbackSlides(ig, gallery) {
  return gallery.items
    .map((photo) => {
      return `<a class="ig-card" href="${esc(ig.url)}"${externalAttrs(ig.url, { me: true })}>
          <img src="${esc(photo.thumb)}" alt="${esc(photo.alt)}" width="${photo.width}" height="${photo.height}" loading="lazy" decoding="async">
        </a>`;
    })
    .join("");
}

function renderInstagramFeed(ig, gallery) {
  const provider = (ig.provider || "").trim().toLowerCase();
  const feedId = (ig.feedId || "").trim();
  if (provider === "lightwidget" && feedId && !feedId.includes("/") && !feedId.includes(" ")) {
    return `<iframe class="ig-frame" title="Instagram posts from ${esc(ig.handle)}" src="https://cdn.lightwidget.com/widgets/${encodeURIComponent(feedId)}.html" loading="lazy"></iframe>`;
  }
  if (provider === "behold" && feedId && !feedId.includes(" ")) {
    return `<div class="ig-behold"><figure data-behold-id="${esc(feedId)}"></figure></div>
      <script type="module" src="https://w.behold.so/widget.js"></script>`;
  }
  if (/^https:\/\//i.test(feedId)) {
    return `<iframe class="ig-frame" title="Instagram posts from ${esc(ig.handle)}" src="${esc(feedId)}" loading="lazy"></iframe>`;
  }
  const slides = fallbackSlides(ig, gallery);
  return `<div class="ig-live" data-ig-live data-profile="${esc(ig.url)}" data-endpoint="/.netlify/functions/instagram">
      <div class="ig-toolbar">
        <button type="button" class="ig-pause" data-ig-pause aria-pressed="false">Pause</button>
      </div>
      <div class="ig-scroller" data-ig-scroller tabindex="0" aria-label="Instagram photos">
        <div class="ig-track" data-ig-track>
          <div class="ig-set">${slides}</div>
          <div class="ig-set" aria-hidden="true">${slides}</div>
        </div>
      </div>
      <p class="fine" data-ig-note>${esc(ig.fallbackNote)}</p>
    </div>`;
}

function renderBands(block) {
  return block.items
    .map((band) => {
      return `<li>
          <a class="band-card" href="${esc(band.href)}"${externalAttrs(band.href)}>
            <span class="band-label">${esc(band.label)}</span>
            <span class="band-handle">${esc(band.handle)}</span>
            <svg class="ext" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M7 17 17 7M9 7h8v8"/>
            </svg>
            <span class="sr-only"> (opens in a new tab)</span>
          </a>
        </li>`;
    })
    .join("\n        ");
}

function contactHeading(label) {
  const parts = label.split(" / ");
  if (parts.length !== 2) return esc(label);
  return `<span class="contact-line">${esc(parts[0])} /</span> <span class="contact-line">${esc(parts[1])}</span>`;
}

function jsonLd(data, pageUrl) {
  const payload = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: data.name,
    jobTitle: data.tagline.split(" · ").map((part) => part.trim()),
    description: data.seo.description,
    sameAs: [data.instagram.url],
    image: pageUrl ? `${pageUrl}${data.photo.src}` : data.photo.src,
  };
  if (pageUrl) payload.url = pageUrl;
  return JSON.stringify(payload).replaceAll("<", "\\u003c");
}

function renderPage(data, assetHash) {
  const name = splitName(data.name);
  const pageUrl = data.seo.siteUrl.replace(/\/$/, "");
  const image = pageUrl ? `${pageUrl}${data.seo.ogImage}` : data.seo.ogImage;
  const canonical = pageUrl ? `\n    <link rel="canonical" href="${esc(pageUrl)}">` : "";
  const ogUrl = pageUrl ? `\n    <meta property="og:url" content="${esc(pageUrl)}">` : "";
  const year = new Date().getFullYear();
  const reasonOptions = data.contact.reasons
    .map((item) => {
      const selected = item.value === data.contact.defaultReason ? " selected" : "";
      return `<option value="${esc(item.value)}"${selected}>${esc(item.label)}</option>`;
    })
    .join("");
  const introBadge = data.introIsPlaceholder
    ? `<span class="tag">${esc(data.placeholderLabel)}</span>`
    : "";
  const assist = data.lessons.buttonAssist
    ? `<span class="sr-only"> ${esc(data.lessons.buttonAssist)}</span>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="dark">
    <meta name="theme-color" content="#1a120c">
    <meta name="format-detection" content="telephone=no">
    <title>${esc(data.seo.title)}</title>
    <meta name="description" content="${esc(data.seo.description)}">
    <meta name="author" content="${esc(data.name)}">${canonical}
    <meta property="og:type" content="website">
    <meta property="og:title" content="${esc(data.seo.title)}">${ogUrl}
    <meta property="og:description" content="${esc(data.seo.description)}">
    <meta property="og:image" content="${esc(image)}">
    <meta property="og:image:alt" content="${esc(data.photo.alt)}">
    <meta property="og:locale" content="en_US">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(data.seo.title)}">
    <meta name="twitter:description" content="${esc(data.seo.description)}">
    <meta name="twitter:image" content="${esc(image)}">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="mask-icon" href="/favicon.svg" color="#e2a322">
    <link rel="preload" href="/fonts/fraunces-latin.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="/fonts/nunito-sans-latin.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" as="image" href="${esc(data.photo.src)}" imagesrcset="${esc(data.photo.srcset)}" imagesizes="${esc(data.photo.sizes)}" fetchpriority="high">
    <link rel="stylesheet" href="/styles.css?v=${assetHash.css}">
    <script type="application/ld+json">${jsonLd(data, pageUrl)}</script>
  </head>
  <body>
    <div class="grove" aria-hidden="true">
      <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <path fill="#3e6b4a" d="M-80 560c90-140 200-90 290-160 100-78 30-190 150-230 120-40 190 50 300 24 100-24 130-130 240-96 90 28 50 150 150 196 110 50 170-30 250 48 36 36 8 130-36 190-56 78 0 160 30 250H-80Z"/>
        <path fill="#c4542a" opacity="0.85" d="M1040-60c130 50 190 160 150 250-36 84-140 78-176 156-40 84 16 168-48 230-78 76-200 36-280 100-70 56-30 150-120 176 210 10 470-90 560-250 64-110 20-300-120-380-36-20-60-70 34-282Z"/>
        <path fill="#e2a322" opacity="0.55" d="M40 60c100 16 80 120 150 164 58 36 140 8 176 78 22 48-28 96-12 148 36 16 20 90-40 112-70 26-130-16-190 18-72 40-36 130-120 140-90 12-150-90-120-180 28-80-40-150-8-230 28-70-8-140 164-250Z"/>
      </svg>
    </div>
    <div class="grain" aria-hidden="true"></div>
    <a class="skip" href="#content">Skip to content</a>
    <header class="site-header">
      <div class="wrap header-inner">
        <a class="brand" href="#content">${esc(data.name)}</a>
        <nav class="nav" aria-label="Sections">
          ${renderNav(data)}
        </nav>
      </div>
    </header>
    <main id="content" tabindex="-1">
      <div class="wrap stack">
        <section class="hero" aria-labelledby="hero-title">
          <div class="hero-copy">
            <h1 id="hero-title">
              <span class="name-first">${esc(name.first)}</span>${
                name.last ? `\n              <span class="name-last">${esc(name.last)}</span>` : ""
              }
            </h1>
            <p class="tagline">${esc(data.tagline)}</p>
            <div class="accent-rule" aria-hidden="true"></div>
            <p class="tours">
              <svg class="mushroom" viewBox="0 0 64 64" aria-hidden="true">
                <path fill="#f6efe2" d="M30 36c-1.2 8-1.4 16-1.2 22h6.2c.2-6-.2-14-1.4-22z"/>
                <ellipse cx="32" cy="28" rx="22" ry="13" fill="#c4542a"/>
                <ellipse cx="22" cy="26" rx="4.2" ry="3" fill="#f6efe2"/>
                <ellipse cx="33" cy="22" rx="3" ry="2.3" fill="#e2a322"/>
                <ellipse cx="42" cy="28" rx="2.6" ry="2" fill="#f6efe2"/>
              </svg>
              <span class="tours-label">${esc(data.tours.label)}:</span>
              <span class="tours-bases">${esc(data.tours.bases)}</span>
            </p>
            <figure class="hero-photo">
              <picture>
                <source type="image/webp" srcset="${esc(data.photo.srcset)}" sizes="${esc(data.photo.sizes)}">
                <img
                  src="${esc(data.photo.fallback)}"
                  alt="${esc(data.photo.alt)}"
                  width="${data.photo.width}"
                  height="${data.photo.height}"
                  fetchpriority="high"
                  decoding="async"
                >
              </picture>
            </figure>
            <p class="intro">${introBadge}<span>${esc(data.intro)}</span></p>
            <ul class="chips">
              ${renderChip(
                { label: "Instagram", handle: data.instagram.handle, href: data.instagram.url },
                { me: true },
              )}
              ${data.links.map((link) => renderChip(link)).join("\n              ")}
            </ul>
          </div>
        </section>

        <section id="lessons" class="lessons" aria-labelledby="lessons-heading">
          <h2 id="lessons-heading">${esc(data.lessons.line)}</h2>
          <a class="btn" href="#contact" data-reason="${esc(data.lessons.reason)}">${esc(data.contact.label)}${assist}</a>
        </section>

        <section id="photos" class="photos" aria-labelledby="photos-heading">
          <div class="section-head">
            <h2 id="photos-heading">${esc(data.gallery.title)}</h2>
          </div>
          ${renderGallery(data.gallery)}
        </section>

        <section id="instagram" class="card ig-section" aria-labelledby="instagram-heading">
          <h2 id="instagram-heading">${esc(data.instagram.title)}</h2>
          <div class="ig-actions">
            <a class="btn" href="${esc(data.instagram.url)}"${externalAttrs(data.instagram.url, { me: true })}>${esc(data.instagram.followLabel)}<span class="sr-only"> (opens in a new tab)</span></a>
            <a class="btn btn-ghost" href="${esc(data.instagram.messageUrl)}"${externalAttrs(data.instagram.messageUrl)}>${esc(data.instagram.messageLabel)}<span class="sr-only"> (opens in a new tab)</span></a>
          </div>
          ${renderInstagramFeed(data.instagram, data.gallery)}
        </section>

        <section id="performances" class="card" aria-labelledby="performances-heading">
          <h2 id="performances-heading">${esc(data.performances.title)}</h2>
          <p class="fine">${esc(data.performances.note)}</p>
          ${renderShows(data.performances)}
        </section>

        <section id="bands" class="bands" aria-labelledby="bands-heading">
          <h2 id="bands-heading">${esc(data.bands.title)}</h2>
          <ul class="band-grid">
            ${renderBands(data.bands)}
          </ul>
        </section>

        <section id="contact" class="card contact-card" aria-labelledby="contact-heading">
          <h2 id="contact-heading">${contactHeading(data.contact.label)}</h2>
          <form
            id="contact-form"
            name="contact"
            method="POST"
            action="/"
            data-netlify="true"
            data-netlify-honeypot="bot-field"
            data-local-preview="${esc(data.contact.localPreview)}"
            data-send-error="${esc(data.contact.sendError)}"
            aria-labelledby="contact-heading"
          >
            <input type="hidden" name="form-name" value="contact">
            <p class="hp" aria-hidden="true">
              <label>Leave this field empty <input name="bot-field" tabindex="-1" autocomplete="off"></label>
            </p>
            <noscript><p class="fine">${esc(data.contact.noscript)}</p></noscript>
            <div class="form-grid">
              <div class="form-row">
                <label class="field">
                  <span>${esc(data.contact.fields.name)}</span>
                  <input id="name" name="name" type="text" autocomplete="name" required maxlength="120">
                </label>
                <label class="field">
                  <span>${esc(data.contact.fields.email)}</span>
                  <input id="email" name="email" type="email" autocomplete="email" required maxlength="200">
                </label>
              </div>
              <label class="field">
                <span>${esc(data.contact.fields.reason)}</span>
                <select id="reason" name="reason" data-lesson-value="${esc(data.lessons.reason)}">
                  ${reasonOptions}
                </select>
              </label>
              <p id="reason-note" class="reason-note" hidden>${esc(data.lessons.mention)}</p>
              <label class="field">
                <span>${esc(data.contact.fields.message)}</span>
                <textarea
                  id="message"
                  name="message"
                  required
                  maxlength="5000"
                  rows="5"
                  placeholder="${esc(data.contact.messagePlaceholder)}"
                  data-default-placeholder="${esc(data.contact.messagePlaceholder)}"
                  data-lesson-placeholder="${esc(data.contact.lessonMessagePlaceholder)}"
                ></textarea>
              </label>
              <div class="form-actions">
                <p class="error" data-error hidden role="alert"></p>
                <button class="btn" type="submit">${esc(data.contact.label)}</button>
              </div>
            </div>
          </form>
          <p class="success" data-success tabindex="-1" hidden role="status">${esc(data.contact.success)}</p>
        </section>
      </div>
    </main>
    <footer class="site-footer">
      <div class="wrap footer-inner">
        <p class="footer-name">${esc(data.name)}</p>
        <p class="footer-tag">${esc(data.tagline)}</p>
        <p class="footer-legal">© ${year}</p>
      </div>
    </footer>
    <dialog class="lightbox" id="lightbox" aria-label="Photo">
      <div class="lightbox-bar">
        <button type="button" class="btn btn-ghost" data-lightbox-prev>Previous</button>
        <button type="button" class="btn btn-ghost" data-lightbox-next>Next</button>
        <button type="button" class="btn" data-lightbox-close>Close</button>
      </div>
      <img class="lightbox-img" alt="" data-lightbox-img>
    </dialog>
    <script src="/main.js?v=${assetHash.js}"></script>
  </body>
</html>
`;
}

function hashFile(filePath) {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex").slice(0, 10);
}

assertSite(site);
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
cpSync(path.join(root, "public"), dist, { recursive: true });
cpSync(path.join(root, "src", "styles.css"), path.join(dist, "styles.css"));
cpSync(path.join(root, "src", "main.js"), path.join(dist, "main.js"));

const assetHash = {
  css: hashFile(path.join(dist, "styles.css")),
  js: hashFile(path.join(dist, "main.js")),
};

writeFileSync(path.join(dist, "index.html"), renderPage(site, assetHash));

const pageUrl = site.seo.siteUrl.replace(/\/$/, "");
const robots = pageUrl
  ? `User-agent: *\nAllow: /\nSitemap: ${pageUrl}/sitemap.xml\n`
  : "User-agent: *\nAllow: /\n";
writeFileSync(path.join(dist, "robots.txt"), robots);
if (pageUrl) {
  writeFileSync(
    path.join(dist, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${pageUrl}/</loc></url>\n</urlset>\n`,
  );
}

console.log("Built dist/index.html");
