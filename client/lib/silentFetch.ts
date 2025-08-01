/**
 * Performs a fetch request with timeout and silent error handling
 * Returns null if the request fails for any reason
 */
export async function silentFetch(
  url: string,
  options: RequestInit = {},
  timeout = 20000, // Increased timeout further
): Promise<Response | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Use native fetch if FullStory is interfering
    const nativeFetch = window.fetch.bind(window) || fetch;

    const response = await nativeFetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
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

    // Log more details in development
    if (isDev || isLocalhost) {
      console.warn(`Fetch failed for: ${url}`, {
        error: error.message,
        name: error.name,
        stack: error.stack?.slice(0, 200)
      });
    }

    // Retry logic for specific errors
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      // Wait and retry once for fetch interference issues
      await new Promise((resolve) => setTimeout(resolve, 500));

      try {
        const controller2 = new AbortController();
        const timeoutId2 = setTimeout(() => controller2.abort(), timeout / 2);

        const retryResponse = await fetch(url, {
          ...options,
          signal: controller2.signal,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            ...options.headers,
          },
        });

        clearTimeout(timeoutId2);
        return retryResponse;
      } catch (retryError) {
        // Final failure, return null
        return null;
      }
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
  timeout = 20000, // Increased timeout further
): Promise<T | null> {
  const response = await silentFetch(url, options, timeout);

  if (!response) {
    return null;
  }

  if (!response.ok) {
    // Log failed responses in development
    const isDev = process.env.NODE_ENV === "development";
    const isLocalhost =
      typeof window !== "undefined" && window.location.hostname === "localhost";

    if (isDev || isLocalhost) {
      console.warn(`HTTP ${response.status} for: ${url}`);
    }
    return null;
  }

  try {
    return await response.json();
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development";
    const isLocalhost =
      typeof window !== "undefined" && window.location.hostname === "localhost";

    if (isDev || isLocalhost) {
      console.warn(`JSON parse failed for: ${url}`, error);
    }
    return null;
  }
}
