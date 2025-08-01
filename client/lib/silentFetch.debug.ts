/**
 * Simplified fetch for debugging - no circuit breaker
 */
export async function simpleFetch(
  url: string,
  options: RequestInit = {},
  timeout = 10000,
): Promise<Response | null> {
  console.log("simpleFetch called for:", url);

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
    console.log("simpleFetch response:", response.status, url);
    return response;
  } catch (error) {
    console.error("simpleFetch error:", error, url);
    return null;
  }
}

export async function simpleFetchJson<T>(
  url: string,
  options: RequestInit = {},
  timeout = 10000,
): Promise<T | null> {
  const response = await simpleFetch(url, options, timeout);

  if (!response) {
    console.log("No response for:", url);
    return null;
  }

  if (!response.ok) {
    console.log("Response not ok:", response.status, url);
    return null;
  }

  try {
    const data = await response.json();
    console.log("JSON data received for:", url, data);
    return data;
  } catch (error) {
    console.error("JSON parse error:", error, url);
    return null;
  }
}
