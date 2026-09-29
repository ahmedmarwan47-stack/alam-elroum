export type GalleryItem = {
  /** The image shown on the card — for a video, its poster frame. */
  src: string;
  alt: string;
  /** Caption under the centre card: which set it comes from. */
  title: string;
  /** Set on a video card: the film that plays in the lightbox. */
  video?: string;
};

const images = (
  dir: string,
  count: number,
  caption: Pick<GalleryItem, "title" | "alt">,
): GalleryItem[] =>
  Array.from({ length: count }, (_, i) => ({
    src: `/gallery/${dir}/${String(i + 1).padStart(2, "0")}.jpg`,
    ...caption,
    alt: `${caption.alt} ${i + 1}`,
  }));

const film = (dir: string, caption: Pick<GalleryItem, "title" | "alt">): GalleryItem => ({
  src: `/gallery/${dir}/film-poster.jpg`,
  video: `/gallery/${dir}/film.mp4`,
  ...caption,
});

/*
 * Captioned by category, one per folder of the Website Content delivery:
 * Beach Shots, Beach Video, Signing of the Land, Experience Center shots and
 * video, and the Prime Minister's visit, shots and video.
 */
const beach = images("beach", 9, {
  alt: "Beach shot of the Alam Al Roum shoreline",
  title: "Beach Shots",
});

const beachFilm = film("beach", {
  alt: "Beach video: Timeless Shores",
  title: "Beach Video",
});

const landSigning = images("land-signing", 2, {
  alt: "Signing of the land for Alam Al Roum",
  title: "Signing of the Land",
});

const experienceCenter = images("experience-center", 7, {
  alt: "The Alam Al Roum Experience Center",
  title: "Experience Center",
});

const experienceCenterFilm = film("experience-center", {
  alt: "Experience Center video",
  title: "Experience Center Video",
});

const pmVisit = images("pm-visit", 4, {
  alt: "The Prime Minister's visit to Alam Al Roum",
  title: "The Prime Minister's Visit",
});

const pmVisitFilm = film("pm-visit", {
  alt: "Video of the Prime Minister's visit to Alam Al Roum",
  title: "The Prime Minister's Visit Video",
});

/**
 * Mixed rather than set by set — nine beach shots in a row look like one
 * picture. Fixed, so it is the same on every visit: no card sits next to one
 * from its own set (the beach video counts as beach, and so on), including
 * across the wrap from the last card back to the first; the three films
 * fall eight cards apart; and each set keeps its own order.
 */
const [b, e, p, l] = [beach, experienceCenter, pmVisit, landSigning];
export const galleryItems: GalleryItem[] = [
  b[0], l[0], e[0], beachFilm, p[0],
  b[1], e[1], b[2], p[1], e[2],
  b[3], experienceCenterFilm, b[4], e[3], l[1],
  p[2], b[5], e[4], b[6], pmVisitFilm,
  e[5], b[7], p[3], b[8], e[6],
];
