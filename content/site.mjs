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

  // Shown in the hero. Edit the wording here.
  tours: {
    label: "Available for tours",
    bases: "NYC / LA",
  },

  // Hero photo. Swap the files in public/images/ if you replace the shot.
  photo: {
    alt: "Michael Santa Cruz playing drums on stage, wearing sunglasses and a leopard-print shirt",
    width: 1600,
    height: 1258,
    sizes: "(min-width: 880px) 38vw, calc(100vw - 2.4rem)",
    src: "/images/michael-drumming-1200.webp",
    srcset:
      "/images/michael-drumming-800.webp 800w, /images/michael-drumming-1200.webp 1200w, /images/michael-drumming-1600.webp 1600w",
    fallback: "/images/michael-drumming-1200.jpg",
  },

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
    { label: "Photos", href: "#photos" },
    { label: "Instagram", href: "#instagram" },
    { label: "Shows", href: "#performances" },
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

  gallery: {
    title: "Photos",
    credit: "Photos: Greg Thistle Photography",
    items: [
      {
        featured: true,
        caption: "Blue swirl kit on a city street",
        focus: "center 78%",
        alt: "A blue swirl-pattern drum kit and cases on a cart on a city street, with brick buildings and high-rises behind it",
        thumb: "/images/gallery-07-blue-kit-street-720.webp",
        large: "/images/gallery-07-blue-kit-street-1400.webp",
        srcset: "/images/gallery-07-blue-kit-street-720.webp 720w, /images/gallery-07-blue-kit-street-1400.webp 1400w",
        width: 1400,
        height: 2488,
      },
      {
        alt: "Michael Santa Cruz playing a drum kit outdoors in sunglasses and a red-and-blue striped shirt, against a concrete wall",
        thumb: "/images/gallery-01-outdoor-color-720.webp",
        large: "/images/gallery-01-outdoor-color-1400.webp",
        srcset: "/images/gallery-01-outdoor-color-720.webp 720w, /images/gallery-01-outdoor-color-1400.webp 1400w",
        width: 1400,
        height: 2100,
      },
      {
        alt: "Michael Santa Cruz laughing while playing drums on stage, in a dark ringer t-shirt with white lettering and a gold chain",
        thumb: "/images/gallery-03-laughing-color-720.webp",
        large: "/images/gallery-03-laughing-color-1400.webp",
        srcset: "/images/gallery-03-laughing-color-720.webp 720w, /images/gallery-03-laughing-color-1400.webp 1400w",
        width: 1400,
        height: 1750,
      },
      {
        alt: "Michael Santa Cruz smiling behind a cymbal on a blue-lit stage, wearing thick black glasses",
        thumb: "/images/gallery-05-blue-stage-720.webp",
        large: "/images/gallery-05-blue-stage-1400.webp",
        srcset: "/images/gallery-05-blue-stage-720.webp 720w, /images/gallery-05-blue-stage-1400.webp 1400w",
        width: 1400,
        height: 932,
      },
      {
        alt: "Black-and-white photo of Michael Santa Cruz playing an Istanbul cymbal with his eyes closed, in a black ringer t-shirt",
        thumb: "/images/gallery-02-cymbal-bw-720.webp",
        large: "/images/gallery-02-cymbal-bw-1400.webp",
        srcset: "/images/gallery-02-cymbal-bw-720.webp 720w, /images/gallery-02-cymbal-bw-1400.webp 1400w",
        width: 1400,
        height: 1750,
      },
      {
        alt: "Black-and-white photo of Michael Santa Cruz on stage in sunglasses, raising a fist above a cymbal",
        thumb: "/images/gallery-04-fist-bw-720.webp",
        large: "/images/gallery-04-fist-bw-1400.webp",
        srcset: "/images/gallery-04-fist-bw-720.webp 720w, /images/gallery-04-fist-bw-1400.webp 1400w",
        width: 1400,
        height: 1750,
      },
      {
        alt: "Black-and-white close portrait of Michael Santa Cruz smiling behind a drum kit, wearing thick glasses and a chain",
        thumb: "/images/gallery-06-portrait-bw-720.webp",
        large: "/images/gallery-06-portrait-bw-1400.webp",
        srcset: "/images/gallery-06-portrait-bw-720.webp 720w, /images/gallery-06-portrait-bw-1400.webp 1400w",
        width: 1400,
        height: 2100,
      },
    ],
  },

  instagram: {
    title: "Instagram",
    handle: "@mikeysantacruz",
    url: "https://www.instagram.com/mikeysantacruz/",
    messageUrl: "https://ig.me/m/mikeysantacruz",
    followLabel: "Follow @mikeysantacruz",
    messageLabel: "Message me on Instagram",
    fallbackNote: "These photos link to his Instagram until the live feed is connected.",
    // Live feed options. Leave both blank to use the Netlify function when
    // INSTAGRAM_ACCESS_TOKEN is set, or to keep the photo fallback.
    // provider: "behold" or "lightwidget"
    // feedId: a Behold feed id, a LightWidget id, or a full https embed URL
    provider: "",
    feedId: "",
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
