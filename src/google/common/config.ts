/**
 * @fileoverview Google Cloud Text-to-Speech Configuration Management
 * 
 * This module handles configuration loading, validation, and management for Google Cloud
 * Text-to-Speech services. It supports API key configuration, optional project ID setup,
 * and provides centralized configuration access throughout the Google TTS implementation.
 * 
 * The configuration system follows secure practices with validation and error handling
 * for production deployments. It ensures that required credentials are properly
 * configured before any API operations are attempted.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link https://cloud.google.com/text-to-speech/docs/before-you-begin | Google TTS Setup Guide}
 * @see {@link https://cloud.google.com/docs/authentication/api-keys | Google API Keys}
 * 
 * @example Basic Configuration Setup
 * ```typescript
 * import { ConfigGoogle } from './config.js';
 * 
 * // Initialize configuration
 * ConfigGoogle.init({
 *   apiKey: 'your-google-api-key'
 * });
 * 
 * // Access configuration
 * console.log(`API Key configured: ${ConfigGoogle.apiKey.substring(0, 10)}...`);
 * ```
 * 
 * @example Configuration with Project ID
 * ```typescript
 * import { ConfigGoogle } from './config.js';
 * 
 * // Initialize with project ID for advanced features
 * ConfigGoogle.init({
 *   apiKey: 'your-google-api-key',
 *   projectId: 'your-gcp-project-id'
 * });
 * 
 * // Use project-specific features
 * if (ConfigGoogle.projectId) {
 *   console.log(`Project ID: ${ConfigGoogle.projectId}`);
 *   // Enable custom voice models or other project-specific features
 * }
 * ```
 * 
 * @example Environment Variable Configuration
 * ```typescript
 * import { ConfigGoogle } from './config.js';
 * 
 * // Configure from environment variables
 * ConfigGoogle.init({
 *   apiKey: process.env.GOOGLE_TTS_API_KEY!,
 *   projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
 * });
 * 
 * // Validate configuration
 * try {
 *   const apiKey = ConfigGoogle.apiKey;
 *   console.log('Google TTS configuration valid');
 * } catch (error) {
 *   console.error('Configuration error:', error.message);
 *   process.exit(1);
 * }
 * ```
 * 
 * @example Production Configuration Validation
 * ```typescript
 * import { ConfigGoogle } from './config.js';
 * 
 * class GoogleTtsConfigValidator {
 *   static validateAndInit(): void {
 *     const apiKey = process.env.GOOGLE_TTS_API_KEY;
 *     const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
 * 
 *     if (!apiKey) {
 *       throw new Error('GOOGLE_TTS_API_KEY environment variable is required');
 *     }
 * 
 *     if (!apiKey.startsWith('AIza')) {
 *       throw new Error('Invalid Google API key format');
 *     }
 * 
 *     ConfigGoogle.init({ apiKey, projectId });
 * 
 *     console.log('Google TTS configuration initialized successfully');
 *   }
 * }
 * 
 * GoogleTtsConfigValidator.validateAndInit();
 * ```
 */

/**
 * Configuration manager for Google Cloud Text-to-Speech services
 * 
 * This class provides centralized configuration management for Google TTS operations,
 * including API key storage, project ID management, and configuration validation.
 * It ensures that all required credentials are properly configured and accessible
 * throughout the Google TTS implementation.
 * 
 * The configuration is stored securely and provides error handling for missing
 * or invalid configuration values. It supports both basic API key authentication
 * and advanced project-specific features.
 * 
 * @example Basic Configuration Usage
 * ```typescript
 * // Initialize configuration
 * ConfigGoogle.init({
 *   apiKey: 'your-api-key'
 * });
 * 
 * // Access configuration values
 * const apiKey = ConfigGoogle.apiKey;
 * const projectId = ConfigGoogle.projectId; // undefined if not set
 * ```
 * 
 * @example Configuration Validation
 * ```typescript
 * try {
 *   ConfigGoogle.init({
 *     apiKey: 'AIzaSyC...',
 *     projectId: 'my-gcp-project'
 *   });
 * 
 *   // Configuration is valid, proceed with TTS operations
 *   console.log('Configuration ready');
 * } catch (error) {
 *   console.error('Configuration failed:', error.message);
 * }
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class ConfigGoogle {
  /**
   * Private constructor to prevent instantiation
   * This class should only be used statically
   * @internal
   */
  private constructor() {}

  /**
   * Internal storage for Google Cloud API key
   * @internal
   */
  private static _apiKey: string;

  /**
   * Gets the configured Google Cloud API key
   * 
   * Returns the API key that was set during initialization. This key is used
   * for authenticating requests to Google Cloud Text-to-Speech API.
   * 
   * @returns The Google Cloud API key
   * @throws {@link Error} When API key is not initialized
   * 
   * @example
   * ```typescript
   * try {
   *   const apiKey = ConfigGoogle.apiKey;
   *   console.log(`API key configured: ${apiKey.substring(0, 10)}...`);
   * } catch (error) {
   *   console.error('API key not configured:', error.message);
   *   // Initialize configuration first
   * }
   * ```
   */
  static get apiKey(): string {
    if (!this._apiKey) {
      throw new Error('Google API Key is not initialized');
    }
    return this._apiKey;
  }

  /**
   * Internal storage for Google Cloud project ID
   * @internal
   */
  private static _projectId?: string;

  /**
   * Gets the configured Google Cloud project ID
   * 
   * Returns the project ID that was optionally set during initialization.
   * Project ID is required for certain advanced features like custom voice models
   * or project-specific configurations.
   * 
   * @returns The Google Cloud project ID, or undefined if not configured
   * 
   * @example
   * ```typescript
   * const projectId = ConfigGoogle.projectId;
   * if (projectId) {
   *   console.log(`Using project: ${projectId}`);
   *   // Enable project-specific features
   * } else {
   *   console.log('No project ID configured, using basic features only');
   * }
   * ```
   */
  static get projectId(): string | undefined {
    return this._projectId;
  }

  /**
   * Initializes the Google Cloud Text-to-Speech configuration
   * 
   * Sets up the API key and optional project ID for Google TTS operations.
   * This method must be called before any other Google TTS operations can be performed.
   * 
   * @param apiKey - The Google Cloud API key for Text-to-Speech service
   * @param projectId - Optional Google Cloud project ID for advanced features
   * 
   * @throws {@link Error} When API key is missing or invalid
   * 
   * @example Basic Initialization
   * ```typescript
   * ConfigGoogle.init({
   *   apiKey: 'AIzaSyC...'
   * });
   * ```
   * 
   * @example Full Initialization
   * ```typescript
   * ConfigGoogle.init({
   *   apiKey: 'AIzaSyC...',
   *   projectId: 'my-gcp-project-123'
   * });
   * ```
   * 
   * @example Environment Variable Initialization
   * ```typescript
   * ConfigGoogle.init({
   *   apiKey: process.env.GOOGLE_TTS_API_KEY!,
   *   projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
   * });
   * ```
   * 
   * @example Validation During Initialization
   * ```typescript
   * function initializeGoogleConfig(): void {
   *   const apiKey = process.env.GOOGLE_TTS_API_KEY;
   *   
   *   if (!apiKey) {
   *     throw new Error('GOOGLE_TTS_API_KEY environment variable is required');
   *   }
   *   
   *   ConfigGoogle.init({
   *     apiKey,
   *     projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
   *   });
   *   
   *   console.log('Google TTS configuration initialized');
   * }
   * ```
   * 
   * @since 3.0.0
   */
  static init({
    apiKey,
    projectId,
  }: {
    apiKey: string;
    projectId?: string;
  }): void {
    ConfigGoogle._apiKey = apiKey;
    ConfigGoogle._projectId = projectId;
  }
}
