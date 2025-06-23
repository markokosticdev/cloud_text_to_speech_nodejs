/**
 * @fileoverview Google Cloud Text-to-Speech Common Exports
 * 
 * This module provides centralized exports for all Google Cloud Text-to-Speech
 * common functionality including configuration, constants, exceptions, and
 * initialization utilities. It serves as the main entry point for Google-specific
 * common components used throughout the Google TTS implementation.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link https://cloud.google.com/text-to-speech/docs | Google Cloud TTS Documentation}
 * 
 * @example Importing Google Common Components
 * ```typescript
 * // Import all Google common components
 * import * as GoogleCommon from './common.js';
 * 
 * // Use configuration
 * GoogleCommon.ConfigGoogle.init({
 *   apiKey: 'your-api-key'
 * });
 * 
 * // Access endpoints
 * const voicesUrl = GoogleCommon.EndpointsGoogle.voices;
 * 
 * // Handle exceptions
 * try {
 *   // Some operation
 * } catch (error) {
 *   if (error instanceof GoogleCommon.ExceptionGoogle) {
 *     console.error('Google TTS error:', error.message);
 *   }
 * }
 * ```
 * 
 * @example Individual Component Imports
 * ```typescript
 * import { ConfigGoogle, EndpointsGoogle } from './common.js';
 * 
 * // Initialize configuration
 * ConfigGoogle.init({
 *   apiKey: process.env.GOOGLE_TTS_API_KEY!,
 *   projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
 * });
 * 
 * // Use endpoints
 * console.log('TTS endpoint:', EndpointsGoogle.tts);
 * ```
 */

export * from './config.js';
export * from './constants.js';
export * from './exception.js';
