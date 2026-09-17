import type { ImageLoaderProps } from "next/image";

/**
 * Static-export image loader: no optimisation service, just the source file
 * under the deployment base path (see lib/asset.ts).
 */
export default function imageLoader({ src }: ImageLoaderProps) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return src.startsWith("/") ? `${base}${src}` : src;
}
