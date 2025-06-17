export interface RateLimitConfig {
  provider: string;
  maxRequests: number;
  windowMs: number;
  burstLimit?: number;
}

export interface RateLimitStatus {
  remaining: number;
  resetTime: number;
  exceeded: boolean;
}

/**
 * Token bucket algorithm for rate limiting with burst support
 */
export class TokenBucketRateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.tokens = config.burstLimit || config.maxRequests;
    this.lastRefill = Date.now();
  }

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
 * Sliding window rate limiter
 */
export class SlidingWindowRateLimiter {
  private requests: number[] = [];
  private readonly config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

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
 * Provider-specific rate limit configurations
 */
export const ProviderRateLimits = {
  google: {
    provider: 'google',
    maxRequests: 100,
    windowMs: 60000, // 1 minute
    burstLimit: 10
  } as RateLimitConfig,
  
  microsoft: {
    provider: 'microsoft',
    maxRequests: 20,
    windowMs: 1000, // 1 second
    burstLimit: 5
  } as RateLimitConfig,
  
  amazon: {
    provider: 'amazon',
    maxRequests: 80,
    windowMs: 60000, // 1 minute
    burstLimit: 10
  } as RateLimitConfig
};

/**
 * Http rate limiter managing multiple providers
 */
export class HttpRateLimiter {
  private limiters = new Map<string, TokenBucketRateLimiter | SlidingWindowRateLimiter>();

  getRateLimiter(config: RateLimitConfig, algorithm: 'token-bucket' | 'sliding-window' = 'token-bucket') {
    const key = `${config.provider}_${algorithm}`;
    
    if (!this.limiters.has(key)) {
      const limiter = algorithm === 'token-bucket' 
        ? new TokenBucketRateLimiter(config)
        : new SlidingWindowRateLimiter(config);
      this.limiters.set(key, limiter);
    }
    
    return this.limiters.get(key)!;
  }

  async checkRateLimit(config: RateLimitConfig, algorithm: 'token-bucket' | 'sliding-window' = 'token-bucket'): Promise<RateLimitStatus> {
    const limiter = this.getRateLimiter(config, algorithm);
    return await limiter.checkRateLimit();
  }

  getStatus(config: RateLimitConfig, algorithm: 'token-bucket' | 'sliding-window' = 'token-bucket'): RateLimitStatus {
    const limiter = this.getRateLimiter(config, algorithm);
    return limiter.getStatus();
  }

  clear(): void {
    this.limiters.clear();
  }
}

// Export singleton instance
export const httpRateLimiter = new HttpRateLimiter(); 