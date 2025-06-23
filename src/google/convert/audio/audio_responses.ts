/**
 * @fileoverview Google Cloud Text-to-Speech Audio Response Types
 * 
 * This module defines response classes for Google Cloud Text-to-Speech audio operations.
 * It provides a comprehensive set of response types covering success scenarios and
 * various error conditions that can occur during Google TTS audio synthesis.
 * 
 * The response types extend the base HTTP response functionality with Google-specific
 * error codes, messages, and audio data handling. Each response class provides
 * structured information about the API operation outcome and any associated data.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link https://cloud.google.com/text-to-speech/docs/error-messages | Google TTS Error Messages}
 * @see {@link HttpResponseBase} for base response functionality
 * 
 * @example Basic Response Handling
 * ```typescript
 * import { AudioResponseGoogle, AudioSuccessGoogle } from './audio_responses.js';
 * 
 * async function handleTTSResponse(response: AudioResponseGoogle) {
 *   if (response instanceof AudioSuccessGoogle) {
 *     console.log('Audio synthesis successful');
 *     const audioData = response.audio;
 *     // Process audio data
 *   } else {
 *     console.error(`TTS failed: ${response.reason}`);
 *   }
 * }
 * ```
 * 
 * @example Error-Specific Handling
 * ```typescript
 * import {
 *   AudioFailedUnauthorizedGoogle,
 *   AudioFailedTooManyRequestGoogle,
 *   AudioFailedBadRequestGoogle
 * } from './audio_responses.js';
 * 
 * function handleTTSError(response: AudioResponseGoogle) {
 *   if (response instanceof AudioFailedUnauthorizedGoogle) {
 *     // Handle authentication issues
 *     console.error('Authentication failed - check API key');
 *   } else if (response instanceof AudioFailedTooManyRequestGoogle) {
 *     // Handle rate limiting
 *     console.error('Rate limit exceeded - implement backoff');
 *   } else if (response instanceof AudioFailedBadRequestGoogle) {
 *     // Handle bad request
 *     console.error('Invalid request parameters');
 *   }
 * }
 * ```
 * 
 * @example Production Response Pipeline
 * ```typescript
 * import { AudioResponseGoogle, AudioSuccessGoogle } from './audio_responses.js';
 * 
 * class GoogleTTSResponseHandler {
 *   async processResponse(response: AudioResponseGoogle): Promise<Buffer | null> {
 *     try {
 *       if (response instanceof AudioSuccessGoogle) {
 *         // Log success metrics
 *         this.logSuccess(response);
 *         
 *         // Convert Uint8Array to Buffer for Node.js compatibility
 *         return Buffer.from(response.audio);
 *       } else {
 *         // Log error metrics
 *         this.logError(response);
 *         
 *         // Handle retry logic for specific error types
 *         if (this.shouldRetry(response)) {
 *           return await this.scheduleRetry();
 *         }
 *         
 *         return null;
 *       }
 *     } catch (error) {
 *       console.error('Response processing failed:', error);
 *       return null;
 *     }
 *   }
 * 
 *   private shouldRetry(response: AudioResponseGoogle): boolean {
 *     // Implement retry logic based on error type
 *     return response.code === 429 || response.code === 502;
 *   }
 * }
 * ```
 * 
 * @example Audio Data Processing
 * ```typescript
 * import { AudioSuccessGoogle } from './audio_responses.js';
 * import * as fs from 'fs';
 * 
 * async function saveAudioResponse(response: AudioSuccessGoogle, filename: string) {
 *   try {
 *     // Convert Uint8Array to Buffer and save to file
 *     const buffer = Buffer.from(response.audio);
 *     await fs.promises.writeFile(filename, buffer);
 *     console.log(`Audio saved to ${filename}`);
 *   } catch (error) {
 *     console.error('Failed to save audio:', error);
 *   }
 * }
 * ```
 */

import { HttpResponseBase } from '../../../common/http/http_response_base.js';

/**
 * Base class for all Google Cloud Text-to-Speech audio responses
 * 
 * Abstract base class that provides common functionality for all Google TTS
 * audio response types. Extends the base HTTP response with Google-specific
 * error handling and response structure.
 * 
 * @example Type Checking
 * ```typescript
 * function isGoogleAudioResponse(response: any): response is AudioResponseGoogle {
 *   return response instanceof AudioResponseGoogle;
 * }
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export abstract class AudioResponseGoogle extends HttpResponseBase {
  /**
   * Creates a new Google audio response instance
   * 
   * @param code - HTTP status code
   * @param reason - Human-readable reason phrase
   * 
   * @protected
   */
  protected constructor(code: number, reason: string) {
    super(code, reason);
  }
}

/**
 * Successful Google TTS audio synthesis response
 * 
 * Represents a successful audio synthesis operation containing the generated
 * audio data. The audio is provided as a Uint8Array that can be converted
 * to various formats or saved directly to a file.
 * 
 * @example Processing Success Response
 * ```typescript
 * if (response instanceof AudioSuccessGoogle) {
 *   const audioBuffer = Buffer.from(response.audio);
 *   await fs.writeFile('output.mp3', audioBuffer);
 * }
 * ```
 * 
 * @example Streaming Audio Data
 * ```typescript
 * const successResponse = new AudioSuccessGoogle(audioData);
 * const stream = new ReadableStream({
 *   start(controller) {
 *     controller.enqueue(successResponse.audio);
 *     controller.close();
 *   }
 * });
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class AudioSuccessGoogle extends AudioResponseGoogle {
  /**
   * Creates a successful audio response
   * 
   * @param audio - The synthesized audio data as Uint8Array
   * 
   * @example Creating Success Response
   * ```typescript
   * const audioData = new Uint8Array([]);
   * const response = new AudioSuccessGoogle(audioData);
   * console.log(`Audio size: ${response.audio.length} bytes`);
   * ```
   */
  constructor(public audio: Uint8Array) {
    super(200, 'Success');
  }
}

/**
 * Bad Request error response for Google TTS
 * 
 * Indicates that a required parameter is missing, empty, null, or invalid.
 * Common causes include malformed SSML, invalid voice names, or incorrect
 * audio format specifications.
 * 
 * @example Handling Bad Request
 * ```typescript
 * if (response instanceof AudioFailedBadRequestGoogle) {
 *   console.error('Request validation failed:', response.reason);
 *   // Check input parameters and format
 * }
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class AudioFailedBadRequestGoogle extends AudioResponseGoogle {
  /**
   * Creates a bad request error response
   * 
   * @param reasonPhrase - Optional additional error details
   * 
   * @example With Custom Reason
   * ```typescript
   * const error = new AudioFailedBadRequestGoogle('Invalid voice name: xyz-123');
   * ```
   */
  constructor(reasonPhrase?: string) {
    super(
      400,
      `Bad Request A required parameter is missing, empty, or null. Or, the value passed to either a required or optional parameter is invalid. A common issue is a header that is too long. ${reasonPhrase ?? ''}`,
    );
  }
}

/**
 * Unauthorized error response for Google TTS
 * 
 * Indicates authentication failure, typically due to invalid API keys,
 * expired tokens, or insufficient permissions for the requested operation.
 * 
 * @example Handling Authorization Error
 * ```typescript
 * if (response instanceof AudioFailedUnauthorizedGoogle) {
 *   console.error('Authentication failed - check API credentials');
 *   // Refresh credentials or check API key
 * }
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class AudioFailedUnauthorizedGoogle extends AudioResponseGoogle {
  /**
   * Creates an unauthorized error response
   * 
   * @example Basic Usage
   * ```typescript
   * const authError = new AudioFailedUnauthorizedGoogle();
   * console.log(authError.code); // 401
   * ```
   */
  constructor() {
    super(
      401,
      'Unauthorized The request is not authorized. Check to make sure your subscription key or token is valid and in the correct region.',
    );
  }
}

/**
 * Unsupported Media Type error response for Google TTS
 * 
 * Indicates that the provided Content-Type header is incorrect or unsupported.
 * Most commonly occurs when the Content-Type is not set to the expected
 * application/ssml+xml for SSML requests.
 * 
 * @example Handling Media Type Error
 * ```typescript
 * if (response instanceof AudioFailedUnsupportedGoogle) {
 *   console.error('Check Content-Type header - should be application/ssml+xml');
 * }
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class AudioFailedUnsupportedGoogle extends AudioResponseGoogle {
  /**
   * Creates an unsupported media type error response
   * 
   * @example Basic Usage
   * ```typescript
   * const mediaError = new AudioFailedUnsupportedGoogle();
   * console.log(mediaError.code); // 415
   * ```
   */
  constructor() {
    super(
      415,
      "Unsupported Media Type It's possible that the wrong Content-Type was provided. Content-Type should be set to application/ssml+xml.",
    );
  }
}

/**
 * Too Many Requests error response for Google TTS
 * 
 * Indicates that the request rate limit or quota has been exceeded.
 * Applications should implement exponential backoff and retry logic
 * when encountering this error.
 * 
 * @example Handling Rate Limiting
 * ```typescript
 * if (response instanceof AudioFailedTooManyRequestGoogle) {
 *   console.warn('Rate limit exceeded - implementing backoff');
 *   await delay(exponentialBackoff());
 *   // Retry request
 * }
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class AudioFailedTooManyRequestGoogle extends AudioResponseGoogle {
  /**
   * Creates a too many requests error response
   * 
   * @example Basic Usage
   * ```typescript
   * const rateError = new AudioFailedTooManyRequestGoogle();
   * console.log(rateError.code); // 429
   * ```
   */
  constructor() {
    super(
      429,
      'Too Many Requests You have exceeded the quota or rate of requests allowed for your subscription.',
    );
  }
}

/**
 * Bad Gateway error response for Google TTS
 * 
 * Indicates network or server-side issues, potentially including invalid
 * headers or temporary service unavailability. These errors are typically
 * transient and may warrant retry attempts.
 * 
 * @example Handling Gateway Error
 * ```typescript
 * if (response instanceof AudioFailedBadGatewayGoogle) {
 *   console.warn('Server issue detected - may retry');
 *   // Implement retry logic
 * }
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class AudioFailedBadGatewayGoogle extends AudioResponseGoogle {
  /**
   * Creates a bad gateway error response
   * 
   * @example Basic Usage
   * ```typescript
   * const gatewayError = new AudioFailedBadGatewayGoogle();
   * console.log(gatewayError.code); // 502
   * ```
   */
  constructor() {
    super(
      502,
      'Bad Gateway Network or server-side issue. May also indicate invalid headers.',
    );
  }
}

/**
 * Unknown error response for Google TTS
 * 
 * Represents any error condition not covered by the specific error types.
 * Provides flexibility for handling unexpected error codes while maintaining
 * the response structure.
 * 
 * @example Handling Unknown Error
 * ```typescript
 * if (response instanceof AudioFailedUnknownErrorGoogle) {
 *   console.error(`Unexpected error ${response.code}: ${response.reason}`);
 * }
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class AudioFailedUnknownErrorGoogle extends AudioResponseGoogle {
  /**
   * Creates an unknown error response
   * 
   * @param code - HTTP status code
   * @param reason - Error description
   * 
   * @example Custom Error
   * ```typescript
   * const unknownError = new AudioFailedUnknownErrorGoogle(
   *   418,
   *   "I'm a teapot - unexpected server response"
   * );
   * ```
   */
  constructor(code: number, reason: string) {
    super(code, reason);
  }
}
