import { apiCache } from "./apiCache";

/**
 * Cache Manager - Utilities to manage and clear all types of cache
 */

export class CacheManager {
  /**
   * Clear API cache (localStorage + memory)
   */
  static clearApiCache(): Promise<void> {
    return new Promise((resolve) => {
      try {
        apiCache.clear();
        console.log("✅ API cache cleared");
        resolve();
      } catch (error) {
        console.error("❌ Failed to clear API cache:", error);
        resolve();
      }
    });
  }

  /**
   * Clear Service Worker caches
   */
  static async clearServiceWorkerCache(): Promise<void> {
    if ("caches" in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName)),
        );
        console.log("✅ Service Worker caches cleared:", cacheNames);
      } catch (error) {
        console.error("❌ Failed to clear Service Worker cache:", error);
      }
    } else {
      console.log("⚠️ Service Worker not supported");
    }
  }

  /**
   * Clear browser cache (forces hard reload)
   */
  static clearBrowserCache(): void {
    try {
      // Clear sessionStorage
      if ("sessionStorage" in window) {
        sessionStorage.clear();
        console.log("✅ Session storage cleared");
      }

      // Force hard reload to clear browser cache
      if ("location" in window) {
        window.location.reload(true as any); // Force reload from server
      }
    } catch (error) {
      console.error("❌ Failed to clear browser cache:", error);
    }
  }

  /**
   * Clear all caches at once
   */
  static async clearAllCaches(): Promise<void> {
    console.log("🧹 Clearing all caches...");

    // Clear API cache
    await this.clearApiCache();

    // Clear Service Worker cache
    await this.clearServiceWorkerCache();

    // Wait a bit for operations to complete
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Clear browser cache (this will reload the page)
    this.clearBrowserCache();
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats(): Promise<any> {
    const stats = {
      api: apiCache.getStats(),
      serviceWorker: {
        supported: "caches" in window,
        caches: [],
      },
      localStorage: {
        supported: "localStorage" in window,
        size: 0,
      },
      sessionStorage: {
        supported: "sessionStorage" in window,
        size: 0,
      },
    };

    // Get Service Worker cache info
    if ("caches" in window) {
      try {
        const cacheNames = await caches.keys();
        stats.serviceWorker.caches = cacheNames;
      } catch (error) {
        console.error("Failed to get SW cache info:", error);
      }
    }

    // Get localStorage size
    if ("localStorage" in window) {
      try {
        let size = 0;
        for (let key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            size += localStorage[key].length;
          }
        }
        stats.localStorage.size = size;
      } catch (error) {
        console.error("Failed to get localStorage size:", error);
      }
    }

    // Get sessionStorage size
    if ("sessionStorage" in window) {
      try {
        let size = 0;
        for (let key in sessionStorage) {
          if (sessionStorage.hasOwnProperty(key)) {
            size += sessionStorage[key].length;
          }
        }
        stats.sessionStorage.size = size;
      } catch (error) {
        console.error("Failed to get sessionStorage size:", error);
      }
    }

    return stats;
  }

  /**
   * Clear only old/expired cache entries
   */
  static async clearExpiredCache(): Promise<void> {
    console.log("🧹 Clearing expired caches...");

    // API cache automatically cleans expired entries when accessed
    // Force a cleanup by trying to get a non-existent key
    apiCache.get("__cleanup_trigger__");

    console.log("✅ Expired caches cleared");
  }
}

/**
 * Global functions for easy access
 */

// Clear all caches
export const clearAllCaches = () => CacheManager.clearAllCaches();

// Clear only API cache
export const clearApiCache = () => CacheManager.clearApiCache();

// Clear only Service Worker cache
export const clearServiceWorkerCache = () =>
  CacheManager.clearServiceWorkerCache();

// Clear only browser cache
export const clearBrowserCache = () => CacheManager.clearBrowserCache();

// Get cache stats
export const getCacheStats = () => CacheManager.getCacheStats();

// Clear only expired entries
export const clearExpiredCache = () => CacheManager.clearExpiredCache();

// Make functions globally available in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).clearAllCaches = clearAllCaches;
  (window as any).clearApiCache = clearApiCache;
  (window as any).clearServiceWorkerCache = clearServiceWorkerCache;
  (window as any).clearBrowserCache = clearBrowserCache;
  (window as any).getCacheStats = getCacheStats;
  (window as any).clearExpiredCache = clearExpiredCache;

  console.log("🔧 Cache management functions available globally:");
  console.log("- clearAllCaches()");
  console.log("- clearApiCache()");
  console.log("- clearServiceWorkerCache()");
  console.log("- clearBrowserCache()");
  console.log("- getCacheStats()");
  console.log("- clearExpiredCache()");
}
