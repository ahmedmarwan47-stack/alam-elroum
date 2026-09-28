export type CoinBeat = {
  /** Headline lines, one per array entry. */
  title: string[];
  body: string;
};

/**
 * The beats that play around the coin while it holds centre stage. The first
 * two are PLACEHOLDER COPY in the brand's voice — refine with the client; the
 * third is the About copy, which used to be a section of its own.
 */
export const coinBeats: CoinBeat[] = [
  {
    title: ["More than", "a seal."],
    body: "Struck with the name of the headland on one face and the mariner's star on the other, the seal of Alam Al Roum is a promise: this coastline is returning to what it was always meant to be.",
  },
  {
    title: ["Guided by", "the star."],
    body: "For centuries this headland guided sailors home. The star on the reverse still points the way back — to 7.2 kilometres of Mediterranean shoreline, 22 kilometres of lagoon, and a city built not for a season but for a lifetime.",
  },
  {
    title: ["An Icon in the", "North Coast,", "Defined by Scale"],
    body: "Alam Al Roum unfolds across 7.2 kilometres of Mediterranean shoreline and 22 kilometres of lagoon. A city where coastal living, open water, and urban life meet. Not for a season, but for a lifetime.",
  },
];
