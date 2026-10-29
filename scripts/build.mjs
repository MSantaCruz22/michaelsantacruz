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
  for (const post of data.instagram.posts) {
    if (post.src && !post.alt) {
      throw new Error("Instagram posts with src need alt text");
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

function renderFeed(ig) {
  if (ig.embedHtml && ig.embedHtml.trim()) {
    return `<div class="ig-embed">${ig.embedHtml}</div>`;
  }
  if (!ig.posts.length) {
    return `<p class="fine">${esc(ig.feedNote)}</p>`;
  }
  const tiles = ig.posts
    .map((post) => {
      if (post.src && !post.placeholder) {
        return `<li class="ig-tile"><img src="${esc(post.src)}" alt="${esc(post.alt)}"></li>`;
      }
      return `<li class="ig-tile is-placeholder"><span class="tag">${esc(site.placeholderLabel)}</span></li>`;
    })
    .join("");
  return `<ul class="ig-grid">${tiles}</ul><p class="fine">${esc(ig.feedNote)}</p>`;
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
    <meta name="theme-color" content="#09090b">
    <meta name="format-detection" content="telephone=no">
    <title>${esc(data.seo.title)}</title>
    <meta name="description" content="${esc(data.seo.description)}">
    <meta name="author" content="${esc(data.name)}">${canonical}
    <meta property="og:type" content="website">
    <meta property="og:title" content="${esc(data.seo.title)}">${ogUrl}
    <meta property="og:description" content="${esc(data.seo.description)}">
    <meta property="og:image" content="${esc(image)}">
    <meta property="og:image:alt" content="${esc(data.name)}">
    <meta property="og:locale" content="en_US">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(data.seo.title)}">
    <meta name="twitter:description" content="${esc(data.seo.description)}">
    <meta name="twitter:image" content="${esc(image)}">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="mask-icon" href="/favicon.svg" color="#ff4c29">
    <link rel="preload" href="/fonts/bricolage-grotesque-latin.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="/fonts/outfit-latin.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="/styles.css?v=${assetHash.css}">
    <script type="application/ld+json">${jsonLd(data, pageUrl)}</script>
  </head>
  <body>
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
            <p class="intro">${introBadge}<span>${esc(data.intro)}</span></p>
            <ul class="chips">
              ${renderChip(
                { label: "Instagram", handle: data.instagram.handle, href: data.instagram.url },
                { me: true },
              )}
              ${data.links.map((link) => renderChip(link)).join("\n              ")}
            </ul>
          </div>
          <div class="mark-wrap" aria-hidden="true"><div class="mark"></div></div>
        </section>

        <section id="lessons" class="lessons" aria-labelledby="lessons-heading">
          <h2 id="lessons-heading">${esc(data.lessons.line)}</h2>
          <a class="btn" href="#contact" data-reason="${esc(data.lessons.reason)}">${esc(data.contact.label)}${assist}</a>
        </section>

        <div class="split">
          <section id="performances" class="card" aria-labelledby="performances-heading">
            <h2 id="performances-heading">${esc(data.performances.title)}</h2>
            <p class="fine">${esc(data.performances.note)}</p>
            ${renderShows(data.performances)}
          </section>
          <section id="instagram" class="card" aria-labelledby="instagram-heading">
            <h2 id="instagram-heading">${esc(data.instagram.title)}</h2>
            <a class="ig-follow" href="${esc(data.instagram.url)}"${externalAttrs(data.instagram.url, { me: true })}>
              <span class="ig-follow-handle">${esc(data.instagram.handle)}</span>
              <span class="ig-follow-label">${esc(data.instagram.followLabel)}
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                  <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M7 17 17 7M9 7h8v8"/>
                </svg>
              </span>
              <span class="sr-only"> (opens in a new tab)</span>
            </a>
            ${renderFeed(data.instagram)}
          </section>
        </div>

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
