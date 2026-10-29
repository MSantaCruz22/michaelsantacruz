/**
 * All editable site content.
 * Rebuild after changes: npm run build
 * Preview: npm run preview
 *
 * placeholder: true, introIsPlaceholder, and an empty href render a visible
 * "Placeholder" state. Swap in real copy when you have it.
 * Do not add credits, quotes, rates, or dates that are not confirmed.
 */

const contactLabel = "Contact Me / Let’s Make Art";

export const site = {
  name: "Michael Santa Cruz",
  tagline: "Drummer · Musician · Producer · Teacher",
  placeholderLabel: "Placeholder",

  // Short line under the name. Set introIsPlaceholder to false once this is real.
  intro: "A short intro line will go here.",
  introIsPlaceholder: true,

  seo: {
    title: "Michael Santa Cruz — Drummer, Musician, Producer, Teacher",
    description:
      "Personal site of Michael Santa Cruz — drummer, musician, producer, and teacher. Performances, bands, Instagram, and a way to get in touch.",
    // Live URL, no trailing slash. Leave "" until the domain exists.
    // Example: "https://michaelsantacruz.netlify.app"
    siteUrl: "",
    ogImage: "/og.png",
  },

  nav: [
    { label: "Lessons", href: "#lessons" },
    { label: "Performances", href: "#performances" },
    { label: "Instagram", href: "#instagram" },
    { label: "Bands", href: "#bands" },
    { label: "Contact", href: "#contact" },
  ],

  // Hero chips after Instagram (Instagram is added from the block below).
  // Leave href "" until you have a real URL — empty links stay placeholders.
  // Email example once you have one: { label: "Email", href: "mailto:you@example.com" }
  links: [
    { label: "Spotify", href: "" },
    { label: "YouTube", href: "" },
    { label: "SoundCloud", href: "" },
    { label: "Email", href: "" },
  ],

  lessons: {
    line: "Hit me up for private lessons",
    // Must match a contact.reasons value. The button scrolls to the form and selects it.
    reason: "Private lessons",
    mention: "This message is about private drum lessons.",
    buttonAssist: "about private lessons",
  },

  performances: {
    title: "Performances",
    note: "Placeholder listings — real dates and venues are not in yet.",
    empty: "No shows listed yet.",
    // timing: "Upcoming" or "Past". Set placeholder to false once the row is real.
    // href is an optional ticket or event link.
    items: [
      {
        placeholder: true,
        timing: "Upcoming",
        date: "Date placeholder",
        title: "Placeholder — upcoming show",
        venue: "Venue placeholder",
        href: "",
      },
      {
        placeholder: true,
        timing: "Past",
        date: "Date placeholder",
        title: "Placeholder — past show",
        venue: "Venue placeholder",
        href: "",
      },
    ],
  },

  instagram: {
    title: "Instagram",
    handle: "@MikeySantaCruz",
    url: "https://www.instagram.com/MikeySantaCruz/",
    followLabel: "Instagram",
    // Paste an embed snippet to replace the tiles, or leave "".
    embedHtml: "",
    // Drop a file in public/images and set src, for example "/images/post-1.jpg".
    // Set placeholder to false when src is a real post.
    posts: [
      { src: "", alt: "Instagram post placeholder", placeholder: true },
      { src: "", alt: "Instagram post placeholder", placeholder: true },
      { src: "", alt: "Instagram post placeholder", placeholder: true },
    ],
    feedNote: "Placeholder tiles — posts will show here.",
  },

  bands: {
    title: "Bands & Studios",
    items: [
      {
        label: "Flotilla — Drummer",
        handle: "@Flotilla_Band",
        href: "https://www.instagram.com/Flotilla_Band/",
      },
      {
        label: "Jake Thistle — Drummer",
        handle: "@JakeThistleMusic",
        href: "https://www.instagram.com/JakeThistleMusic/",
      },
      {
        label: "Lake House Recording Studios — House Drummer",
        handle: "@LakeHouseRecordingStudios",
        href: "https://www.instagram.com/LakeHouseRecordingStudios/",
      },
    ],
  },

  contact: {
    // Section heading and the main button label.
    label: contactLabel,
    success: "Thanks — your message was sent.",
    localPreview:
      "This preview can’t deliver the form. On Netlify, this same form posts to your Forms dashboard.",
    sendError: "Something went wrong sending that. Please try again.",
    messagePlaceholder: "Tell me what you have in mind.",
    lessonMessagePlaceholder: "Tell me about the drum lessons you want.",
    defaultReason: "General",
    reasons: [
      { value: "General", label: "General" },
      { value: "Private lessons", label: "Private lessons" },
      { value: "Booking", label: "Booking" },
    ],
    fields: {
      name: "Name",
      email: "Email",
      reason: "Reason",
      message: "Message",
    },
    noscript: "For drum lessons, choose “Private lessons” as the reason.",
  },
};
