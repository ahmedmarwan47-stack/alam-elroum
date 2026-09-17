/**
 * Prefixes a root-relative URL with the deployment base path (GitHub Pages
 * serves the site under the repository name). Use it for anything that is
 * not a <Link> or <Image>: raw <img> tags, fetched models, CSS urls.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const asset = (path: string) => `${BASE_PATH}${path}`;
