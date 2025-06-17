/**
 * Retry Handler with Exponential Backoff for Cloud Text-to-Speech v3
 * Implements intelligent retry strategies for different error types
 */

import { TtsError, TtsErrorCode, TtsRateLimitError } from './tts_error.js';

export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Initial delay in milliseconds */
  initialDelay?: number;
  /** Maximum delay in milliseconds */
  maxDelay?: number;
  /** Exponential backoff multiplier */
  backoffMultiplier?: number;
  /** Whether to add jitter to delay */
  enableJitter?: boolean;
  /** Custom retry condition function */
  retryCondition?: (error: TtsError) => boolean;
  /** Callback for retry attempts */
  onRetry?: (error: TtsError, attemptNumber: number, delay: number) => void;
}

export interface RetryResult<T> {
  result?: T;
  success: boolean;
  attempts: number;
  totalDelay: number;
  lastError?: TtsError;
}

/**
 * Advanced retry handler with exponential backoff and jitter
 */
export class RetryHandler {
  private readonly options: Required<RetryOptions>;

  constructor(options: RetryOptions = {}) {
    this.options = {
      maxRetries: options.maxRetries ?? 3,
      initialDelay: options.initialDelay ?? 1000,
      maxDelay: options.maxDelay ?? 30000,
      backoffMultiplier: options.backoffMultiplier ?? 2,
      enableJitter: options.enableJitter ?? true,
      retryCondition: options.retryCondition ?? this.defaultRetryCondition,
      onRetry: options.onRetry ?? (() => {})
    };
  }

  /**
   * Execute a function with retry logic
   */
  async execute<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T> {
    let lastError: TtsError;

    for (let attempt = 0; attempt <= this.options.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = this.calculateDelay(attempt - 1, lastError);
          
          this.options.onRetry(lastError, attempt, delay);
          
          await this.sleep(delay);
        }

        const result = await operation();
        return result;

      } catch (error) {
        const ttsError = this.normalizeError(error, context);
        lastError = ttsError;

        // Don't retry if this is the last attempt or error is not retryable
        if (attempt === this.options.maxRetries || !this.options.retryCondition(ttsError)) {
          throw ttsError;
        }
      }
    }

    throw lastError!;
  }

  /**
   * Execute multiple operations with retry logic in parallel
   */
  async executeParallel<T>(
    operations: (() => Promise<T>)[],
    context?: string
  ): Promise<T[]> {
    const promises = operations.map((operation, index) =>
      this.execute(operation, `${context}_${index}`)
    );

    return Promise.all(promises);
  }

  /**
   * Execute with circuit breaker pattern
   */
  async executeWithCircuitBreaker<T>(
    operation: () => Promise<T>,
    circuitBreaker: CircuitBreaker,
    context?: string
  ): Promise<T> {
    if (circuitBreaker.isOpen()) {
      throw new TtsError(
        'Circuit breaker is open - service temporarily unavailable',
        TtsErrorCode.SERVICE_UNAVAILABLE,
        { retryable: true, context: { circuitBreakerState: 'open' } }
      );
    }

    try {
      const result = await this.execute(operation, context);
      circuitBreaker.recordSuccess();
      return result;
    } catch (error) {
      circuitBreaker.recordFailure();
      throw error;
    }
  }

  private calculateDelay(attemptNumber: number, error?: TtsError): number {
    let delay = this.options.initialDelay * Math.pow(this.options.backoffMultiplier, attemptNumber);
    
    // Respect rate limit retry-after header
    if (error instanceof TtsRateLimitError && error.retryAfter) {
      delay = Math.max(delay, error.retryAfter * 1000);
    }

    // Apply maximum delay limit
    delay = Math.min(delay, this.options.maxDelay);

    // Add jitter to prevent thundering herd
    if (this.options.enableJitter) {
      delay *= (0.5 + Math.random() * 0.5);
    }

    return Math.floor(delay);
  }

  private defaultRetryCondition(error: TtsError): boolean {
    return error.retryable;
  }

  private normalizeError(error: unknown, context?: string): TtsError {
    if (error instanceof TtsError) {
      return error;
    }

    // Convert common error types to TtsError
    if (error && typeof error === 'object' && 'code' in error) {
      const nodeError = error as { code: string; message?: string };
      if (nodeError.code === 'ENOTFOUND' || nodeError.code === 'ECONNREFUSED') {
        return new TtsError(
          'Network connection failed',
          TtsErrorCode.NETWORK_ERROR,
          { context: { originalError: error, context } }
        );
      }

      if (nodeError.code === 'ETIMEDOUT') {
        return new TtsError(
          'Request timeout',
          TtsErrorCode.TIMEOUT,
          { context: { originalError: error, context } }
        );
      }
    }

    if (error && typeof error === 'object' && 'name' in error && error.name === 'TimeoutError') {
      return new TtsError(
        'Request timeout',
        TtsErrorCode.TIMEOUT,
        { context: { originalError: error, context } }
      );
    }

    // Default to unknown error
    const message = error && typeof error === 'object' && 'message' in error 
      ? String(error.message) 
      : 'Unknown error occurred';

    return new TtsError(
      message,
      TtsErrorCode.UNKNOWN_ERROR,
      { context: { originalError: error, context } }
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}

/**
 * Circuit Breaker implementation to prevent cascading failures
 */
export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private readonly failureThreshold: number = 5,
    private readonly timeoutMs: number = 60000 // 1 minute
  ) {}

  isOpen(): boolean {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeoutMs) {
        this.state = 'half-open';
        return false;
      }
      return true;
    }
    return false;
  }

  recordSuccess(): void {
    this.failureCount = 0;
    this.state = 'closed';
  }

  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'open';
    }
  }

  getState(): string {
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }
}

/**
 * Default retry configurations for different scenarios
 */
export const RetryConfigurations = {
  /** Conservative retry for authentication operations */
  authentication: new RetryHandler({
    maxRetries: 2,
    initialDelay: 2000,
    maxDelay: 10000,
    backoffMultiplier: 2
  }),

  /** Standard retry for API calls */
  standard: new RetryHandler({
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2
  }),

  /** Aggressive retry for critical operations */
  aggressive: new RetryHandler({
    maxRetries: 5,
    initialDelay: 500,
    maxDelay: 60000,
    backoffMultiplier: 1.5
  }),

  /** Rate limit specific retry */
  rateLimit: new RetryHandler({
    maxRetries: 3,
    initialDelay: 5000,
    maxDelay: 120000,
    backoffMultiplier: 3,
    retryCondition: (error) => 
      error.code === TtsErrorCode.RATE_LIMIT_EXCEEDED || error.retryable
  })
}; 