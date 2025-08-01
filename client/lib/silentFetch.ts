/**
 * Performs a fetch request with timeout and silent error handling
 * Returns null if the request fails for any reason
 */
export async function silentFetch(
  url: string,
  options: RequestInit = {},
  timeout = 15000, // Further increased timeout for production
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
    // More detailed error handling
    const isDev = process.env.NODE_ENV === "development";
    const isLocalhost =
      typeof window !== "undefined" && window.location.hostname === "localhost";

    if (isDev || isLocalhost) {
      console.warn("Fetch failed for:", url, error);
    }

    // In production, if it's a network error, wait a bit before returning null
    if (!isDev && !isLocalhost && error.name === "AbortError") {
      // Wait a small amount for potential network recovery
      await new Promise((resolve) => setTimeout(resolve, 100));
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
  timeout = 15000, // Further increased timeout for production
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
