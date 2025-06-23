/**
 * @fileoverview Google Cloud Text-to-Speech Initialization Parameters
 * 
 * This module defines the initialization parameter interface for Google Cloud
 * Text-to-Speech services. It specifies the required and optional configuration
 * parameters needed to initialize Google TTS operations, including API key
 * authentication and optional project ID for advanced features.
 * 
 * The initialization system ensures proper configuration validation and
 * provides type safety for Google TTS setup operations.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link https://cloud.google.com/text-to-speech/docs/before-you-begin | Google TTS Setup Guide}
 * @see {@link https://cloud.google.com/docs/authentication/api-keys | Google API Keys}
 * 
 * @example Basic Initialization Parameters
 * ```typescript
 * import { InitParamsGoogle } from './init.js';
 * import { TtsGoogle } from '../tts/tts.js';
 * 
 * const initParams: InitParamsGoogle = {
 *   apiKey: 'your-google-api-key'
 * };
 * 
 * TtsGoogle.init({
 *   params: initParams,
 *   withLogs: true
 * });
 * ```
 * 
 * @example Advanced Initialization with Project ID
 * ```typescript
 * import { InitParamsGoogle } from './init.js';
 * import { TtsGoogle } from '../tts/tts.js';
 * 
 * const initParams: InitParamsGoogle = {
 *   apiKey: 'your-google-api-key',
 *   projectId: 'your-gcp-project-id'
 * };
 * 
 * TtsGoogle.init({
 *   params: initParams,
 *   withLogs: false
 * });
 * ```
 * 
 * @example Environment Variable Configuration
 * ```typescript
 * import { InitParamsGoogle } from './init.js';
 * import { TtsGoogle } from '../tts/tts.js';
 * 
 * const initParams: InitParamsGoogle = {
 *   apiKey: process.env.GOOGLE_TTS_API_KEY!,
 *   projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
 * };
 * 
 * // Validate parameters before initialization
 * if (!initParams.apiKey) {
 *   throw new Error('GOOGLE_TTS_API_KEY environment variable is required');
 * }
 * 
 * TtsGoogle.init({
 *   params: initParams,
 *   withLogs: process.env.NODE_ENV === 'development'
 * });
 * ```
 * 
 * @example Configuration Validation Helper
 * ```typescript
 * import { InitParamsGoogle } from './init.js';
 * 
 * function validateGoogleInitParams(params: InitParamsGoogle): void {
 *   if (!params.apiKey) {
 *     throw new Error('Google API key is required');
 *   }
 *   
 *   if (!params.apiKey.startsWith('AIza')) {
 *     throw new Error('Invalid Google API key format');
 *   }
 *   
 *   if (params.projectId && !/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(params.projectId)) {
 *     throw new Error('Invalid Google Cloud project ID format');
 *   }
 * }
 * 
 * const params: InitParamsGoogle = {
 *   apiKey: 'AIzaSyC...',
 *   projectId: 'my-gcp-project'
 * };
 * 
 * validateGoogleInitParams(params);
 * console.log('Google initialization parameters are valid');
 * ```
 */

/**
 * Initialization parameters for Google Cloud Text-to-Speech services
 * 
 * This interface defines the required and optional configuration parameters
 * needed to initialize Google TTS operations. It ensures type safety and
 * provides clear documentation for all configuration options available
 * when setting up Google Cloud Text-to-Speech services.
 * 
 * The parameters include mandatory API key authentication and optional
 * project ID for accessing project-specific features like custom voice
 * models and advanced configurations.
 * 
 * @example Basic Configuration
 * ```typescript
 * const basicParams: InitParamsGoogle = {
 *   apiKey: 'AIzaSyC...'
 * };
 * ```
 * 
 * @example Full Configuration
 * ```typescript
 * const fullParams: InitParamsGoogle = {
 *   apiKey: 'AIzaSyC...',
 *   projectId: 'my-gcp-project-123'
 * };
 * ```
 * 
 * @example Dynamic Configuration
 * ```typescript
 * const dynamicParams: InitParamsGoogle = {
 *   apiKey: process.env.GOOGLE_TTS_API_KEY || 'fallback-key',
 *   projectId: process.env.NODE_ENV === 'production' 
 *     ? process.env.GOOGLE_CLOUD_PROJECT_ID 
 *     : undefined
 * };
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export interface InitParamsGoogle {
  /**
   * Google Cloud API key for Text-to-Speech service authentication
   * 
   * The API key must be a valid Google Cloud API key with Text-to-Speech
   * API access enabled. The key should typically start with "AIza" and
   * must have sufficient permissions for the intended TTS operations.
   * 
   * @example
   * ```typescript
   * const params: InitParamsGoogle = {
   *   apiKey: 'AIzaSyC-your-actual-api-key-here'
   * };
   * ```
   */
  apiKey: string;

  /**
   * Optional Google Cloud project ID for project-specific features
   * 
   * When provided, enables access to project-specific features such as
   * custom voice models, project-scoped configurations, and advanced
   * TTS capabilities. The project ID should follow Google Cloud naming
   * conventions (lowercase letters, numbers, and hyphens).
   * 
   * @example
   * ```typescript
   * const params: InitParamsGoogle = {
   *   apiKey: 'AIzaSyC...',
   *   projectId: 'my-gcp-project-123'
   * };
   * ```
   */
  projectId?: string;
}
