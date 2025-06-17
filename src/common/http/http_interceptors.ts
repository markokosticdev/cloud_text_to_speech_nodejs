import { AxiosInstance, AxiosRequestConfig, AxiosError, AxiosHeaders } from 'axios';
import { RateLimitConfig, RateLimitStatus, httpRateLimiter } from './http_rate_limiter.js';
import { TtsError, TtsErrorCode, TtsRateLimitError, TtsNetworkError, TtsAuthenticationError, TtsErrorContext } from '../errors/tts_error.js';

/**
 * Rate limiting interceptor for HTTP clients
 */
export class RateLimitInterceptor {
  private config: RateLimitConfig;
  private algorithm: 'token-bucket' | 'sliding-window';

  constructor(config: RateLimitConfig, algorithm: 'token-bucket' | 'sliding-window' = 'token-bucket') {
    this.config = config;
    this.algorithm = algorithm;
  }

  /**
   * Install rate limiting interceptor on axios instance
   */
  install(client: AxiosInstance): void {
    client.interceptors.request.use(
      async (config) => {
        const status = await httpRateLimiter.checkRateLimit(this.config, this.algorithm);
        
        if (status.exceeded) {
          const waitTime = status.resetTime - Date.now();
          throw new TtsRateLimitError(
            `Rate limit exceeded for ${this.config.provider}. Please wait ${Math.ceil(waitTime / 1000)} seconds.`,
            this.config.provider,
            waitTime,
            {
              httpStatus: 429,
              details: {
                maxRequests: this.config.maxRequests,
                windowMs: this.config.windowMs,
                remaining: status.remaining,
                resetTime: status.resetTime
              }
            }
          );
        }

        // Add rate limit headers to request for tracking
        if (!config.headers) {
          config.headers = new AxiosHeaders();
        }
        config.headers['X-RateLimit-Provider'] = this.config.provider;
        config.headers['X-RateLimit-Remaining'] = status.remaining.toString();
        
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  /**
   * Get current rate limit status
   */
  getStatus(): RateLimitStatus {
    return httpRateLimiter.getStatus(this.config, this.algorithm);
  }
}

/**
 * Error handling interceptor for HTTP clients
 */
export class ErrorHandlingInterceptor {
  private provider: string;

  constructor(provider: string) {
    this.provider = provider;
  }

  /**
   * Install error handling interceptor on axios instance
   */
  install(client: AxiosInstance): void {
    client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const enhancedError = this.enhanceError(error);
        return Promise.reject(enhancedError);
      }
    );
  }

  private enhanceError(error: AxiosError): TtsError {
    const response = error.response;
    const status = response?.status || 0;
    const statusText = response?.statusText || 'Unknown Error';

    // Extract retry-after header if present
    const retryAfter = response?.headers['retry-after'];
    const retryAfterMs = retryAfter ? parseInt(retryAfter) * 1000 : undefined;

    // Create context object with additional information
    const context: TtsErrorContext = {
      httpStatus: status,
      originalError: error,
      requestId: error.config?.url,
      timestamp: Date.now(),
      details: {
        requestUrl: error.config?.url,
        requestMethod: error.config?.method?.toUpperCase(),
        headers: response?.headers
      }
    };

    // Map HTTP status codes to appropriate TTS error types
    switch (status) {
      case 401:
      case 403:
        return new TtsAuthenticationError(
          `Authentication failed: ${statusText}`,
          this.provider,
          context
        );

      case 429:
        return new TtsRateLimitError(
          `Rate limit exceeded: ${statusText}`,
          this.provider,
          retryAfterMs,
          context
        );

      case 400:
      case 422:
        return new TtsError(
          `Invalid request: ${statusText}`,
          TtsErrorCode.BAD_REQUEST,
          {
            provider: this.provider,
            retryable: false,
            context
          }
        );

      case 500:
      case 502:
      case 503:
      case 504:
        return new TtsError(
          `Server error: ${statusText}`,
          TtsErrorCode.INTERNAL_ERROR,
          {
            provider: this.provider,
            retryable: true,
            context
          }
        );

      case 0:
      case undefined:
        // Network errors (no response received)
        return new TtsNetworkError(
          `Network error: ${error.message}`,
          this.provider,
          context
        );

      default:
        return new TtsError(
          `HTTP error ${status}: ${statusText}`,
          TtsErrorCode.UNKNOWN_ERROR,
          {
            provider: this.provider,
            retryable: status >= 500,
            context
          }
        );
    }
  }
}

/**
 * Retry interceptor with exponential backoff
 */
export class RetryInterceptor {
  private maxRetries: number;
  private initialDelay: number;
  private maxDelay: number;
  private backoffMultiplier: number;
  private enableJitter: boolean;

  constructor({
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    enableJitter = true
  }: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
    enableJitter?: boolean;
  } = {}) {
    this.maxRetries = maxRetries;
    this.initialDelay = initialDelay;
    this.maxDelay = maxDelay;
    this.backoffMultiplier = backoffMultiplier;
    this.enableJitter = enableJitter;
  }

  /**
   * Install retry interceptor on axios instance
   */
  install(client: AxiosInstance): void {
    client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as AxiosRequestConfig & { __retryCount?: number };
        
        if (!config || !this.shouldRetry(error)) {
          return Promise.reject(error);
        }

        config.__retryCount = config.__retryCount || 0;

        if (config.__retryCount >= this.maxRetries) {
          return Promise.reject(error);
        }

        config.__retryCount++;

        const delay = this.calculateDelay(config.__retryCount);
        await this.sleep(delay);

        return client(config);
      }
    );
  }

  private shouldRetry(error: AxiosError): boolean {
    if (!error.response) {
      return true; // Retry network errors
    }

    const status = error.response.status;
    
    // Retry for specific HTTP status codes
    return status === 429 || // Rate limit
           status === 500 || // Internal server error
           status === 502 || // Bad gateway
           status === 503 || // Service unavailable
           status === 504;   // Gateway timeout
  }

  private calculateDelay(attempt: number): number {
    let delay = this.initialDelay * Math.pow(this.backoffMultiplier, attempt - 1);
    delay = Math.min(delay, this.maxDelay);

    if (this.enableJitter) {
      // Add jitter: random value between 0.5x and 1.5x the calculated delay
      const jitter = 0.5 + Math.random();
      delay *= jitter;
    }

    return Math.floor(delay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * HTTP client enhancer that applies multiple interceptors
 */
export class HttpClientEnhancer {
  static enhance(
    client: AxiosInstance,
    provider: string,
    options: {
      rateLimiting?: RateLimitConfig;
      rateLimitAlgorithm?: 'token-bucket' | 'sliding-window';
      errorHandling?: boolean;
      retry?: {
        maxRetries?: number;
        initialDelay?: number;
        maxDelay?: number;
        backoffMultiplier?: number;
        enableJitter?: boolean;
      };
    } = {}
  ): AxiosInstance {
    // Apply rate limiting interceptor if configured
    if (options.rateLimiting) {
      const rateLimitInterceptor = new RateLimitInterceptor(
        options.rateLimiting,
        options.rateLimitAlgorithm
      );
      rateLimitInterceptor.install(client);
    }

    // Apply retry interceptor if configured
    if (options.retry) {
      const retryInterceptor = new RetryInterceptor(options.retry);
      retryInterceptor.install(client);
    }

    // Apply error handling interceptor if enabled
    if (options.errorHandling !== false) {
      const errorInterceptor = new ErrorHandlingInterceptor(provider);
      errorInterceptor.install(client);
    }

    return client;
  }
} 