export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  lastAccess: number;
}

export interface CacheOptions {
  defaultTtl?: number; // Default TTL in milliseconds
  maxSize?: number; // Maximum number of entries
  cleanupInterval?: number; // Cleanup interval in milliseconds
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  evictions: number;
  hitRate: number;
  totalMemoryUsage: number;
}

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

  constructor(options: CacheOptions = {}) {
    this.defaultTtl = options.defaultTtl || 300000; // 5 minutes default
    this.maxSize = options.maxSize || 1000;
    this.cleanupInterval = options.cleanupInterval || 60000; // 1 minute default
    
    this.startCleanupTimer();
  }

  /**
   * Set a value in the cache
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
   * Get a value from the cache
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
   * Check if a key exists and is not expired
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
   * Delete a specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.stats.evictions = 0;
  }

  /**
   * Get cache statistics
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
   * Get or set with factory function (cache-aside pattern)
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
   * Invalidate entries matching a pattern
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
   * Get all keys in cache
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache entries for debugging
   */
  entries(): Array<{ key: string; entry: CacheEntry<T> }> {
    return Array.from(this.cache.entries()).map(([key, entry]) => ({ key, entry }));
  }

  /**
   * Start cleanup timer
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