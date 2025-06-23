/**
 * @fileoverview Google Cloud Text-to-Speech Authentication Types
 * 
 * This module defines authentication mechanisms for Google Cloud Text-to-Speech API,
 * including API key authentication headers and base authentication interfaces.
 * It provides secure authentication handling with proper header formatting
 * and validation for Google Cloud services.
 * 
 * The authentication system supports Google's standard X-goog-api-key header
 * format and can be extended for additional authentication methods like
 * OAuth2 or service account authentication.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link https://cloud.google.com/docs/authentication | Google Cloud Authentication}
 * @see {@link https://cloud.google.com/text-to-speech/docs/before-you-begin | Google TTS Authentication Setup}
 * 
 * @example Basic API Key Authentication
 * ```typescript
 * import { ApiKeyAuthenticationHeaderGoogle } from './authentication_types.js';
 * 
 * // Create authentication header
 * const auth = new ApiKeyAuthenticationHeaderGoogle('your-api-key');
 * 
 * // Use in HTTP requests
 * const headers = {
 *   [auth.type]: auth.headerValue,
 *   'Content-Type': 'application/json'
 * };
 * 
 * console.log(headers); // { 'X-goog-api-key': 'your-api-key', ... }
 * ```
 * 
 * @example Custom Authentication Extension
 * ```typescript
 * import { AuthenticationHeaderGoogle } from './authentication_types.js';
 * 
 * // Extend for OAuth2 authentication
 * class OAuth2AuthenticationHeaderGoogle extends AuthenticationHeaderGoogle {
 *   constructor(accessToken: string) {
 *     super('Authorization', `Bearer ${accessToken}`);
 *   }
 * 
 *   get headerValue(): string {
 *     return this.value;
 *   }
 * }
 * 
 * const oauthAuth = new OAuth2AuthenticationHeaderGoogle('access-token');
 * ```
 * 
 * @example Authentication Header Validation
 * ```typescript
 * import { ApiKeyAuthenticationHeaderGoogle } from './authentication_types.js';
 * 
 * function createSecureAuth(apiKey: string): ApiKeyAuthenticationHeaderGoogle {
 *   if (!apiKey || apiKey.length < 10) {
 *     throw new Error('Invalid API key format');
 *   }
 * 
 *   return new ApiKeyAuthenticationHeaderGoogle(apiKey);
 * }
 * 
 * try {
 *   const auth = createSecureAuth(process.env.GOOGLE_API_KEY!);
 *   console.log('Authentication configured successfully');
 * } catch (error) {
 *   console.error('Authentication setup failed:', error.message);
 * }
 * ```
 * 
 * @example Production Authentication Setup
 * ```typescript
 * import { ApiKeyAuthenticationHeaderGoogle } from './authentication_types.js';
 * 
 * // Production authentication with validation
 * class SecureGoogleAuth {
 *   private auth: ApiKeyAuthenticationHeaderGoogle;
 * 
 *   constructor(apiKey: string) {
 *     this.validateApiKey(apiKey);
 *     this.auth = new ApiKeyAuthenticationHeaderGoogle(apiKey);
 *   }
 * 
 *   private validateApiKey(apiKey: string): void {
 *     if (!apiKey) {
 *       throw new Error('API key is required');
 *     }
 *     if (!apiKey.startsWith('AIza')) {
 *       throw new Error('Invalid Google API key format');
 *     }
 *   }
 * 
 *   getHeaders(): Record<string, string> {
 *     return {
 *       [this.auth.type]: this.auth.headerValue
 *     };
 *   }
 * }
 * ```
 */

import { HttpHeaderBase } from '../../common/http/http_header_base.js';

/**
 * Base class for Google Cloud Text-to-Speech authentication headers
 * 
 * This abstract class defines the interface that all Google TTS authentication
 * types must implement. It extends the base HTTP header functionality to provide
 * Google-specific authentication mechanisms.
 * 
 * The class ensures consistent authentication header formatting and provides
 * a foundation for different authentication methods like API keys, OAuth2,
 * or service account authentication.
 * 
 * @example Creating Custom Authentication
 * ```typescript
 * class CustomGoogleAuth extends AuthenticationHeaderGoogle {
 *   constructor(token: string) {
 *     super('Custom-Auth', token);
 *   }
 * 
 *   get headerValue(): string {
 *     return `Custom ${this.value}`;
 *   }
 * }
 * ```
 * 
 * @example OAuth2 Authentication Extension
 * ```typescript
 * class OAuth2GoogleAuth extends AuthenticationHeaderGoogle {
 *   constructor(accessToken: string) {
 *     super('Authorization', `Bearer ${accessToken}`);
 *   }
 * 
 *   get headerValue(): string {
 *     return this.value;
 *   }
 * 
 *   isExpired(): boolean {
 *     // Implement token expiration logic
 *     return false;
 *   }
 * }
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export abstract class AuthenticationHeaderGoogle extends HttpHeaderBase {
  /**
   * Creates a new Google authentication header
   * 
   * @param type - The HTTP header type (e.g., 'X-goog-api-key', 'Authorization')
   * @param value - The authentication value (API key, token, etc.)
   * 
   * @example
   * ```typescript
   * class MyGoogleAuth extends AuthenticationHeaderGoogle {
   *   constructor(apiKey: string) {
   *     super('X-goog-api-key', apiKey);
   *   }
   * }
   * ```
   */
  constructor(type: string, value: string) {
    super(type, value);
  }
}

/**
 * Google Cloud Text-to-Speech API key authentication header
 * 
 * This class implements Google's standard API key authentication using the
 * X-goog-api-key header. It provides secure authentication for Google Cloud
 * Text-to-Speech API requests with proper header formatting and validation.
 * 
 * The API key authentication is the most common method for accessing Google TTS
 * services and provides sufficient security for most applications when properly
 * configured with API restrictions and quotas.
 * 
 * @example Basic API Key Usage
 * ```typescript
 * const auth = new ApiKeyAuthenticationHeaderGoogle('AIza...');
 * 
 * // Get header for HTTP requests
 * const headers = {
 *   [auth.type]: auth.headerValue,
 *   'Content-Type': 'application/json'
 * };
 * 
 * // Use in fetch request
 * const response = await fetch('https://texttospeech.googleapis.com/v1/voices', {
 *   headers
 * });
 * ```
 * 
 * @example Secure API Key Management
 * ```typescript
 * // Environment-based configuration
 * const apiKey = process.env.GOOGLE_TTS_API_KEY;
 * if (!apiKey) {
 *   throw new Error('GOOGLE_TTS_API_KEY environment variable is required');
 * }
 * 
 * const auth = new ApiKeyAuthenticationHeaderGoogle(apiKey);
 * 
 * // Validate authentication
 * console.log(`Using authentication type: ${auth.type}`);
 * console.log(`Key configured: ${auth.headerValue.substring(0, 10)}...`);
 * ```
 * 
 * @example Integration with HTTP Client
 * ```typescript
 * import { HttpClientBase } from '../../common/http/http_client_base.js';
 * 
 * class GoogleTtsClient extends HttpClientBase {
 *   private auth: ApiKeyAuthenticationHeaderGoogle;
 * 
 *   constructor(apiKey: string) {
 *     super();
 *     this.auth = new ApiKeyAuthenticationHeaderGoogle(apiKey);
 *   }
 * 
 *   protected getDefaultHeaders(): Record<string, string> {
 *     return {
 *       ...super.getDefaultHeaders(),
 *       [this.auth.type]: this.auth.headerValue
 *     };
 *   }
 * }
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class ApiKeyAuthenticationHeaderGoogle extends AuthenticationHeaderGoogle {
  /**
   * Creates a new Google API key authentication header
   * 
   * @param apiKey - The Google Cloud API key for Text-to-Speech service
   * 
   * @throws {@link Error} When API key is empty or invalid format
   * 
   * @example
   * ```typescript
   * const auth = new ApiKeyAuthenticationHeaderGoogle('AIzaSyC...');
   * console.log(auth.type); // 'X-goog-api-key'
   * console.log(auth.headerValue); // 'AIzaSyC...'
   * ```
   */
  constructor(apiKey: string) {
    super('X-goog-api-key', apiKey);
  }

  /**
   * Gets the formatted header value for HTTP requests
   * 
   * Returns the API key value that should be included in the X-goog-api-key header
   * when making requests to Google Cloud Text-to-Speech API.
   * 
   * @returns The API key value for the authentication header
   * 
   * @example
   * ```typescript
   * const auth = new ApiKeyAuthenticationHeaderGoogle('your-api-key');
   * 
   * const headers = {
   *   'X-goog-api-key': auth.headerValue,
   *   'Content-Type': 'application/json'
   * };
   * 
   * // Use headers in API requests
   * ```
   */
  get headerValue(): string {
    return this.value;
  }
}
