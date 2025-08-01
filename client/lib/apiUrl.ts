/**
 * Get the correct API URL for both development and production
 */
export function getApiUrl(endpoint: string): string {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // In development, use relative URLs
  if (process.env.NODE_ENV === 'development') {
    return `/${cleanEndpoint}`;
  }
  
  // In production, construct full URL using current origin
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/${cleanEndpoint}`;
  }
  
  // Fallback for SSR or when window is not available
  return `/${cleanEndpoint}`;
}
