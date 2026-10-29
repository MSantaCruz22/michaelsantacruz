const reason = document.querySelector("#reason");
const note = document.querySelector("#reason-note");
const message = document.querySelector("#message");
const form = document.querySelector("#contact-form");
const contact = document.querySelector("#contact");

function syncReason() {
  if (!reason) return;
  const lessonValue = reason.getAttribute("data-lesson-value");
  const isLesson = reason.value === lessonValue;
  contact?.classList.toggle("is-lessons", isLesson);
  if (note) note.hidden = !isLesson;
  if (!message) return;
  const next = isLesson
    ? message.getAttribute("data-lesson-placeholder")
    : message.getAttribute("data-default-placeholder");
  if (next) message.placeholder = next;
}

document.querySelectorAll("[data-reason]").forEach((el) => {
  el.addEventListener("click", () => {
    if (!reason) return;
    const value = el.getAttribute("data-reason");
    if (!value) return;
    const option = [...reason.options].some((item) => item.value === value);
    if (!option) return;
    reason.value = value;
    syncReason();
  });
});

reason?.addEventListener("change", syncReason);
syncReason();

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submit = form.querySelector("[type='submit']");
  const error = form.querySelector("[data-error]");
  const success = document.querySelector("[data-success]");
  if (submit) submit.disabled = true;
  if (error) error.hidden = true;

  const body = new URLSearchParams(new FormData(form)).toString();
  try {
    const response = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!response.ok) throw new Error("Request failed");
    form.hidden = true;
    if (success) {
      success.hidden = false;
      success.focus();
    }
  } catch {
    const local =
      location.hostname === "localhost" || location.hostname === "127.0.0.1";
    if (error) {
      error.textContent = local
        ? form.getAttribute("data-local-preview")
        : form.getAttribute("data-send-error");
      error.hidden = false;
    }
    if (submit) submit.disabled = false;
  }
});

const lightbox = document.querySelector("#lightbox");
const lightboxImg = document.querySelector("[data-lightbox-img]");
const photoButtons = [...document.querySelectorAll(".photo-open")];
let photoIndex = 0;

function showPhoto(index) {
  if (!lightbox || !lightboxImg || !photoButtons.length) return;
  photoIndex = (index + photoButtons.length) % photoButtons.length;
  const button = photoButtons[photoIndex];
  lightboxImg.src = button.getAttribute("data-full");
  lightboxImg.alt = button.getAttribute("data-alt") || "";
  if (!lightbox.open) lightbox.showModal();
}

photoButtons.forEach((button, index) => {
  button.addEventListener("click", () => showPhoto(index));
});

document.querySelector("[data-lightbox-close]")?.addEventListener("click", () => lightbox?.close());
document.querySelector("[data-lightbox-prev]")?.addEventListener("click", () => showPhoto(photoIndex - 1));
document.querySelector("[data-lightbox-next]")?.addEventListener("click", () => showPhoto(photoIndex + 1));
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});

const live = document.querySelector("[data-ig-live]");
const scroller = document.querySelector("[data-ig-scroller]");
const track = document.querySelector("[data-ig-track]");
const pauseButton = document.querySelector("[data-ig-pause]");
const feedNote = document.querySelector("[data-ig-note]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let feedPaused = reduceMotion;

function escHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderPosts(posts) {
  if (!track || !posts?.length) return;
  const html = posts
    .filter((post) => /^https:\/\//i.test(post.permalink || "") && /^https:\/\//i.test(post.image || ""))
    .map((post) => {
      const caption = post.caption ? ` — ${escHtml(post.caption)}` : "";
      return `<a class="ig-card" href="${escHtml(post.permalink)}" target="_blank" rel="noopener noreferrer"><img src="${escHtml(post.image)}" alt="Instagram post${caption}"></a>`;
    })
    .join("");
  if (!html) return;
  track.innerHTML = `<div class="ig-set">${html}</div><div class="ig-set" aria-hidden="true">${html}</div>`;
  if (feedNote) feedNote.hidden = true;
}

if (live && track) {
  fetch(live.getAttribute("data-endpoint") || "/.netlify/functions/instagram")
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      if (data?.ok && data.posts?.length) renderPosts(data.posts);
    })
    .catch(() => {});
}

if (pauseButton) {
  if (reduceMotion) pauseButton.hidden = true;
  pauseButton.addEventListener("click", () => {
    feedPaused = !feedPaused;
    pauseButton.setAttribute("aria-pressed", String(feedPaused));
    pauseButton.textContent = feedPaused ? "Play" : "Pause";
  });
}

if (scroller && track && !reduceMotion) {
  let last = 0;
  const step = (now) => {
    if (!feedPaused && !document.hidden && now - last > 16) {
      last = now;
      scroller.scrollLeft += 0.55;
      const half = track.scrollWidth / 2;
      if (half > 0 && scroller.scrollLeft >= half) scroller.scrollLeft -= half;
    }
    requestAnimationFrame(step);
  };
  scroller.addEventListener("mouseenter", () => {
    feedPaused = true;
  });
  scroller.addEventListener("mouseleave", () => {
    if (pauseButton?.getAttribute("aria-pressed") !== "true") feedPaused = false;
  });
  scroller.addEventListener("focusin", () => {
    feedPaused = true;
  });
  scroller.addEventListener("focusout", () => {
    if (pauseButton?.getAttribute("aria-pressed") !== "true") feedPaused = false;
  });
  requestAnimationFrame(step);
}
