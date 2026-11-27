import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { site } from "../content/site.mjs";
import { shop } from "../data/shop.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "dist", "index.html"), "utf8");
const text = html
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ");

let failed = false;
function must(condition, message) {
  if (!condition) {
    failed = true;
    console.error("FAIL:", message);
  }
}

const exact = {
  tagline: "Drummer \u00b7 Musician \u00b7 Producer \u00b7 Teacher",
  cta: "Contact Me / Let\u2019s Make Art",
  lessons: "Hit me up for private lessons",
  bandsTitle: "Bands & Studios",
  handle: "@mikeysantacruz",
  instagram: "https://www.instagram.com/mikeysantacruz/",
  message: "https://ig.me/m/mikeysantacruz",
  follow: "Follow @mikeysantacruz",
  messageLabel: "Message me on Instagram",
  credit: "Photos: Greg Thistle Photography",
  bands: [
    ["Flotilla \u2014 Drummer", "https://www.instagram.com/Flotilla_Band/", "@Flotilla_Band"],
    ["Jake Thistle \u2014 Drummer", "https://www.instagram.com/JakeThistleMusic/", "@JakeThistleMusic"],
    [
      "Lake House Recording Studios \u2014 House Drummer",
      "https://www.instagram.com/LakeHouseRecordingStudios/",
      "@LakeHouseRecordingStudios",
    ],
  ],
};

must(site.tagline === exact.tagline, "tagline drifted from the requested wording");
must(site.contact.label === exact.cta, "contact label drifted from the requested wording");
must(site.lessons.line === exact.lessons, "lessons line drifted from the requested wording");
must(site.bands.title === exact.bandsTitle, "bands title drifted");
must(site.instagram.handle === exact.handle, "Instagram handle drifted");
must(site.instagram.url === exact.instagram, "Instagram URL drifted");
must(site.instagram.messageUrl === exact.message, "Instagram message URL drifted");
must(site.instagram.followLabel === exact.follow, "Follow button drifted");
must(site.instagram.messageLabel === exact.messageLabel, "Message button drifted");
must(site.gallery.credit === exact.credit, "photo credit drifted");

must(text.includes(exact.tagline), "tagline missing from the page");
must(text.includes(exact.cta), "contact wording missing from the page");
must(text.includes(exact.lessons), "lessons line missing from the page");
must(site.tours.label === "Available for tours", "tours label drifted");
must(site.tours.bases === "NYC / LA", "tour bases drifted");
must(text.includes("Available for tours"), "tours note missing");
must(text.includes("NYC / LA"), "tour bases missing from the page");
must(html.includes(site.photo.alt), "photo alt missing");
must(html.includes("michael-drumming-1600.webp"), "large photo missing");
must(html.includes('type="image/webp"'), "webp source missing");
must(text.includes(site.name), "name missing");
must(html.includes("<h1"), "missing h1");
must((html.match(/<h1[\s>]/g) || []).length === 1, "expected a single h1");
must(html.includes('data-netlify="true"'), "Netlify form attribute missing");
must(html.includes('name="contact"'), "form name missing");
must(html.includes('name="form-name"'), "form-name field missing");
must(html.includes('name="bot-field"'), "honeypot missing");
must(html.includes('name="description"'), "meta description missing");
must(html.includes('property="og:title"'), "Open Graph title missing");
must(html.includes('property="og:description"'), "Open Graph description missing");
must(html.includes('property="og:image"'), "Open Graph image missing");
must(html.includes('rel="icon"'), "favicon missing");
must(html.includes('href="#contact"'), "contact jump missing");
must(html.includes(`data-reason="${site.lessons.reason}"`), "lessons button does not preselect the reason");
must(html.includes(">Private lessons<"), "lessons option missing");
must(fs.existsSync(path.join(root, "dist", "og.png")), "og.png was not copied into dist");
must(fs.existsSync(path.join(root, "dist", "favicon.svg")), "favicon missing from dist");
must(!/href=""/.test(html), "empty href");
must(!/href="#"(?![\w-])/.test(html), "bare hash href");
must(!/lorem|ipsum|grammy|testimonial/i.test(text), "unexpected invented copy");
must((html.match(/class="tag"/g) || []).length >= 5, "expected visible placeholder badges");

for (const [label, href, handle] of exact.bands) {
  must(site.bands.items.some((item) => item.label === label && item.href === href && item.handle === handle), `${label} missing from content`);
  must(text.includes(label), `${label} missing from page text`);
  must(html.includes(`href="${href}"`), `${href} missing`);
  must(text.includes(handle), `${handle} missing`);
}

must(text.includes(exact.follow), "Follow button missing");
must(text.includes(exact.messageLabel), "Message button missing");
must(html.includes(exact.message), "message link missing");
must(text.includes(exact.credit), "photo credit missing");
must(site.gallery.title === "Photography", "photography title drifted");
must(html.includes('href="#photography"'), "photography nav link missing");
must(html.includes('id="photography"'), "photography section missing");
must(html.includes("blue swirl-pattern drum kit"), "street kit alt missing");
must(html.includes("netlify/functions/instagram") || html.includes("/.netlify/functions/instagram"), "instagram function url missing");
must((html.match(/rel="me noopener noreferrer"/g) || []).length >= 1, "personal Instagram should use rel=me");

function escText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const emoji = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;
const shopHome = "https://msc-wfr-shop.fourthwall.com";
must(shop.products.length === 4, "expected 4 shop products");
must(shop.baseUrl === shopHome, "shop baseUrl is not the confirmed Fourthwall home");
must(shop.buyLabel === "Shop Now", "shop button label should be Shop Now");
must(shop.products.every((product) => product.url === ""), "product url must stay empty until Fourthwall has the item");
must(!/\/products\//.test(JSON.stringify(shop)), "do not guess Fourthwall product paths");
must(html.includes(`href="${shopHome}"`), "homepage shop link missing");
must(html.includes("Shop Now"), "homepage Shop Now missing");
must(!html.includes(`${shopHome}/`), "homepage shop link must be the home page only");
must(html.includes('id="shop"'), "shop section missing");
must(html.includes('href="#shop"'), "shop nav link missing");
must(text.includes(shop.sectionTitle), "shop title missing");
must(!emoji.test(JSON.stringify(shop)), "emoji in shop catalog");
must(!emoji.test(html), "emoji in homepage");
for (const product of shop.products) {
  const pagePath = path.join(root, "dist", "shop", `${product.slug}.html`);
  must(fs.existsSync(pagePath), `${product.slug} page missing`);
  const page = fs.readFileSync(pagePath, "utf8");
  must(page.includes(`<h1>${escText(product.title)}</h1>`), `${product.slug} title missing`);
  must(page.includes(`<title>${escText(product.metaTitle)}</title>`), `${product.slug} meta title missing`);
  must(page.includes(escText(product.metaDescription)), `${product.slug} meta description missing`);
  must(page.includes(product.price), `${product.slug} price missing`);
  for (const paragraph of product.description) {
    must(page.includes(escText(paragraph)), `${product.slug} description missing`);
  }
  for (const spec of product.specs) {
    must(page.includes(escText(spec.value)), `${product.slug} spec missing: ${spec.label}`);
  }
  for (const color of product.colors) {
    must(page.includes(color.name), `${product.slug} color missing: ${color.name}`);
  }
  for (const size of product.sizes) {
    must(page.includes(`>${size}<`), `${product.slug} size missing: ${size}`);
  }
  must(page.includes(`href="${shopHome}"`), `${product.slug} shop link missing`);
  must(page.includes('target="_blank"'), `${product.slug} shop link should open a new tab`);
  must(page.includes('rel="noopener'), `${product.slug} shop link needs rel=noopener`);
  must(page.includes("Shop Now"), `${product.slug} Shop Now button missing`);
  must(!page.includes("Coming Soon"), `${product.slug} still says Coming Soon`);
  must(!page.includes(`${shopHome}/`), `${product.slug} shop link must be the home page only`);
  must(page.includes("data-art-white") && page.includes("data-art-black"), `${product.slug} ink variants missing`);
  must(page.includes('href="/#shop"'), `${product.slug} back to shop missing`);
  must(page.includes('href="/"'), `${product.slug} back home missing`);
  must(html.includes(`/shop/${product.slug}.html`), `${product.slug} card link missing`);
  must(html.includes(product.price), `${product.slug} price missing on homepage`);
  must(!emoji.test(page), `emoji on ${product.slug} page`);
  must(!/href=""/.test(page), `empty href on ${product.slug}`);
}

if (failed) process.exit(1);
console.log("content checks passed");
