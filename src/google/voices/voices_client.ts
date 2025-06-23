/**
 * @fileoverview Google Cloud Text-to-Speech Voices HTTP Client
 * 
 * This module provides the HTTP client implementation specifically for Google Cloud
 * Text-to-Speech voice operations. It extends the base HTTP client with Google-specific
 * authentication, retry logic, and request configuration optimized for voice listing
 * and voice metadata operations.
 * 
 * The client handles Google Cloud authentication headers, implements exponential
 * backoff retry strategies, and ensures proper authentication for voice-related
 * API requests. It provides a robust foundation for voice discovery and management.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link https://cloud.google.com/text-to-speech/docs/voices | Google TTS Voices}
 * @see {@link HttpClientBase} for base HTTP client functionality
 * 
 * @example Basic Voices Client Setup
 * ```typescript
 * import { VoicesClientGoogle } from './voices_client.js';
 * import { AuthenticationHeaderGoogle } from '../auth/authentication_types.js';
 * import axios from 'axios';
 * 
 * const authHeader: AuthenticationHeaderGoogle = {
 *   type: 'Authorization',
 *   headerValue: 'Bearer your-access-token'
 * };
 * 
 * const client = axios.create({
 *   timeout: 30000,
 *   baseURL: 'https://texttospeech.googleapis.com'
 * });
 * 
 * const voicesClient = new VoicesClientGoogle(client, authHeader);
 * ```
 * 
 * @example Advanced Client Configuration
 * ```typescript
 * import { VoicesClientGoogle } from './voices_client.js';
 * import axios from 'axios';
 * 
 * // Configure Axios instance with custom settings
 * const axiosInstance = axios.create({
 *   timeout: 60000,
 *   headers: {
 *     'User-Agent': 'VoiceDiscovery/1.0.0',
 *     'Accept': 'application/json'
 *   }
 * });
 * 
 * const voicesClient = new VoicesClientGoogle(axiosInstance, authHeader);
 * 
 * // Client automatically configures retry logic and authentication
 * ```
 * 
 * @example Making Voice Requests
 * ```typescript
 * import { VoicesClientGoogle } from './voices_client.js';
 * 
 * const voicesClient = new VoicesClientGoogle(client, authHeader);
 * 
 * const requestConfig = {
 *   method: 'GET',
 *   url: '/v1/voices',
 *   params: {
 *     languageCode: 'en-US'
 *   }
 * };
 * 
 * try {
 *   const response = await voicesClient.send(requestConfig);
 *   console.log('Voices request successful:', response.data.voices.length);
 * } catch (error) {
 *   console.error('Voices request failed:', error);
 * }
 * ```
 * 
 * @example Production Client with Error Handling
 * ```typescript
 * import { VoicesClientGoogle } from './voices_client.js';
 * 
 * class GoogleVoicesClient {
 *   private voicesClient: VoicesClientGoogle;
 * 
 *   constructor(authHeader: AuthenticationHeaderGoogle) {
 *     const client = axios.create({
 *       timeout: 30000,
 *       validateStatus: (status) => status < 500, // Don't throw on 4xx errors
 *     });
 * 
 *     this.voicesClient = new VoicesClientGoogle(client, authHeader);
 *   }
 * 
 *   async listVoices(languageCode?: string): Promise<any[]> {
 *     const requestConfig = {
 *       method: 'GET',
 *       url: '/v1/voices',
 *       ...(languageCode && { params: { languageCode } })
 *     };
 * 
 *     const response = await this.voicesClient.send(requestConfig);
 *     
 *     if (response.status === 200) {
 *       return response.data.voices || [];
 *     } else {
 *       throw new Error(`Voice listing failed with status ${response.status}`);
 *     }
 *   }
 * }
 * ```
 */

import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { HttpClientBase } from '../../common/http/http_client_base.js';
import { AuthenticationHeaderGoogle } from '../auth/authentication_types.js';
import axiosRetry, { IAxiosRetryConfig } from 'axios-retry';

/**
 * Google Cloud Text-to-Speech HTTP client for voice operations
 * 
 * Specialized HTTP client that extends the base client functionality with
 * Google-specific authentication, retry logic, and request configuration
 * for voice-related operations. Automatically handles Google Cloud
 * authentication headers and implements robust retry strategies.
 * 
 * The client is configured with exponential backoff retry logic and
 * automatically sets appropriate headers for Google TTS voice API requests.
 * 
 * @example Basic Usage
 * ```typescript
 * const client = new VoicesClientGoogle(axiosInstance, authHeader);
 * 
 * const response = await client.send({
 *   method: 'GET',
 *   url: '/v1/voices',
 *   params: { languageCode: 'en-US' }
 * });
 * ```
 * 
 * @example With Language Filtering
 * ```typescript
 * // The client supports all Google TTS voice API parameters
 * const client = new VoicesClientGoogle(axiosInstance, authHeader);
 * // Inherits: 3 retries, exponential delay, retryable error conditions
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class VoicesClientGoogle extends HttpClientBase {
  /**
   * Creates a new Google voices client instance
   * 
   * Initializes the client with Google-specific retry configuration including
   * exponential backoff delay and intelligent retry conditions. The client
   * automatically configures authentication headers for voice operations.
   * 
   * @param client - Configured Axios instance for HTTP requests
   * @param header - Google Cloud authentication header configuration
   * 
   * @example Client Creation
   * ```typescript
   * const axiosClient = axios.create({
   *   timeout: 30000,
   *   baseURL: 'https://texttospeech.googleapis.com'
   * });
   * 
   * const authHeader = {
   *   type: 'Authorization',
   *   headerValue: 'Bearer access-token'
   * };
   * 
   * const voicesClient = new VoicesClientGoogle(axiosClient, authHeader);
   * ```
   * 
   * @example With Custom Retry Logic
   * ```typescript
   * // The constructor automatically sets up retry configuration
   * const voicesClient = new VoicesClientGoogle(client, authHeader);
   * // Configured with: 3 retries, exponential delay, error condition checking
   * ```
   */
  constructor(client: AxiosInstance, header: AuthenticationHeaderGoogle) {
    const retryConfig: IAxiosRetryConfig = {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return axiosRetry.isRetryableError(error);
      },
    };
    axiosRetry(client, retryConfig);
    super(client, header);
  }

  /**
   * Sends an HTTP request with Google-specific headers and authentication
   * 
   * Configures the request with proper Google Cloud authentication headers.
   * Automatically applies the authentication header for voice API operations
   * while preserving any existing headers in the request configuration.
   * 
   * @param requestConfig - Axios request configuration
   * @returns Promise resolving to the HTTP response
   * 
   * @throws {Error} When the request fails or authentication is invalid
   * 
   * @example Voice Listing Request
   * ```typescript
   * const response = await client.send({
   *   method: 'GET',
   *   url: '/v1/voices',
   *   params: {
   *     languageCode: 'en-US'
   *   }
   * });
   * ```
   * 
   * @example Filtered Voice Request
   * ```typescript
   * const response = await client.send({
   *   method: 'GET',
   *   url: '/v1/voices',
   *   params: {
   *     languageCode: 'es-ES',
   *     // Additional filtering parameters
   *   }
   * });
   * ```
   */
  async send(requestConfig: AxiosRequestConfig): Promise<AxiosResponse> {
    requestConfig.headers = requestConfig.headers || {};
    requestConfig.headers[this.header.type] = this.header.headerValue;

    return await this.client.request(requestConfig);
  }
}
