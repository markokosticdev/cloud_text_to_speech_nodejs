/**
 * @fileoverview In-memory cache management system with TTL, LRU eviction, and comprehensive statistics.
 * Provides high-performance caching for voice data, SSML processing results, and configuration settings
 * with automatic cleanup and memory management for optimal performance in TTS operations.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * 
 * @example Basic cache usage
 * ```typescript
 * import { CacheManager } from './cache_manager.js';
 * 
 * // Create cache with 5-minute TTL and max 500 entries
 * const cache = new CacheManager<string>({
 *   defaultTtl: 300000,
 *   maxSize: 500,
 *   cleanupInterval: 60000
 * });
 * 
 * // Set and get values
 * cache.set('user:123', 'John Doe', 600000); // 10-minute TTL
 * const user = cache.get('user:123'); // Returns 'John Doe'
 * 
 * // Check cache statistics
 * const stats = cache.getStats();
 * console.log(`Hit rate: ${stats.hitRate}%`);
 * ```
 * 
 * @example Cache-aside pattern with voice data
 * ```typescript
 * // Cache voice data with factory function
 * const voiceData = await cache.getOrSet(
 *   'voices:en-US',
 *   async () => await fetchVoicesFromAPI('en-US'),
 *   3600000 // 1 hour TTL
 * );
 * 
 * // Pattern-based invalidation
 * cache.invalidatePattern(/^voices:/); // Clear all voice caches
 * ```
 * 
 * @example Singleton cache instances
 * ```typescript
 * import { CacheInstances } from './cache_manager.js';
 * 
 * // Use pre-configured cache instances
 * const voiceCache = CacheInstances.getVoiceCache();
 * const ssmlCache = CacheInstances.getSsmlCache();
 * const configCache = CacheInstances.getConfigCache();
 * 
 * // Get statistics for all caches
 * const allStats = CacheInstances.getAllStats();
 * console.log(allStats);
 * ```
 */

/**
 * Represents a single cache entry with metadata for TTL, access tracking, and statistics.
 * 
 * @template T - The type of data stored in the cache entry
 * @category Cache Management
 * 
 * @example Cache entry structure
 * ```typescript
 * interface UserCacheEntry extends CacheEntry<User> {
 *   data: User;
 *   timestamp: 1672531200000;
 *   ttl: 300000; // 5 minutes
 *   hits: 15;
 *   lastAccess: 1672531800000;
 * }
 * ```
 */
export interface CacheEntry<T> {
  /** The cached data of type T */
  data: T;
  /** Timestamp when the entry was created (milliseconds since epoch) */
  timestamp: number;
  /** Time-to-live in milliseconds from creation time */
  ttl: number;
  /** Number of times this entry has been accessed */
  hits: number;
  /** Timestamp of the last access (milliseconds since epoch) */
  lastAccess: number;
}

/**
 * Configuration options for cache behavior including TTL, size limits, and cleanup intervals.
 * 
 * @category Cache Management
 * 
 * @example Cache configuration
 * ```typescript
 * const options: CacheOptions = {
 *   defaultTtl: 600000,    // 10 minutes default TTL
 *   maxSize: 1000,         // Maximum 1000 entries
 *   cleanupInterval: 30000 // Cleanup every 30 seconds
 * };
 * ```
 */
export interface CacheOptions {
  /** Default TTL in milliseconds (default: 300000 = 5 minutes) */
  defaultTtl?: number;
  /** Maximum number of entries (default: 1000) */
  maxSize?: number;
  /** Cleanup interval in milliseconds (default: 60000 = 1 minute) */
  cleanupInterval?: number;
}

/**
 * Comprehensive cache statistics including performance metrics and memory usage.
 * 
 * @category Cache Management
 * 
 * @example Reading cache statistics
 * ```typescript
 * const stats = cache.getStats();
 * console.log(`Cache performance:
 *   Size: ${stats.size} entries
 *   Hit rate: ${stats.hitRate}%
 *   Total hits: ${stats.hits}
 *   Total misses: ${stats.misses}
 *   Evictions: ${stats.evictions}
 *   Memory usage: ${(stats.totalMemoryUsage / 1024).toFixed(2)} KB
 * `);
 * ```
 */
export interface CacheStats {
  /** Current number of entries in the cache */
  size: number;
  /** Total number of cache hits */
  hits: number;
  /** Total number of cache misses */
  misses: number;
  /** Total number of entries evicted due to size limits */
  evictions: number;
  /** Hit rate as a percentage (0-100) with 2 decimal places */
  hitRate: number;
  /** Estimated total memory usage in bytes */
  totalMemoryUsage: number;
}

/**
 * High-performance in-memory cache with TTL expiration, LRU eviction, and comprehensive statistics.
 * Features automatic cleanup, memory management, and cache-aside pattern support for optimal
 * performance in TTS voice data, SSML processing, and configuration caching scenarios.
 * 
 * @template T - The type of data to be cached (default: unknown)
 * @category Cache Management
 * 
 * @example Basic cache operations
 * ```typescript
 * const cache = new CacheManager<VoiceData>({
 *   defaultTtl: 300000,  // 5 minutes
 *   maxSize: 500,        // 500 entries max
 *   cleanupInterval: 60000 // Cleanup every minute
 * });
 * 
 * // Store voice data
 * cache.set('voice:en-US-female', voiceData, 600000);
 * 
 * // Retrieve with automatic expiration check
 * const voice = cache.get('voice:en-US-female');
 * 
 * // Check if key exists and is valid
 * if (cache.has('voice:en-US-female')) {
 *   console.log('Voice data is cached and valid');
 * }
 * ```
 * 
 * @example Cache-aside pattern
 * ```typescript
 * // Automatically cache API results
 * const voices = await cache.getOrSet(
 *   'voices:google:en-US',
 *   async () => {
 *     const response = await googleTtsApi.getVoices('en-US');
 *     return response.voices;
 *   },
 *   1800000 // 30 minutes TTL
 * );
 * ```
 * 
 * @example Pattern-based cache invalidation
 * ```typescript
 * // Cache various voice configurations
 * cache.set('voices:google:en-US', googleVoices);
 * cache.set('voices:microsoft:en-US', microsoftVoices);
 * cache.set('voices:amazon:en-US', amazonVoices);
 * 
 * // Invalidate all English US voices
 * const invalidated = cache.invalidatePattern(/^voices:.*:en-US$/);
 * console.log(`Invalidated ${invalidated} voice caches`);
 * ```
 */
export class CacheManager<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>();
  private defaultTtl: number;
  private maxSize: number;
  private cleanupInterval: number;
  private cleanupTimer?: NodeJS.Timeout;
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
  };

  /**
   * Creates a new cache manager with the specified configuration options.
   * 
   * @param options - Cache configuration options
   * 
   * @example Creating a voice cache
   * ```typescript
   * const voiceCache = new CacheManager<VoiceData[]>({
   *   defaultTtl: 1800000,  // 30 minutes for voice data
   *   maxSize: 200,         // 200 voice configurations
   *   cleanupInterval: 300000 // Cleanup every 5 minutes
   * });
   * ```
   */
  constructor(options: CacheOptions = {}) {
    this.defaultTtl = options.defaultTtl || 300000; // 5 minutes default
    this.maxSize = options.maxSize || 1000;
    this.cleanupInterval = options.cleanupInterval || 60000; // 1 minute default
    
    this.startCleanupTimer();
  }

  /**
   * Sets a value in the cache with an optional custom TTL. If the cache is at capacity
   * and the key doesn't exist, the least recently used entry will be evicted.
   * 
   * @param key - The cache key to store the value under
   * @param value - The value to cache
   * @param ttl - Custom TTL in milliseconds (optional, uses defaultTtl if not provided)
   * 
   * @example Setting cache values
   * ```typescript
   * // Use default TTL
   * cache.set('config:tts-settings', config);
   * 
   * // Use custom TTL for temporary data
   * cache.set('session:temp-voice', tempVoice, 60000); // 1 minute
   * 
   * // Cache expensive computation results
   * cache.set('ssml:processed:hash123', processedSsml, 3600000); // 1 hour
   * ```
   */
  set(key: string, value: T, ttl?: number): void {
    const actualTtl = ttl || this.defaultTtl;
    const now = Date.now();
    
    // Check if we need to evict entries
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data: value,
      timestamp: now,
      ttl: actualTtl,
      hits: 0,
      lastAccess: now,
    });
  }

  /**
   * Retrieves a value from the cache. Automatically removes expired entries and
   * updates access statistics for performance monitoring and LRU eviction.
   * 
   * @param key - The cache key to retrieve
   * @returns The cached value or undefined if not found or expired
   * 
   * @example Getting cache values
   * ```typescript
   * // Basic retrieval
   * const voiceData = cache.get('voices:en-US');
   * if (voiceData) {
   *   console.log('Using cached voice data');
   * } else {
   *   console.log('Cache miss - need to fetch from API');
   * }
   * 
   * // Type-safe retrieval
   * const config: TtsConfig | undefined = configCache.get('user:settings');
   * ```
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return undefined;
    }

    const now = Date.now();
    
    // Check if entry has expired
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return undefined;
    }

    // Update access statistics
    entry.hits++;
    entry.lastAccess = now;
    this.stats.hits++;
    
    return entry.data;
  }

  /**
   * Checks if a key exists in the cache and has not expired. Does not update
   * access statistics or affect LRU ordering.
   * 
   * @param key - The cache key to check
   * @returns True if the key exists and is not expired, false otherwise
   * 
   * @example Checking cache presence
   * ```typescript
   * if (cache.has('voices:google:en-US')) {
   *   console.log('Google voices are cached');
   * } else {
   *   console.log('Need to fetch Google voices');
   * }
   * ```
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Removes a specific key from the cache.
   * 
   * @param key - The cache key to delete
   * @returns True if the key existed and was deleted, false otherwise
   * 
   * @example Deleting cache entries
   * ```typescript
   * // Remove specific voice cache
   * cache.delete('voices:en-US:female');
   * 
   * // Remove temporary session data
   * cache.delete(`session:${sessionId}`);
   * ```
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Removes all entries from the cache and resets all statistics.
   * 
   * @example Clearing cache
   * ```typescript
   * // Clear all cached data and reset statistics
   * cache.clear();
   * console.log('Cache cleared and statistics reset');
   * ```
   */
  clear(): void {
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.stats.evictions = 0;
  }

  /**
   * Retrieves comprehensive cache statistics including hit rate, memory usage,
   * and performance metrics for monitoring and optimization.
   * 
   * @returns Complete cache statistics object
   * 
   * @example Monitoring cache performance
   * ```typescript
   * const stats = cache.getStats();
   * 
   * // Log performance metrics
   * console.log(`Cache Performance Report:
   *   Entries: ${stats.size}
   *   Hit Rate: ${stats.hitRate}%
   *   Total Requests: ${stats.hits + stats.misses}
   *   Evictions: ${stats.evictions}
   *   Memory: ${(stats.totalMemoryUsage / 1024 / 1024).toFixed(2)} MB
   * `);
   * 
   * // Alert on poor performance
   * if (stats.hitRate < 70) {
   *   console.warn('Cache hit rate is below 70%, consider increasing TTL');
   * }
   * ```
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
    
    return {
      size: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      evictions: this.stats.evictions,
      hitRate: Math.round(hitRate * 10000) / 100, // Percentage with 2 decimal places
      totalMemoryUsage: this.estimateMemoryUsage(),
    };
  }

  /**
   * Implements the cache-aside pattern by retrieving a value from cache or executing
   * a factory function to generate and cache the value if not found.
   * 
   * @template K - Type extending T for the returned value
   * @param key - The cache key to retrieve or store under
   * @param factory - Async function to generate the value if not cached
   * @param ttl - Optional custom TTL for the new entry
   * @returns Promise resolving to the cached or newly generated value
   * 
   * @example Cache-aside pattern for API calls
   * ```typescript
   * // Cache expensive API calls
   * const voices = await cache.getOrSet(
   *   'voices:google:en-US',
   *   async () => {
   *     console.log('Fetching voices from Google API...');
   *     const response = await googleTtsClient.getVoices('en-US');
   *     return response.voices;
   *   },
   *   1800000 // 30 minutes
   * );
   * 
   * // Cache expensive computations
   * const processedSsml = await ssmlCache.getOrSet(
   *   `ssml:${ssmlHash}`,
   *   async () => await processComplexSsml(rawSsml),
   *   3600000 // 1 hour
   * );
   * ```
   */
  async getOrSet<K extends T>(
    key: string,
    factory: () => Promise<K>,
    ttl?: number
  ): Promise<K> {
    const cached = this.get(key) as K;
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * Removes entries with keys matching the specified pattern. Useful for bulk
   * invalidation of related cache entries.
   * 
   * @param pattern - String or RegExp pattern to match against cache keys
   * @returns Number of entries that were invalidated
   * 
   * @example Pattern-based invalidation
   * ```typescript
   * // Invalidate all voice caches for English locales
   * const count = cache.invalidatePattern(/^voices:.*:en-/);
   * console.log(`Invalidated ${count} English voice caches`);
   * 
   * // Invalidate all user session data
   * cache.invalidatePattern('session:');
   * 
   * // Invalidate provider-specific caches
   * cache.invalidatePattern(/^voices:google:/);
   * ```
   */
  invalidatePattern(pattern: string | RegExp): number {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    let count = 0;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    return count;
  }

  /**
   * Returns an array of all cache keys. Useful for debugging and cache inspection.
   * 
   * @returns Array of all cache keys
   * 
   * @example Inspecting cache keys
   * ```typescript
   * const keys = cache.keys();
   * console.log('Cached keys:', keys);
   * 
   * // Find keys matching pattern
   * const voiceKeys = keys.filter(key => key.startsWith('voices:'));
   * console.log('Voice cache keys:', voiceKeys);
   * ```
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Returns cache entries with their keys for debugging and detailed inspection.
   * 
   * @returns Array of objects containing key and entry data
   * 
   * @example Debugging cache content
   * ```typescript
   * const entries = cache.entries();
   * entries.forEach(({ key, entry }) => {
   *   console.log(`Key: ${key}, Hits: ${entry.hits}, Age: ${Date.now() - entry.timestamp}ms`);
   * });
   * ```
   */
  entries(): Array<{ key: string; entry: CacheEntry<T> }> {
    return Array.from(this.cache.entries()).map(([key, entry]) => ({ key, entry }));
  }

  /**
   * Starts the automatic cleanup timer for removing expired entries.
   * Called automatically during construction.
   * 
   * @private
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  /**
   * Stop cleanup timer
   */
  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }
    
    for (const key of expiredKeys) {
      this.cache.delete(key);
    }
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let lruKey: string | undefined;
    let lruTime = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccess < lruTime) {
        lruTime = entry.lastAccess;
        lruKey = key;
      }
    }
    
    if (lruKey) {
      this.cache.delete(lruKey);
      this.stats.evictions++;
    }
  }

  /**
   * Estimate memory usage (rough calculation)
   */
  private estimateMemoryUsage(): number {
    let size = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      // Rough estimation: key size + JSON string size + metadata
      size += key.length * 2; // UTF-16 characters
      size += JSON.stringify(entry.data).length * 2;
      size += 64; // Estimated metadata size
    }
    
    return size;
  }

  /**
   * Destructor
   */
  destroy(): void {
    this.stopCleanup();
    this.clear();
  }
}

/**
 * Global cache instances for different data types
 */
export class CacheInstances {
  private static voiceCache?: CacheManager;
  private static ssmlCache?: CacheManager;
  private static configCache?: CacheManager;

  static getVoiceCache(): CacheManager {
    if (!this.voiceCache) {
      this.voiceCache = new CacheManager({
        defaultTtl: 1800000, // 30 minutes for voice lists
        maxSize: 100,
        cleanupInterval: 300000, // 5 minutes
      });
    }
    return this.voiceCache;
  }

  static getSsmlCache(): CacheManager {
    if (!this.ssmlCache) {
      this.ssmlCache = new CacheManager({
        defaultTtl: 600000, // 10 minutes for SSML processing
        maxSize: 500,
        cleanupInterval: 120000, // 2 minutes
      });
    }
    return this.ssmlCache;
  }

  static getConfigCache(): CacheManager {
    if (!this.configCache) {
      this.configCache = new CacheManager({
        defaultTtl: 3600000, // 1 hour for configurations
        maxSize: 50,
        cleanupInterval: 600000, // 10 minutes
      });
    }
    return this.configCache;
  }

  /**
   * Clear all caches
   */
  static clearAll(): void {
    this.voiceCache?.clear();
    this.ssmlCache?.clear();
    this.configCache?.clear();
  }

  /**
   * Get combined statistics
   */
  static getAllStats(): Record<string, CacheStats> {
    return {
      voices: this.voiceCache?.getStats() || { size: 0, hits: 0, misses: 0, evictions: 0, hitRate: 0, totalMemoryUsage: 0 },
      ssml: this.ssmlCache?.getStats() || { size: 0, hits: 0, misses: 0, evictions: 0, hitRate: 0, totalMemoryUsage: 0 },
      config: this.configCache?.getStats() || { size: 0, hits: 0, misses: 0, evictions: 0, hitRate: 0, totalMemoryUsage: 0 },
    };
  }

  /**
   * Destroy all caches
   */
  static destroyAll(): void {
    this.voiceCache?.destroy();
    this.ssmlCache?.destroy();
    this.configCache?.destroy();
    this.voiceCache = undefined;
    this.ssmlCache = undefined;
    this.configCache = undefined;
  }
} 