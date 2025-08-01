import { robustFetch, robustFetchJson } from './robustFetch';

/**
 * Admin-specific fetch wrapper that handles FullStory interference
 * and provides consistent error handling across admin pages
 */

export async function adminFetch(
  url: string,
  options: RequestInit = {},
  timeout = 10000
): Promise<Response | null> {
  // Ensure URL starts with /api for admin calls
  const apiUrl = url.startsWith('/api') ? url : `/api/${url}`;
  
  try {
    return await robustFetch(apiUrl, options, timeout);
  } catch (error) {
    console.error('Admin fetch failed:', error);
    return null;
  }
}

export async function adminFetchJson<T>(
  url: string,
  options: RequestInit = {},
  timeout = 10000
): Promise<T | null> {
  // Ensure URL starts with /api for admin calls
  const apiUrl = url.startsWith('/api') ? url : `/api/${url}`;
  
  try {
    return await robustFetchJson<T>(apiUrl, options, timeout);
  } catch (error) {
    console.error('Admin fetch JSON failed:', error);
    return null;
  }
}

// Helper for common admin operations
export const adminAPI = {
  // GET requests
  get: <T>(endpoint: string) => adminFetchJson<T>(endpoint),
  
  // POST requests
  post: <T>(endpoint: string, data: any) => 
    adminFetchJson<T>(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
  
  // PUT requests
  put: <T>(endpoint: string, data: any) =>
    adminFetchJson<T>(endpoint, {
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
  
  // DELETE requests
  delete: <T>(endpoint: string) =>
    adminFetchJson<T>(endpoint, { method: 'DELETE' })
};
