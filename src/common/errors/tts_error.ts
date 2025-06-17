/**
 * Universal Error Hierarchy for Cloud Text-to-Speech v3
 * Provides standardized error handling across all providers
 */

export enum TtsErrorCode {
  // General Errors
  INITIALIZATION_ERROR = 'INITIALIZATION_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // Authentication Errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Request Errors
  BAD_REQUEST = 'BAD_REQUEST',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  INVALID_VOICE = 'INVALID_VOICE',
  INVALID_SSML = 'INVALID_SSML',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  
  // Network Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  BAD_GATEWAY = 'BAD_GATEWAY',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  
  // Internal Errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface TtsErrorContext {
  provider?: string;
  endpoint?: string;
  requestId?: string;
  timestamp?: number;
  originalError?: Error | unknown;
  retryCount?: number;
  retryAfter?: number;
  httpStatus?: number;
  details?: Record<string, unknown>;
  validationErrors?: string[];
  circuitBreakerState?: string;
  context?: string;
  itemsCount?: number;
  batchIndex?: number;
}

/**
 * Base TTS Error class with enhanced context and retry information
 */
export class TtsError extends Error {
  public readonly code: TtsErrorCode;
  public readonly provider?: string;
  public readonly retryable: boolean;
  public readonly context: TtsErrorContext;
  public readonly timestamp: number;

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
 */
export class TtsAuthenticationError extends TtsError {
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
 */
export class TtsRateLimitError extends TtsError {
  public readonly retryAfter?: number;

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
 */
export class TtsValidationError extends TtsError {
  public readonly validationErrors: string[];

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
 */
export class TtsNetworkError extends TtsError {
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
 * Service unavailable errors
 */
export class TtsServiceError extends TtsError {
  constructor(message: string, provider?: string, context?: TtsErrorContext) {
    super(message, TtsErrorCode.SERVICE_UNAVAILABLE, {
      provider,
      retryable: true,
      context
    });
    this.name = 'TtsServiceError';
  }
} 