export type GallerySlide = {
  src: string;
  alt: string;
  title: string;
  subtitle: string;
};

/** The gallery draws on the renders already shipped with the site. */
export const gallerySlides: GallerySlide[] = [
  { src: "/images/ls-beach.jpg", alt: "Aerial view of the shoreline", title: "The Shoreline", subtitle: "7.2 kilometres of Mediterranean beach" },
  { src: "/images/ls-marina.jpg", alt: "Marina at dusk", title: "The Marina", subtitle: "International yachting arrivals" },
  { src: "/images/ls-canals.jpg", alt: "Canal walk with cafés", title: "The Canals", subtitle: "A signature walk through the city" },
  { src: "/images/image-18.jpg", alt: "The Lighthouse at sunset", title: "The Lighthouse", subtitle: "Where the land, sea and sky align" },
  { src: "/images/ls-golf.jpg", alt: "Golf course above the sea", title: "The Golf", subtitle: "Eighteen holes overlooking the water" },
  { src: "/images/ls-town.jpg", alt: "Town centre plaza", title: "Town Centres", subtitle: "Shaded streets, courtyards and plazas" },
  { src: "/images/ls-hotel.jpg", alt: "Hotel terrace", title: "Hospitality", subtitle: "Resort and boutique stays" },
  { src: "/images/ls-leisure.jpg", alt: "Swimming in a lagoon", title: "The Lagoons", subtitle: "Open-water swimming, crystal clear" },
  { src: "/images/ls-entertainment.jpg", alt: "Outdoor performance", title: "Culture", subtitle: "World-class performances by the sea" },
  { src: "/images/masterplan-aerial.jpg", alt: "Masterplan aerial", title: "The Masterplan", subtitle: "A city shaped by the coastline" },
];
