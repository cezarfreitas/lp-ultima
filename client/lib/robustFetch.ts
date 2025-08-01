/**
 * Robust fetch implementation that bypasses FullStory and other third-party interference
 */

// Store original fetch before any scripts can override it
const originalFetch = (() => {
  // Try to get the original fetch before FullStory messes with it
  if (typeof window !== "undefined") {
    // Create a clean iframe to get original fetch
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    const cleanFetch = iframe.contentWindow?.fetch;
    document.body.removeChild(iframe);
    return cleanFetch || window.fetch || fetch;
  }
  return fetch;
})();

/**
 * Robust fetch that bypasses third-party interference
 */
export async function robustFetch(
  url: string,
  options: RequestInit = {},
  timeout = 5000,
): Promise<Response | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Use multiple fallback strategies
    let fetchToUse = originalFetch;

    // Fallback 1: Try original fetch
    if (!fetchToUse) {
      fetchToUse = window.fetch?.bind(window);
    }

    // Fallback 2: Try global fetch
    if (!fetchToUse) {
      fetchToUse = fetch;
    }

    const response = await fetchToUse(url, {
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
    clearTimeout(timeoutId);

    // If first attempt fails due to FullStory interference, try XMLHttpRequest
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      return await fallbackXHR(url, options, timeout);
    }

    return null;
  }
}

/**
 * Fallback using XMLHttpRequest when fetch is completely broken
 */
async function fallbackXHR(
  url: string,
  options: RequestInit = {},
  timeout = 5000,
): Promise<Response | null> {
  return new Promise((resolve) => {
    try {
      const xhr = new XMLHttpRequest();
      const method = options.method || "GET";

      xhr.timeout = timeout;
      xhr.open(method, url);

      // Set headers
      if (options.headers) {
        const headers = options.headers as Record<string, string>;
        Object.entries(headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
      }

      xhr.onload = () => {
        // Create a Response-like object
        const response = {
          ok: xhr.status >= 200 && xhr.status < 300,
          status: xhr.status,
          statusText: xhr.statusText,
          headers: new Headers(),
          json: async () => {
            try {
              return JSON.parse(xhr.responseText);
            } catch {
              throw new Error("Invalid JSON");
            }
          },
          text: async () => xhr.responseText,
        } as Response;

        resolve(response);
      };

      xhr.onerror = () => resolve(null);
      xhr.ontimeout = () => resolve(null);

      // Send request
      if (options.body) {
        xhr.send(options.body as string);
      } else {
        xhr.send();
      }
    } catch {
      resolve(null);
    }
  });
}

/**
 * Robust fetch for JSON data
 */
export async function robustFetchJson<T>(
  url: string,
  options: RequestInit = {},
  timeout = 5000,
): Promise<T | null> {
  const response = await robustFetch(url, options, timeout);

  if (!response || !response.ok) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}
