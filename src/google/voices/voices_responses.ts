/**
 * @fileoverview Google Cloud Text-to-Speech Voice Response Types
 * 
 * This module defines response classes for Google Cloud Text-to-Speech voice
 * listing operations. It provides typed response models for successful voice
 * retrievals and various error conditions, following HTTP status code patterns
 * and Google Cloud API error handling conventions.
 * 
 * The response system supports comprehensive error handling with specific
 * error types for different failure scenarios including authentication,
 * rate limiting, and network issues.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link https://cloud.google.com/text-to-speech/docs/reference/rest/v1/voices/list | Google TTS Voices API}
 * @see {@link VoiceGoogle} for the voice model structure
 * 
 * @example Handling Voice List Responses
 * ```typescript
 * import { 
 *   VoicesResponseGoogle, 
 *   VoicesSuccessGoogle, 
 *   VoicesFailedUnauthorizedGoogle 
 * } from './voices_responses.js';
 * 
 * async function getVoices(): Promise<VoiceGoogle[]> {
 *   const response = await googleTtsClient.getVoices();
 *   
 *   if (response instanceof VoicesSuccessGoogle) {
 *     return response.voices;
 *   } else if (response instanceof VoicesFailedUnauthorizedGoogle) {
 *     throw new Error('Authentication failed - check API credentials');
 *   } else {
 *     throw new Error(`Voice listing failed: ${response.reason}`);
 *   }
 * }
 * ```
 * 
 * @example Response Type Checking
 * ```typescript
 * import { VoicesResponseGoogle, VoicesSuccessGoogle } from './voices_responses.js';
 * 
 * function processVoicesResponse(response: VoicesResponseGoogle): void {
 *   console.log(`Response code: ${response.code}`);
 *   console.log(`Response reason: ${response.reason}`);
 *   
 *   if (response instanceof VoicesSuccessGoogle) {
 *     console.log(`Found ${response.voices.length} voices`);
 *     response.voices.forEach(voice => {
 *       console.log(`- ${voice.name} (${voice.gender})`);
 *     });
 *   }
 * }
 * ```
 * 
 * @example Error Handling with Retry Logic
 * ```typescript
 * import { 
 *   VoicesFailedTooManyRequestsGoogle,
 *   VoicesFailedBadGateWayGoogle 
 * } from './voices_responses.js';
 * 
 * async function getVoicesWithRetry(maxRetries = 3): Promise<VoiceGoogle[]> {
 *   for (let attempt = 1; attempt <= maxRetries; attempt++) {
 *     const response = await googleTtsClient.getVoices();
 *     
 *     if (response instanceof VoicesSuccessGoogle) {
 *       return response.voices;
 *     }
 *     
 *     if (response instanceof VoicesFailedTooManyRequestsGoogle) {
 *       console.log(`Rate limited, waiting before retry ${attempt}/${maxRetries}`);
 *       await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
 *       continue;
 *     }
 *     
 *     if (response instanceof VoicesFailedBadGateWayGoogle && attempt < maxRetries) {
 *       console.log(`Network error, retrying ${attempt}/${maxRetries}`);
 *       continue;
 *     }
 *     
 *     throw new Error(`Failed to get voices: ${response.reason}`);
 *   }
 *   
 *   throw new Error('Max retries exceeded');
 * }
 * ```
 * 
 * @example Custom Error Handler
 * ```typescript
 * import { VoicesResponseGoogle } from './voices_responses.js';
 * 
 * function handleVoicesError(response: VoicesResponseGoogle): never {
 *   const errorMap = {
 *     400: 'Invalid request parameters',
 *     401: 'Authentication required',
 *     429: 'Rate limit exceeded - please try again later',
 *     502: 'Service temporarily unavailable'
 *   };
 *   
 *   const userMessage = errorMap[response.code] || 'Unknown error occurred';
 *   throw new Error(`${userMessage} (${response.code}: ${response.reason})`);
 * }
 * ```
 */

import { HttpResponseBase } from '../../common/http/http_response_base.js';
import { VoiceGoogle } from './voices_model.js';

/**
 * Base response class for Google Cloud Text-to-Speech voice operations
 * 
 * This abstract class provides the foundation for all Google TTS voice response
 * types, extending the common HTTP response base with Google-specific handling.
 * It establishes the common interface for both successful and failed responses.
 * 
 * @example Type Checking
 * ```typescript
 * function isVoicesResponse(response: any): response is VoicesResponseGoogle {
 *   return response instanceof VoicesResponseGoogle;
 * }
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class VoicesResponseGoogle extends HttpResponseBase {
  /**
   * Creates a new Google voices response
   * 
   * @param code - HTTP status code
   * @param reason - Response reason phrase or error description
   * 
   * @protected This constructor is intended for use by subclasses only
   */
  protected constructor(code: number, reason: string) {
    super(code, reason);
  }
}

/**
 * Successful voice listing response from Google Cloud Text-to-Speech
 * 
 * This class represents a successful response containing an array of available
 * voices from the Google TTS service. It includes all voice metadata such as
 * names, genders, languages, and supported engines.
 * 
 * @example Processing Successful Response
 * ```typescript
 * const response = new VoicesSuccessGoogle([
 *   { name: 'en-US-Neural2-A', gender: 'Male', engines: ['neural2'] },
 *   { name: 'en-US-Neural2-F', gender: 'Female', engines: ['neural2'] }
 * ]);
 * 
 * console.log(`Success! Found ${response.voices.length} voices`);
 * response.voices.forEach(voice => {
 *   console.log(`- ${voice.name}: ${voice.gender} voice`);
 * });
 * ```
 * 
 * @example Voice Filtering
 * ```typescript
 * function filterNeuralVoices(response: VoicesSuccessGoogle): VoiceGoogle[] {
 *   return response.voices.filter(voice => 
 *     voice.engines.includes('neural2')
 *   );
 * }
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class VoicesSuccessGoogle extends VoicesResponseGoogle {
  /**
   * Creates a successful voice listing response
   * 
   * @param voices - Array of available Google TTS voices
   * 
   * @example Creating Success Response
   * ```typescript
   * const voices: VoiceGoogle[] = [
   *   { name: 'en-US-Neural2-A', gender: 'Male', engines: ['neural2'] },
   *   { name: 'en-US-Neural2-F', gender: 'Female', engines: ['neural2'] }
   * ];
   * 
   * const response = new VoicesSuccessGoogle(voices);
   * console.log(`Response code: ${response.code}`); // 200
   * console.log(`Voices count: ${response.voices.length}`); // 2
   * ```
   * 
   * @example Voice Analysis
   * ```typescript
   * const response = new VoicesSuccessGoogle(voicesArray);
   * 
   * const analysis = {
   *   total: response.voices.length,
   *   neural2: response.voices.filter(v => v.engines.includes('neural2')).length,
   *   wavenet: response.voices.filter(v => v.engines.includes('wavenet')).length,
   *   male: response.voices.filter(v => v.gender === 'Male').length,
   *   female: response.voices.filter(v => v.gender === 'Female').length
   * };
   * 
   * console.log('Voice analysis:', analysis);
   * ```
   */
  constructor(public voices: VoiceGoogle[]) {
    super(200, 'Success');
  }
}

/**
 * Bad request error response from Google Cloud Text-to-Speech
 * 
 * This class represents a 400 Bad Request error, typically indicating invalid
 * parameters, missing required fields, or malformed request data. Common causes
 * include invalid headers, incorrect parameter values, or missing authentication.
 * 
 * @example Handling Bad Request
 * ```typescript
 * if (response instanceof VoicesFailedBadRequestGoogle) {
 *   console.error('Request validation failed:', response.reason);
 *   // Check request parameters and headers
 * }
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class VoicesFailedBadRequestGoogle extends VoicesResponseGoogle {
  /**
   * Creates a bad request error response
   * 
   * @param reasonPhrase - Optional additional error details
   * 
   * @example Basic Bad Request
   * ```typescript
   * const error = new VoicesFailedBadRequestGoogle();
   * console.log(error.code); // 400
   * console.log(error.reason); // "Bad Request A required parameter is missing..."
   * ```
   * 
   * @example Bad Request with Details
   * ```typescript
   * const error = new VoicesFailedBadRequestGoogle('Invalid language code: xyz');
   * console.log(error.reason); // Includes the additional detail
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
 * Unauthorized error response from Google Cloud Text-to-Speech
 * 
 * This class represents a 401 Unauthorized error, indicating authentication
 * failure. This typically occurs when API keys are invalid, expired, or
 * missing, or when OAuth tokens are not properly configured.
 * 
 * @example Handling Authentication Error
 * ```typescript
 * if (response instanceof VoicesFailedUnauthorizedGoogle) {
 *   console.error('Authentication failed - check API credentials');
 *   // Redirect to authentication flow or refresh tokens
 * }
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class VoicesFailedUnauthorizedGoogle extends VoicesResponseGoogle {
  /**
   * Creates an unauthorized error response
   * 
   * @example Authentication Error
   * ```typescript
   * const error = new VoicesFailedUnauthorizedGoogle();
   * console.log(error.code); // 401
   * console.log(error.reason); // "Unauthorized The request is not authorized..."
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
 * Rate limit exceeded error response from Google Cloud Text-to-Speech
 * 
 * This class represents a 429 Too Many Requests error, indicating that the
 * application has exceeded its quota or rate limits. This requires implementing
 * retry logic with appropriate backoff strategies.
 * 
 * @example Handling Rate Limits
 * ```typescript
 * if (response instanceof VoicesFailedTooManyRequestsGoogle) {
 *   console.log('Rate limit exceeded - implementing backoff');
 *   await new Promise(resolve => setTimeout(resolve, 5000));
 *   // Retry the request
 * }
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class VoicesFailedTooManyRequestsGoogle extends VoicesResponseGoogle {
  /**
   * Creates a rate limit exceeded error response
   * 
   * @example Rate Limit Error
   * ```typescript
   * const error = new VoicesFailedTooManyRequestsGoogle();
   * console.log(error.code); // 429
   * console.log(error.reason); // "Too Many Requests You have exceeded..."
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
 * Bad gateway error response from Google Cloud Text-to-Speech
 * 
 * This class represents a 502 Bad Gateway error, indicating network or
 * server-side issues. This may be temporary and often resolves with retry
 * attempts. Can also indicate invalid headers or malformed requests.
 * 
 * @example Handling Gateway Errors
 * ```typescript
 * if (response instanceof VoicesFailedBadGateWayGoogle) {
 *   console.log('Network error detected - will retry');
 *   // Implement retry logic with exponential backoff
 * }
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class VoicesFailedBadGateWayGoogle extends VoicesResponseGoogle {
  /**
   * Creates a bad gateway error response
   * 
   * @example Gateway Error
   * ```typescript
   * const error = new VoicesFailedBadGateWayGoogle();
   * console.log(error.code); // 502
   * console.log(error.reason); // "Bad Gateway Network or server-side issue..."
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
 * Unknown error response from Google Cloud Text-to-Speech
 * 
 * This class represents any error response that doesn't fit the standard
 * error categories. It captures the original HTTP status code and reason
 * for debugging and logging purposes.
 * 
 * @example Handling Unknown Errors
 * ```typescript
 * if (response instanceof VoicesFailedUnknownErrorGoogle) {
 *   console.error(`Unknown error: ${response.code} - ${response.reason}`);
 *   // Log for debugging and fallback handling
 * }
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class VoicesFailedUnknownErrorGoogle extends VoicesResponseGoogle {
  /**
   * Creates an unknown error response
   * 
   * @param code - HTTP status code from the original response
   * @param reason - Error reason or message from the original response
   * 
   * @example Unknown Error
   * ```typescript
   * const error = new VoicesFailedUnknownErrorGoogle(503, 'Service Unavailable');
   * console.log(error.code); // 503
   * console.log(error.reason); // "Service Unavailable"
   * ```
   * 
   * @example Error Logging
   * ```typescript
   * function logUnknownError(response: VoicesFailedUnknownErrorGoogle) {
   *   console.error(`Unexpected error: ${response.code}`);
   *   console.error(`Details: ${response.reason}`);
   *   // Send to error tracking service
   * }
   * ```
   */
  constructor(code: number, reason: string) {
    super(code, reason);
  }
}
