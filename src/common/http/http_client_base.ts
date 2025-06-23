/**
 * @fileoverview Base HTTP Client Infrastructure for Cloud Text-to-Speech Services
 * 
 * This module provides the foundational HTTP client abstraction used across all
 * TTS providers (Google Cloud TTS, Microsoft Azure TTS, and Amazon Polly).
 * The HttpClientBase class encapsulates Axios configuration, header management,
 * and provides a consistent interface for HTTP operations.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 */

import { AxiosInstance } from 'axios';
import { HttpHeaderBase } from './http_header_base.js';

/**
 * Abstract base class for HTTP client implementations across TTS providers
 * 
 * Provides a standardized interface for HTTP client management with support
 * for custom headers, Axios configuration, and provider-specific extensions.
 * This base class is extended by provider-specific HTTP clients to implement
 * authentication, request formatting, and response handling.
 * 
 * @example Basic HTTP Client Extension
 * ```typescript
 * import { HttpClientBase, HttpHeaderBase } from 'cloud-text-to-speech';
 * import axios, { AxiosInstance } from 'axios';
 * 
 * class CustomTtsHttpClient extends HttpClientBase {
 *   constructor() {
 *     const client = axios.create({
 *       baseURL: 'https://api.example.com',
 *       timeout: 30000
 *     });
 *     
 *     const headers = new HttpHeaderBase({
 *       'Content-Type': 'application/json',
 *       'User-Agent': 'CustomTTS/1.0'
 *     });
 *     
 *     super(client, headers);
 *   }
 *   
 *   async synthesizeText(text: string): Promise<ArrayBuffer> {
 *     const response = await this.client.post('/synthesize', {
 *       text,
 *       voice: 'en-US-Standard-A'
 *     }, {
 *       headers: this.header?.toObject()
 *     });
 *     return response.data;
 *   }
 * }
 * ```
 * 
 * @example HTTP Client with Authentication
 * ```typescript
 * class AuthenticatedTtsClient extends HttpClientBase {
 *   private apiKey: string;
 *   
 *   constructor(apiKey: string) {
 *     const client = axios.create({
 *       baseURL: 'https://secure-tts-api.com',
 *       timeout: 60000
 *     });
 *     
 *     const headers = new HttpHeaderBase({
 *       'Authorization': `Bearer ${apiKey}`,
 *       'Content-Type': 'application/json'
 *     });
 *     
 *     super(client, headers);
 *     this.apiKey = apiKey;
 *   }
 *   
 *   async makeAuthenticatedRequest(endpoint: string, data: any) {
 *     return await this.client.post(endpoint, data, {
 *       headers: {
 *         ...this.header?.toObject(),
 *         'X-API-Key': this.apiKey
 *       }
 *     });
 *   }
 * }
 * ```
 * 
 * @example HTTP Client with Interceptors
 * ```typescript
 * class TtsClientWithInterceptors extends HttpClientBase {
 *   constructor() {
 *     const client = axios.create({
 *       baseURL: 'https://api.tts-service.com'
 *     });
 *     
 *     // Add request interceptor
 *     client.interceptors.request.use(
 *       (config) => {
 *         console.log('Making request to:', config.url);
 *         return config;
 *       },
 *       (error) => Promise.reject(error)
 *     );
 *     
 *     // Add response interceptor
 *     client.interceptors.response.use(
 *       (response) => {
 *         console.log('Response received:', response.status);
 *         return response;
 *       },
 *       (error) => {
 *         console.error('Request failed:', error.message);
 *         return Promise.reject(error);
 *       }
 *     );
 *     
 *     super(client);
 *   }
 * }
 * ```
 * 
 * @category Common Utilities
 * @since 3.0.0
 */
export abstract class HttpClientBase {
  /** Optional HTTP headers configuration */
  protected _header?: HttpHeaderBase;
  /** Axios instance for HTTP operations */
  protected _client: AxiosInstance;

  /**
   * Creates a new HTTP client base with Axios instance and optional headers
   * 
   * Initializes the HTTP client with the provided Axios configuration and
   * optional header management. The Axios instance should be pre-configured
   * with base URL, timeouts, and any other provider-specific settings.
   * 
   * @param client - Pre-configured Axios instance for HTTP operations
   * @param header - Optional HTTP headers configuration
   * 
   * @example Basic HTTP Client Setup
   * ```typescript
   * import axios from 'axios';
   * import { HttpHeaderBase } from 'cloud-text-to-speech';
   * 
   * const axiosClient = axios.create({
   *   baseURL: 'https://api.example.com',
   *   timeout: 30000,
   *   validateStatus: (status) => status >= 200 && status < 300
   * });
   * 
   * const headers = new HttpHeaderBase({
   *   'Content-Type': 'application/json',
   *   'Accept': 'application/json'
   * });
   * 
   * class MyHttpClient extends HttpClientBase {
   *   constructor() {
   *     super(axiosClient, headers);
   *   }
   * }
   * ```
   * 
   * @example HTTP Client with Provider-Specific Configuration
   * ```typescript
   * const googleClient = axios.create({
   *   baseURL: 'https://texttospeech.googleapis.com/v1',
   *   timeout: 60000,
   *   headers: {
   *     'User-Agent': 'Google-Cloud-TTS-Client/3.0.0'
   *   }
   * });
   * 
   * const googleHeaders = new HttpHeaderBase({
   *   'Content-Type': 'application/json; charset=utf-8'
   * });
   * 
   * class GoogleTtsClient extends HttpClientBase {
   *   constructor() {
   *     super(googleClient, googleHeaders);
   *   }
   * }
   * ```
   * 
   * @since 3.0.0
   */
  constructor(client: AxiosInstance, header?: HttpHeaderBase) {
    this._header = header;
    this._client = client;
  }

  /**
   * Gets the HTTP headers configuration
   * 
   * Returns the current HTTP headers configuration that will be used
   * for requests. Headers can be undefined if no specific headers
   * were configured during client initialization.
   * 
   * @returns Current HTTP headers configuration or undefined
   * 
   * @example Using HTTP Headers
   * ```typescript
   * const client = new MyHttpClient();
   * 
   * if (client.header) {
   *   console.log('Client has headers configured');
   *   const headerObject = client.header.toObject();
   *   console.log('Content-Type:', headerObject['Content-Type']);
   * } else {
   *   console.log('No headers configured');
   * }
   * ```
   * 
   * @since 3.0.0
   */
  get header(): HttpHeaderBase | undefined {
    return this._header;
  }

  /**
   * Gets the Axios client instance
   * 
   * Returns the underlying Axios instance that can be used for making
   * HTTP requests. This provides full access to Axios features including
   * interceptors, request/response transformation, and configuration.
   * 
   * @returns Configured Axios instance for HTTP operations
   * 
   * @example Direct Axios Usage
   * ```typescript
   * const client = new MyHttpClient();
   * 
   * // Use the Axios client directly
   * try {
   *   const response = await client.client.get('/health');
   *   console.log('Service is healthy:', response.status === 200);
   * } catch (error) {
   *   console.error('Health check failed:', error.message);
   * }
   * ```
   * 
   * @example Adding Request Interceptors
   * ```typescript
   * const client = new MyHttpClient();
   * 
   * // Add authentication to all requests
   * client.client.interceptors.request.use((config) => {
   *   config.headers.Authorization = `Bearer ${getAuthToken()}`;
   *   return config;
   * });
   * 
   * // Add retry logic to failed requests
   * client.client.interceptors.response.use(
   *   (response) => response,
   *   async (error) => {
   *     if (error.response?.status === 401) {
   *       await refreshAuthToken();
   *       return client.client.request(error.config);
   *     }
   *     return Promise.reject(error);
   *   }
   * );
   * ```
   * 
   * @since 3.0.0
   */
  get client(): AxiosInstance {
    return this._client;
  }
}
