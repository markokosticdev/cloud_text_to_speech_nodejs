/**
 * @fileoverview HTTP Interceptors for Cloud Text-to-Speech Services
 * 
 * This module provides a comprehensive set of HTTP interceptors for handling
 * rate limiting, error processing, and automatic retry logic across all TTS providers.
 * The interceptors integrate with Axios to provide seamless error handling,
 * rate limit enforcement, and intelligent retry mechanisms with exponential backoff.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link HttpRateLimiter} for rate limiting implementation
 * @see {@link TtsError} for error handling system
 * 
 * @example Basic interceptor setup
 * ```typescript
 * import axios from 'axios';
 * import { HttpClientEnhancer, ProviderRateLimits } from 'cloud-text-to-speech';
 * 
 * const client = axios.create({
 *   baseURL: 'https://api.example.com'
 * });
 * 
 * // Enhance client with all interceptors
 * const enhancedClient = HttpClientEnhancer.enhance(client, 'google', {
 *   rateLimiting: ProviderRateLimits.google,
 *   errorHandling: true,
 *   retry: {
 *     maxRetries: 3,
 *     initialDelay: 1000
 *   }
 * });
 * 
 * // Use enhanced client for TTS requests
 * const response = await enhancedClient.post('/synthesize', { text: 'Hello world' });
 * ```
 * 
 * @example Manual interceptor installation
 * ```typescript
 * import { RateLimitInterceptor, ErrorHandlingInterceptor, RetryInterceptor } from 'cloud-text-to-speech';
 * 
 * const rateLimiter = new RateLimitInterceptor(ProviderRateLimits.microsoft);
 * const errorHandler = new ErrorHandlingInterceptor('microsoft');
 * const retryHandler = new RetryInterceptor({ maxRetries: 5 });
 * 
 * rateLimiter.install(axiosClient);
 * errorHandler.install(axiosClient);
 * retryHandler.install(axiosClient);
 * ```
 */

import { AxiosInstance, AxiosRequestConfig, AxiosError, AxiosHeaders } from 'axios';
import { RateLimitConfig, RateLimitStatus, httpRateLimiter } from './http_rate_limiter.js';
import { TtsError, TtsErrorCode, TtsRateLimitError, TtsNetworkError, TtsAuthenticationError, TtsErrorContext } from '../errors/tts_error.js';

/**
 * Rate limiting interceptor for HTTP clients with automatic quota management.
 * Enforces provider-specific rate limits using configurable algorithms (token bucket or sliding window)
 * and automatically blocks requests when limits are exceeded, providing retry timing information.
 * 
 * @category Common Utilities
 * 
 * @example Basic rate limiting setup
 * ```typescript
 * import { RateLimitInterceptor, ProviderRateLimits } from 'cloud-text-to-speech';
 * 
 * const interceptor = new RateLimitInterceptor(ProviderRateLimits.google);
 * interceptor.install(axiosClient);
 * 
 * // Check current status
 * const status = interceptor.getStatus();
 * console.log(`${status.remaining} requests remaining`);
 * ```
 * 
 * @example Rate limiting with sliding window
 * ```typescript
 * const interceptor = new RateLimitInterceptor(
 *   ProviderRateLimits.microsoft,
 *   'sliding-window'
 * );
 * interceptor.install(axiosClient);
 * 
 * // More precise rate limiting for high-frequency requests
 * ```
 * 
 * @example Custom rate limit configuration
 * ```typescript
 * const customConfig: RateLimitConfig = {
 *   provider: 'custom-api',
 *   maxRequests: 50,
 *   windowMs: 60000,  // 50 requests per minute
 *   burstLimit: 5     // Allow 5 rapid requests
 * };
 * 
 * const interceptor = new RateLimitInterceptor(customConfig);
 * interceptor.install(axiosClient);
 * ```
 * 
 * @example Rate limit monitoring
 * ```typescript
 * const interceptor = new RateLimitInterceptor(ProviderRateLimits.amazon);
 * interceptor.install(axiosClient);
 * 
 * // Monitor rate limit status
 * setInterval(() => {
 *   const status = interceptor.getStatus();
 *   if (status.remaining < 10) {
 *     console.warn('Rate limit approaching, slow down requests');
 *   }
 * }, 5000);
 * ```
 */
export class RateLimitInterceptor {
  /** Rate limiting configuration */
  private config: RateLimitConfig;
  /** Rate limiting algorithm to use */
  private algorithm: 'token-bucket' | 'sliding-window';

  /**
   * Creates a new rate limit interceptor with the specified configuration.
   * 
   * @param config - Rate limiting configuration with provider-specific limits
   * @param algorithm - Rate limiting algorithm ('token-bucket' allows bursts, 'sliding-window' is precise)
   * 
   * @example
   * ```typescript
   * const interceptor = new RateLimitInterceptor(
   *   ProviderRateLimits.google,
   *   'token-bucket'
   * );
   * ```
   */
  constructor(config: RateLimitConfig, algorithm: 'token-bucket' | 'sliding-window' = 'token-bucket') {
    this.config = config;
    this.algorithm = algorithm;
  }

  /**
   * Install rate limiting interceptor on axios instance.
   * Adds request interceptor that checks rate limits before allowing requests to proceed.
   * Blocked requests throw TtsRateLimitError with retry timing information.
   * 
   * @param client - Axios instance to enhance with rate limiting
   * 
   * @throws {TtsRateLimitError} When rate limit is exceeded
   * 
   * @example Basic installation
   * ```typescript
   * const client = axios.create({ baseURL: 'https://api.example.com' });
   * const interceptor = new RateLimitInterceptor(ProviderRateLimits.google);
   * 
   * interceptor.install(client);
   * 
   * // All requests through this client are now rate limited
   * try {
   *   const response = await client.post('/api', data);
   * } catch (error) {
   *   if (error instanceof TtsRateLimitError) {
   *     console.log(`Rate limited, wait ${error.retryAfter}ms`);
   *   }
   * }
   * ```
   * 
   * @example Installation with error handling
   * ```typescript
   * interceptor.install(client);
   * 
   * // Handle rate limit errors gracefully
   * client.interceptors.response.use(
   *   response => response,
   *   async (error) => {
   *     if (error instanceof TtsRateLimitError) {
   *       // Wait and retry
   *       await new Promise(resolve => setTimeout(resolve, error.retryAfter));
   *       return client.request(error.config);
   *     }
   *     throw error;
   *   }
   * );
   * ```
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
   * Get current rate limit status without consuming quota.
   * Useful for monitoring and displaying rate limit information to users.
   * 
   * @returns Current rate limit status
   * 
   * @example Status monitoring
   * ```typescript
   * const status = interceptor.getStatus();
   * 
   * console.log(`Remaining requests: ${status.remaining}`);
   * console.log(`Reset time: ${new Date(status.resetTime)}`);
   * console.log(`Rate limit exceeded: ${status.exceeded}`);
   * ```
   * 
   * @example Proactive rate limiting
   * ```typescript
   * // Check before making requests
   * const status = interceptor.getStatus();
   * if (status.remaining < 5) {
   *   console.warn('Low rate limit, consider throttling requests');
   * }
   * 
   * if (status.exceeded) {
   *   const waitTime = status.resetTime - Date.now();
   *   await new Promise(resolve => setTimeout(resolve, waitTime));
   * }
   * ```
   */
  getStatus(): RateLimitStatus {
    return httpRateLimiter.getStatus(this.config, this.algorithm);
  }
}

/**
 * Error handling interceptor for HTTP clients with provider-specific error mapping.
 * Transforms HTTP errors into meaningful TTS error types with enhanced context information,
 * proper error categorization, and retry recommendations based on error type.
 * 
 * @category Common Utilities
 * 
 * @example Basic error handling
 * ```typescript
 * import { ErrorHandlingInterceptor } from 'cloud-text-to-speech';
 * 
 * const interceptor = new ErrorHandlingInterceptor('google');
 * interceptor.install(axiosClient);
 * 
 * // HTTP errors are now automatically converted to TTS errors
 * try {
 *   const response = await axiosClient.post('/api', data);
 * } catch (error) {
 *   if (error instanceof TtsAuthenticationError) {
 *     console.error('Authentication failed:', error.getUserMessage());
 *   } else if (error instanceof TtsRateLimitError) {
 *     console.log(`Rate limited, retry in ${error.retryAfter}ms`);
 *   }
 * }
 * ```
 * 
 * @example Error handling with logging
 * ```typescript
 * const interceptor = new ErrorHandlingInterceptor('microsoft');
 * interceptor.install(axiosClient);
 * 
 * // Add additional error logging
 * axiosClient.interceptors.response.use(
 *   response => response,
 *   (error) => {
 *     if (error instanceof TtsError) {
 *       console.error(`TTS Error [${error.provider}]:`, error.getUserMessage());
 *       console.debug('Error context:', error.context);
 *     }
 *     throw error;
 *   }
 * );
 * ```
 */
export class ErrorHandlingInterceptor {
  /** Provider identifier for error context */
  private provider: string;

  /**
   * Creates a new error handling interceptor for the specified provider.
   * 
   * @param provider - TTS provider identifier (e.g., 'google', 'microsoft', 'amazon')
   * 
   * @example
   * ```typescript
   * const interceptor = new ErrorHandlingInterceptor('google');
   * ```
   */
  constructor(provider: string) {
    this.provider = provider;
  }

  /**
   * Install error handling interceptor on axios instance.
   * Transforms HTTP errors into appropriate TTS error types with enhanced context.
   * 
   * @param client - Axios instance to enhance with error handling
   * 
   * @example Installation with custom error handling
   * ```typescript
   * const client = axios.create({ baseURL: 'https://api.example.com' });
   * const interceptor = new ErrorHandlingInterceptor('amazon');
   * 
   * interceptor.install(client);
   * 
   * // Handle specific error types
   * try {
   *   const response = await client.post('/synthesize', requestData);
   * } catch (error) {
   *   if (error instanceof TtsAuthenticationError) {
   *     // Handle auth errors - refresh tokens, prompt for credentials
   *     await refreshAuthentication();
   *   } else if (error instanceof TtsRateLimitError) {
   *     // Handle rate limits - implement backoff
   *     await new Promise(resolve => setTimeout(resolve, error.retryAfter));
   *   } else if (error instanceof TtsNetworkError) {
   *     // Handle network issues - check connectivity
   *     console.error('Network error, check connection');
   *   }
   * }
   * ```
   * 
   * @example Error handling with metrics
   * ```typescript
   * let errorCounts = { auth: 0, rate: 0, network: 0, other: 0 };
   * 
   * interceptor.install(client);
   * 
   * client.interceptors.response.use(
   *   response => response,
   *   (error) => {
   *     // Track error types for monitoring
   *     if (error instanceof TtsAuthenticationError) {
   *       errorCounts.auth++;
   *     } else if (error instanceof TtsRateLimitError) {
   *       errorCounts.rate++;
   *     } else if (error instanceof TtsNetworkError) {
   *       errorCounts.network++;
   *     } else {
   *       errorCounts.other++;
   *     }
   *     
   *     throw error;
   *   }
   * );
   * ```
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

  /**
   * Transform an Axios error into an appropriate TTS error type.
   * Maps HTTP status codes to specific error types and adds contextual information.
   * 
   * @param error - Axios error to transform
   * @returns Enhanced TTS error with proper typing and context
   * 
   * @private
   */
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
 * Retry interceptor with exponential backoff and jitter for failed requests.
 * Automatically retries failed requests with configurable delay strategies,
 * smart retry conditions, and protection against thundering herd problems.
 * 
 * @category Common Utilities
 * 
 * @example Basic retry configuration
 * ```typescript
 * import { RetryInterceptor } from 'cloud-text-to-speech';
 * 
 * const interceptor = new RetryInterceptor({
 *   maxRetries: 3,
 *   initialDelay: 1000,
 *   backoffMultiplier: 2
 * });
 * 
 * interceptor.install(axiosClient);
 * 
 * // Failed requests are automatically retried with exponential backoff
 * ```
 * 
 * @example Advanced retry configuration
 * ```typescript
 * const interceptor = new RetryInterceptor({
 *   maxRetries: 5,
 *   initialDelay: 500,
 *   maxDelay: 30000,
 *   backoffMultiplier: 1.5,
 *   enableJitter: true  // Prevents thundering herd
 * });
 * 
 * interceptor.install(axiosClient);
 * ```
 * 
 * @example Retry with custom logic
 * ```typescript
 * const interceptor = new RetryInterceptor({ maxRetries: 3 });
 * interceptor.install(axiosClient);
 * 
 * // Add custom retry logic
 * axiosClient.interceptors.response.use(
 *   response => response,
 *   async (error) => {
 *     // Custom conditions for retry
 *     if (shouldRetryCustomCondition(error)) {
 *       await new Promise(resolve => setTimeout(resolve, 2000));
 *       return axiosClient.request(error.config);
 *     }
 *     throw error;
 *   }
 * );
 * ```
 */
export class RetryInterceptor {
  /** Maximum number of retry attempts */
  private maxRetries: number;
  /** Initial delay before first retry in milliseconds */
  private initialDelay: number;
  /** Maximum delay between retries in milliseconds */
  private maxDelay: number;
  /** Multiplier for exponential backoff */
  private backoffMultiplier: number;
  /** Whether to add jitter to prevent thundering herd */
  private enableJitter: boolean;

  /**
   * Creates a new retry interceptor with the specified configuration.
   * 
   * @param options - Retry configuration options
   * @param options.maxRetries - Maximum number of retry attempts (default: 3)
   * @param options.initialDelay - Initial delay in milliseconds (default: 1000)
   * @param options.maxDelay - Maximum delay in milliseconds (default: 30000)
   * @param options.backoffMultiplier - Exponential backoff multiplier (default: 2)
   * @param options.enableJitter - Add jitter to prevent thundering herd (default: true)
   * 
   * @example Conservative retry configuration
   * ```typescript
   * const interceptor = new RetryInterceptor({
   *   maxRetries: 2,
   *   initialDelay: 2000,
   *   backoffMultiplier: 1.5
   * });
   * ```
   * 
   * @example Aggressive retry configuration
   * ```typescript
   * const interceptor = new RetryInterceptor({
   *   maxRetries: 5,
   *   initialDelay: 500,
   *   maxDelay: 60000,
   *   backoffMultiplier: 2.5,
   *   enableJitter: true
   * });
   * ```
   */
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
   * Install retry interceptor on axios instance.
   * Automatically retries failed requests that meet retry conditions.
   * 
   * @param client - Axios instance to enhance with retry logic
   * 
   * @example Installation with monitoring
   * ```typescript
   * const client = axios.create({ baseURL: 'https://api.example.com' });
   * const interceptor = new RetryInterceptor({ maxRetries: 3 });
   * 
   * interceptor.install(client);
   * 
   * // Monitor retry attempts
   * client.interceptors.response.use(
   *   response => {
   *     const retryCount = response.config.__retryCount || 0;
   *     if (retryCount > 0) {
   *       console.log(`Request succeeded after ${retryCount} retries`);
   *     }
   *     return response;
   *   },
   *   error => {
   *     const retryCount = error.config?.__retryCount || 0;
   *     console.log(`Request failed after ${retryCount} retries`);
   *     throw error;
   *   }
   * );
   * ```
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

  /**
   * Determine if an error should trigger a retry attempt.
   * Only retries network errors and specific HTTP status codes.
   * 
   * @param error - Axios error to evaluate
   * @returns True if the request should be retried
   * 
   * @private
   */
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

  /**
   * Calculate delay for the specified retry attempt using exponential backoff.
   * Applies jitter if enabled to prevent thundering herd problems.
   * 
   * @param attempt - Current retry attempt number
   * @returns Delay in milliseconds
   * 
   * @private
   */
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

  /**
   * Sleep for the specified number of milliseconds.
   * 
   * @param ms - Milliseconds to sleep
   * @returns Promise that resolves after the delay
   * 
   * @private
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * HTTP client enhancer that applies multiple interceptors in a single operation.
 * Provides a convenient way to add rate limiting, error handling, and retry logic
 * to any Axios instance with sensible defaults and comprehensive configuration options.
 * 
 * @category Common Utilities
 * 
 * @example Complete client enhancement
 * ```typescript
 * import axios from 'axios';
 * import { HttpClientEnhancer, ProviderRateLimits } from 'cloud-text-to-speech';
 * 
 * const client = axios.create({
 *   baseURL: 'https://texttospeech.googleapis.com/v1',
 *   timeout: 30000
 * });
 * 
 * const enhancedClient = HttpClientEnhancer.enhance(client, 'google', {
 *   rateLimiting: ProviderRateLimits.google,
 *   rateLimitAlgorithm: 'token-bucket',
 *   errorHandling: true,
 *   retry: {
 *     maxRetries: 3,
 *     initialDelay: 1000,
 *     enableJitter: true
 *   }
 * });
 * 
 * // Client now has rate limiting, error handling, and retry logic
 * const response = await enhancedClient.post('/text:synthesize', requestData);
 * ```
 * 
 * @example Minimal enhancement
 * ```typescript
 * // Just add error handling
 * const client = HttpClientEnhancer.enhance(axiosInstance, 'microsoft', {
 *   errorHandling: true
 * });
 * ```
 * 
 * @example Custom configuration per provider
 * ```typescript
 * // Different configurations for different providers
 * const googleClient = HttpClientEnhancer.enhance(googleAxios, 'google', {
 *   rateLimiting: ProviderRateLimits.google,
 *   retry: { maxRetries: 5 }
 * });
 * 
 * const microsoftClient = HttpClientEnhancer.enhance(microsoftAxios, 'microsoft', {
 *   rateLimiting: ProviderRateLimits.microsoft,
 *   rateLimitAlgorithm: 'sliding-window',
 *   retry: { maxRetries: 3, initialDelay: 2000 }
 * });
 * ```
 */
export class HttpClientEnhancer {
  /**
   * Enhance an Axios instance with multiple interceptors for production-ready TTS operations.
   * Applies rate limiting, error handling, and retry logic based on the provided configuration.
   * 
   * @param client - Axios instance to enhance
   * @param provider - TTS provider identifier for error context
   * @param options - Enhancement configuration options
   * @param options.rateLimiting - Rate limiting configuration (optional)
   * @param options.rateLimitAlgorithm - Rate limiting algorithm to use
   * @param options.errorHandling - Enable error handling interceptor (default: true)
   * @param options.retry - Retry configuration (optional)
   * @returns Enhanced Axios instance with interceptors installed
   * 
   * @example Production TTS client setup
   * ```typescript
   * const createProductionTtsClient = (provider: 'google' | 'microsoft' | 'amazon') => {
   *   const baseConfig = {
   *     google: { baseURL: 'https://texttospeech.googleapis.com/v1', timeout: 60000 },
   *     microsoft: { baseURL: 'https://cognitiveservices.azure.com', timeout: 30000 },
   *     amazon: { baseURL: 'https://polly.amazonaws.com', timeout: 45000 }
   *   };
   * 
   *   const client = axios.create(baseConfig[provider]);
   * 
   *   return HttpClientEnhancer.enhance(client, provider, {
   *     rateLimiting: ProviderRateLimits[provider],
   *     rateLimitAlgorithm: provider === 'microsoft' ? 'sliding-window' : 'token-bucket',
   *     errorHandling: true,
   *     retry: {
   *       maxRetries: 3,
   *       initialDelay: 1000,
   *       maxDelay: 30000,
   *       enableJitter: true
   *     }
   *   });
   * };
   * 
   * const googleClient = createProductionTtsClient('google');
   * const microsoftClient = createProductionTtsClient('microsoft');
   * const amazonClient = createProductionTtsClient('amazon');
   * ```
   * 
   * @example Development vs Production configurations
   * ```typescript
   * const isDevelopment = process.env.NODE_ENV === 'development';
   * 
   * const enhanceClientForEnvironment = (client: AxiosInstance, provider: string) => {
   *   if (isDevelopment) {
   *     // Relaxed settings for development
   *     return HttpClientEnhancer.enhance(client, provider, {
   *       errorHandling: true,
   *       retry: { maxRetries: 1, initialDelay: 500 }
   *     });
   *   } else {
   *     // Strict settings for production
   *     return HttpClientEnhancer.enhance(client, provider, {
   *       rateLimiting: ProviderRateLimits[provider],
   *       errorHandling: true,
   *       retry: {
   *         maxRetries: 5,
   *         initialDelay: 1000,
   *         maxDelay: 60000,
   *         enableJitter: true
   *       }
   *     });
   *   }
   * };
   * ```
   * 
   * @example Selective enhancement
   * ```typescript
   * // Only add specific interceptors based on needs
   * 
   * // High-volume service - focus on rate limiting
   * const highVolumeClient = HttpClientEnhancer.enhance(client, 'google', {
   *   rateLimiting: ProviderRateLimits.google,
   *   rateLimitAlgorithm: 'token-bucket',
   *   errorHandling: false  // Handle errors manually
   * });
   * 
   * // Unreliable network - focus on retries
   * const unreliableNetworkClient = HttpClientEnhancer.enhance(client, 'amazon', {
   *   errorHandling: true,
   *   retry: {
   *     maxRetries: 8,
   *     initialDelay: 2000,
   *     backoffMultiplier: 2,
   *     enableJitter: true
   *   }
   * });
   * ```
   */
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