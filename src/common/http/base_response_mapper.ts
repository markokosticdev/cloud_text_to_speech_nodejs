/**
 * @fileoverview Base HTTP Response Mapping Interface for Cloud Text-to-Speech Services
 * 
 * This module defines the interface for mapping HTTP responses from provider APIs
 * to standardized internal response objects. It provides abstraction for handling
 * different response formats across Google Cloud TTS, Microsoft Azure TTS, and Amazon Polly.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link HttpResponseBase} for the target response format
 * @see {@link HttpClientBase} for HTTP client implementation
 * 
 * @example Basic response mapper implementation
 * ```typescript
 * import { BaseResponseMapper, HttpResponseBase } from 'cloud-text-to-speech';
 * import { BaseResponseMapper, HttpResponseBase } from 'cloud-text-to-speech';
 * import { AxiosResponse } from 'axios';
 * 
 * class TtsResponseMapper implements BaseResponseMapper {
 *   map(response: AxiosResponse): HttpResponseBase {
 *     return new HttpResponseBase(
 *       response.status,
 *       response.statusText || 'Success'
 *     );
 *   }
 * }
 * 
 * // Usage with API response
 * const mapper = new TtsResponseMapper();
 * const mappedResponse = mapper.map(axiosResponse);
 * console.log(`Status: ${mappedResponse.code} - ${mappedResponse.reason}`);
 * ```
 * 
 * @example Provider-specific response mapping
 * ```typescript
 * class GoogleTtsResponseMapper implements BaseResponseMapper {
 *   map(response: AxiosResponse): HttpResponseBase {
 *     // Handle Google-specific response format
 *     const googleStatus = response.data?.status || response.status;
 *     const googleMessage = response.data?.message || response.statusText;
 *     
 *     return new HttpResponseBase(googleStatus, googleMessage);
 *   }
 * }
 * 
 * class MicrosoftTtsResponseMapper implements BaseResponseMapper {
 *   map(response: AxiosResponse): HttpResponseBase {
 *     // Handle Microsoft-specific response format
 *     if (response.data?.error) {
 *       return new HttpResponseBase(
 *         response.data.error.code,
 *         response.data.error.message
 *       );
 *     }
 *     
 *     return new HttpResponseBase(response.status, 'Success');
 *   }
 * }
 * ```
 * 
 * @example Error response mapping
 * ```typescript
 * class ErrorAwareResponseMapper implements BaseResponseMapper {
 *   map(response: AxiosResponse): HttpResponseBase {
 *     // Map successful responses
 *     if (response.status >= 200 && response.status < 300) {
 *       return new HttpResponseBase(response.status, 'Success');
 *     }
 *     
 *     // Map error responses with enhanced error information
 *     const errorMessage = this.extractErrorMessage(response);
 *     return new HttpResponseBase(response.status, errorMessage);
 *   }
 *   
 *   private extractErrorMessage(response: AxiosResponse): string {
 *     // Try multiple sources for error information
 *     return response.data?.message ||
 *            response.data?.error?.message ||
 *            response.statusText ||
 *            'Unknown error';
 *   }
 * }
 * ```
 */

import { AxiosResponse } from 'axios';
import { HttpResponseBase } from './http_response_base.js';

/**
 * Interface for mapping HTTP responses from external APIs to internal response format.
 * Provides abstraction for handling different response structures across TTS providers,
 * enabling consistent response processing regardless of the underlying API format.
 * 
 * @category Common Utilities
 * 
 * @example Basic response mapper
 * ```typescript
 * import { BaseResponseMapper, HttpResponseBase } from 'cloud-text-to-speech';
 * 
 * class SimpleResponseMapper implements BaseResponseMapper {
 *   map(response: AxiosResponse): HttpResponseBase {
 *     return new HttpResponseBase(
 *       response.status,
 *       response.statusText
 *     );
 *   }
 * }
 * 
 * // Use with HTTP client
 * const mapper = new SimpleResponseMapper();
 * const httpResponse = mapper.map(axiosResponse);
 * ```
 * 
 * @example Advanced response mapper with data extraction
 * ```typescript
 * class TtsAudioResponseMapper implements BaseResponseMapper {
 *   map(response: AxiosResponse): HttpResponseBase {
 *     // Validate response has audio data
 *     if (!response.data || !response.data.audioContent) {
 *       return new HttpResponseBase(400, 'Missing audio content');
 *     }
 *     
 *     // Check audio format
 *     const contentType = response.headers['content-type'];
 *     if (!contentType?.includes('audio/')) {
 *       return new HttpResponseBase(415, 'Invalid audio format');
 *     }
 *     
 *     return new HttpResponseBase(
 *       response.status,
 *       `Audio generated successfully (${contentType})`
 *     );
 *   }
 * }
 * ```
 * 
 * @example Response mapper with validation
 * ```typescript
 * class ValidatingResponseMapper implements BaseResponseMapper {
 *   map(response: AxiosResponse): HttpResponseBase {
 *     // Validate response structure
 *     if (!this.isValidResponse(response)) {
 *       return new HttpResponseBase(500, 'Invalid response structure');
 *     }
 *     
 *     // Extract status information
 *     const status = this.extractStatus(response);
 *     const message = this.extractMessage(response);
 *     
 *     return new HttpResponseBase(status, message);
 *   }
 *   
 *   private isValidResponse(response: AxiosResponse): boolean {
 *     return response && 
 *            typeof response.status === 'number' &&
 *            response.status >= 100 && 
 *            response.status < 600;
 *   }
 *   
 *   private extractStatus(response: AxiosResponse): number {
 *     return response.data?.statusCode || response.status;
 *   }
 *   
 *   private extractMessage(response: AxiosResponse): string {
 *     return response.data?.message || 
 *            response.statusText || 
 *            'Response processed';
 *   }
 * }
 * ```
 * 
 * @example Composite response mapper for multiple providers
 * ```typescript
 * class MultiProviderResponseMapper implements BaseResponseMapper {
 *   private providerMappers: Map<string, BaseResponseMapper> = new Map();
 *   
 *   constructor() {
 *     this.providerMappers.set('google', new GoogleResponseMapper());
 *     this.providerMappers.set('microsoft', new MicrosoftResponseMapper());
 *     this.providerMappers.set('amazon', new AmazonResponseMapper());
 *   }
 *   
 *   map(response: AxiosResponse): HttpResponseBase {
 *     // Detect provider from response headers or URL
 *     const provider = this.detectProvider(response);
 *     const mapper = this.providerMappers.get(provider);
 *     
 *     if (mapper) {
 *       return mapper.map(response);
 *     }
 *     
 *     // Fallback to generic mapping
 *     return new HttpResponseBase(response.status, response.statusText);
 *   }
 *   
 *   private detectProvider(response: AxiosResponse): string {
 *     const url = response.config?.url || '';
 *     
 *     if (url.includes('googleapis.com')) return 'google';
 *     if (url.includes('cognitiveservices.azure.com')) return 'microsoft';
 *     if (url.includes('amazonaws.com')) return 'amazon';
 *     
 *     return 'generic';
 *   }
 * }
 * ```
 * 
 * @example Response mapper with metrics
 * ```typescript
 * class MetricsAwareResponseMapper implements BaseResponseMapper {
 *   private responseCount = 0;
 *   private errorCount = 0;
 *   
 *   map(response: AxiosResponse): HttpResponseBase {
 *     this.responseCount++;
 *     
 *     if (response.status >= 400) {
 *       this.errorCount++;
 *     }
 *     
 *     // Log metrics periodically
 *     if (this.responseCount % 100 === 0) {
 *       console.log(`Response metrics: ${this.responseCount} total, ${this.errorCount} errors`);
 *     }
 *     
 *     return new HttpResponseBase(response.status, response.statusText);
 *   }
 *   
 *   getMetrics() {
 *     return {
 *       total: this.responseCount,
 *       errors: this.errorCount,
 *       successRate: (this.responseCount - this.errorCount) / this.responseCount
 *     };
 *   }
 * }
 * ```
 */
export interface BaseResponseMapper {
  /**
   * Maps an Axios HTTP response to the internal HttpResponseBase format.
   * Implementations should extract relevant status and message information
   * from the provider-specific response structure and return a normalized response object.
   * 
   * @param response - Axios response object from HTTP request
   * @returns Mapped response in internal format
   * 
   * @example Basic mapping implementation
   * ```typescript
   * map(response: AxiosResponse): HttpResponseBase {
   *   return new HttpResponseBase(
   *     response.status,
   *     response.statusText || 'OK'
   *   );
   * }
   * ```
   * 
   * @example Enhanced mapping with error handling
   * ```typescript
   * map(response: AxiosResponse): HttpResponseBase {
   *   try {
   *     // Extract enhanced status information
   *     const status = response.data?.code || response.status;
   *     const message = response.data?.message || response.statusText;
   *     
   *     return new HttpResponseBase(status, message);
   *   } catch (error) {
   *     return new HttpResponseBase(500, 'Response mapping failed');
   *   }
   * }
   * ```
   * 
   * @example Provider-specific mapping
   * ```typescript
   * map(response: AxiosResponse): HttpResponseBase {
   *   // Handle Google Cloud TTS response format
   *   if (response.data?.audioContent) {
   *     return new HttpResponseBase(200, 'Audio synthesis successful');
   *   }
   *   
   *   if (response.data?.error) {
   *     return new HttpResponseBase(
   *       response.data.error.code || 400,
   *       response.data.error.message || 'Request failed'
   *     );
   *   }
   *   
   *   return new HttpResponseBase(response.status, response.statusText);
   * }
   * ```
   */
  map(response: AxiosResponse): HttpResponseBase;
}
