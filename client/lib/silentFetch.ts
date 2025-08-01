/**
 * Performs a fetch request with timeout and silent error handling
 * Returns null if the request fails for any reason
 */
export async function silentFetch(
  url: string,
  options: RequestInit = {},
  timeout = 10000, // Increased timeout for production
): Promise<Response | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    // Log error in development, silent in production
    if (process.env.NODE_ENV === 'development') {
      console.warn('Fetch failed for:', url, error);
    }
    return null;
  }
}

/**
 * Performs a silent fetch and returns JSON data or null
 */
export async function silentFetchJson<T>(
  url: string,
  options: RequestInit = {},
  timeout = 10000, // Increased timeout for production
): Promise<T | null> {
  const response = await silentFetch(url, options, timeout);

  if (!response || !response.ok) {
    return null;
  }

  try {
    return await response.json();
  } catch (error) {
    return null;
  }
}
