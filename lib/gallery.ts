export type GalleryItem = {
  /** The image shown on the card — for a video, its poster frame. */
  src: string;
  alt: string;
  /** Caption under the centre card: which set it comes from. */
  title: string;
  subtitle: string;
  /** Set on a video card: the film that plays in the lightbox. */
  video?: string;
};

const images = (
  dir: string,
  count: number,
  caption: Pick<GalleryItem, "title" | "subtitle" | "alt">,
): GalleryItem[] =>
  Array.from({ length: count }, (_, i) => ({
    src: `/gallery/${dir}/${String(i + 1).padStart(2, "0")}.jpg`,
    ...caption,
    alt: `${caption.alt} ${i + 1}`,
  }));

const brandFilm: GalleryItem = {
  src: "/gallery/brand-film-poster.jpg",
  video: "/gallery/brand-film.mp4",
  alt: "Alam Al Roum brand film",
  title: "Alam Al Roum",
  subtitle: "The brand film",
};

const beach = images("beach", 6, {
  alt: "The Alam Al Roum shoreline",
  title: "The Mediterranean",
  subtitle: "The Alam Al Roum shoreline",
});

const experienceCenter = images("experience-center", 7, {
  alt: "The Alam Al Roum Experience Center",
  title: "The Experience Center",
  subtitle: "Alam Al Roum, North Coast",
});

const landSigning = images("land-signing", 2, {
  alt: "Signing of the Alam Al Roum partnership agreement",
  title: "The Land Signing",
  subtitle: "New Administrative Capital, November 2025",
});

/** The visit's photographs run in the order they were taken. */
const pmVisit: GalleryItem[] = images("pm-visit", 17, {
  alt: "The Prime Minister's visit to Alam Al Roum",
  title: "The Prime Minister's Visit",
  subtitle: "Phase One launch, August 2026",
});
pmVisit.splice(9, 0, {
  src: "/gallery/pm-visit/film-poster.jpg",
  video: "/gallery/pm-visit/film.mp4",
  alt: "The Prime Minister's visit to Alam Al Roum, film",
  title: "The Prime Minister's Visit",
  subtitle: "The film, August 2026",
});

/**
 * Lays `sets` out so each one is spread evenly along the sequence: an item's
 * place is its fraction of the way through its own set, and `phase` staggers
 * the sets so they take turns rather than arriving together.
 */
function spread(sets: { items: GalleryItem[]; phase: number }[]) {
  return sets
    .flatMap(({ items, phase }) =>
      items.map((item, i) => ({ item, at: (i + phase) / items.length })),
    )
    .sort((a, b) => a.at - b.at)
    .map(({ item }) => item);
}

/**
 * One sequence of everything, arranged rather than shuffled — the same on
 * every visit.
 *
 * It opens on the brand film. Beach, Experience Center and the signing are
 * spread evenly among themselves, so the rhythm keeps changing and the two
 * signing photographs land a third and two-thirds of the way round. The
 * Prime Minister's visit, over half the material, is then woven through
 * that line in its own chronological order, so it reads as a story running
 * through the gallery. There is one more of it than there are gaps, so two
 * of its pictures meet — spaced well apart — and nowhere do three.
 */
const others = [
  brandFilm,
  ...spread([
    { items: beach, phase: 0 },
    { items: experienceCenter, phase: 0.45 },
    { items: landSigning, phase: 0.6 },
  ]),
];

export const galleryItems: GalleryItem[] = [
  ...others.map((item, i) => ({ item, at: i / others.length })),
  ...pmVisit.map((item, i) => ({ item, at: (i + 0.5) / pmVisit.length })),
]
  .sort((a, b) => a.at - b.at)
  .map(({ item }) => item);
