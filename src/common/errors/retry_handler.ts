/**
 * @fileoverview Advanced Retry Handler with Exponential Backoff for Cloud Text-to-Speech
 * 
 * This module provides intelligent retry strategies for TTS operations, including
 * exponential backoff, jitter, circuit breaker patterns, and provider-specific
 * error handling. The retry system automatically handles rate limits, network
 * errors, and service unavailability with appropriate backoff strategies.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 */

import { TtsError, TtsErrorCode, TtsRateLimitError } from './tts_error.js';

/**
 * Configuration options for retry behavior
 * 
 * Defines how the retry handler should behave when operations fail,
 * including timing, conditions, and callbacks for monitoring retry attempts.
 * 
 * @example Basic Retry Configuration
 * ```typescript
 * const retryOptions: RetryOptions = {
 *   maxRetries: 3,
 *   initialDelay: 1000,
 *   maxDelay: 30000,
 *   enableJitter: true
 * };
 * 
 * const retryHandler = new RetryHandler(retryOptions);
 * ```
 * 
 * @example Advanced Retry Configuration with Custom Logic
 * ```typescript
 * const advancedOptions: RetryOptions = {
 *   maxRetries: 5,
 *   initialDelay: 500,
 *   maxDelay: 60000,
 *   backoffMultiplier: 1.5,
 *   enableJitter: true,
 *   retryCondition: (error) => {
 *     // Don't retry authentication errors
 *     return error.retryable && error.code !== TtsErrorCode.UNAUTHORIZED;
 *   },
 *   onRetry: (error, attempt, delay) => {
 *     console.log(`Retry attempt ${attempt} after ${delay}ms for error: ${error.code}`);
 *   }
 * };
 * ```
 * 
 * @category Error Handling
 * @since 3.0.0
 */
export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Initial delay in milliseconds before first retry (default: 1000ms) */
  initialDelay?: number;
  /** Maximum delay in milliseconds between retries (default: 30000ms) */
  maxDelay?: number;
  /** Exponential backoff multiplier (default: 2) */
  backoffMultiplier?: number;
  /** Whether to add jitter to delay to prevent thundering herd (default: true) */
  enableJitter?: boolean;
  /** Custom function to determine if an error should be retried */
  retryCondition?: (error: TtsError) => boolean;
  /** Callback function called before each retry attempt */
  onRetry?: (error: TtsError, attemptNumber: number, delay: number) => void;
}

/**
 * Result of a retry operation
 * 
 * Contains information about the execution including success status,
 * number of attempts made, total time spent, and any errors encountered.
 * 
 * @example Analyzing Retry Results
 * ```typescript
 * const retryHandler = new RetryHandler();
 * 
 * try {
 *   const result = await retryHandler.execute(async () => {
 *     return await TtsUniversal.convertTts(params);
 *   });
 *   console.log('Operation succeeded');
 * } catch (error) {
 *   console.log(`Failed after ${error.context.retryCount} attempts`);
 * }
 * ```
 * 
 * @category Error Handling
 * @since 3.0.0
 */
export interface RetryResult<T> {
  /** The successful result, if operation succeeded */
  result?: T;
  /** Whether the operation ultimately succeeded */
  success: boolean;
  /** Total number of attempts made */
  attempts: number;
  /** Total delay time in milliseconds across all attempts */
  totalDelay: number;
  /** The last error encountered, if operation failed */
  lastError?: TtsError;
}

/**
 * Advanced retry handler with exponential backoff and jitter
 * 
 * Provides intelligent retry strategies for TTS operations with support for
 * exponential backoff, jitter, circuit breaker patterns, and provider-specific
 * error handling. The handler automatically respects rate limit headers and
 * implements best practices for cloud service interaction.
 * 
 * @example Basic Usage
 * ```typescript
 * import { RetryHandler } from 'cloud-text-to-speech';
 * 
 * const retryHandler = new RetryHandler({
 *   maxRetries: 3,
 *   initialDelay: 1000
 * });
 * 
 * // Wrap any TTS operation with retry logic
 * const result = await retryHandler.execute(async () => {
 *   return await TtsUniversal.convertTts({
 *     text: 'Hello world',
 *     voice: { name: 'en-US-Standard-A' }
 *   });
 * });
 * 
 * console.log(`Generated ${result.audio.length} bytes of audio`);
 * ```
 * 
 * @example Advanced Usage with Custom Retry Logic
 * ```typescript
 * const retryHandler = new RetryHandler({
 *   maxRetries: 5,
 *   initialDelay: 500,
 *   maxDelay: 30000,
 *   retryCondition: (error) => {
 *     // Only retry network and rate limit errors
 *     return error.code === TtsErrorCode.NETWORK_ERROR || 
 *            error.code === TtsErrorCode.RATE_LIMIT_EXCEEDED ||
 *            error.code === TtsErrorCode.SERVICE_UNAVAILABLE;
 *   },
 *   onRetry: (error, attempt, delay) => {
 *     console.log(`Attempt ${attempt}: Retrying in ${delay}ms due to ${error.code}`);
 *   }
 * });
 * 
 * try {
 *   const voices = await retryHandler.execute(async () => {
 *     return await TtsUniversal.getVoices();
 *   });
 *   console.log(`Retrieved ${voices.voices.length} voices`);
 * } catch (error) {
 *   console.error('All retry attempts failed:', error.getUserMessage());
 * }
 * ```
 * 
 * @example Parallel Operations with Retry
 * ```typescript
 * const retryHandler = new RetryHandler();
 * 
 * const operations = [
 *   () => TtsUniversal.convertTts({ text: 'Hello', voice: { name: 'voice1' } }),
 *   () => TtsUniversal.convertTts({ text: 'World', voice: { name: 'voice2' } }),
 *   () => TtsUniversal.convertTts({ text: 'Test', voice: { name: 'voice3' } })
 * ];
 * 
 * const results = await retryHandler.executeParallel(operations, 'batch-convert');
 * console.log(`Converted ${results.length} texts successfully`);
 * ```
 * 
 * @example Circuit Breaker Pattern
 * ```typescript
 * const retryHandler = new RetryHandler();
 * const circuitBreaker = new CircuitBreaker(5, 60000); // 5 failures, 60s timeout
 * 
 * try {
 *   const result = await retryHandler.executeWithCircuitBreaker(
 *     () => TtsUniversal.convertTts(params),
 *     circuitBreaker,
 *     'tts-convert'
 *   );
 * } catch (error) {
 *   if (error.code === TtsErrorCode.SERVICE_UNAVAILABLE && 
 *       error.context.circuitBreakerState === 'open') {
 *     console.log('Circuit breaker is open - service temporarily disabled');
 *   }
 * }
 * ```
 * 
 * @category Error Handling
 * @since 3.0.0
 */
export class RetryHandler {
  /** Internal retry configuration with defaults applied */
  private readonly options: Required<RetryOptions>;

  /**
   * Creates a new retry handler with the specified options
   * 
   * @param options - Configuration options for retry behavior
   * 
   * @example
   * ```typescript
   * // Use defaults
   * const basicHandler = new RetryHandler();
   * 
   * // Custom configuration
   * const customHandler = new RetryHandler({
   *   maxRetries: 5,
   *   initialDelay: 2000,
   *   enableJitter: false
   * });
   * ```
   */
  constructor(options: RetryOptions = {}) {
    this.options = {
      maxRetries: options.maxRetries ?? 3,
      initialDelay: options.initialDelay ?? 1000,
      maxDelay: options.maxDelay ?? 30000,
      backoffMultiplier: options.backoffMultiplier ?? 2,
      enableJitter: options.enableJitter ?? true,
      retryCondition: options.retryCondition ?? this.defaultRetryCondition,
      onRetry: options.onRetry ?? ((): void => {})
    };
  }

  /**
   * Execute a function with retry logic
   * 
   * Executes the provided operation with automatic retry on failure,
   * using exponential backoff with jitter. Respects rate limit headers
   * and provides detailed error context.
   * 
   * @param operation - Async function to execute with retry logic
   * @param context - Optional context string for error tracking
   * @returns Promise resolving to the operation result
   * 
   * @throws {@link TtsError} When all retry attempts are exhausted
   * @throws {@link TtsAuthenticationError} When authentication fails (not retryable)
   * @throws {@link TtsValidationError} When input validation fails (not retryable)
   * 
   * @example Basic Retry Execution
   * ```typescript
   * const retryHandler = new RetryHandler();
   * 
   * const result = await retryHandler.execute(async () => {
   *   const response = await fetch('https://api.example.com/data');
   *   if (!response.ok) {
   *     throw new TtsError('Request failed', TtsErrorCode.NETWORK_ERROR);
   *   }
   *   return response.json();
   * });
   * ```
   * 
   * @example Retry with Context
   * ```typescript
   * const audioResult = await retryHandler.execute(
   *   async () => TtsUniversal.convertTts(params),
   *   'user-123-conversion'
   * );
   * ```
   * 
   * @since 3.0.0
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
          
          // Notify callback about retry attempt
          this.options.onRetry(lastError, attempt, delay);
          
          // Wait before retrying
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
   * 
   * Runs multiple operations concurrently, each with its own retry logic.
   * All operations must succeed for the method to succeed. If any operation
   * fails after all retries, the entire batch fails.
   * 
   * @param operations - Array of async functions to execute
   * @param context - Optional context string for error tracking
   * @returns Promise resolving to array of results in the same order
   * 
   * @throws {@link TtsError} When any operation fails after all retries
   * 
   * @example Parallel Voice Retrieval
   * ```typescript
   * const retryHandler = new RetryHandler();
   * 
   * const voiceOperations = [
   *   () => TtsGoogle.getVoices(),
   *   () => TtsMicrosoft.getVoices(),
   *   () => TtsAmazon.getVoices()
   * ];
   * 
   * const voiceResults = await retryHandler.executeParallel(
   *   voiceOperations,
   *   'multi-provider-voices'
   * );
   * 
   * console.log(`Retrieved voices from ${voiceResults.length} providers`);
   * ```
   * 
   * @example Parallel Text Conversion
   * ```typescript
   * const texts = ['Hello', 'World', 'Test'];
   * const operations = texts.map((text, index) => 
   *   () => TtsUniversal.convertTts({
   *     text,
   *     voice: { name: 'en-US-Standard-A' }
   *   })
   * );
   * 
   * const audioResults = await retryHandler.executeParallel(
   *   operations,
   *   'batch-conversion'
   * );
   * ```
   * 
   * @since 3.0.0
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
   * Execute with circuit breaker pattern for service protection
   * 
   * Combines retry logic with circuit breaker pattern to protect against
   * cascading failures. When too many failures occur, the circuit breaker
   * opens and prevents further requests for a specified time period.
   * 
   * @param operation - Async function to execute
   * @param circuitBreaker - Circuit breaker instance to use
   * @param context - Optional context string for error tracking
   * @returns Promise resolving to the operation result
   * 
   * @throws {@link TtsError} When circuit breaker is open or operation fails
   * 
   * @example Circuit Breaker with TTS Operations
   * ```typescript
   * const retryHandler = new RetryHandler();
   * const circuitBreaker = new CircuitBreaker(3, 30000); // 3 failures, 30s timeout
   * 
   * try {
   *   const result = await retryHandler.executeWithCircuitBreaker(
   *     async () => {
   *       return await TtsUniversal.convertTts({
   *         text: 'Test text',
   *         voice: { name: 'en-US-Standard-A' }
   *       });
   *     },
   *     circuitBreaker,
   *     'protected-conversion'
   *   );
   *   
   *   console.log('Conversion successful');
   * } catch (error) {
   *   if (error.context?.circuitBreakerState === 'open') {
   *     console.log('Service temporarily disabled due to failures');
   *   }
   * }
   * ```
   * 
   * @since 3.0.0
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

  /**
   * Calculate delay for the next retry attempt
   * 
   * Implements exponential backoff with jitter and respects rate limit headers.
   * The delay increases exponentially with each attempt to reduce load on
   * failing services.
   * 
   * @param attemptNumber - Current attempt number (0-based)
   * @param error - Optional error from previous attempt for rate limit info
   * @returns Delay in milliseconds
   * @private
   */
  private calculateDelay(attemptNumber: number, error?: TtsError): number {
    let delay = this.options.initialDelay * Math.pow(this.options.backoffMultiplier, attemptNumber);
    
    // Respect rate limit retry-after header from provider
    if (error instanceof TtsRateLimitError && error.retryAfter) {
      delay = Math.max(delay, error.retryAfter * 1000);
    }

    // Apply maximum delay limit
    delay = Math.min(delay, this.options.maxDelay);

    // Add jitter to prevent thundering herd effect
    if (this.options.enableJitter) {
      delay *= (0.5 + Math.random() * 0.5);
    }

    return Math.floor(delay);
  }

  /**
   * Default retry condition - checks if error is retryable
   * 
   * @param error - Error to evaluate
   * @returns True if error should be retried
   * @private
   */
  private defaultRetryCondition(error: TtsError): boolean {
    return error.retryable;
  }

  /**
   * Normalize various error types to TtsError for consistent handling
   * 
   * Converts Node.js errors, HTTP errors, and other error types into
   * standardized TtsError instances with appropriate error codes.
   * 
   * @param error - Error to normalize
   * @param context - Optional context for error tracking
   * @returns Normalized TtsError instance
   * @private
   */
  private normalizeError(error: unknown, context?: string): TtsError {
    if (error instanceof TtsError) {
      return error;
    }

    // Convert common Node.js error types to TtsError
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

    // Handle timeout errors
    if (error && typeof error === 'object' && 'name' in error && error.name === 'TimeoutError') {
      return new TtsError(
        'Request timeout',
        TtsErrorCode.TIMEOUT,
        { context: { originalError: error, context } }
      );
    }

    // Default to unknown error for unrecognized error types
    const message = error && typeof error === 'object' && 'message' in error 
      ? String(error.message) 
      : 'Unknown error occurred';

    return new TtsError(
      message,
      TtsErrorCode.UNKNOWN_ERROR,
      { context: { originalError: error, context } }
    );
  }

  /**
   * Sleep for the specified number of milliseconds
   * 
   * @param ms - Milliseconds to sleep
   * @returns Promise that resolves after the delay
   * @private
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}

/**
 * Circuit breaker implementation for protecting against cascading failures
 * 
 * Implements the circuit breaker pattern to prevent cascading failures by
 * temporarily disabling service calls when too many failures occur. The
 * circuit breaker has three states: closed (normal), open (blocked), and
 * half-open (testing recovery).
 * 
 * @example Basic Circuit Breaker Usage
 * ```typescript
 * import { CircuitBreaker, RetryHandler } from 'cloud-text-to-speech';
 * 
 * const circuitBreaker = new CircuitBreaker(3, 30000); // 3 failures, 30s timeout
 * const retryHandler = new RetryHandler();
 * 
 * async function protectedTtsCall() {
 *   try {
 *     return await retryHandler.executeWithCircuitBreaker(
 *       () => TtsUniversal.convertTts({ text: 'Hello', voice: { name: 'voice' } }),
 *       circuitBreaker,
 *       'protected-call'
 *     );
 *   } catch (error) {
 *     if (circuitBreaker.isOpen()) {
 *       console.log('Circuit breaker is open - service temporarily disabled');
 *     }
 *     throw error;
 *   }
 * }
 * ```
 * 
 * @example Monitoring Circuit Breaker State
 * ```typescript
 * const circuitBreaker = new CircuitBreaker(5, 60000);
 * 
 * // Monitor circuit breaker state
 * setInterval(() => {
 *   console.log(`Circuit breaker state: ${circuitBreaker.getState()}`);
 *   console.log(`Failure count: ${circuitBreaker.getFailureCount()}`);
 *   
 *   if (circuitBreaker.isOpen()) {
 *     console.log('Service is temporarily disabled due to failures');
 *   }
 * }, 10000);
 * ```
 * 
 * @category Error Handling
 * @since 3.0.0
 */
export class CircuitBreaker {
  /** Current number of consecutive failures */
  private failureCount = 0;
  /** Timestamp of the last failure occurrence */
  private lastFailureTime = 0;
  /** Current state of the circuit breaker */
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  /**
   * Creates a new circuit breaker with specified thresholds
   * 
   * @param failureThreshold - Number of failures required to open the circuit (default: 5)
   * @param timeoutMs - Time in milliseconds to wait before attempting recovery (default: 60000ms)
   */
  constructor(
    private readonly failureThreshold: number = 5,
    private readonly timeoutMs: number = 60000 // 1 minute
  ) {}

  /**
   * Checks if the circuit breaker is currently open (blocking requests)
   * 
   * Determines whether requests should be blocked based on the current state
   * and time since last failure. Automatically transitions from open to
   * half-open state after the timeout period.
   * 
   * @returns True if the circuit breaker is open and blocking requests
   */
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

  /**
   * Records a successful operation and resets the circuit breaker
   * 
   * Called when an operation succeeds, which resets the failure count
   * and closes the circuit breaker to allow normal operation.
   */
  recordSuccess(): void {
    this.failureCount = 0;
    this.state = 'closed';
  }

  /**
   * Records a failed operation and potentially opens the circuit breaker
   * 
   * Increments the failure count and opens the circuit breaker if the
   * failure threshold is reached. This prevents further requests until
   * the timeout period elapses.
   */
  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'open';
    }
  }

  /**
   * Gets the current state of the circuit breaker
   * 
   * @returns Current state: 'closed', 'open', or 'half-open'
   */
  getState(): string {
    return this.state;
  }

  /**
   * Gets the current failure count
   * 
   * @returns Number of consecutive failures recorded
   */
  getFailureCount(): number {
    return this.failureCount;
  }
}

/**
 * Pre-configured retry handlers for common TTS operation scenarios
 * 
 * Provides ready-to-use retry configurations optimized for different
 * types of TTS operations, from conservative authentication retries
 * to aggressive critical operation retries.
 * 
 * @example Using Pre-configured Retry Handlers
 * ```typescript
 * import { RetryConfigurations } from 'cloud-text-to-speech';
 * 
 * // Use standard retry for most operations
 * const result = await RetryConfigurations.standard.execute(async () => {
 *   return await TtsUniversal.convertTts({
 *     text: 'Hello world',
 *     voice: { name: 'en-US-Standard-A' }
 *   });
 * });
 * 
 * // Use rate limit specific retry for bulk operations
 * const voices = await RetryConfigurations.rateLimit.execute(async () => {
 *   return await TtsUniversal.getVoices();
 * });
 * 
 * // Use aggressive retry for critical operations
 * const criticalResult = await RetryConfigurations.aggressive.execute(async () => {
 *   return await performCriticalTtsOperation();
 * });
 * ```
 * 
 * @example Comparing Retry Strategies
 * ```typescript
 * // Conservative: 2 retries, longer delays, good for auth
 * await RetryConfigurations.authentication.execute(authOperation);
 * 
 * // Standard: 3 retries, balanced timing, good for most use cases
 * await RetryConfigurations.standard.execute(normalOperation);
 * 
 * // Aggressive: 5 retries, faster attempts, good for critical operations
 * await RetryConfigurations.aggressive.execute(criticalOperation);
 * 
 * // Rate limit aware: Longer delays, optimized for rate limit scenarios
 * await RetryConfigurations.rateLimit.execute(bulkOperation);
 * ```
 * 
 * @category Error Handling
 * @since 3.0.0
 */
export const RetryConfigurations = {
  /** 
   * Conservative retry configuration for authentication operations
   * 
   * Uses fewer retries with longer delays to avoid overwhelming
   * authentication services or triggering security measures.
   * 
   * - Max retries: 2
   * - Initial delay: 2000ms
   * - Max delay: 10000ms
   * - Backoff multiplier: 2
   */
  authentication: new RetryHandler({
    maxRetries: 2,
    initialDelay: 2000,
    maxDelay: 10000,
    backoffMultiplier: 2
  }),

  /** 
   * Standard retry configuration for typical API calls
   * 
   * Balanced approach suitable for most TTS operations with
   * reasonable retry counts and timing.
   * 
   * - Max retries: 3
   * - Initial delay: 1000ms
   * - Max delay: 30000ms
   * - Backoff multiplier: 2
   */
  standard: new RetryHandler({
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2
  }),

  /** 
   * Aggressive retry configuration for critical operations
   * 
   * More retry attempts with faster initial recovery for
   * operations that must succeed.
   * 
   * - Max retries: 5
   * - Initial delay: 500ms
   * - Max delay: 60000ms
   * - Backoff multiplier: 1.5
   */
  aggressive: new RetryHandler({
    maxRetries: 5,
    initialDelay: 500,
    maxDelay: 60000,
    backoffMultiplier: 1.5
  }),

  /** 
   * Rate limit aware retry configuration
   * 
   * Optimized for scenarios where rate limiting is expected,
   * with longer delays and specific retry conditions.
   * 
   * - Max retries: 3
   * - Initial delay: 5000ms
   * - Max delay: 120000ms
   * - Backoff multiplier: 3
   * - Only retries rate limit and retryable errors
   */
  rateLimit: new RetryHandler({
    maxRetries: 3,
    initialDelay: 5000,
    maxDelay: 120000,
    backoffMultiplier: 3,
    retryCondition: (error): boolean => 
      error.code === TtsErrorCode.RATE_LIMIT_EXCEEDED || error.retryable
  })
}; 