// Global performance middleware
// Adds caching headers and optimizations to all responses

export function addPerformanceHeaders(response: Response): Response {
  const newResponse = new Response(response.body, response);

  // Set appropriate cache headers based on content type
  const contentType = newResponse.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    // API responses: cache for 1 minute
    newResponse.headers.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
  } else if (contentType.includes("text/html")) {
    // HTML: cache for 30 seconds, allow stale content for up to 5 minutes
    newResponse.headers.set("Cache-Control", "public, max-age=30, stale-while-revalidate=300");
  } else if (contentType.includes("text/css") || contentType.includes("application/javascript")) {
    // CSS/JS: cache for 30 days (versioned)
    newResponse.headers.set("Cache-Control", "public, max-age=2592000, immutable");
  } else if (contentType.includes("image")) {
    // Images: cache for 30 days
    newResponse.headers.set("Cache-Control", "public, max-age=2592000, immutable");
  } else {
    // Default: cache for 1 hour
    newResponse.headers.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  }

  // Add performance headers
  newResponse.headers.set("X-Content-Type-Options", "nosniff");
  newResponse.headers.set("X-Frame-Options", "SAMEORIGIN");
  newResponse.headers.set("X-XSS-Protection", "1; mode=block");

  // Enable compression
  newResponse.headers.set("Content-Encoding", "gzip");

  return newResponse;
}

/**
 * Request optimization utilities
 */
export const RequestOptimizations = {
  /**
   * Deduplicate identical concurrent requests
   */
  deduplicateRequests: (() => {
    const pendingRequests = new Map<string, Promise<any>>();

    return async <T,>(
      key: string,
      fetcher: () => Promise<T>
    ): Promise<T> => {
      if (pendingRequests.has(key)) {
        return pendingRequests.get(key)!;
      }

      const promise = fetcher().finally(() => {
        pendingRequests.delete(key);
      });

      pendingRequests.set(key, promise);
      return promise;
    };
  })(),

  /**
   * Batch multiple requests to reduce overhead
   */
  batchRequests: async <T,>(
    requests: Array<() => Promise<T>>,
    batchSize = 5
  ): Promise<T[]> => {
    const results: T[] = [];
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(req => req()));
      results.push(...batchResults);
    }
    return results;
  },

  /**
   * Timeout for requests - fail fast if too slow
   */
  withTimeout: async <T,>(
    promise: Promise<T>,
    ms: number,
    fallback?: T
  ): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((resolve, reject) =>
        setTimeout(
          () => {
            if (fallback !== undefined) {
              resolve(fallback);
            } else {
              reject(new Error(`Request timeout after ${ms}ms`));
            }
          },
          ms
        )
      ),
    ]);
  },
};

/**
 * Response optimization
 */
export const ResponseOptimizations = {
  /**
   * Compress response data
   */
  compressJSON: (data: any): string => {
    return JSON.stringify(data);
  },

  /**
   * Optimize JSON response size
   */
  minifyJSON: (data: any): any => {
    // Remove null values
    if (Array.isArray(data)) {
      return data.map(item => ResponseOptimizations.minifyJSON(item));
    }
    if (typeof data === "object" && data !== null) {
      const minimized: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (value !== null && value !== undefined) {
          minimized[key] = ResponseOptimizations.minifyJSON(value);
        }
      }
      return minimized;
    }
    return data;
  },
};
