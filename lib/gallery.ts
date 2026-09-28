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

/** The chosen photographs of a set, by their file number. */
const images = (
  dir: string,
  picks: number[],
  caption: Pick<GalleryItem, "title" | "subtitle" | "alt">,
): GalleryItem[] =>
  picks.map((n, i) => ({
    src: `/gallery/${dir}/${String(n).padStart(2, "0")}.jpg`,
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

/*
 * Eighteen of the forty-one on disk: past that, few people swipe on, and
 * every card is a full-size photograph to download. The rest stay in
 * public/gallery to swap in. The portrait beach shots are left out — the
 * 4:3 cards crop them to a sliver of water — as are near-repeats.
 */
const beach = images("beach", [1, 3], {
  alt: "The Alam Al Roum shoreline",
  title: "The Mediterranean",
  subtitle: "The Alam Al Roum shoreline",
});

const experienceCenter = images("experience-center", [2, 3, 5, 6, 1], {
  alt: "The Alam Al Roum Experience Center",
  title: "The Experience Center",
  subtitle: "Alam Al Roum, North Coast",
});

const landSigning = images("land-signing", [1, 2], {
  alt: "Signing of the Alam Al Roum partnership agreement",
  title: "The Land Signing",
  subtitle: "New Administrative Capital, November 2025",
});

/** The visit's photographs run in the order they were taken. */
const pmVisit: GalleryItem[] = images("pm-visit", [4, 9, 11, 12, 14, 16, 17], {
  alt: "The Prime Minister's visit to Alam Al Roum",
  title: "The Prime Minister's Visit",
  subtitle: "Phase One launch, August 2026",
});
pmVisit.splice(2, 0, {
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
 * spread evenly among themselves, so the rhythm keeps changing. The Prime
 * Minister's visit is then woven through that line in its own chronological
 * order, so it reads as a story running through the gallery; with fewer of
 * it than there are gaps, no two of its pictures ever meet.
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
