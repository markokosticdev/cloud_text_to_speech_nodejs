import { PROCESS_ASYNC, PROCESS_LIMIT } from './convert_params_defaults.js';
import { 
  ProcessRetryOptions, 
  ProcessErrorOptions, 
  ProcessRateLimitOptions, 
  ProcessMonitoringOptions 
} from '../../universal/convert/convert_process_options.js';
import { RateLimitConfig, ProviderRateLimits } from '../../common/http/http_rate_limiter.js';

export class ConvertProcessOptionsMicrosoft {
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

    // Enhanced options with Microsoft-specific defaults
    this.retryOptions = retryOptions;
    this.errorOptions = {
      enableEnhancedErrors: true,
      throwOnFirstError: false,
      collectErrors: true,
      ...errorOptions
    };
    this.rateLimitOptions = {
      enabled: false,
      algorithm: 'sliding-window', // Microsoft prefers sliding window
      customConfig: ProviderRateLimits.microsoft,
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
   * Get Microsoft-specific rate limit configuration
   */
  getRateLimitConfig(): RateLimitConfig | undefined {
    if (!this.rateLimitOptions?.enabled) {
      return undefined;
    }
    return this.rateLimitOptions.customConfig || ProviderRateLimits.microsoft;
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
