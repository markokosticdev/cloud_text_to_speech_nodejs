/**
 * @fileoverview Google Cloud Text-to-Speech Audio Response Mapper
 * 
 * This module provides response mapping functionality for Google Cloud Text-to-Speech
 * audio operations. It transforms raw HTTP responses from the Google TTS API into
 * structured response objects with proper error handling and audio data processing.
 * 
 * The mapper handles base64 audio content decoding, maps various HTTP status codes
 * to specific error types, and provides consistent response objects for all
 * Google TTS operations. It ensures proper error classification and audio data handling.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link https://cloud.google.com/text-to-speech/docs/error-messages | Google TTS Error Messages}
 * @see {@link BaseResponseMapper} for base response mapping functionality
 * 
 * @example Basic Response Mapping
 * ```typescript
 * import { AudioResponseMapperGoogle } from './audio_response_mapper.js';
 * import { AudioSuccessGoogle } from './audio_responses.js';
 * 
 * const mapper = new AudioResponseMapperGoogle();
 * 
 * // Map successful TTS response
 * const response = await httpClient.post('/v1/text:synthesize', requestData);
 * const mappedResponse = mapper.map(response);
 * 
 * if (mappedResponse instanceof AudioSuccessGoogle) {
 *   console.log('Audio synthesis successful');
 *   const audioBuffer = Buffer.from(mappedResponse.audio);
 * }
 * ```
 * 
 * @example Error Response Handling
 * ```typescript
 * import { AudioResponseMapperGoogle } from './audio_response_mapper.js';
 * import { AudioFailedUnauthorizedGoogle } from './audio_responses.js';
 * 
 * const mapper = new AudioResponseMapperGoogle();
 * 
 * try {
 *   const httpResponse = await httpClient.post('/v1/text:synthesize', data);
 *   const result = mapper.map(httpResponse);
 *   
 *   if (result instanceof AudioFailedUnauthorizedGoogle) {
 *     console.error('Authentication failed - check API key');
 *   }
 * } catch (error) {
 *   console.error('Request failed:', error);
 * }
 * ```
 * 
 * @example Production Response Pipeline
 * ```typescript
 * import { AudioResponseMapperGoogle } from './audio_response_mapper.js';
 * import { AudioSuccessGoogle } from './audio_responses.js';
 * 
 * class GoogleTTSResponseProcessor {
 *   private mapper = new AudioResponseMapperGoogle();
 * 
 *   async processResponse(httpResponse: AxiosResponse): Promise<Buffer | null> {
 *     const mappedResponse = this.mapper.map(httpResponse);
 *     
 *     if (mappedResponse instanceof AudioSuccessGoogle) {
 *       // Log success metrics
 *       this.logSuccess(mappedResponse);
 *       return Buffer.from(mappedResponse.audio);
 *     } else {
 *       // Log error metrics
 *       this.logError(mappedResponse);
 *       return null;
 *     }
 *   }
 * 
 *   private logSuccess(response: AudioSuccessGoogle): void {
 *     console.log(`Audio generated: ${response.audio.length} bytes`);
 *   }
 * 
 *   private logError(response: HttpResponseBase): void {
 *     console.error(`TTS failed: ${response.code} - ${response.reason}`);
 *   }
 * }
 * ```
 * 
 * @example Advanced Error Classification
 * ```typescript
 * import { AudioResponseMapperGoogle } from './audio_response_mapper.js';
 * import {
 *   AudioFailedTooManyRequestGoogle,
 *   AudioFailedBadGatewayGoogle
 * } from './audio_responses.js';
 * 
 * const mapper = new AudioResponseMapperGoogle();
 * 
 * function handleMappedResponse(response: HttpResponseBase): boolean {
 *   if (response instanceof AudioFailedTooManyRequestGoogle) {
 *     // Implement rate limiting backoff
 *     console.warn('Rate limit hit - backing off');
 *     return true; // Should retry
 *   } else if (response instanceof AudioFailedBadGatewayGoogle) {
 *     // Server error - may retry
 *     console.warn('Server error - may retry');
 *     return true; // Should retry
 *   } else {
 *     // Client error - don't retry
 *     return false;
 *   }
 * }
 * ```
 */

import { BaseResponseMapper } from '../../../common/http/base_response_mapper.js';
import { AxiosResponse } from 'axios';
import { HttpResponseBase } from '../../../common/http/http_response_base.js';
import {
  AudioFailedBadGatewayGoogle,
  AudioFailedBadRequestGoogle,
  AudioFailedTooManyRequestGoogle,
  AudioFailedUnauthorizedGoogle,
  AudioFailedUnknownErrorGoogle,
  AudioFailedUnsupportedGoogle,
  AudioSuccessGoogle,
} from './audio_responses.js';

/**
 * Google Cloud Text-to-Speech audio response mapper
 * 
 * Maps raw HTTP responses from the Google TTS API to structured response objects.
 * Handles base64 audio content decoding, error status code mapping, and provides
 * consistent response objects for all Google TTS operations.
 * 
 * The mapper automatically decodes base64-encoded audio content and creates
 * appropriate success or error response objects based on HTTP status codes.
 * 
 * @example Basic Mapping
 * ```typescript
 * const mapper = new AudioResponseMapperGoogle();
 * const mappedResponse = mapper.map(httpResponse);
 * 
 * if (mappedResponse instanceof AudioSuccessGoogle) {
 *   // Process audio data
 *   const audioData = mappedResponse.audio;
 * }
 * ```
 * 
 * @example Error Handling
 * ```typescript
 * const mapper = new AudioResponseMapperGoogle();
 * const result = mapper.map(httpResponse);
 * 
 * switch (result.constructor) {
 *   case AudioSuccessGoogle:
 *     console.log('Success!');
 *     break;
 *   case AudioFailedUnauthorizedGoogle:
 *     console.error('Auth failed');
 *     break;
 *   default:
 *     console.error('Other error:', result.reason);
 * }
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class AudioResponseMapperGoogle implements BaseResponseMapper {
  /**
   * Maps an HTTP response to a structured Google TTS response object
   * 
   * Processes the HTTP response from Google TTS API and creates appropriate
   * response objects. For successful responses (200), decodes base64 audio
   * content. For error responses, creates specific error response objects
   * based on HTTP status codes.
   * 
   * @param response - The raw HTTP response from Google TTS API
   * @returns Structured response object (success or error)
   * 
   * @example Success Response Mapping
   * ```typescript
   * const mapper = new AudioResponseMapperGoogle();
   * 
   * // HTTP 200 response with base64 audio content
   * const httpResponse = {
   *   status: 200,
   *   data: { audioContent: 'base64-encoded-audio-data' }
   * };
   * 
   * const result = mapper.map(httpResponse);
   * // Returns AudioSuccessGoogle with decoded audio data
   * ```
   * 
   * @example Error Response Mapping
   * ```typescript
   * const mapper = new AudioResponseMapperGoogle();
   * 
   * // HTTP 401 unauthorized response
   * const httpResponse = {
   *   status: 401,
   *   statusText: 'Unauthorized'
   * };
   * 
   * const result = mapper.map(httpResponse);
   * // Returns AudioFailedUnauthorizedGoogle
   * ```
   * 
   * @example Unknown Error Handling
   * ```typescript
   * const mapper = new AudioResponseMapperGoogle();
   * 
   * // HTTP 418 (unusual status code)
   * const httpResponse = {
   *   status: 418,
   *   statusText: "I'm a teapot",
   *   data: { error: 'Unusual server response' }
   * };
   * 
   * const result = mapper.map(httpResponse);
   * // Returns AudioFailedUnknownErrorGoogle with status details
   * ```
   */
  map(response: AxiosResponse): HttpResponseBase {
    switch (response.status) {
      case 200:
        const audioContent: string = response.data.audioContent;
        const bodyBytes: Uint8Array = Buffer.from(audioContent, 'base64');
        return new AudioSuccessGoogle(bodyBytes);
      case 400:
        return new AudioFailedBadRequestGoogle(response.statusText);
      case 401:
        return new AudioFailedUnauthorizedGoogle();
      case 415:
        return new AudioFailedUnsupportedGoogle();
      case 429:
        return new AudioFailedTooManyRequestGoogle();
      case 502:
        return new AudioFailedBadGatewayGoogle();
      default:
        return new AudioFailedUnknownErrorGoogle(
          response.status,
          response.statusText || JSON.stringify(response.data),
        );
    }
  }
}
