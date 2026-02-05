// Gallery image URL resolver
//
// IMPORTANT: To keep production builds fast and reliable, we serve gallery assets from /public
// (public/assets/gallery/*) instead of bundling them via import.meta.glob.
//
// Expected input format in the app: "/assets/gallery/01.jpg" (or any filename under that folder)
// This resolver keeps those URLs working and provides a simple preload helper.

const resolvedCache: Record<string, string> = {};

function normalizeGalleryUrl(url: string): string {
  // Absolute URLs (http/https) are returned as-is
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  // If it's already a public gallery path, keep it
  if (url.startsWith('/assets/gallery/')) return url;

  // If someone passes just a filename, normalize it
  if (!url.includes('/') && url.toLowerCase().endsWith('.jpg')) {
    return `/assets/gallery/${url}`;
  }

  // Fallback to original URL
  return url;
}

export async function resolveImageUrlAsync(url: string): Promise<string> {
  const normalized = normalizeGalleryUrl(url);

  // Cache by exact normalized URL
  if (resolvedCache[normalized]) return resolvedCache[normalized];

  // We don't need async work anymore, but keep the async API for compatibility
  resolvedCache[normalized] = normalized;
  return normalized;
}

export function resolveImageUrl(url: string): string {
  return normalizeGalleryUrl(url);
}

export async function preloadImage(url: string): Promise<string> {
  const resolved = await resolveImageUrlAsync(url);

  // Best-effort preload (won't throw on errors)
  try {
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = resolved;
    });
  } catch {
    // ignore
  }

  return resolved;
}

// Export for debugging/compatibility
export { resolvedCache };
export const filenameToPath: Record<string, string> = {};
