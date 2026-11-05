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

function icon(name) {
  const paths = {
    instagram:
      '<rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="3.6" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="17.2" cy="6.8" r="0.9" fill="currentColor"/>',
    message:
      '<path d="M5 6.5h14v9H8.5L5 18.5V6.5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
    spotify:
      '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 10.2c2.4-1 5.6-.8 8 .6M8.4 13c2-.7 4.6-.6 6.6.5M8.8 15.6c1.6-.5 3.4-.4 4.8.4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
    youtube:
      '<rect x="3.5" y="7" width="17" height="10" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M11 9.8v4.4l4-2.2-4-2.2z" fill="currentColor"/>',
    soundcloud:
      '<path d="M4 15.5h1.2v-2.2H4v2.2zm2.2 0h1.2V11H6.2v4.5zm2.2 0H9.6V9.2H8.4V15.5zm2.2 0h1.2V8H10.6v7.5z" fill="currentColor"/><path d="M13 15.5h6.2a2.4 2.4 0 0 0 .3-4.8 3.4 3.4 0 0 0-6.5 1.2" fill="none" stroke="currentColor" stroke-width="1.4"/>',
    email:
      '<rect x="3.5" y="6" width="17" height="12" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4 7.2 12 13l8-5.8" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  };
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || ""}</svg>`;
}

function renderSocials(data) {
  const items = [
    {
      label: "Instagram",
      href: data.instagram.url,
      icon: "instagram",
      me: true,
      text: data.instagram.followLabel,
    },
    {
      label: "Message",
      href: data.instagram.messageUrl,
      icon: "message",
      text: data.instagram.messageLabel,
    },
    ...data.links.map((link) => ({
      label: link.label,
      href: link.href,
      icon: link.label.toLowerCase().replace(/\s+/g, ""),
      text: link.label,
    })),
  ];
  return items
    .map((item) => {
      if (!item.href) {
        return `<li><span class="social is-placeholder">${icon(item.icon)}<span class="social-label">${esc(item.label)}</span><span class="tag">${esc(site.placeholderLabel)}</span></span></li>`;
      }
      const sr = /^https?:/i.test(item.href) ? " (opens in a new tab)" : "";
      return `<li><a class="social" href="${esc(item.href)}"${externalAttrs(item.href, { me: item.me })}>${icon(item.icon)}<span class="sr-only">${esc(item.text)}${sr}</span></a></li>`;
    })
    .join("");
}

function renderStage(data) {
  if (data.photo.videoUrl) {
    return `<div class="stage-screen"><iframe src="${esc(data.photo.videoUrl)}" title="Performance video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`;
  }
  return `<figure class="stage-screen hero-photo">
              <picture>
                <source type="image/webp" srcset="${esc(data.photo.srcset)}" sizes="${esc(data.photo.sizes)}">
                <img src="${esc(data.photo.fallback)}" alt="${esc(data.photo.alt)}" width="${data.photo.width}" height="${data.photo.height}" fetchpriority="high" decoding="async">
              </picture>
            </figure>`;
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
            <img src="${esc(photo.thumb)}" srcset="${esc(photo.srcset)}" sizes="(min-width: 800px) 320px, 70vw" alt="${esc(photo.alt)}" width="${photo.width}" height="${photo.height}" decoding="async"${focus}>
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
          <img src="${esc(photo.thumb)}" alt="${esc(photo.alt)}" width="${photo.width}" height="${photo.height}" decoding="async">
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
    <meta name="color-scheme" content="light">
    <meta name="theme-color" content="#ffffff">
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
    <link rel="mask-icon" href="/favicon.svg" color="#111111">
    <link rel="preload" href="/fonts/oswald-latin.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="/fonts/source-sans-3-latin.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" as="image" href="${esc(data.photo.src)}" imagesrcset="${esc(data.photo.srcset)}" imagesizes="${esc(data.photo.sizes)}" fetchpriority="high">
    <link rel="stylesheet" href="/styles.css?v=${assetHash.css}">
    <script type="application/ld+json">${jsonLd(data, pageUrl)}</script>
  </head>
  <body>
    <a class="skip" href="#content">Skip to content</a>
    <header class="site-header">
      <a class="wordmark" href="#content"><h1 id="hero-title">${esc(data.name)}</h1></a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
        <span class="sr-only">Menu</span>
        <span class="burger" aria-hidden="true"></span>
      </button>
      <nav class="nav" id="site-nav" aria-label="Sections">
        ${renderNav(data)}
      </nav>
    </header>
    <main id="content" tabindex="-1">
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-frame">
          ${renderStage(data)}
          <div class="hero-overlay">
            <p class="tagline">${esc(data.tagline)}</p>
            <p class="tours"><span class="tours-label">${esc(data.tours.label)}:</span> <span class="tours-bases">${esc(data.tours.bases)}</span></p>
            <div class="hero-ctas">
              <a class="pill" href="${esc(data.instagram.url)}"${externalAttrs(data.instagram.url, { me: true })}>Instagram<span class="sr-only"> (opens in a new tab)</span></a>
              <a class="pill" href="${esc(data.instagram.messageUrl)}"${externalAttrs(data.instagram.messageUrl)}>Message me<span class="sr-only"> (opens in a new tab)</span></a>
              <a class="pill" href="#contact">${esc(data.contact.label)}</a>
            </div>
          </div>
        </div>
        <p class="intro">${introBadge}<span>${esc(data.intro)}</span></p>
        <ul class="socials">${renderSocials(data)}</ul>
        <section id="lessons" class="lessons" aria-labelledby="lessons-heading">
          <h2 id="lessons-heading">${esc(data.lessons.line)}</h2>
          <a class="pill pill-line" href="#contact" data-reason="${esc(data.lessons.reason)}">${esc(data.contact.label)}${assist}</a>
        </section>
      </section>
      <div class="wrap stack">

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

        <section id="instagram" class="card ig-section" aria-labelledby="instagram-heading">
          <h2 id="instagram-heading">${esc(data.instagram.title)}</h2>
          <div class="ig-actions">
            <a class="btn" href="${esc(data.instagram.url)}"${externalAttrs(data.instagram.url, { me: true })}>${esc(data.instagram.followLabel)}<span class="sr-only"> (opens in a new tab)</span></a>
            <a class="btn btn-ghost" href="${esc(data.instagram.messageUrl)}"${externalAttrs(data.instagram.messageUrl)}>${esc(data.instagram.messageLabel)}<span class="sr-only"> (opens in a new tab)</span></a>
          </div>
          ${renderInstagramFeed(data.instagram, data.gallery)}
        </section>

        <section id="photos" class="photos" aria-labelledby="photos-heading">
          <div class="section-head">
            <h2 id="photos-heading">${esc(data.gallery.title)}</h2>
          </div>
          ${renderGallery(data.gallery)}
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
      <a class="footer-mark" href="#content">${esc(data.name)}</a>
      <div class="footer-rule"></div>
      <div class="footer-bar">
        <p class="footer-legal">© ${year} ${esc(data.name)}</p>
        <a class="to-top" href="#content">Back to top</a>
        <a class="footer-ig" href="${esc(data.instagram.url)}"${externalAttrs(data.instagram.url, { me: true })}>${icon("instagram")}<span class="sr-only">${esc(data.instagram.followLabel)} (opens in a new tab)</span></a>
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
