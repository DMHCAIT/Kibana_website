/**
 * Database Query Retry Wrapper
 * Automatically retries failed queries with exponential backoff
 */

interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelayMs: 100,
  maxDelayMs: 2000,
  backoffMultiplier: 2,
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | unknown;
  let delayMs = config.initialDelayMs;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === config.maxAttempts) {
        // Last attempt failed, throw error
        console.error(
          `❌ Query failed after ${config.maxAttempts} attempts:`,
          error instanceof Error ? error.message : error,
        );
        throw error;
      }

      // Calculate delay for next attempt with exponential backoff
      const nextDelay = Math.min(delayMs * config.backoffMultiplier, config.maxDelayMs);

      console.warn(
        `⚠️ Query attempt ${attempt} failed, retrying in ${delayMs}ms...`,
        error instanceof Error ? error.message : error,
      );

      await sleep(delayMs);
      delayMs = nextDelay;
    }
  }

  // Should never reach here, but just in case
  throw lastError || new Error("Query failed after all retry attempts");
}

/**
 * Batch retry for multiple queries
 */
export async function withBatchRetry<T>(
  fns: Array<() => Promise<T>>,
  options: RetryOptions = {},
): Promise<T[]> {
  return Promise.all(fns.map((fn) => withRetry(fn, options)));
}

/**
 * Circuit breaker pattern for database operations
 * Prevents cascading failures by temporarily stopping requests
 */
class CircuitBreaker {
  private state: "closed" | "open" | "half-open" = "closed";
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private readonly failureThreshold: number;
  private readonly successThreshold: number;
  private readonly timeout: number;

  constructor(
    failureThreshold = 5,
    successThreshold = 2,
    timeout = 60000, // 1 minute
  ) {
    this.failureThreshold = failureThreshold;
    this.successThreshold = successThreshold;
    this.timeout = timeout;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if we should attempt to recover
    if (this.state === "open") {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure > this.timeout) {
        console.log("🔄 Circuit breaker: Attempting recovery (half-open state)");
        this.state = "half-open";
        this.successCount = 0;
      } else {
        throw new Error("Circuit breaker is open. Database service unavailable.");
      }
    }

    try {
      const result = await fn();

      // Success - update state
      if (this.state === "half-open") {
        this.successCount += 1;
        if (this.successCount >= this.successThreshold) {
          console.log("✅ Circuit breaker: Recovered (closed state)");
          this.state = "closed";
          this.failureCount = 0;
          this.successCount = 0;
        }
      } else if (this.state === "closed") {
        this.failureCount = 0;
      }

      return result;
    } catch (error) {
      this.failureCount += 1;
      this.lastFailureTime = Date.now();

      if (this.state === "closed" && this.failureCount >= this.failureThreshold) {
        console.error(`🚨 Circuit breaker opened after ${this.failureThreshold} failures`);
        this.state = "open";
      }

      throw error;
    }
  }

  getState(): string {
    return `Circuit Breaker: ${this.state} (failures: ${this.failureCount}, successes: ${this.successCount})`;
  }
}

export const dbCircuitBreaker = new CircuitBreaker(5, 2, 60000);
