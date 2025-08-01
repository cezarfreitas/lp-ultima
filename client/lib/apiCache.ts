interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class APICache {
  private cache = new Map<string, any>();
  private storage: Storage | null = null;

  constructor() {
    // Try to use localStorage if available
    try {
      this.storage = typeof window !== "undefined" ? window.localStorage : null;
      this.loadFromStorage();
    } catch (error) {
      console.warn("localStorage not available, using memory cache only");
    }
  }

  private loadFromStorage() {
    if (!this.storage) return;

    try {
      const stored = this.storage.getItem("api_cache");
      if (stored) {
        const parsed = JSON.parse(stored);
        this.cache = new Map(Object.entries(parsed));
        this.cleanExpired();
      }
    } catch (error) {
      console.warn("Failed to load cache from storage");
    }
  }

  private saveToStorage() {
    if (!this.storage) return;

    try {
      const obj = Object.fromEntries(this.cache);
      this.storage.setItem("api_cache", JSON.stringify(obj));
    } catch (error) {
      // Storage full or not available, clear some old entries
      this.clearOldEntries();
      try {
        const obj = Object.fromEntries(this.cache);
        this.storage.setItem("api_cache", JSON.stringify(obj));
      } catch {
        // Still failing, disable storage cache
        this.storage = null;
      }
    }
  }

  private cleanExpired() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp + entry.expiry < now) {
        this.cache.delete(key);
      }
    }
  }

  private clearOldEntries() {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    // Remove oldest 30%
    const toRemove = Math.ceil(entries.length * 0.3);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  set<T>(key: string, data: T, expiry: number = 300000): void {
    // 5 minutes default
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiry,
    };

    this.cache.set(key, entry);
    this.saveToStorage();
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (entry.timestamp + entry.expiry < now) {
      this.cache.delete(key);
      this.saveToStorage();
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (entry.timestamp + entry.expiry < now) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  clear(): void {
    this.cache.clear();
    if (this.storage) {
      this.storage.removeItem("api_cache");
    }
  }

  // Get cache stats for debugging
  getStats() {
    return {
      size: this.cache.size,
      hasStorage: !!this.storage,
      entries: Array.from(this.cache.keys()),
    };
  }
}

// Global cache instance
export const apiCache = new APICache();

// Cache-aware fetch function
export async function cachedFetch<T>(
  url: string,
  options: RequestInit = {},
  cacheKey?: string,
  cacheTTL: number = 300000, // 5 minutes
): Promise<T | null> {
  const key = cacheKey || url;

  // Check cache first
  const cached = apiCache.get<T>(key);
  if (cached) {
    console.log("Cache HIT:", key);
    return cached;
  }

  console.log("Cache MISS:", key);

  // Import robustFetch dynamically to avoid circular dependencies
  const { robustFetchJson } = await import("./robustFetch");

  // Fetch fresh data
  const data = await robustFetchJson<T>(url, options);

  // Cache successful responses
  if (data) {
    apiCache.set(key, data, cacheTTL);
  }

  return data;
}

// Preload and cache critical data
export function preloadCriticalData() {
  // Preload hero and form content in parallel
  Promise.all([
    cachedFetch("/api/hero", {}, "hero", 600000), // 10 minutes cache
    cachedFetch("/api/form-content", {}, "form", 600000),
  ]).catch(() => {
    // Silent fail for preload
  });
}
