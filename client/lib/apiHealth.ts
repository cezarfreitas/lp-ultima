import { getApiUrl } from "./apiUrl";

let apiHealthStatus: "unknown" | "healthy" | "unhealthy" = "unknown";
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

/**
 * Check if API is responding with a simple ping
 */
export async function checkApiHealth(): Promise<boolean> {
  const now = Date.now();

  // Use cached result if recent
  if (
    now - lastHealthCheck < HEALTH_CHECK_INTERVAL &&
    apiHealthStatus !== "unknown"
  ) {
    return apiHealthStatus === "healthy";
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // Quick health check

    const response = await fetch(getApiUrl("api/ping"), {
      method: "GET",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      apiHealthStatus = "healthy";
      lastHealthCheck = now;
      return true;
    } else {
      apiHealthStatus = "unhealthy";
      lastHealthCheck = now;
      return false;
    }
  } catch (error) {
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
