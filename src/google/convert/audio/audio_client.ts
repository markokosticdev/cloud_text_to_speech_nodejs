/**
 * @fileoverview Google Cloud Text-to-Speech HTTP Audio Client
 * 
 * This module provides the HTTP client implementation specifically for Google Cloud
 * Text-to-Speech audio operations. It extends the base HTTP client with Google-specific
 * authentication, retry logic, and request configuration optimized for TTS operations.
 * 
 * The client handles Google Cloud authentication headers, implements exponential
 * backoff retry strategies, and ensures proper content-type headers for Google TTS
 * API requests. It provides a robust foundation for audio synthesis operations.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link https://cloud.google.com/text-to-speech/docs/reference/rest | Google TTS REST API}
 * @see {@link HttpClientBase} for base HTTP client functionality
 * 
 * @example Basic Audio Client Setup
 * ```typescript
 * import { AudioClientGoogle } from './audio_client.js';
 * import { AuthenticationHeaderGoogle } from '../../auth/authentication_types.js';
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
 * const audioClient = new AudioClientGoogle(client, authHeader);
 * ```
 * 
 * @example Advanced Client Configuration
 * ```typescript
 * import { AudioClientGoogle } from './audio_client.js';
 * import axios from 'axios';
 * 
 * // Configure Axios instance with custom settings
 * const axiosInstance = axios.create({
 *   timeout: 60000,
 *   maxContentLength: 10 * 1024 * 1024, // 10MB
 *   headers: {
 *     'User-Agent': 'MyApp/1.0.0',
 *     'Accept': 'application/json'
 *   }
 * });
 * 
 * const audioClient = new AudioClientGoogle(axiosInstance, authHeader);
 * 
 * // Client automatically configures retry logic and authentication
 * ```
 * 
 * @example Making TTS Requests
 * ```typescript
 * import { AudioClientGoogle } from './audio_client.js';
 * 
 * const audioClient = new AudioClientGoogle(client, authHeader);
 * 
 * const requestConfig = {
 *   method: 'POST',
 *   url: '/v1/text:synthesize',
 *   data: {
 *     input: { text: 'Hello, world!' },
 *     voice: { name: 'en-US-Neural2-A' },
 *     audioConfig: { audioEncoding: 'MP3' }
 *   },
 *   responseType: 'arraybuffer' as const
 * };
 * 
 * try {
 *   const response = await audioClient.send(requestConfig);
 *   console.log('TTS request successful:', response.status);
 * } catch (error) {
 *   console.error('TTS request failed:', error);
 * }
 * ```
 * 
 * @example Production Client with Error Handling
 * ```typescript
 * import { AudioClientGoogle } from './audio_client.js';
 * 
 * class GoogleTTSClient {
 *   private audioClient: AudioClientGoogle;
 * 
 *   constructor(authHeader: AuthenticationHeaderGoogle) {
 *     const client = axios.create({
 *       timeout: 30000,
 *       validateStatus: (status) => status < 500, // Don't throw on 4xx errors
 *     });
 * 
 *     this.audioClient = new AudioClientGoogle(client, authHeader);
 *   }
 * 
 *   async synthesize(text: string, voice: string): Promise<Buffer> {
 *     const requestConfig = {
 *       method: 'POST',
 *       url: '/v1/text:synthesize',
 *       data: {
 *         input: { text },
 *         voice: { name: voice },
 *         audioConfig: { audioEncoding: 'MP3' }
 *       },
 *       responseType: 'arraybuffer' as const
 *     };
 * 
 *     const response = await this.audioClient.send(requestConfig);
 *     
 *     if (response.status === 200) {
 *       return Buffer.from(response.data);
 *     } else {
 *       throw new Error(`TTS failed with status ${response.status}`);
 *     }
 *   }
 * }
 * ```
 */

import { HttpClientBase } from '../../../common/http/http_client_base.js';
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { AuthenticationHeaderGoogle } from '../../auth/authentication_types.js';
import axiosRetry, { IAxiosRetryConfig } from 'axios-retry';

/**
 * Google Cloud Text-to-Speech HTTP client for audio operations
 * 
 * Specialized HTTP client that extends the base client functionality with
 * Google-specific authentication, retry logic, and request configuration.
 * Automatically handles Google Cloud authentication headers and implements
 * robust retry strategies for reliable TTS operations.
 * 
 * The client is configured with exponential backoff retry logic and
 * automatically sets appropriate headers for Google TTS API requests.
 * 
 * @example Basic Usage
 * ```typescript
 * const client = new AudioClientGoogle(axiosInstance, authHeader);
 * 
 * const response = await client.send({
 *   method: 'POST',
 *   url: '/v1/text:synthesize',
 *   data: ttsRequest
 * });
 * ```
 * 
 * @example With Custom Retry Configuration
 * ```typescript
 * // The client automatically configures retry logic
 * const client = new AudioClientGoogle(axiosInstance, authHeader);
 * // Inherits: 3 retries, exponential delay, retryable error conditions
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class AudioClientGoogle extends HttpClientBase {
  /**
   * Creates a new Google audio client instance
   * 
   * Initializes the client with Google-specific retry configuration including
   * exponential backoff delay and intelligent retry conditions. The client
   * automatically configures authentication and content-type headers.
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
   * const audioClient = new AudioClientGoogle(axiosClient, authHeader);
   * ```
   */
  constructor(client: AxiosInstance, header: AuthenticationHeaderGoogle) {
    const retryConfig: IAxiosRetryConfig = {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: axiosRetry.isRetryableError,
    };
    axiosRetry(client, retryConfig);
    super(client, header);
  }

  /**
   * Sends an HTTP request with Google-specific headers and authentication
   * 
   * Configures the request with proper Google Cloud authentication headers
   * and content-type settings. Automatically applies the authentication
   * header and sets JSON content type for TTS API compatibility.
   * 
   * @param requestConfig - Axios request configuration
   * @returns Promise resolving to the HTTP response
   * 
   * @throws {Error} When the request fails or authentication is invalid
   * 
   * @example TTS Synthesis Request
   * ```typescript
   * const response = await client.send({
   *   method: 'POST',
   *   url: '/v1/text:synthesize',
   *   data: {
   *     input: { text: 'Hello world' },
   *     voice: { name: 'en-US-Neural2-A' },
   *     audioConfig: { audioEncoding: 'MP3' }
   *   },
   *   responseType: 'arraybuffer'
   * });
   * ```
   * 
   * @example Voice Listing Request
   * ```typescript
   * const response = await client.send({
   *   method: 'GET',
   *   url: '/v1/voices',
   *   params: { languageCode: 'en-US' }
   * });
   * ```
   */
  async send(requestConfig: AxiosRequestConfig): Promise<AxiosResponse> {
    requestConfig.headers = requestConfig.headers || {};
    requestConfig.headers[this.header.type] = this.header.headerValue;
    requestConfig.headers['Content-Type'] = 'application/json';
    return await this.client.request(requestConfig);
  }
}
