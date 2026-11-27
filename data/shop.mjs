/**
 * Merch catalog. Edit this file, then run npm run build.
 *
 * baseUrl
 *   Shop subdomain, no trailing slash. Example: "https://shop.yourdomain.com"
 *   Leave "" until that address exists.
 * product.url
 *   Full Fourthwall product URL. When this is an https link, the button
 *   label switches to buyLabel and opens that product.
 * product.path
 *   Appended to baseUrl while url is still empty, so Coming Soon can point
 *   at the future product address.
 * product.image
 *   Path under public/. Swap in the print-ready PNG, for example /shop/tee.png
 */

export const shop = {
  baseUrl: "",
  comingSoonLabel: "Coming Soon",
  buyLabel: "Shop",
  soonNote: "The shop is not open yet.",
  sectionTitle: "Shop",
  sectionNote: "Artwork, prices, and the shop link are not connected yet.",
  viewLabel: "View",
  backShop: "Back to Shop",
  backHome: "Back to Home",
  sizeLabel: "Size",
  colorLabel: "Color",
  fitLabel: "Fit",
  materialLabel: "Material",
  products: [
    {
      slug: "tee",
      title: "Tee",
      note: "Short-sleeve tee. The print is not final.",
      description: "A short-sleeve tee. The print, price, and fabric are not final.",
      price: "Price coming soon",
      image: "/shop/tee.svg",
      imageAlt: "Line drawing of a short-sleeve tee, standing in for the print",
      width: 800,
      height: 800,
      path: "/products/tee",
      url: "",
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: [
        { name: "Black", hex: "#111111" },
        { name: "White", hex: "#ffffff" },
      ],
      fit: "Fit to be confirmed",
      material: "Material to be confirmed",
    },
    {
      slug: "hoodie",
      title: "Hoodie",
      note: "Pullover hoodie. The print is not final.",
      description: "A pullover hoodie. The print, price, and fabric are not final.",
      price: "Price coming soon",
      image: "/shop/hoodie.svg",
      imageAlt: "Line drawing of a pullover hoodie, standing in for the print",
      width: 800,
      height: 800,
      path: "/products/hoodie",
      url: "",
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: [
        { name: "Black", hex: "#111111" },
        { name: "White", hex: "#ffffff" },
      ],
      fit: "Fit to be confirmed",
      material: "Material to be confirmed",
    },
    {
      slug: "cap",
      title: "Cap",
      note: "Cap. The print is not final.",
      description: "A cap. The print, price, and fabric are not final.",
      price: "Price coming soon",
      image: "/shop/cap.svg",
      imageAlt: "Line drawing of a cap, standing in for the print",
      width: 800,
      height: 800,
      path: "/products/cap",
      url: "",
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: [
        { name: "Black", hex: "#111111" },
        { name: "White", hex: "#ffffff" },
      ],
      fit: "Fit to be confirmed",
      material: "Material to be confirmed",
    },
  ],
};
