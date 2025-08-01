import { getApiUrl } from "./apiUrl";

let apiHealthStatus: "unknown" | "healthy" | "unhealthy" = "unknown";
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

/**
 * Check if API is responding with a simple ping
 */
export async function checkApiHealth(): Promise<boolean> {
  const now = Date.now();

  // Use cached result if recent and healthy
  if (
    now - lastHealthCheck < HEALTH_CHECK_INTERVAL &&
    apiHealthStatus === "healthy"
  ) {
    return true;
  }

  // For unhealthy status, check more frequently (every 10 seconds)
  if (
    now - lastHealthCheck < 10000 &&
    apiHealthStatus === "unhealthy"
  ) {
    return false;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // Slightly longer timeout

    // Use native fetch to avoid FullStory interference
    const nativeFetch = window.fetch?.bind(window) || fetch;

    const response = await nativeFetch(getApiUrl("api/ping"), {
      method: "GET",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      apiHealthStatus = "healthy";
      lastHealthCheck = now;
      return true;
    } else {
      // Try alternative health check endpoint
      try {
        const altController = new AbortController();
        const altTimeoutId = setTimeout(() => altController.abort(), 5000);

        const altResponse = await nativeFetch(getApiUrl("api/debug"), {
          method: "GET",
          signal: altController.signal,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
        });

        clearTimeout(altTimeoutId);

        if (altResponse.ok) {
          apiHealthStatus = "healthy";
          lastHealthCheck = now;
          return true;
        }
      } catch (altError) {
        // Alternative endpoint also failed
      }

      apiHealthStatus = "unhealthy";
      lastHealthCheck = now;
      return false;
    }
  } catch (error) {
    // Log error in development
    const isDev = process.env.NODE_ENV === "development";
    const isLocalhost =
      typeof window !== "undefined" && window.location.hostname === "localhost";

    if (isDev || isLocalhost) {
      console.warn("API health check failed:", error.message);
    }

    apiHealthStatus = "unhealthy";
    lastHealthCheck = now;
    return false;
  }
}

/**
 * Get current API health status without making a new request
 */
export function getApiHealthStatus(): "unknown" | "healthy" | "unhealthy" {
  return apiHealthStatus;
}

/**
 * Reset API health status (useful for retry scenarios)
 */
export function resetApiHealth(): void {
  apiHealthStatus = "unknown";
  lastHealthCheck = 0;
}
