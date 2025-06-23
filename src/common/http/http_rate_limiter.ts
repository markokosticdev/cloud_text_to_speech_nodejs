/**
 * @fileoverview HTTP Rate Limiting System for Multi-Provider TTS Services
 * 
 * This module provides comprehensive rate limiting functionality for Cloud Text-to-Speech
 * operations across Google Cloud TTS, Microsoft Azure TTS, and Amazon Polly. It implements
 * multiple rate limiting algorithms (token bucket and sliding window) with provider-specific
 * configurations, burst support, and automatic quota management.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 */

/**
 * Configuration interface for rate limiting parameters
 * 
 * Defines the rate limiting behavior for a specific TTS provider,
 * including request limits, time windows, and optional burst capacity.
 * Used by rate limiter implementations to enforce provider-specific quotas.
 * 
 * @example Basic Rate Limit Configuration
 * ```typescript
 * import { RateLimitConfig } from 'cloud-text-to-speech';
 * 
 * const config: RateLimitConfig = {
 *   provider: 'google',
 *   maxRequests: 100,
 *   windowMs: 60000,  // 1 minute
 *   burstLimit: 10    // Allow up to 10 rapid requests
 * };
 * ```
 * 
 * @example Provider-Specific Configurations
 * ```typescript
 * const googleConfig: RateLimitConfig = {
 *   provider: 'google',
 *   maxRequests: 100,   // 100 requests per minute
 *   windowMs: 60000,
 *   burstLimit: 10
 * };
 * 
 * const microsoftConfig: RateLimitConfig = {
 *   provider: 'microsoft',
 *   maxRequests: 20,    // 20 requests per second
 *   windowMs: 1000,
 *   burstLimit: 5
 * };
 * ```
 * 
 * @category Common Utilities
 * @since 3.0.0
 */
export interface RateLimitConfig {
  /** Provider identifier (e.g., 'google', 'microsoft', 'amazon') */
  provider: string;
  /** Maximum number of requests allowed in the time window */
  maxRequests: number;
  /** Time window in milliseconds for rate limiting */
  windowMs: number;
  /** Optional burst limit allowing rapid consecutive requests */
  burstLimit?: number;
}

/**
 * Rate limit status information
 * 
 * Provides current rate limiting status including remaining quota,
 * reset timing, and whether the limit has been exceeded. Used to
 * implement intelligent retry logic and quota monitoring.
 * 
 * @example Checking Rate Limit Status
 * ```typescript
 * import { httpRateLimiter, ProviderRateLimits } from 'cloud-text-to-speech';
 * 
 * const status = await httpRateLimiter.checkRateLimit(ProviderRateLimits.google);
 * 
 * if (status.exceeded) {
 *   const waitTime = status.resetTime - Date.now();
 *   console.log(`Rate limit exceeded. Wait ${waitTime}ms before next request`);
 * } else {
 *   console.log(`${status.remaining} requests remaining`);
 * }
 * ```
 * 
 * @category Common Utilities
 * @since 3.0.0
 */
export interface RateLimitStatus {
  /** Number of requests remaining in current window */
  remaining: number;
  /** Timestamp when the rate limit window resets */
  resetTime: number;
  /** Whether the rate limit has been exceeded */
  exceeded: boolean;
}

/**
 * Token bucket algorithm implementation for rate limiting with burst support
 * 
 * Implements the token bucket rate limiting algorithm that allows for burst
 * traffic while maintaining average rate limits. Tokens are added to the bucket
 * at a steady rate, and each request consumes one token. This approach provides
 * flexibility for handling traffic spikes while enforcing long-term rate limits.
 * 
 * @example Basic Token Bucket Usage
 * ```typescript
 * import { TokenBucketRateLimiter, ProviderRateLimits } from 'cloud-text-to-speech';
 * 
 * const limiter = new TokenBucketRateLimiter(ProviderRateLimits.google);
 * 
 * const status = await limiter.checkRateLimit();
 * if (status.exceeded) {
 *   console.log('Rate limit exceeded, please wait');
 * } else {
 *   console.log(`Request allowed, ${status.remaining} requests remaining`);
 * }
 * ```
 * 
 * @example Rate Limiting with Burst Handling
 * ```typescript
 * const config = {
 *   provider: 'custom',
 *   maxRequests: 60,    // 60 requests per minute
 *   windowMs: 60000,
 *   burstLimit: 10      // Allow 10 rapid requests
 * };
 * 
 * const limiter = new TokenBucketRateLimiter(config);
 * 
 * // Make multiple rapid requests (burst)
 * for (let i = 0; i < 5; i++) {
 *   const status = await limiter.checkRateLimit();
 *   console.log(`Burst request ${i + 1}: ${status.exceeded ? 'blocked' : 'allowed'}`);
 * }
 * ```
 * 
 * @example Monitoring Rate Limit Status
 * ```typescript
 * const limiter = new TokenBucketRateLimiter(ProviderRateLimits.microsoft);
 * 
 * setInterval(() => {
 *   const status = limiter.getStatus();
 *   console.log(`Status - Remaining: ${status.remaining}, Reset: ${new Date(status.resetTime)}`);
 * }, 1000);
 * ```
 * 
 * @category Common Utilities
 * @since 3.0.0
 */
export class TokenBucketRateLimiter {
  /** Current number of tokens in the bucket */
  private tokens: number;
  /** Timestamp of last token refill */
  private lastRefill: number;
  /** Rate limiting configuration */
  private readonly config: RateLimitConfig;

  /**
   * Creates a new token bucket rate limiter
   * 
   * Initializes the token bucket with the configured burst limit or max requests,
   * and sets up the refill timing mechanism. The bucket starts full to allow
   * immediate burst traffic if configured.
   * 
   * @param config - Rate limiting configuration
   * 
   * @example
   * ```typescript
   * const limiter = new TokenBucketRateLimiter({
   *   provider: 'google',
   *   maxRequests: 100,
   *   windowMs: 60000,
   *   burstLimit: 10
   * });
   * ```
   */
  constructor(config: RateLimitConfig) {
    this.config = config;
    this.tokens = config.burstLimit || config.maxRequests;
    this.lastRefill = Date.now();
  }

  /**
   * Check if a request is allowed and consume a token if so
   * 
   * Refills tokens based on elapsed time, checks if a token is available,
   * and consumes one token if the request is allowed. Returns detailed
   * status information for monitoring and retry logic.
   * 
   * @returns Promise resolving to current rate limit status
   * 
   * @example Basic Rate Check
   * ```typescript
   * const status = await limiter.checkRateLimit();
   * 
   * if (status.exceeded) {
   *   const waitMs = status.resetTime - Date.now();
   *   throw new Error(`Rate limited. Retry after ${waitMs}ms`);
   * }
   * 
   * // Proceed with request
   * await makeApiCall();
   * ```
   * 
   * @example Rate Limiting with Retry Logic
   * ```typescript
   * async function makeRateLimitedRequest() {
   *   const status = await limiter.checkRateLimit();
   *   
   *   if (status.exceeded) {
   *     const waitTime = Math.max(0, status.resetTime - Date.now());
   *     await new Promise(resolve => setTimeout(resolve, waitTime));
   *     return makeRateLimitedRequest(); // Retry
   *   }
   *   
   *   return await ttsApiCall();
   * }
   * ```
   */
  async checkRateLimit(): Promise<RateLimitStatus> {
    this.refillTokens();
    
    const remaining = Math.floor(this.tokens);
    const resetTime = this.lastRefill + this.config.windowMs;
    const exceeded = this.tokens < 1;

    if (!exceeded) {
      this.tokens -= 1;
    }

    return {
      remaining,
      resetTime,
      exceeded
    };
  }

  /**
   * Refill tokens based on elapsed time
   * 
   * Calculates the number of tokens to add based on the time elapsed
   * since the last refill and the configured rate. Ensures the bucket
   * never exceeds the maximum capacity.
   * 
   * @private
   */
  private refillTokens(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = (timePassed / this.config.windowMs) * this.config.maxRequests;
    
    this.tokens = Math.min(
      this.config.burstLimit || this.config.maxRequests,
      this.tokens + tokensToAdd
    );
    
    this.lastRefill = now;
  }

  /**
   * Get current rate limit status without consuming tokens
   * 
   * Returns the current status information without affecting the token
   * count. Useful for monitoring and displaying rate limit information
   * to users or in dashboards.
   * 
   * @returns Current rate limit status
   * 
   * @example
   * ```typescript
   * const status = limiter.getStatus();
   * console.log(`Available requests: ${status.remaining}`);
   * console.log(`Reset time: ${new Date(status.resetTime)}`);
   * ```
   */
  getStatus(): RateLimitStatus {
    this.refillTokens();
    return {
      remaining: Math.floor(this.tokens),
      resetTime: this.lastRefill + this.config.windowMs,
      exceeded: this.tokens < 1
    };
  }
}

/**
 * Sliding window rate limiter implementation
 * 
 * Implements the sliding window rate limiting algorithm that tracks individual
 * request timestamps within a moving time window. This provides precise rate
 * limiting but requires more memory to store request history. Ideal for
 * scenarios requiring exact request counting and timing.
 * 
 * @example Basic Sliding Window Usage
 * ```typescript
 * import { SlidingWindowRateLimiter } from 'cloud-text-to-speech';
 * 
 * const limiter = new SlidingWindowRateLimiter({
 *   provider: 'microsoft',
 *   maxRequests: 20,
 *   windowMs: 1000  // 20 requests per second
 * });
 * 
 * const status = await limiter.checkRateLimit();
 * console.log(`Precise rate limiting: ${status.remaining} requests remaining`);
 * ```
 * 
 * @example Comparing with Token Bucket
 * ```typescript
 * const config = { provider: 'test', maxRequests: 10, windowMs: 1000 };
 * 
 * const tokenBucket = new TokenBucketRateLimiter(config);
 * const slidingWindow = new SlidingWindowRateLimiter(config);
 * 
 * // Token bucket allows bursts, sliding window is more strict
 * console.log('Token bucket allows burst traffic');
 * console.log('Sliding window provides precise counting');
 * ```
 * 
 * @category Common Utilities
 * @since 3.0.0
 */
export class SlidingWindowRateLimiter {
  /** Array of request timestamps within the current window */
  private requests: number[] = [];
  /** Rate limiting configuration */
  private readonly config: RateLimitConfig;

  /**
   * Creates a new sliding window rate limiter
   * 
   * @param config - Rate limiting configuration
   */
  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Check if a request is allowed using sliding window algorithm
   * 
   * Maintains a sliding window of request timestamps, removes expired
   * requests, and checks if the current request count is within limits.
   * Adds the current request timestamp if allowed.
   * 
   * @returns Promise resolving to current rate limit status
   * 
   * @example Precise Rate Limiting
   * ```typescript
   * async function preciseRateLimit() {
   *   const status = await slidingLimiter.checkRateLimit();
   *   
   *   if (status.exceeded) {
   *     console.log('Exact rate limit reached');
   *     const waitTime = status.resetTime - Date.now();
   *     await new Promise(resolve => setTimeout(resolve, waitTime));
   *   }
   *   
   *   return performTtsOperation();
   * }
   * ```
   */
  async checkRateLimit(): Promise<RateLimitStatus> {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    // Remove old requests outside the window
    this.requests = this.requests.filter(timestamp => timestamp > windowStart);
    
    const remaining = Math.max(0, this.config.maxRequests - this.requests.length);
    const exceeded = this.requests.length >= this.config.maxRequests;
    
    if (!exceeded) {
      this.requests.push(now);
    }

    const oldestRequest = this.requests[0];
    const resetTime = oldestRequest ? oldestRequest + this.config.windowMs : now;

    return {
      remaining,
      resetTime,
      exceeded
    };
  }

  /**
   * Get current rate limit status without adding a request
   * 
   * @returns Current rate limit status
   */
  getStatus(): RateLimitStatus {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    this.requests = this.requests.filter(timestamp => timestamp > windowStart);
    
    const remaining = Math.max(0, this.config.maxRequests - this.requests.length);
    const oldestRequest = this.requests[0];
    const resetTime = oldestRequest ? oldestRequest + this.config.windowMs : now;

    return {
      remaining,
      resetTime,
      exceeded: this.requests.length >= this.config.maxRequests
    };
  }
}

/**
 * Pre-configured rate limit settings for TTS providers
 * 
 * Provides production-ready rate limiting configurations for Google Cloud TTS,
 * Microsoft Azure TTS, and Amazon Polly based on their documented API limits.
 * These configurations include appropriate burst limits and are regularly
 * updated to match provider specifications.
 * 
 * @example Using Provider Rate Limits
 * ```typescript
 * import { ProviderRateLimits, TokenBucketRateLimiter } from 'cloud-text-to-speech';
 * 
 * // Use Google's rate limits
 * const googleLimiter = new TokenBucketRateLimiter(ProviderRateLimits.google);
 * 
 * // Use Microsoft's rate limits
 * const microsoftLimiter = new TokenBucketRateLimiter(ProviderRateLimits.microsoft);
 * 
 * // Use Amazon's rate limits
 * const amazonLimiter = new TokenBucketRateLimiter(ProviderRateLimits.amazon);
 * ```
 * 
 * @example Dynamic Provider Selection
 * ```typescript
 * function createLimiterForProvider(provider: 'google' | 'microsoft' | 'amazon') {
 *   const config = ProviderRateLimits[provider];
 *   return new TokenBucketRateLimiter(config);
 * }
 * 
 * const limiter = createLimiterForProvider('google');
 * ```
 * 
 * @category Common Utilities
 * @since 3.0.0
 */
export const ProviderRateLimits = {
  /** 
   * Google Cloud Text-to-Speech rate limits
   * - 100 requests per minute with 10 request burst capacity
   */
  google: {
    provider: 'google',
    maxRequests: 100,
    windowMs: 60000, // 1 minute
    burstLimit: 10
  } as RateLimitConfig,
  
  /** 
   * Microsoft Azure Text-to-Speech rate limits
   * - 20 requests per second with 5 request burst capacity
   */
  microsoft: {
    provider: 'microsoft',
    maxRequests: 20,
    windowMs: 1000, // 1 second
    burstLimit: 5
  } as RateLimitConfig,
  
  /** 
   * Amazon Polly Text-to-Speech rate limits
   * - 80 requests per minute with 10 request burst capacity
   */
  amazon: {
    provider: 'amazon',
    maxRequests: 80,
    windowMs: 60000, // 1 minute
    burstLimit: 10
  } as RateLimitConfig
};

/**
 * Multi-provider HTTP rate limiter manager
 * 
 * Manages rate limiters for multiple TTS providers with support for different
 * algorithms (token bucket and sliding window). Maintains separate limiter
 * instances for each provider and algorithm combination, ensuring proper
 * isolation and optimal performance.
 * 
 * @example Multi-Provider Rate Limiting
 * ```typescript
 * import { HttpRateLimiter, ProviderRateLimits } from 'cloud-text-to-speech';
 * 
 * const rateLimiter = new HttpRateLimiter();
 * 
 * // Check Google rate limit
 * const googleStatus = await rateLimiter.checkRateLimit(
 *   ProviderRateLimits.google, 
 *   'token-bucket'
 * );
 * 
 * // Check Microsoft rate limit
 * const microsoftStatus = await rateLimiter.checkRateLimit(
 *   ProviderRateLimits.microsoft, 
 *   'sliding-window'
 * );
 * ```
 * 
 * @example Algorithm Comparison
 * ```typescript
 * const rateLimiter = new HttpRateLimiter();
 * const config = ProviderRateLimits.google;
 * 
 * // Token bucket - allows bursts
 * const tokenStatus = await rateLimiter.checkRateLimit(config, 'token-bucket');
 * 
 * // Sliding window - precise counting
 * const windowStatus = await rateLimiter.checkRateLimit(config, 'sliding-window');
 * 
 * console.log('Token bucket remaining:', tokenStatus.remaining);
 * console.log('Sliding window remaining:', windowStatus.remaining);
 * ```
 * 
 * @example Rate Limiter Cleanup
 * ```typescript
 * const rateLimiter = new HttpRateLimiter();
 * 
 * // Use rate limiter for operations...
 * 
 * // Clean up when done
 * rateLimiter.clear();
 * console.log('All rate limiters cleared');
 * ```
 * 
 * @category Common Utilities
 * @since 3.0.0
 */
export class HttpRateLimiter {
  /** Map of provider/algorithm combinations to rate limiter instances */
  private limiters = new Map<string, TokenBucketRateLimiter | SlidingWindowRateLimiter>();

  /**
   * Get or create a rate limiter for the specified configuration and algorithm
   * 
   * Returns an existing rate limiter instance if available, or creates a new
   * one for the provider/algorithm combination. This ensures efficient
   * resource usage and proper rate limit tracking.
   * 
   * @param config - Rate limiting configuration
   * @param algorithm - Rate limiting algorithm to use
   * @returns Rate limiter instance
   * 
   * @example
   * ```typescript
   * const limiter = rateLimiter.getRateLimiter(
   *   ProviderRateLimits.google, 
   *   'token-bucket'
   * );
   * const status = await limiter.checkRateLimit();
   * ```
   */
  getRateLimiter(config: RateLimitConfig, algorithm: 'token-bucket' | 'sliding-window' = 'token-bucket'): TokenBucketRateLimiter | SlidingWindowRateLimiter {
    const key = `${config.provider}_${algorithm}`;
    
    if (!this.limiters.has(key)) {
      const limiter = algorithm === 'token-bucket' 
        ? new TokenBucketRateLimiter(config)
        : new SlidingWindowRateLimiter(config);
      this.limiters.set(key, limiter);
    }
    
    return this.limiters.get(key)!;
  }

  /**
   * Check rate limit for a provider using specified algorithm
   * 
   * Convenience method that gets the appropriate rate limiter and checks
   * if a request is allowed. Automatically manages limiter instances and
   * provides a simple interface for rate limiting operations.
   * 
   * @param config - Rate limiting configuration
   * @param algorithm - Rate limiting algorithm to use
   * @returns Promise resolving to rate limit status
   * 
   * @example Multi-Provider Rate Checking
   * ```typescript
   * const rateLimiter = new HttpRateLimiter();
   * 
   * // Check multiple providers
   * const results = await Promise.all([
   *   rateLimiter.checkRateLimit(ProviderRateLimits.google),
   *   rateLimiter.checkRateLimit(ProviderRateLimits.microsoft),
   *   rateLimiter.checkRateLimit(ProviderRateLimits.amazon)
   * ]);
   * 
   * results.forEach((status, index) => {
   *   const provider = ['google', 'microsoft', 'amazon'][index];
   *   console.log(`${provider}: ${status.exceeded ? 'blocked' : 'allowed'}`);
   * });
   * ```
   */
  async checkRateLimit(config: RateLimitConfig, algorithm: 'token-bucket' | 'sliding-window' = 'token-bucket'): Promise<RateLimitStatus> {
    const limiter = this.getRateLimiter(config, algorithm);
    return await limiter.checkRateLimit();
  }

  /**
   * Get rate limit status without consuming quota
   * 
   * @param config - Rate limiting configuration
   * @param algorithm - Rate limiting algorithm to use
   * @returns Current rate limit status
   */
  getStatus(config: RateLimitConfig, algorithm: 'token-bucket' | 'sliding-window' = 'token-bucket'): RateLimitStatus {
    const limiter = this.getRateLimiter(config, algorithm);
    return limiter.getStatus();
  }

  /**
   * Clear all rate limiter instances
   * 
   * Removes all cached rate limiter instances, effectively resetting
   * all rate limiting state. Useful for testing or when reconfiguring
   * the application.
   */
  clear(): void {
    this.limiters.clear();
  }
}

/**
 * Singleton HTTP rate limiter instance for global use
 * 
 * Pre-configured rate limiter instance that can be used throughout the
 * application without manual instantiation. Provides convenient access
 * to rate limiting functionality with automatic instance management.
 * 
 * @example Using Singleton Rate Limiter
 * ```typescript
 * import { httpRateLimiter, ProviderRateLimits } from 'cloud-text-to-speech';
 * 
 * // Use directly without instantiation
 * const status = await httpRateLimiter.checkRateLimit(ProviderRateLimits.google);
 * 
 * if (status.exceeded) {
 *   console.log('Rate limit exceeded');
 * } else {
 *   console.log('Request allowed');
 * }
 * ```
 * 
 * @example Global Rate Limit Monitoring
 * ```typescript
 * setInterval(async () => {
 *   const googleStatus = httpRateLimiter.getStatus(ProviderRateLimits.google);
 *   const microsoftStatus = httpRateLimiter.getStatus(ProviderRateLimits.microsoft);
 *   const amazonStatus = httpRateLimiter.getStatus(ProviderRateLimits.amazon);
 *   
 *   console.log('Rate Limits - Google:', googleStatus.remaining, 
 *               'Microsoft:', microsoftStatus.remaining,
 *               'Amazon:', amazonStatus.remaining);
 * }, 5000);
 * ```
 * 
 * @category Common Utilities
 * @since 3.0.0
 */
export const httpRateLimiter = new HttpRateLimiter(); 