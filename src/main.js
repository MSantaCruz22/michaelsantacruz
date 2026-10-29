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
