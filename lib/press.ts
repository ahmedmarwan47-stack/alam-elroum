export type PressArticle = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  readTime: string;
  /** Paragraphs shown in the drawer. */
  body: string[];
};

/**
 * PLACEHOLDER CONTENT — swap for real coverage before launch. The imagery is
 * the site's own renders, and no publication is named — nothing here should
 * read as a real attribution until the coverage is real.
 *
 * Excerpts are held to roughly 125–130 characters so the three cards in the
 * row wrap to the same depth and read as one band rather than a staircase.
 * Keep replacements within that range. <Press> also pins the link to the
 * bottom of each card, so a stray long line cannot re-introduce the ladder.
 */
export const pressArticles: PressArticle[] = [
  {
    slug: "coastline-shaped-for-greatness",
    title: "A Coastline Shaped for Greatness",
    excerpt:
      "Qatari Diar unveils Alam Al Roum, a 20.58 million square metre city on Egypt's North Coast, shaped by 7.2 kilometres of shoreline.",
    image: "/images/image-11.jpg",
    date: "12 September 2026",
    readTime: "5 min read",
    body: [
      "Alam Al Roum unfolds across 7.2 kilometres of Mediterranean shoreline and 22 kilometres of lagoon. A city where coastal living, open water and urban life meet. Not for a season, but for a lifetime.",
      "A network of lagoons carries the water deep inland, creating over 28 kilometres of waterfront that reach into residential communities, leisure zones and urban centres far beyond the shoreline.",
      "A central boulevard connects the arrival gateway to the marina, forming the spine of a walkable, human-scaled city.",
    ],
  },
  {
    slug: "the-lighthouse-returns",
    title: "The Lighthouse Returns to the Headland",
    excerpt:
      "For centuries this headland guided sailors home. The masterplan sets a new landmark at its heart, facing the open Mediterranean.",
    image: "/images/image-18.jpg",
    date: "28 August 2026",
    readTime: "4 min read",
    body: [
      "A Roman landmark that once guided sailors safely home, Alam Al Roum now returns this coastline to its true meaning, defined by timeless beauty, grandeur and enduring light.",
      "Each day begins with one of the city's most iconic sights: the sun rising from the Mediterranean horizon and casting a golden path across the sea towards the Lighthouse.",
    ],
  },
  {
    slug: "marina-experience",
    title: "Three Marinas, One Waterfront",
    excerpt:
      "An international marina for global yachting arrivals, a neighbourhood marina at community scale, and a third kept for residents.",
    image: "/images/ls-marina.jpg",
    date: "10 August 2026",
    readTime: "6 min read",
    body: [
      "Together the three marinas frame a waterfront promenade alive with dining, retail and the rhythm of the sea.",
      "Through the city's centre, a signature canal walk animates daily life, carrying water taxis and quiet currents alike, connecting the boulevard to the marina in one continuous, walkable thread.",
    ],
  },
  {
    slug: "golf-overlooking-the-sea",
    title: "Championship Golf Above the Mediterranean",
    excerpt:
      "The 18-hole course lies along the northern edge of Alam Al Roum, with a clifftop clubhouse where the view becomes part of the game.",
    image: "/images/ls-golf.jpg",
    date: "22 July 2026",
    readTime: "3 min read",
    body: [
      "The championship course overlooks a natural lagoon and the Mediterranean beyond. A clifftop clubhouse completes the experience.",
      "Morning runs along 22 kilometres of coastal trails, paddleboarding, cycling and yoga by the sea: wellness here is built into every part of daily life.",
    ],
  },
  {
    slug: "smart-sustainable-living",
    title: "Designed for a Lifetime, Not a Season",
    excerpt:
      "An education hub, a longevity medical centre, autonomous mobility and renewable energy underpin a city built for a lifetime.",
    image: "/images/ls-smart.jpg",
    date: "3 July 2026",
    readTime: "7 min read",
    body: [
      "Alam Al Roum is designed for those who stay not for a season, but for a life. An Education Hub and a Longevity Medical Centre sit alongside autonomous mobility and renewable energy infrastructure.",
      "A dedicated Free Zone, mixed-use town centres, commercial districts and an Expo and Convention Centre power regional business, not just serve visitors.",
    ],
  },
  {
    slug: "qatari-diar-north-coast",
    title: "Qatari Diar's Defining Statement on the North Coast",
    excerpt:
      "Twenty years, twenty countries, one standard: the developer behind Lusail brings that same principle to Egypt's Mediterranean.",
    image: "/images/image-16.jpg",
    date: "15 June 2026",
    readTime: "5 min read",
    body: [
      "Qatari Diar is a global real estate developer backed by the sovereign capital of the Qatar Investment Authority. Across more than 50 projects in 20 countries, the same principle has held: that exceptional places are built for people, not just for markets.",
      "Alam Al Roum is Qatari Diar's defining statement on Egypt's North Coast.",
    ],
  },
];
