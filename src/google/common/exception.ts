import { HttpResponseBase } from '../../common/http/http_response_base.js';

/**
 * @fileoverview Google Cloud Text-to-Speech Exception Handling
 * 
 * This module defines Google-specific exception types and error handling mechanisms
 * for Google Cloud Text-to-Speech API operations. It provides specialized error
 * classes that extend the base TTS error system with Google-specific error codes,
 * messages, and retry guidance.
 * 
 * The exception system includes proper error categorization, user-friendly messages,
 * and integration with Google Cloud error response formats for comprehensive
 * error handling in production applications.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link https://cloud.google.com/apis/design/errors | Google Cloud API Errors}
 * @see {@link https://cloud.google.com/text-to-speech/docs/error-codes | Google TTS Error Codes}
 * 
 * @example Basic Exception Handling
 * ```typescript
 * import { ExceptionGoogle } from './exception.js';
 * import { TtsGoogle } from '../tts/tts.js';
 * 
 * try {
 *   const result = await TtsGoogle.convertTts(params);
 * } catch (error) {
 *   if (error instanceof ExceptionGoogle) {
 *     console.error(`Google TTS Error: ${error.getUserMessage()}`);
 *     console.error(`Error Code: ${error.code}`);
 *     
 *     if (error.retryable) {
 *       console.log('This error can be retried');
 *     }
 *   }
 * }
 * ```
 * 
 * @example Custom Google Exception Creation
 * ```typescript
 * import { ExceptionGoogle } from './exception.js';
 * 
 * // Create custom Google-specific error
 * const customError = new ExceptionGoogle(
 *   'Custom Google TTS error occurred',
 *   'CUSTOM_ERROR',
 *   {
 *     provider: 'google',
 *     retryable: false,
 *     context: { operation: 'custom-operation' }
 *   }
 * );
 * 
 * throw customError;
 * ```
 * 
 * @example Error Response Mapping
 * ```typescript
 * import { ExceptionGoogle } from './exception.js';
 * 
 * function mapGoogleApiError(apiResponse: any): ExceptionGoogle {
 *   const { error } = apiResponse;
 *   
 *   return new ExceptionGoogle(
 *     error.message || 'Unknown Google API error',
 *     error.code || 'UNKNOWN_ERROR',
 *     {
 *       provider: 'google',
 *       retryable: error.status >= 500,
 *       context: {
 *         status: error.status,
 *         details: error.details
 *       }
 *     }
 *   );
 * }
 * ```
 * 
 * @example Production Error Handling
 * ```typescript
 * import { ExceptionGoogle } from './exception.js';
 * import { TtsGoogle } from '../tts/tts.js';
 * 
 * class GoogleTtsErrorHandler {
 *   static async handleTtsOperation<T>(
 *     operation: () => Promise<T>
 *   ): Promise<T> {
 *     try {
 *       return await operation();
 *     } catch (error) {
 *       if (error instanceof ExceptionGoogle) {
 *         // Log Google-specific error details
 *         console.error('Google TTS Error:', {
 *           message: error.getUserMessage(),
 *           code: error.code,
 *           retryable: error.retryable,
 *           provider: error.provider,
 *           context: error.context
 *         });
 *         
 *         // Implement retry logic for retryable errors
 *         if (error.retryable) {
 *           console.log('Scheduling retry for Google TTS operation');
 *         }
 *       }
 *       
 *       throw error;
 *     }
 *   }
 * }
 * ```
 */

/**
 * Google Cloud Text-to-Speech specific exception class
 * 
 * This class extends the base TTS error system to provide Google-specific
 * error handling with proper error codes, retry guidance, and context
 * information. It integrates with Google Cloud API error responses
 * and provides user-friendly error messages for common error scenarios.
 * 
 * The exception class includes Google-specific error categorization,
 * retry recommendations, and detailed context information to help
 * developers debug and handle errors effectively in production environments.
 * 
 * @example Basic Google Exception Usage
 * ```typescript
 * try {
 *   // Some Google TTS operation
 *   await TtsGoogle.convertTts(params);
 * } catch (error) {
 *   if (error instanceof ExceptionGoogle) {
 *     console.error('Google Error:', error.getUserMessage());
 *     
 *     if (error.code === 'QUOTA_EXCEEDED') {
 *       console.log('Rate limit exceeded, waiting before retry');
 *     }
 *   }
 * }
 * ```
 * 
 * @example Creating Custom Google Exceptions
 * ```typescript
 * const error = new ExceptionGoogle(
 *   'Custom voice model not found',
 *   'CUSTOM_VOICE_NOT_FOUND',
 *   {
 *     provider: 'google',
 *     retryable: false,
 *     context: { voiceId: 'custom-voice-123' }
 *   }
 * );
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class ExceptionGoogle extends Error {
  response: HttpResponseBase;
  code: string;
  provider?: string;
  retryable?: boolean;
  context?: Record<string, unknown>;

  /**
   * Creates a new Google Cloud TTS exception
   * 
   * @param message - Human-readable error message describing what went wrong
   * @param code - Google-specific error code for programmatic handling
   * @param options - Additional error context and configuration options
   * 
   * @example
   * ```typescript
   * const error = new ExceptionGoogle(
   *   'API key is invalid or expired',
   *   'INVALID_API_KEY',
   *   {
   *     provider: 'google',
   *     retryable: false,
   *     context: { apiKeyPrefix: 'AIza...' }
   *   }
   * );
   * ```
   */
  constructor(
    message: string,
    code: string,
    options?: {
      provider?: string;
      retryable?: boolean;
      context?: Record<string, unknown>;
    }
  ) {
    super(`[TtsExceptionGoogle] ${code}: ${message}`);
    this.response = new HttpResponseBase(this.mapErrorCodeToHttpStatus(code), message);
    this.code = code;
    this.provider = options?.provider;
    this.retryable = options?.retryable;
    this.context = options?.context;
    this.name = 'TtsExceptionGoogle';
  }
  
  private mapErrorCodeToHttpStatus(errorCode: string): number {
    const statusMap: Record<string, number> = {
      'INVALID_API_KEY': 401,
      'QUOTA_EXCEEDED': 429,
      'INVALID_REQUEST': 400,
      'NOT_FOUND': 404,
      'PERMISSION_DENIED': 403,
      'INTERNAL_ERROR': 500,
      'SERVICE_UNAVAILABLE': 503,
      'TIMEOUT': 408
    };
    
    return statusMap[errorCode] || 500;
  }
}
