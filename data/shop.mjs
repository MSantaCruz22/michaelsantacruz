/**
 * Merch catalog. Edit this file, then run npm run build.
 *
 * baseUrl
 *   Shop subdomain, no trailing slash. Leave "" until Michael copies the
 *   real address from the Fourthwall dashboard. Do not guess it.
 * product.url
 *   Full Fourthwall product URL. When this is an https link, the button
 *   label switches to buyLabel and opens that product.
 * product.path
 *   Appended to baseUrl while url is still empty.
 * art.black / art.white
 *   Web PNGs in public/shop/. Black ink on light garments, white ink on dark.
 * color.ink
 *   "black" or "white": which file to show on that colorway.
 */

export const shop = {
  baseUrl: "",
  comingSoonLabel: "Coming Soon",
  buyLabel: "Shop",
  soonNote: "The shop is not open yet.",
  sectionTitle: "Shop",
  sectionNote: "Launch Line",
  viewLabel: "View",
  backShop: "Back to Shop",
  backHome: "Back to Home",
  sizeLabel: "Size",
  colorLabel: "Color",
  products: [
    {
      slug: "signature-drummer-tee",
      title: "Signature Drummer Tee",
      note: "A heavyweight cotton tee cut for the long haul — rehearsal, load-in, and the walk home after the set.",
      description: [
        "A heavyweight cotton tee cut for the long haul — rehearsal, load-in, and the walk home after the set. The front carries a clean Santa Cruz mark. Nothing loud. Just the work.",
        "Printed on demand. Ships when you order it.",
      ],
      price: "$34.00",
      metaTitle: "Signature Drummer Tee | Michael Santa Cruz",
      metaDescription:
        "Heavyweight unisex cotton tee with a clean Santa Cruz mark. Black or vintage charcoal, sizes S–2XL. Official merch from drummer Michael Santa Cruz.",
      imageAlt: "Santa Cruz wordmark with three lines above the name",
      art: {
        black: "/shop/santa-cruz-minimal-mark.png",
        white: "/shop/santa-cruz-minimal-mark-white-ink.png",
      },
      path: "",
      url: "",
      sizes: ["S", "M", "L", "XL", "2XL"],
      colors: [
        { name: "Black", hex: "#141414", ink: "white" },
        { name: "Vintage Charcoal", hex: "#3f3d3b", ink: "white" },
      ],
      specs: [
        { label: "Product type", value: "Heavyweight unisex cotton tee" },
        {
          label: "Fabric",
          value:
            "100% garment-dyed cotton (heather or charcoal blends may include polyester; confirm on the blank)",
        },
        {
          label: "Weight",
          value:
            "heavyweight (Comfort Colors 1717 is typically about 6.1 oz; Cotton Heritage heavyweight is listed at 6.5 oz)",
        },
        { label: "Fit", value: "unisex, relaxed" },
        { label: "Print method", value: "direct-to-garment (DTG)" },
        { label: "Print placement", value: "front chest, centered" },
        {
          label: "Care",
          value: "machine wash cold, inside out; tumble dry low; do not iron the print",
        },
      ],
    },
    {
      slug: "nyc-la-tour-hoodie",
      title: "NYC \u2194 LA Tour Hoodie",
      note: "Built for the split life.",
      description: [
        "Built for the split life. Midweight fleece with a quiet NYC\u2013LA graphic \u2014 made for the flight, the van, and the late session.",
        "Two cities. One kit. Pulled on between them.",
        "Printed on demand. Ships when you order it.",
      ],
      price: "$62.00",
      metaTitle: "NYC \u2194 LA Tour Hoodie | Michael Santa Cruz",
      metaDescription:
        "Midweight fleece hoodie with a minimal NYC\u2013LA drum graphic. Washed black or heather grey, sizes S\u20132XL. Official merch from Michael Santa Cruz.",
      imageAlt: "NYC and LA stacked around a snare drum and a double arrow",
      art: {
        black: "/shop/nyc-la-drummer-tee.png",
        white: "/shop/nyc-la-drummer-tee-white-ink.png",
      },
      path: "",
      url: "",
      sizes: ["S", "M", "L", "XL", "2XL"],
      colors: [
        { name: "Washed Black", hex: "#2a2928", ink: "white" },
        { name: "Heather Grey", hex: "#c5c3be", ink: "black" },
      ],
      specs: [
        { label: "Product type", value: "Midweight fleece hoodie" },
        {
          label: "Fabric",
          value:
            "cotton/poly fleece (Gildan 18500 is typically a midweight blend; Cotton Heritage M2580 is listed as 65% ring-spun cotton / 35% polyester, 8.5 oz)",
        },
        {
          label: "Fit",
          value:
            "unisex, regular (Cotton Heritage can run a bit tight \u2014 note \"consider a size up for a relaxed fit\" in the size guide if that blank is used)",
        },
        { label: "Print method", value: "DTG" },
        { label: "Print placement", value: "front, centered, mid-chest" },
        {
          label: "Care",
          value: "machine wash cold, inside out; tumble dry low; do not iron the print",
        },
      ],
    },
    {
      slug: "keep-time-dad-hat",
      title: "Keep Time Dad Hat",
      note: "Unstructured and low profile, with an embroidered Keep Time emblem on the front.",
      description: [
        "Unstructured and low profile, with an embroidered Keep Time emblem on the front. One size, everyday. Built to live on a kit bag or a hook by the door.",
        "Embroidered on demand. Ships when you order it.",
      ],
      price: "$28.00",
      metaTitle: "Keep Time Dad Hat | Michael Santa Cruz",
      metaDescription:
        "Embroidered unstructured dad hat with the Keep Time emblem. Black or olive, one size. Official merch from drummer Michael Santa Cruz.",
      imageAlt: "Circular Keep Time emblem with a drum in the center",
      art: {
        black: "/shop/keep-time-emblem.png",
        white: "/shop/keep-time-emblem-white-ink.png",
      },
      path: "",
      url: "",
      sizes: ["One Size"],
      colors: [
        { name: "Black", hex: "#141414", ink: "white" },
        { name: "Olive", hex: "#4a5133", ink: "white" },
      ],
      specs: [
        { label: "Product type", value: "Embroidered unstructured dad hat" },
        { label: "Fabric", value: "100% chino cotton twill (Yupoong Classic)" },
        { label: "Profile", value: "low, unstructured" },
        { label: "Closure", value: "buckle, one size fits most" },
        { label: "Decoration", value: "embroidery (not DTG)" },
        { label: "Placement", value: "front (Front Large if the editor offers it)" },
      ],
    },
    {
      slug: "drum-shed-tote",
      title: "Drum Shed Tote",
      note: "A sturdy canvas tote for sticks, charts, and whatever else leaves the shed.",
      description: [
        "A sturdy canvas tote for sticks, charts, and whatever else leaves the shed. Same quiet Santa Cruz mark as the rest of the line. Natural or black. Made to be thrown over a shoulder on the way out the door.",
        "Printed on demand. Ships when you order it.",
      ],
      price: "$24.00",
      metaTitle: "Drum Shed Tote | Michael Santa Cruz",
      metaDescription:
        "Canvas tote with a clean Santa Cruz mark. Natural or black. Official merch from drummer Michael Santa Cruz \u2014 made for the carry out of the shed.",
      imageAlt: "Santa Cruz wordmark with three lines above the name",
      art: {
        black: "/shop/santa-cruz-minimal-mark.png",
        white: "/shop/santa-cruz-minimal-mark-white-ink.png",
      },
      path: "",
      url: "",
      sizes: ["One Size"],
      colors: [
        { name: "Natural", hex: "#f3efe6", ink: "black" },
        { name: "Black", hex: "#141414", ink: "white" },
      ],
      specs: [
        { label: "Product type", value: "Canvas tote bag" },
        { label: "Print method", value: "DTG (or the tote blank's standard print method)" },
        { label: "Print placement", value: "front face, centered" },
        { label: "Care", value: "spot clean or gentle wash; air dry" },
      ],
    },
  ],
};
