/**
 * Utility: resolve a course/lesson thumbnail to a usable src string.
 *
 * Strapi can return thumbnail as:
 *  - a plain URL string  (e.g. when we store an external URL)
 *  - a StrapiMedia object  { url: '/uploads/...' }
 *  - null / undefined
 */
export function getThumbnailSrc(
  thumbnail: string | { url?: string } | null | undefined
): string | undefined {
  if (!thumbnail) return undefined;
  if (typeof thumbnail === 'string') return thumbnail;
  const url = thumbnail.url;
  if (!url) return undefined;
  return url.startsWith('http')
    ? url
    : `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:1337'}${url}`;
}
