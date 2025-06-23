/**
 * @fileoverview Configuration Options for Text Processing Operations
 * 
 * This module defines the configuration options for text processing operations
 * including text splitting limits, chunk size management, and processing behavior
 * customization. It provides a flexible configuration system that supports both
 * default values and user overrides for optimal TTS processing.
 * 
 * The TextOptions class manages text processing parameters that control how
 * large texts are split into manageable chunks for TTS synthesis, ensuring
 * optimal performance while respecting provider limitations and user preferences.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link TextSplitter} for text chunking implementation
 * @see {@link TextBase} for text processing pipeline
 * @see {@link https://cloud.google.com/text-to-speech/quotas | Google Cloud TTS Limits}
 * @see {@link https://docs.aws.amazon.com/polly/latest/dg/limits.html | Amazon Polly Limits}
 * 
 * @example Basic Configuration Setup
 * ```typescript
 * import { TextOptions } from './text_options.js';
 * 
 * // Create options with default split limit
 * const defaultOptions = new TextOptions(
 *   { splitLimit: 5000 }, // Provider defaults
 *   {}                    // No user overrides
 * );
 * 
 * console.log(defaultOptions.splitLimit); // 5000
 * ```
 * 
 * @example Custom Configuration with Overrides
 * ```typescript
 * import { TextOptions } from './text_options.js';
 * 
 * // Create options with custom split limit
 * const customOptions = new TextOptions(
 *   { splitLimit: 5000 }, // Provider defaults
 *   { splitLimit: 2000 }  // User wants smaller chunks
 * );
 * 
 * console.log(customOptions.splitLimit); // 2000 (user override)
 * ```
 * 
 * @example Provider-Specific Configuration
 * ```typescript
 * import { TextOptions } from './text_options.js';
 * 
 * // Google Cloud TTS configuration
 * const googleOptions = new TextOptions(
 *   { splitLimit: 5000 }, // Google's character limit
 *   { splitLimit: 4000 }  // Leave buffer for SSML markup
 * );
 * 
 * // Amazon Polly configuration
 * const amazonOptions = new TextOptions(
 *   { splitLimit: 3000 }, // Amazon's character limit
 *   { splitLimit: 2500 }  // Conservative limit for reliability
 * );
 * 
 * // Microsoft Azure configuration
 * const azureOptions = new TextOptions(
 *   { splitLimit: 8000 }, // Azure's character limit
 *   {}                    // Use default limit
 * );
 * 
 * console.log('Google limit:', googleOptions.splitLimit);  // 4000
 * console.log('Amazon limit:', amazonOptions.splitLimit);  // 2500
 * console.log('Azure limit:', azureOptions.splitLimit);    // 8000
 * ```
 * 
 * @example Production Configuration Management
 * ```typescript
 * import { TextOptions } from './text_options.js';
 * 
 * interface ProviderConfig {
 *   name: string;
 *   maxChunkSize: number;
 *   recommendedChunkSize: number;
 * }
 * 
 * const providerConfigs: ProviderConfig[] = [
 *   { name: 'google', maxChunkSize: 5000, recommendedChunkSize: 4000 },
 *   { name: 'amazon', maxChunkSize: 3000, recommendedChunkSize: 2500 },
 *   { name: 'microsoft', maxChunkSize: 8000, recommendedChunkSize: 6000 }
 * ];
 * 
 * function createOptionsForProvider(
 *   providerName: string, 
 *   userPreferences: { splitLimit?: number } = {}
 * ): TextOptions {
 *   const config = providerConfigs.find(c => c.name === providerName);
 *   if (!config) {
 *     throw new Error(`Unsupported provider: ${providerName}`);
 *   }
 *   
 *   return new TextOptions(
 *     { splitLimit: config.recommendedChunkSize },
 *     userPreferences
 *   );
 * }
 * 
 * // Create provider-specific options
 * const googleOpts = createOptionsForProvider('google', { splitLimit: 3500 });
 * const amazonOpts = createOptionsForProvider('amazon');
 * const azureOpts = createOptionsForProvider('microsoft', { splitLimit: 7000 });
 * 
 * console.log('Configured limits:', {
 *   google: googleOpts.splitLimit,  // 3500 (user override)
 *   amazon: amazonOpts.splitLimit,  // 2500 (default)
 *   azure: azureOpts.splitLimit     // 7000 (user override)
 * });
 * ```
 */

/**
 * Configuration options for text processing and splitting operations
 * 
 * Manages configuration parameters that control text processing behavior,
 * particularly the split limit for breaking large texts into manageable chunks.
 * Supports a flexible override system where user preferences take precedence
 * over provider defaults.
 * 
 * The options system ensures that large texts are processed efficiently while
 * respecting both provider limitations and user preferences for chunk sizes.
 * This is crucial for TTS operations where providers have character limits
 * for individual synthesis requests.
 * 
 * @example Configuration Hierarchy
 * ```typescript
 * import { TextOptions } from './text_options.js';
 * 
 * // Demonstrate configuration precedence
 * const options = new TextOptions(
 *   { splitLimit: 5000 }, // Provider default
 *   { splitLimit: 3000 }  // User override wins
 * );
 * 
 * console.log(options.splitLimit); // 3000
 * ```
 * 
 * @example Validation and Limits
 * ```typescript
 * import { TextOptions } from './text_options.js';
 * 
 * // Set up options with validation in mind
 * function createValidatedOptions(
 *   providerDefaults: { splitLimit: number },
 *   userOptions: { splitLimit?: number }
 * ): TextOptions {
 *   // Validate user input
 *   if (userOptions.splitLimit && userOptions.splitLimit < 100) {
 *     throw new Error('Split limit must be at least 100 characters');
 *   }
 *   
 *   if (userOptions.splitLimit && userOptions.splitLimit > 10000) {
 *     console.warn('Split limit is very high, may cause performance issues');
 *   }
 *   
 *   return new TextOptions(providerDefaults, userOptions);
 * }
 * 
 * const validOptions = createValidatedOptions(
 *   { splitLimit: 5000 },
 *   { splitLimit: 2000 }
 * );
 * ```
 * 
 * @category Configuration
 * @since 3.0.0
 */
export class TextOptions {
  /**
   * Maximum character limit for individual text chunks
   * 
   * Defines the maximum number of characters allowed in a single text chunk
   * before splitting is required. This limit includes any template markup
   * that will be added during processing, so the actual text content will
   * be smaller than this limit.
   * 
   * @remarks The effective text limit is reduced by the size of any SSML
   * or provider-specific markup that gets added during processing
   * @defaultValue Varies by provider (typically 3000-8000 characters)
   */
  splitLimit: number;

  /**
   * Creates a new TextOptions instance with configurable split limits
   * 
   * Initializes text processing options using a two-tier configuration system.
   * Provider defaults are used as the base configuration, with user options
   * taking precedence when specified. This allows for flexible configuration
   * while maintaining sensible defaults for each TTS provider.
   * 
   * @param defaults - Default configuration values provided by the TTS provider
   * @param defaults.splitLimit - Default maximum characters per chunk
   * @param options - User-specified configuration overrides
   * @param options.splitLimit - User override for maximum characters per chunk
   * 
   * @example Basic Configuration
   * ```typescript
   * // Use provider defaults
   * const defaultConfig = new TextOptions(
   *   { splitLimit: 5000 },
   *   {}
   * );
   * 
   * console.log(defaultConfig.splitLimit); // 5000
   * ```
   * 
   * @example Custom Configuration
   * ```typescript
   * // Override with user preferences
   * const customConfig = new TextOptions(
   *   { splitLimit: 5000 }, // Provider default
   *   { splitLimit: 2000 }  // User wants smaller chunks
   * );
   * 
   * console.log(customConfig.splitLimit); // 2000
   * ```
   * 
   * @example Conditional Configuration
   * ```typescript
   * // Configuration based on content type
   * function createOptionsForContent(
   *   contentType: 'short' | 'medium' | 'long',
   *   providerDefaults: { splitLimit: number }
   * ): TextOptions {
   *   const limits = {
   *     short: 1000,
   *     medium: 3000,
   *     long: 5000
   *   };
   *   
   *   return new TextOptions(
   *     providerDefaults,
   *     { splitLimit: limits[contentType] }
   *   );
   * }
   * 
   * const shortTextOptions = createOptionsForContent('short', { splitLimit: 5000 });
   * console.log(shortTextOptions.splitLimit); // 1000
   * ```
   * 
   * @since 3.0.0
   */
  constructor(
    defaults: { splitLimit: number },
    options: { splitLimit?: number },
  ) {
    // Use user override if provided, otherwise fall back to default
    this.splitLimit = options.splitLimit ?? defaults.splitLimit;
  }
}
