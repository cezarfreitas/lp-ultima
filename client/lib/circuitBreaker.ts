interface CircuitBreakerState {
  state: "CLOSED" | "OPEN" | "HALF_OPEN";
  failureCount: number;
  lastFailureTime: number;
  successCount: number;
}

class CircuitBreaker {
  private states: Map<string, CircuitBreakerState> = new Map();
  private readonly failureThreshold = 5;
  private readonly timeout = 60000; // 1 minute
  private readonly monitoringPeriod = 30000; // 30 seconds

  constructor() {
    // Clear old states periodically
    setInterval(() => {
      const now = Date.now();
      for (const [key, state] of this.states.entries()) {
        if (now - state.lastFailureTime > this.timeout * 2) {
          this.states.delete(key);
        }
      }
    }, this.monitoringPeriod);
  }

  private getState(endpoint: string): CircuitBreakerState {
    if (!this.states.has(endpoint)) {
      this.states.set(endpoint, {
        state: "CLOSED",
        failureCount: 0,
        lastFailureTime: 0,
        successCount: 0,
      });
    }
    return this.states.get(endpoint)!;
  }

  async execute<T>(
    endpoint: string,
    operation: () => Promise<T>,
  ): Promise<T | null> {
    const state = this.getState(endpoint);
    const now = Date.now();

    // If circuit is OPEN, check if timeout has passed
    if (state.state === "OPEN") {
      if (now - state.lastFailureTime < this.timeout) {
        console.warn(`Circuit breaker OPEN for ${endpoint}, skipping request`);
        return null;
      } else {
        // Move to HALF_OPEN state
        state.state = "HALF_OPEN";
        state.successCount = 0;
      }
    }

    try {
      const result = await operation();

      // Success - reset or improve state
      if (state.state === "HALF_OPEN") {
        state.successCount++;
        if (state.successCount >= 2) {
          // Back to CLOSED state
          state.state = "CLOSED";
          state.failureCount = 0;
        }
      } else {
        state.failureCount = Math.max(0, state.failureCount - 1);
      }

      return result;
    } catch (error) {
      // Failure - increment failure count
      state.failureCount++;
      state.lastFailureTime = now;

      if (state.failureCount >= this.failureThreshold) {
        state.state = "OPEN";
        console.warn(
          `Circuit breaker opened for ${endpoint} after ${state.failureCount} failures`,
        );
      }

      throw error;
    }
  }

  isOpen(endpoint: string): boolean {
    const state = this.getState(endpoint);
    return (
      state.state === "OPEN" &&
      Date.now() - state.lastFailureTime < this.timeout
    );
  }

  getStats(endpoint: string) {
    const state = this.getState(endpoint);
    return {
      state: state.state,
      failureCount: state.failureCount,
      isOpen: this.isOpen(endpoint),
    };
  }
}

// Global circuit breaker instance
export const circuitBreaker = new CircuitBreaker();

// Helper function to use circuit breaker with silentFetch
export async function protectedFetch<T>(
  endpoint: string,
  operation: () => Promise<T>,
): Promise<T | null> {
  if (circuitBreaker.isOpen(endpoint)) {
    return null;
  }

  try {
    return await circuitBreaker.execute(endpoint, operation);
  } catch (error) {
    return null;
  }
}
