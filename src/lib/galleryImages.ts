// Static imports for gallery images
// This file provides a mapping from relative paths to bundled asset URLs
// Using lazy loading to avoid bundling all images upfront

const galleryModules = import.meta.glob<{ default: string }>('@/assets/gallery/*.jpg', { 
  eager: false,
  query: '?url'
});

// Cache for resolved URLs
const resolvedCache: Record<string, string> = {};

// Extract filenames for quick lookup
const filenameToPath: Record<string, string> = {};
Object.keys(galleryModules).forEach((path) => {
  const filename = path.split('/').pop() || '';
  filenameToPath[filename] = path;
});

export async function resolveImageUrlAsync(url: string): Promise<string> {
  // If it's an absolute URL (http/https), return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a local gallery path like "/assets/gallery/01.jpg"
  if (url.includes('/assets/gallery/')) {
    const filename = url.split('/').pop() || '';
    
    // Check cache first
    if (resolvedCache[filename]) {
      return resolvedCache[filename];
    }
    
    const modulePath = filenameToPath[filename];
    if (modulePath && galleryModules[modulePath]) {
      try {
        const module = await galleryModules[modulePath]();
        resolvedCache[filename] = module.default;
        return module.default;
      } catch {
        // Fallback to original URL on error
      }
    }
  }
  
  // Fallback to original URL
  return url;
}

// Synchronous version for backward compatibility
// Returns the original URL if not cached (images load from public path)
export function resolveImageUrl(url: string): string {
  // If it's an absolute URL (http/https), return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a local gallery path, check cache
  if (url.includes('/assets/gallery/')) {
    const filename = url.split('/').pop() || '';
    if (resolvedCache[filename]) {
      return resolvedCache[filename];
    }
  }
  
  // Return original URL - images in public folder work directly
  return url;
}

// Preload a specific image (useful for hero images)
export async function preloadImage(url: string): Promise<string> {
  return resolveImageUrlAsync(url);
}

// Export for debugging
export { resolvedCache, filenameToPath };
