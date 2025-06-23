/**
 * @fileoverview HTTP Header Management Base Class for Cloud Text-to-Speech Services
 * 
 * This module provides the base class for HTTP header management across all TTS providers.
 * It defines the structure for header objects that encapsulate header type and value pairs,
 * with abstract methods for custom header value formatting and serialization.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link HttpClientBase} for HTTP client implementation
 * @see {@link BaseResponseMapper} for response handling
 * 
 * @example Basic header implementation
 * ```typescript
 * import { HttpHeaderBase } from 'cloud-text-to-speech';
 * 
 * class ContentTypeHeader extends HttpHeaderBase {
 *   constructor(contentType: string) {
 *     super('Content-Type', contentType);
 *   }
 *   
 *   get headerValue(): string {
 *     return `${this.type}: ${this.value}`;
 *   }
 * }
 * 
 * // Usage
 * const header = new ContentTypeHeader('application/json');
 * console.log(header.headerValue); // 'Content-Type: application/json'
 * ```
 * 
 * @example Authentication header
 * ```typescript
 * class AuthorizationHeader extends HttpHeaderBase {
 *   constructor(token: string, scheme: string = 'Bearer') {
 *     super('Authorization', `${scheme} ${token}`);
 *   }
 *   
 *   get headerValue(): string {
 *     return `${this.type}: ${this.value}`;
 *   }
 * }
 * 
 * // Usage
 * const authHeader = new AuthorizationHeader('abc123token');
 * console.log(authHeader.headerValue); // 'Authorization: Bearer abc123token'
 * ```
 * 
 * @example Custom header formatting
 * ```typescript
 * class CustomApiHeader extends HttpHeaderBase {
 *   private apiVersion: string;
 *   
 *   constructor(apiKey: string, version: string = 'v1') {
 *     super('X-API-Key', apiKey);
 *     this.apiVersion = version;
 *   }
 *   
 *   get headerValue(): string {
 *     return `${this.type}: ${this.value}; version=${this.apiVersion}`;
 *   }
 * }
 * ```
 */

/**
 * Abstract base class for HTTP header management and formatting.
 * Provides common functionality for header type and value storage with
 * extensible formatting through the abstract headerValue getter.
 * 
 * @category Common Utilities
 * 
 * @example Simple header implementation
 * ```typescript
 * class SimpleHeader extends HttpHeaderBase {
 *   constructor(type: string, value: string) {
 *     super(type, value);
 *   }
 *   
 *   get headerValue(): string {
 *     return `${this.type}: ${this.value}`;
 *   }
 * }
 * 
 * const header = new SimpleHeader('User-Agent', 'TTS-Client/1.0');
 * console.log(header.type);        // 'User-Agent'
 * console.log(header.value);       // 'TTS-Client/1.0'
 * console.log(header.headerValue); // 'User-Agent: TTS-Client/1.0'
 * ```
 * 
 * @example Provider-specific headers
 * ```typescript
 * class GoogleApiHeader extends HttpHeaderBase {
 *   constructor(apiKey: string) {
 *     super('X-Goog-Api-Key', apiKey);
 *   }
 *   
 *   get headerValue(): string {
 *     return `${this.type}: ${this.value}`;
 *   }
 * }
 * 
 * class MicrosoftSubscriptionHeader extends HttpHeaderBase {
 *   constructor(subscriptionKey: string) {
 *     super('Ocp-Apim-Subscription-Key', subscriptionKey);
 *   }
 *   
 *   get headerValue(): string {
 *     return `${this.type}: ${this.value}`;
 *   }
 * }
 * 
 * class AmazonAuthHeader extends HttpHeaderBase {
 *   constructor(authValue: string) {
 *     super('Authorization', authValue);
 *   }
 *   
 *   get headerValue(): string {
 *     return `${this.type}: ${this.value}`;
 *   }
 * }
 * ```
 * 
 * @example Complex header with validation
 * ```typescript
 * class ValidatedHeader extends HttpHeaderBase {
 *   constructor(type: string, value: string) {
 *     if (!type || type.trim().length === 0) {
 *       throw new Error('Header type cannot be empty');
 *     }
 *     
 *     if (!value || value.trim().length === 0) {
 *       throw new Error('Header value cannot be empty');
 *     }
 *     
 *     super(type.trim(), value.trim());
 *   }
 *   
 *   get headerValue(): string {
 *     // Format with proper capitalization
 *     const formattedType = this.type
 *       .split('-')
 *       .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
 *       .join('-');
 *     
 *     return `${formattedType}: ${this.value}`;
 *   }
 * }
 * 
 * // Usage
 * const header = new ValidatedHeader('content-type', 'application/json');
 * console.log(header.headerValue); // 'Content-Type: application/json'
 * ```
 * 
 * @example Multi-value header
 * ```typescript
 * class AcceptHeader extends HttpHeaderBase {
 *   private acceptedTypes: string[];
 *   
 *   constructor(types: string[]) {
 *     super('Accept', types.join(', '));
 *     this.acceptedTypes = types;
 *   }
 *   
 *   get headerValue(): string {
 *     return `${this.type}: ${this.acceptedTypes.join(', ')}`;
 *   }
 *   
 *   addType(type: string): void {
 *     if (!this.acceptedTypes.includes(type)) {
 *       this.acceptedTypes.push(type);
 *       this._value = this.acceptedTypes.join(', ');
 *     }
 *   }
 * }
 * 
 * // Usage
 * const acceptHeader = new AcceptHeader(['application/json', 'application/xml']);
 * acceptHeader.addType('text/plain');
 * console.log(acceptHeader.headerValue);
 * // 'Accept: application/json, application/xml, text/plain'
 * ```
 * 
 * @example Header collection manager
 * ```typescript
 * class HeaderCollection {
 *   private headers: Map<string, HttpHeaderBase> = new Map();
 *   
 *   addHeader(header: HttpHeaderBase): void {
 *     this.headers.set(header.type.toLowerCase(), header);
 *   }
 *   
 *   getHeader(type: string): HttpHeaderBase | undefined {
 *     return this.headers.get(type.toLowerCase());
 *   }
 *   
 *   toObject(): Record<string, string> {
 *     const result: Record<string, string> = {};
 *     this.headers.forEach(header => {
 *       result[header.type] = header.value;
 *     });
 *     return result;
 *   }
 *   
 *   toString(): string {
 *     return Array.from(this.headers.values())
 *       .map(header => header.headerValue)
 *       .join('\n');
 *   }
 * }
 * ```
 */
export abstract class HttpHeaderBase {
  /** The header type/name (e.g., 'Content-Type', 'Authorization') */
  private readonly _type: string;
  /** The header value */
  private _value: string;

  /**
   * Creates a new HTTP header with the specified type and value.
   * 
   * @param type - The header type/name (e.g., 'Content-Type', 'Authorization')
   * @param value - The header value
   * 
   * @example Basic header creation
   * ```typescript
   * class MyHeader extends HttpHeaderBase {
   *   constructor(value: string) {
   *     super('X-Custom-Header', value);
   *   }
   *   
   *   get headerValue(): string {
   *     return `${this.type}: ${this.value}`;
   *   }
   * }
   * 
   * const header = new MyHeader('custom-value');
   * ```
   * 
   * @example Content-Type header
   * ```typescript
   * class ContentTypeHeader extends HttpHeaderBase {
   *   constructor(mediaType: string, charset?: string) {
   *     const value = charset ? `${mediaType}; charset=${charset}` : mediaType;
   *     super('Content-Type', value);
   *   }
   *   
   *   get headerValue(): string {
   *     return `${this.type}: ${this.value}`;
   *   }
   * }
   * 
   * const jsonHeader = new ContentTypeHeader('application/json', 'utf-8');
   * console.log(jsonHeader.headerValue);
   * // 'Content-Type: application/json; charset=utf-8'
   * ```
   * 
   * @example API key header
   * ```typescript
   * class ApiKeyHeader extends HttpHeaderBase {
   *   constructor(apiKey: string, prefix: string = 'ApiKey') {
   *     super('X-API-Key', `${prefix} ${apiKey}`);
   *   }
   *   
   *   get headerValue(): string {
   *     return `${this.type}: ${this.value}`;
   *   }
   * }
   * ```
   */
  constructor(type: string, value: string) {
    this._type = type;
    this._value = value;
  }

  /**
   * Gets the header value.
   * 
   * @returns The current header value
   * 
   * @example
   * ```typescript
   * const header = new MyHeader('test-value');
   * console.log(header.value); // 'test-value'
   * ```
   */
  get value(): string {
    return this._value;
  }

  /**
   * Gets the header type/name.
   * 
   * @returns The header type/name
   * 
   * @example
   * ```typescript
   * const header = new MyHeader('test-value');
   * console.log(header.type); // 'X-Custom-Header'
   * ```
   */
  get type(): string {
    return this._type;
  }

  /**
   * Abstract getter that must be implemented by subclasses to provide
   * the formatted header string ready for HTTP transmission.
   * 
   * @returns Formatted header string (e.g., 'Content-Type: application/json')
   * 
   * @example Standard formatting
   * ```typescript
   * get headerValue(): string {
   *   return `${this.type}: ${this.value}`;
   * }
   * ```
   * 
   * @example Custom formatting with validation
   * ```typescript
   * get headerValue(): string {
   *   if (!this.value) {
   *     throw new Error(`Header ${this.type} has no value`);
   *   }
   *   return `${this.type}: ${this.value}`;
   * }
   * ```
   * 
   * @example Complex formatting
   * ```typescript
   * get headerValue(): string {
   *   // Format header with special handling for certain types
   *   if (this.type.toLowerCase() === 'authorization') {
   *     return `${this.type}: ${this.value}`;
   *   }
   *   
   *   // Add quotes for string values
   *   return `${this.type}: "${this.value}"`;
   * }
   * ```
   */
  abstract get headerValue(): string;
}
