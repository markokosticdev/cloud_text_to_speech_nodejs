/**
 * @fileoverview Google Cloud Text-to-Speech Processing Options Configuration
 * 
 * This module defines processing behavior configuration for Google Cloud Text-to-Speech
 * conversion operations. It provides comprehensive control over asynchronous processing,
 * concurrency limits, retry strategies, error handling, rate limiting, and performance
 * monitoring to optimize TTS operations for different deployment scenarios.
 * 
 * The processing options extend the base configuration with Google-specific defaults
 * and enhanced features for production environments including advanced error handling,
 * monitoring capabilities, and rate limit management.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link https://cloud.google.com/text-to-speech/quotas | Google TTS Quotas and Limits}
 * @see {@link ProcessRetryOptions} for retry configuration details
 * 
 * @example Basic Processing Configuration
 * ```typescript
 * import { ConvertProcessOptionsGoogle } from './convert_process_options.js';
 * 
 * const processOptions = new ConvertProcessOptionsGoogle({
 *   processAsync: true,
 *   processLimit: 6
 * });
 * 
 * const params = new ConvertParamsGoogle({
 *   text: 'Hello world',
 *   voice: { name: 'en-US-Neural2-A' },
 *   processOptions
 * });
 * ```
 * 
 * @example Advanced Error Handling and Retry Configuration
 * ```typescript
 * import { ConvertProcessOptionsGoogle } from './convert_process_options.js';
 * 
 * const advancedOptions = new ConvertProcessOptionsGoogle({
 *   processAsync: true,
 *   processLimit: 4,
 *   retryOptions: {
 *     maxRetries: 3,
 *     baseDelay: 1000,
 *     maxDelay: 10000,
 *     backoffFactor: 2,
 *     retryCondition: (error) => error.code === 429 || error.code >= 500
 *   },
 *   errorOptions: {
 *     enableEnhancedErrors: true,
 *     throwOnFirstError: false,
 *     collectErrors: true,
 *     errorTransform: (error) => ({ ...error, timestamp: Date.now() })
 *   }
 * });
 * ```
 * 
 * @example Production Monitoring Configuration
 * ```typescript
 * import { ConvertProcessOptionsGoogle } from './convert_process_options.js';
 * 
 * const monitoringOptions = new ConvertProcessOptionsGoogle({
 *   processAsync: true,
 *   processLimit: 8,
 *   monitoringOptions: {
 *     enableProgressTracking: true,
 *     enableTiming: true,
 *     enableMemoryTracking: true,
 *     progressCallback: (completed, total, duration) => {
 *       console.log(`Progress: ${completed}/${total} (${duration}ms)`);
 *     },
 *     timingCallback: (operation, duration) => {
 *       console.log(`${operation} took ${duration}ms`);
 *     }
 *   }
 * });
 * ```
 * 
 * @example Rate Limiting Configuration
 * ```typescript
 * import { ConvertProcessOptionsGoogle } from './convert_process_options.js';
 * 
 * const rateLimitedOptions = new ConvertProcessOptionsGoogle({
 *   rateLimitOptions: {
 *     enabled: true,
 *     algorithm: 'token-bucket',
 *     customConfig: {
 *       requestsPerMinute: 300,
 *       charactersPerMinute: 1000000,
 *       burstLimit: 10
 *     }
 *   }
 * });
 * 
 * // Check rate limit status
 * if (rateLimitedOptions.getRateLimitConfig()) {
 *   console.log('Rate limiting enabled for Google TTS');
 * }
 * ```
 */

import { PROCESS_ASYNC, PROCESS_LIMIT } from './convert_params_defaults.js';
import { 
  ProcessRetryOptions, 
  ProcessErrorOptions, 
  ProcessRateLimitOptions, 
  ProcessMonitoringOptions 
} from '../../universal/convert/convert_process_options.js';
import { RateLimitConfig, ProviderRateLimits } from '../../common/http/http_rate_limiter.js';

/**
 * Processing behavior configuration for Google Cloud Text-to-Speech operations
 * 
 * This class provides comprehensive control over TTS processing behavior including
 * asynchronous execution, concurrency management, error handling strategies,
 * retry mechanisms, rate limiting, and performance monitoring. It extends basic
 * processing options with Google-specific defaults and production-ready features.
 * 
 * The configuration supports both simple and advanced use cases, from basic
 * async processing to complex production deployments with monitoring and
 * automatic error recovery.
 * 
 * @example Simple Async Processing
 * ```typescript
 * const options = new ConvertProcessOptionsGoogle({
 *   processAsync: true,
 *   processLimit: 4
 * });
 * ```
 * 
 * @example Production Configuration
 * ```typescript
 * const options = new ConvertProcessOptionsGoogle({
 *   processAsync: true,
 *   processLimit: 8,
 *   retryOptions: {
 *     maxRetries: 3,
 *     baseDelay: 1000
 *   },
 *   monitoringOptions: {
 *     enableProgressTracking: true
 *   }
 * });
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class ConvertProcessOptionsGoogle {
  // Core processing options
  processAsync: boolean;
  processLimit: number;

  // Enhanced processing options
  retryOptions?: ProcessRetryOptions;
  errorOptions?: ProcessErrorOptions;
  rateLimitOptions?: ProcessRateLimitOptions;
  monitoringOptions?: ProcessMonitoringOptions;

  constructor({
    processAsync,
    processLimit,
    retryOptions,
    errorOptions,
    rateLimitOptions,
    monitoringOptions,
  }: {
    processAsync?: boolean;
    processLimit?: number;
    retryOptions?: ProcessRetryOptions;
    errorOptions?: ProcessErrorOptions;
    rateLimitOptions?: ProcessRateLimitOptions;
    monitoringOptions?: ProcessMonitoringOptions;
  } = {}) {
    // Core options
    this.processAsync = processAsync ?? PROCESS_ASYNC;
    this.processLimit = processLimit ?? PROCESS_LIMIT;

    // Enhanced options with Google-specific defaults
    this.retryOptions = retryOptions;
    this.errorOptions = {
      enableEnhancedErrors: true,
      throwOnFirstError: false,
      collectErrors: true,
      ...errorOptions
    };
    this.rateLimitOptions = {
      enabled: false,
      algorithm: 'token-bucket',
      customConfig: ProviderRateLimits.google,
      ...rateLimitOptions
    };
    this.monitoringOptions = {
      enableProgressTracking: false,
      enableTiming: false,
      enableMemoryTracking: false,
      ...monitoringOptions
    };
  }

  /**
   * Get Google-specific rate limit configuration
   */
  getRateLimitConfig(): RateLimitConfig | undefined {
    if (!this.rateLimitOptions?.enabled) {
      return undefined;
    }
    return this.rateLimitOptions.customConfig || ProviderRateLimits.google;
  }

  /**
   * Check if retry is enabled
   */
  isRetryEnabled(): boolean {
    return this.retryOptions !== undefined && this.retryOptions.maxRetries !== 0;
  }

  /**
   * Check if enhanced error handling is enabled
   */
  isEnhancedErrorsEnabled(): boolean {
    return this.errorOptions?.enableEnhancedErrors === true;
  }

  /**
   * Check if monitoring is enabled
   */
  isMonitoringEnabled(): boolean {
    return this.monitoringOptions?.enableProgressTracking === true ||
           this.monitoringOptions?.enableTiming === true ||
           this.monitoringOptions?.enableMemoryTracking === true;
  }
}
