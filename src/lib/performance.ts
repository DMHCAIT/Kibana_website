// Performance optimization hooks and utilities
// This file provides optimized versions of API calls with caching and optimistic updates

import { useCallback, useRef } from "react";

/**
 * Simple response cache for GET requests
 * Stores responses for 5 minutes by default
 */
export class ResponseCache {
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private ttl = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: unknown) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  clear() {
    this.cache.clear();
  }

  invalidate(pattern: string) {
    Array.from(this.cache.keys())
      .filter(key => key.includes(pattern))
      .forEach(key => this.cache.delete(key));
  }
}

// Global cache instance
export const apiCache = new ResponseCache();

/**
 * Debounce hook to prevent rapid consecutive calls
 */
export function useDebounce<T extends (...args: unknown[]) => Promise<unknown>>(
  callback: T,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

/**
 * Hook for cached API calls with request deduplication
 */
export function useCachedFetch() {
  const pendingRequests = useRef(new Map<string, Promise<unknown>>());

  const cachedFetch = useCallback(
    async <T,>(
      url: string,
      options?: RequestInit,
      cacheKey?: string
    ): Promise<T> => {
      const key = cacheKey || url;

      // Check cache first
      const cached = apiCache.get(key);
      if (cached) return cached as T;

      // Check if request is already in flight
      if (pendingRequests.current.has(key)) {
        return pendingRequests.current.get(key)! as Promise<T>;
      }

      // Create new request
      const promise = fetch(url, options)
        .then(res => res.json())
        .finally(() => pendingRequests.current.delete(key));

      pendingRequests.current.set(key, promise);
      const result = await promise;

      // Only cache successful responses
      if (result && !result.error) {
        apiCache.set(key, result);
      }

      return result;
    },
    []
  );

  return { cachedFetch, clearCache: () => apiCache.clear() };
}

/**
 * Batch multiple requests together for better performance
 */
export async function batchRequests<T>(
  requests: Array<() => Promise<T>>
): Promise<T[]> {
  return Promise.all(requests.map(req => req()));
}

/**
 * Optimistic update helper
 * Updates UI immediately while request completes in background
 */
export function useOptimisticUpdate<T>(
  currentValue: T,
  setCurrentValue: (value: T) => void
) {
  return useCallback(
    async (
      optimisticValue: T,
      updateFn: () => Promise<T | { error?: string }>
    ) => {
      // 1. Update UI immediately (optimistic)
      setCurrentValue(optimisticValue);

      // 2. Make request in background
      try {
        const result = await updateFn();
        if (!result || (typeof result === "object" && "error" in result)) {
          // Revert on error
          setCurrentValue(currentValue);
          return result || { error: "Update failed" };
        } else {
          // Confirm with server response
          setCurrentValue(result as T);
          return { success: true };
        }
      } catch {
        // Revert on error
        setCurrentValue(currentValue);
        return { error: "Failed to update" };
      }
    },
    [currentValue, setCurrentValue]
  );
}

/**
 * Prefetch hook - load data in background before user needs it
 */
export function usePrefetch() {
  return useCallback(async (url: string, options?: RequestInit) => {
    try {
      const cached = apiCache.get(url);
      if (!cached) {
        const response = await fetch(url, options);
        const data = await response.json();
        apiCache.set(url, data);
      }
    } catch {
      // Silent fail - this is prefetch
    }
  }, []);
}

/**
 * Parallel request executor
 * Execute multiple requests simultaneously and wait for all
 */
export async function executeInParallel<T>(
  requests: Array<Promise<T>>
): Promise<T[]> {
  return Promise.all(requests);
}

/**
 * Race multiple strategies - use fastest response
 */
export async function raceStrategies<T>(
  strategies: Array<() => Promise<T>>
): Promise<T> {
  return Promise.race(strategies.map(s => s()));
}
