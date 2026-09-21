export type LifestyleCard = {
  tag: string;
  /** Line breaks are deliberate — they match the original's <br> positions. */
  headline: string[];
  body: string;
  /**
   * One line, for layouts where the copy sits over the photograph and the
   * full body would bury it — the rail, where the card is the picture.
   */
  short: string;
  image: string;
  alt: string;
  /** Odd cards put the image right; even cards flip it left. */
  reversed: boolean;
};

export const lifestyleCards: LifestyleCard[] = [
  {
    tag: "01",
    headline: ["BEACHFRONT", "LIVING"],
    body: "7.2 kilometres of Mediterranean shoreline, shaped for the way you live. Social beaches for gathering. Resort beaches for seclusion. Neighbourhood beaches steps from your door. Further inland, swimmable lagoons and a network of canals bring the water into the heart of every community.",
    short:
      "Social, resort and neighbourhood beaches along 7.2 kilometres of shoreline.",
    image: "/images/ls-beach.jpg",
    alt: "Aerial view of Mediterranean shoreline",
    reversed: false,
  },
  {
    tag: "02",
    headline: ["THE", "CANALS"],
    body: "Through the city's centre, a signature canal walk animates daily life. Lined with cafés, retail and waterfront dining, it carries water taxis and quiet currents alike, connecting the boulevard to the marina in one continuous, walkable thread.",
    short:
      "A canal walk of cafés and waterfront dining, from the boulevard to the marina.",
    image: "/images/ls-canals.jpg",
    alt: "Canal walk lined with cafés and waterfront dining",
    reversed: true,
  },
  {
    tag: "03",
    headline: ["MARINA", "EXPERIENCE"],
    body: "An international marina for global yachting arrivals. A neighbourhood marina at the community scale. A private marina for exclusive use. Together, they frame a waterfront promenade alive with dining, retail, and the rhythm of the sea.",
    short:
      "Three marinas — international, neighbourhood and private — on one promenade.",
    image: "/images/ls-marina.jpg",
    alt: "Marina and waterfront promenade",
    reversed: false,
  },
  {
    tag: "04",
    headline: ["TOWN CENTRES", "& RETAIL"],
    body: "The social and cultural heart of Alam Al Roum. Walkable mixed-use districts where waterfront dining, cafés, retail, art, and cultural programming come together across shaded streets, courtyards, and plazas. Active from morning to evening, the town centres shape the rhythm of daily life by the lagoons.",
    short:
      "Walkable mixed-use districts of shaded streets, courtyards and plazas.",
    image: "/images/ls-town.jpg",
    alt: "Walkable town centre with shaded streets and plazas",
    reversed: true,
  },
  {
    tag: "05",
    headline: ["HOTELS &", "HOSPITALITY"],
    body: "From internationally recognized hospitality brands to thoughtfully curated boutique hotels, each with its own identity, the destination offers a collection of experiences designed to cater to different lifestyles and preferences.",
    short:
      "International brands and boutique stays, each with its own identity.",
    image: "/images/ls-hotel.jpg",
    alt: "Hotel terrace overlooking the coast",
    reversed: false,
  },
  {
    tag: "06",
    headline: ["ICONIC", "MOMENTS"],
    body: "Each day begins with one of Alam Al Roum's most iconic sights. Rising from the Mediterranean horizon, the sun casts a golden path across the sea, drawing the eye towards the Lighthouse at the heart of the coastline. It is a moment of quiet beauty that sets the tone for life by the water.",
    short:
      "Sunrise over the Mediterranean, drawing the eye to the Lighthouse.",
    image: "/images/ls-iconic.jpg",
    alt: "Sunrise over the Mediterranean towards the lighthouse",
    reversed: true,
  },
  {
    tag: "07",
    headline: ["GLOBAL", "CONNECTIVITY", "& BUSINESS"],
    body: "A dedicated Free Zone. Mixed-use town centres. Commercial districts. An Expo and Convention Centre. Seamlessly connected by road, sea, and air, Alam Al Roum powers regional business, not just serves visitors.",
    short:
      "A Free Zone, commercial districts and an Expo Centre, connected by road, sea and air.",
    image: "/images/s9-sailboat.jpg",
    alt: "Sailboat on open Mediterranean water",
    reversed: false,
  },
  {
    tag: "08",
    headline: ["SMART &", "SUSTAINABLE", "LIVING"],
    body: "An Education Hub. A Longevity Medical Centre. Autonomous mobility and renewable energy infrastructure. Designed for those who stay not for a season, but for a life.",
    short:
      "An education hub, a longevity centre, autonomous mobility and renewable energy.",
    image: "/images/ls-smart.jpg",
    alt: "Smart, sustainable residential district",
    reversed: true,
  },
  {
    tag: "09",
    headline: ["LEISURE &", "WELLNESS"],
    body: "Open-water swimming in crystal-clear lagoons. Morning runs along 22 kilometres of coastal trails. Paddleboarding, cycling, and yoga by the sea. Wellness here is not a destination within the destination — it is built into every part of daily life.",
    short:
      "Open-water swimming, coastal trails, paddleboarding and yoga by the sea.",
    image: "/images/ls-leisure.jpg",
    alt: "Open-water swimming in a clear lagoon",
    reversed: false,
  },
  {
    tag: "10",
    headline: ["GOLF", "OVERLOOKING", "THE SEA"],
    body: "The 18-hole championship golf course lies along the northern edge of Alam Al Roum, overlooking a natural lagoon and the Mediterranean beyond. A clifftop clubhouse completes the experience, where the views become part of the game.",
    short:
      "Eighteen championship holes above a lagoon, with a clifftop clubhouse.",
    image: "/images/ls-golf.jpg",
    alt: "Championship golf course overlooking the sea",
    reversed: true,
  },
  {
    tag: "11",
    headline: ["ENTERTAINMENT", "& CULTURE"],
    body: "Marking memorable moments at Alam Al Roum, entertainment and cultural experiences come to life through world-class performances, artistic expression, and community celebrations that inspire, connect, and captivate.",
    short:
      "World-class performances, artistic expression and community celebrations.",
    image: "/images/ls-entertainment.jpg",
    alt: "Outdoor cultural performance venue",
    reversed: false,
  },
];
