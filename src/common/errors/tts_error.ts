/**
 * @fileoverview Universal Error System for Cloud Text-to-Speech
 * 
 * This module provides a comprehensive error handling system for the Cloud Text-to-Speech
 * library, supporting standardized error reporting across Google Cloud, Microsoft Azure,
 * and Amazon Polly providers. The error system includes retry mechanisms, context tracking,
 * and user-friendly error messages.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 */

/**
 * Enumeration of standardized error codes across all TTS providers
 * 
 * These error codes provide a consistent way to identify and handle specific
 * error conditions regardless of the underlying TTS provider. Each code maps
 * to common error scenarios that can occur during TTS operations.
 * 
 * @example Error Code Usage
 * ```typescript
 * try {
 *   const result = await TtsUniversal.convertTts(params);
 * } catch (error) {
 *   if (error instanceof TtsError) {
 *     switch (error.code) {
 *       case TtsErrorCode.RATE_LIMIT_EXCEEDED:
 *         console.log('Rate limited, implement backoff');
 *         break;
 *       case TtsErrorCode.UNAUTHORIZED:
 *         console.log('Check API credentials');
 *         break;
 *       case TtsErrorCode.INVALID_VOICE:
 *         console.log('Voice not supported');
 *         break;
 *     }
 *   }
 * }
 * ```
 * 
 * @category Error Handling
 * @since 3.0.0
 */
export enum TtsErrorCode {
  // General Errors
  /** Service initialization failed due to configuration issues */
  INITIALIZATION_ERROR = 'INITIALIZATION_ERROR',
  /** Invalid configuration parameters provided */
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  /** Input validation failed (invalid parameters, format, etc.) */
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // Authentication Errors
  /** API credentials are invalid or access is denied */
  UNAUTHORIZED = 'UNAUTHORIZED',
  /** Provided API credentials are malformed or incorrect */
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  /** Authentication token has expired and needs renewal */
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Request Errors
  /** Request parameters are invalid or malformed */
  BAD_REQUEST = 'BAD_REQUEST',
  /** Requested audio format is not supported by the provider */
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  /** Specified voice is not available or supported */
  INVALID_VOICE = 'INVALID_VOICE',
  /** SSML content contains syntax errors or unsupported elements */
  INVALID_SSML = 'INVALID_SSML',
  
  // Rate Limiting
  /** API rate limit has been exceeded */
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  /** Usage quota has been exceeded */
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  
  // Network Errors
  /** Network connectivity issues or request timeout */
  NETWORK_ERROR = 'NETWORK_ERROR',
  /** Request timeout exceeded */
  TIMEOUT = 'TIMEOUT',
  /** Gateway or proxy server error */
  BAD_GATEWAY = 'BAD_GATEWAY',
  /** TTS service is temporarily unavailable */
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  
  // Internal Errors
  /** Internal server error on the provider side */
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  /** Unexpected error condition */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Context information for TTS errors
 * 
 * Provides additional metadata and context about error conditions to help
 * with debugging, monitoring, and error handling decisions. This context
 * is automatically populated by the error handling system.
 * 
 * @example Accessing Error Context
 * ```typescript
 * try {
 *   await TtsUniversal.convertTts(params);
 * } catch (error) {
 *   if (error instanceof TtsError) {
 *     console.log(`Provider: ${error.context.provider}`);
 *     console.log(`Request ID: ${error.context.requestId}`);
 *     console.log(`Retry count: ${error.context.retryCount}`);
 *     if (error.context.retryAfter) {
 *       console.log(`Retry after: ${error.context.retryAfter} seconds`);
 *     }
 *   }
 * }
 * ```
 * 
 * @category Error Handling
 * @since 3.0.0
 */
export interface TtsErrorContext {
  /** TTS provider where the error occurred */
  provider?: string;
  /** API endpoint that was called */
  endpoint?: string;
  /** Unique request identifier for tracking */
  requestId?: string;
  /** Unix timestamp when the error occurred */
  timestamp?: number;
  /** Original error object from the provider */
  originalError?: Error | unknown;
  /** Number of retry attempts made */
  retryCount?: number;
  /** Seconds to wait before retrying (for rate limit errors) */
  retryAfter?: number;
  /** HTTP status code from the response */
  httpStatus?: number;
  /** Additional provider-specific error details */
  details?: Record<string, unknown>;
  /** Array of validation error messages */
  validationErrors?: string[];
  /** Current state of circuit breaker (if applicable) */
  circuitBreakerState?: string;
  /** Operation context or description */
  context?: string;
  /** Number of items being processed (for batch operations) */
  itemsCount?: number;
  /** Index of the failed item in batch operations */
  batchIndex?: number;
}

/**
 * Base TTS Error class with enhanced context and retry information
 * 
 * The foundational error class for all TTS-related errors. Provides standardized
 * error handling with rich context information, retry capabilities, and user-friendly
 * error messages. All other TTS error types inherit from this base class.
 * 
 * @example Basic Error Handling
 * ```typescript
 * try {
 *   const result = await TtsUniversal.convertTts({
 *     text: 'Hello world',
 *     voice: { name: 'invalid-voice' }
 *   });
 * } catch (error) {
 *   if (error instanceof TtsError) {
 *     console.error(`TTS Error [${error.code}]: ${error.getUserMessage()}`);
 *     console.log(`Retryable: ${error.retryable}`);
 *     console.log(`Provider: ${error.provider}`);
 *     
 *     // Log full context for debugging
 *     console.debug('Error context:', error.context);
 *   }
 * }
 * ```
 * 
 * @example Creating Custom Errors
 * ```typescript
 * throw new TtsError(
 *   'Custom error message',
 *   TtsErrorCode.VALIDATION_ERROR,
 *   {
 *     provider: 'google',
 *     retryable: false,
 *     context: {
 *       endpoint: '/v1/text:synthesize',
 *       validationErrors: ['Voice name is required'],
 *       details: { inputLength: 0 }
 *     }
 *   }
 * );
 * ```
 * 
 * @example Serializing Errors
 * ```typescript
 * const errorData = error.toJSON();
 * // Send to monitoring system
 * await logError(errorData);
 * 
 * // Or save to file
 * await fs.writeFile('error.json', JSON.stringify(errorData, null, 2));
 * ```
 * 
 * @category Error Handling
 * @since 3.0.0
 */
export class TtsError extends Error {
  /** Standardized error code for programmatic handling */
  public readonly code: TtsErrorCode;
  /** TTS provider where the error occurred */
  public readonly provider?: string;
  /** Whether this error condition can be retried */
  public readonly retryable: boolean;
  /** Additional context and metadata about the error */
  public readonly context: TtsErrorContext;
  /** Unix timestamp when the error was created */
  public readonly timestamp: number;

  /**
   * Creates a new TTS error with context and metadata
   * 
   * @param message - Human-readable error message
   * @param code - Standardized error code from TtsErrorCode enum
   * @param options - Configuration options for the error
   * @param options.provider - TTS provider identifier
   * @param options.retryable - Override default retry behavior for this error code
   * @param options.context - Additional context and metadata
   * @param options.cause - Original error that caused this error
   */
  constructor(
    message: string,
    code: TtsErrorCode,
    options: {
      provider?: string;
      retryable?: boolean;
      context?: TtsErrorContext;
      cause?: Error | unknown;
    } = {}
  ) {
    super(message);
    this.name = 'TtsError';
    this.code = code;
    this.provider = options.provider;
    this.retryable = options.retryable ?? this.isRetryableByDefault(code);
    this.timestamp = Date.now();
    this.context = {
      ...options.context,
      provider: options.provider,
      timestamp: this.timestamp,
      originalError: options.cause
    };

    // Maintain proper stack trace for V8 engines
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TtsError);
    }
  }

  /**
   * Determines if an error code is retryable by default
   * 
   * @param code - Error code to check
   * @returns True if the error is typically retryable
   * @private
   */
  private isRetryableByDefault(code: TtsErrorCode): boolean {
    const retryableCodes = [
      TtsErrorCode.RATE_LIMIT_EXCEEDED,
      TtsErrorCode.NETWORK_ERROR,
      TtsErrorCode.TIMEOUT,
      TtsErrorCode.BAD_GATEWAY,
      TtsErrorCode.SERVICE_UNAVAILABLE,
      TtsErrorCode.INTERNAL_ERROR
    ];
    return retryableCodes.includes(code);
  }

  /**
   * Creates a serializable representation of the error
   * 
   * Converts the error object to a plain JavaScript object that can be
   * safely serialized to JSON for logging, monitoring, or storage purposes.
   * 
   * @returns Serializable error representation
   * 
   * @example
   * ```typescript
   * const errorJson = error.toJSON();
   * console.log(JSON.stringify(errorJson, null, 2));
   * 
   * // Output:
   * // {
   * //   "name": "TtsError",
   * //   "message": "Invalid voice specified",
   * //   "code": "INVALID_VOICE",
   * //   "provider": "google",
   * //   "retryable": false,
   * //   "timestamp": 1640995200000,
   * //   "context": { ... },
   * //   "stack": "TtsError: Invalid voice..."
   * // }
   * ```
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      provider: this.provider,
      retryable: this.retryable,
      timestamp: this.timestamp,
      context: this.context,
      stack: this.stack
    };
  }

  /**
   * Creates a user-friendly error message
   * 
   * Generates a human-readable error message suitable for displaying to end users.
   * The message provides context about the error and suggests potential solutions
   * where appropriate.
   * 
   * @returns User-friendly error message
   * 
   * @example
   * ```typescript
   * try {
   *   await TtsUniversal.convertTts(params);
   * } catch (error) {
   *   if (error instanceof TtsError) {
   *     // Show user-friendly message to user
   *     showUserNotification(error.getUserMessage());
   *     
   *     // Log technical details for developers
   *     console.error(error.message, error.context);
   *   }
   * }
   * ```
   */
  getUserMessage(): string {
    const providerText = this.provider ? ` (${this.provider})` : '';
    switch (this.code) {
      case TtsErrorCode.UNAUTHORIZED:
        return `Authentication failed${providerText}. Please check your credentials.`;
      case TtsErrorCode.RATE_LIMIT_EXCEEDED:
        return `Rate limit exceeded${providerText}. Please try again later.`;
      case TtsErrorCode.INVALID_VOICE:
        return `Invalid voice specified${providerText}. Please select a supported voice.`;
      case TtsErrorCode.INVALID_SSML:
        return `Invalid SSML content${providerText}. Please check your SSML syntax.`;
      case TtsErrorCode.NETWORK_ERROR:
        return `Network error${providerText}. Please check your internet connection.`;
      case TtsErrorCode.SERVICE_UNAVAILABLE:
        return `Service temporarily unavailable${providerText}. Please try again later.`;
      default:
        return this.message;
    }
  }
}

/**
 * Authentication-related errors
 * 
 * Thrown when authentication fails due to invalid credentials, expired tokens,
 * or insufficient permissions. These errors are typically not retryable and
 * require user intervention to resolve.
 * 
 * @example Handling Authentication Errors
 * ```typescript
 * try {
 *   await TtsUniversal.getVoices();
 * } catch (error) {
 *   if (error instanceof TtsAuthenticationError) {
 *     console.error('Authentication failed:', error.getUserMessage());
 *     // Redirect to login or credential configuration
 *     redirectToAuthentication();
 *   }
 * }
 * ```
 * 
 * @category Error Handling
 * @since 3.0.0
 */
export class TtsAuthenticationError extends TtsError {
  /**
   * Creates a new authentication error
   * 
   * @param message - Detailed error message for developers
   * @param provider - TTS provider where authentication failed
   * @param context - Additional error context and metadata
   */
  constructor(message: string, provider?: string, context?: TtsErrorContext) {
    super(message, TtsErrorCode.UNAUTHORIZED, {
      provider,
      retryable: false,
      context
    });
    this.name = 'TtsAuthenticationError';
  }
}

/**
 * Rate limiting errors with retry information
 * 
 * Thrown when API rate limits are exceeded. These errors include information
 * about when to retry the request and are typically retryable with proper
 * backoff strategies.
 * 
 * @example Handling Rate Limit Errors
 * ```typescript
 * try {
 *   await TtsUniversal.convertTts(params);
 * } catch (error) {
 *   if (error instanceof TtsRateLimitError) {
 *     const delay = error.retryAfter || 60; // Default to 60 seconds
 *     console.log(`Rate limited, retrying in ${delay} seconds`);
 *     
 *     setTimeout(async () => {
 *       try {
 *         await TtsUniversal.convertTts(params);
 *       } catch (retryError) {
 *         console.error('Retry failed:', retryError);
 *       }
 *     }, delay * 1000);
 *   }
 * }
 * ```
 * 
 * @category Error Handling
 * @since 3.0.0
 */
export class TtsRateLimitError extends TtsError {
  /** Seconds to wait before retrying the request */
  public readonly retryAfter?: number;

  /**
   * Creates a new rate limit error
   * 
   * @param message - Detailed error message for developers
   * @param provider - TTS provider that returned the rate limit
   * @param retryAfter - Seconds to wait before retrying (from provider response)
   * @param context - Additional error context and metadata
   */
  constructor(
    message: string,
    provider?: string,
    retryAfter?: number,
    context?: TtsErrorContext
  ) {
    super(message, TtsErrorCode.RATE_LIMIT_EXCEEDED, {
      provider,
      retryable: true,
      context: {
        ...context,
        retryAfter
      }
    });
    this.name = 'TtsRateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Validation errors for input parameters
 * 
 * Thrown when input validation fails due to invalid parameters, unsupported
 * formats, or missing required fields. These errors include detailed validation
 * messages to help identify and fix the issues.
 * 
 * @example Handling Validation Errors
 * ```typescript
 * try {
 *   await TtsUniversal.convertTts({
 *     text: '', // Empty text
 *     voice: { name: '' } // Empty voice name
 *   });
 * } catch (error) {
 *   if (error instanceof TtsValidationError) {
 *     console.error('Validation failed:');
 *     error.validationErrors.forEach((err, index) => {
 *       console.error(`  ${index + 1}. ${err}`);
 *     });
 *     
 *     // Display errors to user for correction
 *     showValidationErrors(error.validationErrors);
 *   }
 * }
 * ```
 * 
 * @category Error Handling
 * @since 3.0.0
 */
export class TtsValidationError extends TtsError {
  /** Array of specific validation error messages */
  public readonly validationErrors: string[];

  /**
   * Creates a new validation error
   * 
   * @param message - General validation error message
   * @param validationErrors - Array of specific validation error messages
   * @param provider - TTS provider where validation failed
   * @param context - Additional error context and metadata
   */
  constructor(
    message: string,
    validationErrors: string[] = [],
    provider?: string,
    context?: TtsErrorContext
  ) {
    super(message, TtsErrorCode.VALIDATION_ERROR, {
      provider,
      retryable: false,
      context: {
        ...context,
        validationErrors
      }
    });
    this.name = 'TtsValidationError';
    this.validationErrors = validationErrors;
  }
}

/**
 * Network-related errors
 * 
 * Thrown when network connectivity issues occur, including timeouts,
 * DNS resolution failures, or connection refused errors. These errors
 * are typically retryable with appropriate backoff strategies.
 * 
 * @example Handling Network Errors
 * ```typescript
 * try {
 *   await TtsUniversal.convertTts(params);
 * } catch (error) {
 *   if (error instanceof TtsNetworkError) {
 *     console.error('Network error occurred:', error.getUserMessage());
 *     
 *     // Implement exponential backoff retry
 *     const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 30000);
 *     setTimeout(() => {
 *       retryOperation(params);
 *     }, retryDelay);
 *   }
 * }
 * ```
 * 
 * @category Error Handling
 * @since 3.0.0
 */
export class TtsNetworkError extends TtsError {
  /**
   * Creates a new network error
   * 
   * @param message - Detailed error message for developers
   * @param provider - TTS provider where the network error occurred
   * @param context - Additional error context and metadata
   */
  constructor(message: string, provider?: string, context?: TtsErrorContext) {
    super(message, TtsErrorCode.NETWORK_ERROR, {
      provider,
      retryable: true,
      context
    });
    this.name = 'TtsNetworkError';
  }
}

/**
 * Service-related errors from TTS providers
 * 
 * Thrown when the TTS service encounters internal errors, is temporarily
 * unavailable, or experiences other server-side issues. These errors are
 * typically retryable after a short delay.
 * 
 * @example Handling Service Errors
 * ```typescript
 * try {
 *   await TtsUniversal.convertTts(params);
 * } catch (error) {
 *   if (error instanceof TtsServiceError) {
 *     console.error('Service error:', error.getUserMessage());
 *     
 *     // Check if service is temporarily unavailable
 *     if (error.context.httpStatus === 503) {
 *       console.log('Service temporarily unavailable, will retry');
 *       scheduleRetry(params);
 *     }
 *   }
 * }
 * ```
 * 
 * @category Error Handling
 * @since 3.0.0
 */
export class TtsServiceError extends TtsError {
  /**
   * Creates a new service error
   * 
   * @param message - Detailed error message for developers
   * @param provider - TTS provider where the service error occurred
   * @param context - Additional error context and metadata
   */
  constructor(message: string, provider?: string, context?: TtsErrorContext) {
    super(message, TtsErrorCode.SERVICE_UNAVAILABLE, {
      provider,
      retryable: true,
      context
    });
    this.name = 'TtsServiceError';
  }
} 