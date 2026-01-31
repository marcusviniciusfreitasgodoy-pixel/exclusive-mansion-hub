// Static imports for gallery images
// This file provides a mapping from relative paths to bundled asset URLs

const galleryModules = import.meta.glob('@/assets/gallery/*.jpg', { eager: true, as: 'url' });

// Create a map from filename to URL
const galleryMap: Record<string, string> = {};
Object.entries(galleryModules).forEach(([path, url]) => {
  // Extract filename from path like "/src/assets/gallery/01.jpg" -> "01.jpg"
  const filename = path.split('/').pop() || '';
  galleryMap[filename] = url;
});

export function resolveImageUrl(url: string): string {
  // If it's an absolute URL (http/https), return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a local gallery path like "/assets/gallery/01.jpg"
  if (url.includes('/assets/gallery/')) {
    const filename = url.split('/').pop() || '';
    const resolved = galleryMap[filename];
    if (resolved) {
      return resolved;
    }
  }
  
  // Fallback to original URL
  return url;
}

// Export the gallery map for debugging
export { galleryMap };
