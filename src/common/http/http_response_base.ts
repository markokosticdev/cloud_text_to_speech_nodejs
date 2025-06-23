/**
 * @fileoverview HTTP Response Base Class for Cloud Text-to-Speech Services
 * 
 * This module provides the base HTTP response representation used across all TTS providers.
 * It standardizes HTTP response handling by encapsulating status codes and reason messages
 * in a consistent format, enabling uniform response processing regardless of the underlying
 * provider API structure.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link BaseResponseMapper} for response mapping interface
 * @see {@link HttpClientBase} for HTTP client implementation
 * 
 * @example Basic response creation
 * ```typescript
 * import { HttpResponseBase } from 'cloud-text-to-speech';
 * 
 * const successResponse = new HttpResponseBase(200, 'OK');
 * console.log(successResponse.toString()); // '200: OK'
 * 
 * const errorResponse = new HttpResponseBase(400, 'Bad Request');
 * console.log(errorResponse.toString()); // '400: Bad Request'
 * ```
 * 
 * @example Response validation
 * ```typescript
 * const validateResponse = (response: HttpResponseBase): boolean => {
 *   if (response.code >= 200 && response.code < 300) {
 *     console.log('Success:', response.reason);
 *     return true;
 *   } else if (response.code >= 400 && response.code < 500) {
 *     console.error('Client error:', response.reason);
 *     return false;
 *   } else if (response.code >= 500) {
 *     console.error('Server error:', response.reason);
 *     return false;
 *   }
 *   return false;
 * };
 * 
 * const response = new HttpResponseBase(201, 'Created');
 * const isValid = validateResponse(response); // true
 * ```
 * 
 * @example Response categorization
 * ```typescript
 * const categorizeResponse = (response: HttpResponseBase): string => {
 *   const code = response.code;
 *   
 *   if (code >= 100 && code < 200) return 'Informational';
 *   if (code >= 200 && code < 300) return 'Success';
 *   if (code >= 300 && code < 400) return 'Redirection';
 *   if (code >= 400 && code < 500) return 'Client Error';
 *   if (code >= 500 && code < 600) return 'Server Error';
 *   
 *   return 'Unknown';
 * };
 * ```
 */

/**
 * Base class for standardized HTTP response representation across TTS providers.
 * Encapsulates HTTP status codes and reason messages in a consistent format,
 * providing uniform response handling regardless of the underlying provider API.
 * 
 * @category Common Utilities
 * 
 * @example Creating success responses
 * ```typescript
 * import { HttpResponseBase } from 'cloud-text-to-speech';
 * 
 * // Standard success responses
 * const okResponse = new HttpResponseBase(200, 'OK');
 * const createdResponse = new HttpResponseBase(201, 'Created');
 * const acceptedResponse = new HttpResponseBase(202, 'Accepted');
 * 
 * console.log(okResponse.toString());      // '200: OK'
 * console.log(createdResponse.toString()); // '201: Created'
 * console.log(acceptedResponse.toString()); // '202: Accepted'
 * ```
 * 
 * @example Creating error responses
 * ```typescript
 * // Client error responses
 * const badRequest = new HttpResponseBase(400, 'Bad Request');
 * const unauthorized = new HttpResponseBase(401, 'Unauthorized');
 * const forbidden = new HttpResponseBase(403, 'Forbidden');
 * const notFound = new HttpResponseBase(404, 'Not Found');
 * const rateLimited = new HttpResponseBase(429, 'Too Many Requests');
 * 
 * // Server error responses
 * const serverError = new HttpResponseBase(500, 'Internal Server Error');
 * const badGateway = new HttpResponseBase(502, 'Bad Gateway');
 * const serviceUnavailable = new HttpResponseBase(503, 'Service Unavailable');
 * ```
 * 
 * @example Response comparison and validation
 * ```typescript
 * const responses = [
 *   new HttpResponseBase(200, 'Success'),
 *   new HttpResponseBase(400, 'Invalid input'),
 *   new HttpResponseBase(500, 'Server crashed')
 * ];
 * 
 * // Filter successful responses
 * const successfulResponses = responses.filter(r => r.code >= 200 && r.code < 300);
 * console.log(`${successfulResponses.length} successful responses`);
 * 
 * // Find error responses
 * const errorResponses = responses.filter(r => r.code >= 400);
 * errorResponses.forEach(r => console.error(`Error: ${r.toString()}`));
 * ```
 * 
 * @example Response logging and monitoring
 * ```typescript
 * class ResponseLogger {
 *   private static logResponse(response: HttpResponseBase, context: string): void {
 *     const timestamp = new Date().toISOString();
 *     const logLevel = response.code >= 400 ? 'ERROR' : 'INFO';
 *     
 *     console.log(`[${timestamp}] ${logLevel} ${context}: ${response.toString()}`);
 *   }
 *   
 *   static logTtsResponse(response: HttpResponseBase, provider: string): void {
 *     this.logResponse(response, `TTS-${provider.toUpperCase()}`);
 *   }
 * }
 * 
 * // Usage in TTS operations
 * const googleResponse = new HttpResponseBase(200, 'Audio synthesized');
 * ResponseLogger.logTtsResponse(googleResponse, 'google');
 * // Output: [2024-01-15T10:30:00.000Z] INFO TTS-GOOGLE: 200: Audio synthesized
 * ```
 * 
 * @example Response caching and tracking
 * ```typescript
 * class ResponseTracker {
 *   private responses: Map<string, HttpResponseBase[]> = new Map();
 *   
 *   addResponse(provider: string, response: HttpResponseBase): void {
 *     if (!this.responses.has(provider)) {
 *       this.responses.set(provider, []);
 *     }
 *     this.responses.get(provider)!.push(response);
 *   }
 *   
 *   getSuccessRate(provider: string): number {
 *     const responses = this.responses.get(provider) || [];
 *     if (responses.length === 0) return 0;
 *     
 *     const successful = responses.filter(r => r.code >= 200 && r.code < 300).length;
 *     return successful / responses.length;
 *   }
 *   
 *   getAverageResponseCode(provider: string): number {
 *     const responses = this.responses.get(provider) || [];
 *     if (responses.length === 0) return 0;
 *     
 *     const total = responses.reduce((sum, r) => sum + r.code, 0);
 *     return total / responses.length;
 *   }
 * }
 * 
 * const tracker = new ResponseTracker();
 * tracker.addResponse('google', new HttpResponseBase(200, 'OK'));
 * tracker.addResponse('google', new HttpResponseBase(400, 'Bad Request'));
 * tracker.addResponse('google', new HttpResponseBase(200, 'OK'));
 * 
 * console.log(`Google success rate: ${tracker.getSuccessRate('google')}`); // 0.67
 * ```
 * 
 * @example Custom response types
 * ```typescript
 * class TtsHttpResponse extends HttpResponseBase {
 *   public readonly provider: string;
 *   public readonly audioFormat?: string;
 *   public readonly duration?: number;
 *   
 *   constructor(
 *     code: number, 
 *     reason: string, 
 *     provider: string,
 *     audioFormat?: string,
 *     duration?: number
 *   ) {
 *     super(code, reason);
 *     this.provider = provider;
 *     this.audioFormat = audioFormat;
 *     this.duration = duration;
 *   }
 *   
 *   toString(): string {
 *     let result = super.toString();
 *     result += ` [${this.provider}]`;
 *     
 *     if (this.audioFormat) {
 *       result += ` Format: ${this.audioFormat}`;
 *     }
 *     
 *     if (this.duration) {
 *       result += ` Duration: ${this.duration}s`;
 *     }
 *     
 *     return result;
 *   }
 * }
 * 
 * const ttsResponse = new TtsHttpResponse(
 *   200, 
 *   'Audio synthesized successfully', 
 *   'google',
 *   'mp3',
 *   5.2
 * );
 * 
 * console.log(ttsResponse.toString());
 * // '200: Audio synthesized successfully [google] Format: mp3 Duration: 5.2s'
 * ```
 */
export class HttpResponseBase {
  /** HTTP reason text */
  public reason: string;
  /** HTTP status code (e.g., 200, 404, 500) */
  public code: number;

  /**
   * Creates a new HTTP response with the specified status code and reason.
   * 
   * @param code - HTTP status code (e.g., 200 for success, 404 for not found)
   * @param reason - Human-readable reason phrase describing the response
   * 
   * @example Creating standard HTTP responses
   * ```typescript
   * // Success responses
   * const success = new HttpResponseBase(200, 'OK');
   * const created = new HttpResponseBase(201, 'Resource created successfully');
   * const accepted = new HttpResponseBase(202, 'Request accepted for processing');
   * 
   * // Client error responses
   * const badRequest = new HttpResponseBase(400, 'Invalid request parameters');
   * const unauthorized = new HttpResponseBase(401, 'Authentication required');
   * const forbidden = new HttpResponseBase(403, 'Access denied');
   * const notFound = new HttpResponseBase(404, 'Resource not found');
   * 
   * // Server error responses
   * const serverError = new HttpResponseBase(500, 'Internal server error');
   * const unavailable = new HttpResponseBase(503, 'Service temporarily unavailable');
   * ```
   * 
   * @example Creating TTS-specific responses
   * ```typescript
   * // TTS success responses
   * const audioSynthesized = new HttpResponseBase(200, 'Audio synthesized successfully');
   * const voicesRetrieved = new HttpResponseBase(200, 'Voice list retrieved');
   * 
   * // TTS error responses
   * const invalidText = new HttpResponseBase(400, 'Text contains unsupported characters');
   * const quotaExceeded = new HttpResponseBase(429, 'API quota exceeded');
   * const synthesisError = new HttpResponseBase(500, 'Audio synthesis failed');
   * ```
   * 
   * @example Creating responses with detailed messages
   * ```typescript
   * const detailedResponses = [
   *   new HttpResponseBase(200, 'Speech synthesized: 1,234 characters, 45.6 seconds duration'),
   *   new HttpResponseBase(400, 'Invalid voice: "en-US-NonExistent" not found'),
   *   new HttpResponseBase(429, 'Rate limit exceeded: 100 requests per minute limit reached'),
   *   new HttpResponseBase(500, 'Synthesis engine temporarily unavailable')
   * ];
   * 
   * detailedResponses.forEach(response => {
   *   console.log(`[${response.code}] ${response.reason}`);
   * });
   * ```
   * 
   * @example Creating responses for different providers
   * ```typescript
   * // Google Cloud TTS responses
   * const googleSuccess = new HttpResponseBase(200, 'Google TTS: Audio generated');
   * const googleError = new HttpResponseBase(400, 'Google TTS: Invalid SSML markup');
   * 
   * // Microsoft Azure responses
   * const azureSuccess = new HttpResponseBase(200, 'Azure TTS: Speech synthesized');
   * const azureError = new HttpResponseBase(401, 'Azure TTS: Invalid subscription key');
   * 
   * // Amazon Polly responses
   * const pollySuccess = new HttpResponseBase(200, 'Amazon Polly: Audio ready');
   * const pollyError = new HttpResponseBase(403, 'Amazon Polly: Insufficient permissions');
   * ```
   */
  constructor(code: number, reason: string) {
    this.code = code;
    this.reason = reason;
  }

  /**
   * Returns a formatted string representation of the HTTP response.
   * Combines the status code and reason phrase in a standard format.
   * 
   * @returns Formatted response string in the format "code: reason"
   * 
   * @example Basic string representation
   * ```typescript
   * const response = new HttpResponseBase(200, 'OK');
   * console.log(response.toString()); // '200: OK'
   * 
   * const errorResponse = new HttpResponseBase(404, 'Not Found');
   * console.log(errorResponse.toString()); // '404: Not Found'
   * ```
   * 
   * @example Using toString() for logging
   * ```typescript
   * const responses = [
   *   new HttpResponseBase(200, 'Success'),
   *   new HttpResponseBase(400, 'Bad Request'),
   *   new HttpResponseBase(500, 'Server Error')
   * ];
   * 
   * responses.forEach(response => {
   *   console.log(`Response: ${response.toString()}`);
   * });
   * // Output:
   * // Response: 200: Success
   * // Response: 400: Bad Request
   * // Response: 500: Server Error
   * ```
   * 
   * @example Conditional logging based on response
   * ```typescript
   * const logResponse = (response: HttpResponseBase) => {
   *   const responseString = response.toString();
   *   
   *   if (response.code >= 200 && response.code < 300) {
   *     console.log(`✅ ${responseString}`);
   *   } else if (response.code >= 400 && response.code < 500) {
   *     console.warn(`⚠️  ${responseString}`);
   *   } else if (response.code >= 500) {
   *     console.error(`❌ ${responseString}`);
   *   } else {
   *     console.info(`ℹ️  ${responseString}`);
   *   }
   * };
   * 
   * logResponse(new HttpResponseBase(200, 'Audio generated'));    // ✅ 200: Audio generated
   * logResponse(new HttpResponseBase(400, 'Invalid input'));     // ⚠️  400: Invalid input
   * logResponse(new HttpResponseBase(500, 'Server error'));      // ❌ 500: Server error
   * ```
   * 
   * @example Response comparison and sorting
   * ```typescript
   * const responses = [
   *   new HttpResponseBase(500, 'Server Error'),
   *   new HttpResponseBase(200, 'OK'),
   *   new HttpResponseBase(400, 'Bad Request')
   * ];
   * 
   * // Sort by status code
   * responses.sort((a, b) => a.code - b.code);
   * 
   * console.log('Sorted responses:');
   * responses.forEach(r => console.log(r.toString()));
   * // Output:
   * // 200: OK
   * // 400: Bad Request
   * // 500: Server Error
   * ```
   */
  toString(): string {
    return `${this.code}: ${this.reason}`;
  }
}
