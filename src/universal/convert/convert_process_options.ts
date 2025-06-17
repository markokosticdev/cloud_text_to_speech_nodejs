import { PROCESS_ASYNC, PROCESS_LIMIT } from './convert_params_defaults.js';
import { RateLimitConfig, ProviderRateLimits } from '../../common/http/http_rate_limiter.js';

export interface ProcessRetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  enableJitter?: boolean;
}

export interface ProcessErrorOptions {
  enableEnhancedErrors?: boolean;
  throwOnFirstError?: boolean;
  collectErrors?: boolean;
}

export interface ProcessRateLimitOptions {
  enabled?: boolean;
  algorithm?: 'token-bucket' | 'sliding-window';
  customConfig?: RateLimitConfig;
}

export interface ProcessMonitoringOptions {
  enableProgressTracking?: boolean;
  onProgress?: (completed: number, total: number, currentItem?: string) => void;
  onItemComplete?: (result: unknown) => void;
  enableTiming?: boolean;
  enableMemoryTracking?: boolean;
}

export class ConvertProcessOptionsUniversal {
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

    // Enhanced options with defaults
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
   * Get rate limit configuration for a specific provider
   */
  getRateLimitConfig(provider: string): RateLimitConfig | undefined {
    if (!this.rateLimitOptions?.enabled) {
      return undefined;
    }

    if (this.rateLimitOptions.customConfig) {
      return this.rateLimitOptions.customConfig;
    }

    // Use provider default configurations
    switch (provider.toLowerCase()) {
      case 'google':
        return ProviderRateLimits.google;
      case 'microsoft':
        return ProviderRateLimits.microsoft;
      case 'amazon':
        return ProviderRateLimits.amazon;
      default:
        return undefined;
    }
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
