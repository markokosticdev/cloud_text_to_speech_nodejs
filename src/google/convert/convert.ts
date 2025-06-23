/**
 * @fileoverview Google Cloud Text-to-Speech Conversion Exports
 * 
 * This module provides centralized exports for all Google Cloud Text-to-Speech
 * conversion functionality including parameters, options, and configuration classes.
 * It serves as the main entry point for Google-specific conversion components
 * used throughout the Google TTS conversion workflow.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link https://cloud.google.com/text-to-speech/docs | Google Cloud TTS Documentation}
 * 
 * @example Importing Google Conversion Components
 * ```typescript
 * // Import all conversion components
 * import * as GoogleConvert from './convert.js';
 * 
 * // Use conversion parameters
 * const params = new GoogleConvert.ConvertParamsGoogle({
 *   text: 'Hello from Google TTS',
 *   voice: { name: 'en-US-Neural2-A' }
 * });
 * 
 * // Configure audio options
 * const audioOptions = new GoogleConvert.ConvertAudioOptionsGoogle({
 *   audioEncoding: 'MP3',
 *   sampleRateHertz: 24000
 * });
 * ```
 * 
 * @example Individual Component Imports
 * ```typescript
 * import { 
 *   ConvertParamsGoogle, 
 *   ConvertAudioOptionsGoogle 
 * } from './convert.js';
 * 
 * // Create conversion configuration
 * const params = new ConvertParamsGoogle({
 *   text: 'Hello world',
 *   voice: { name: 'en-US-Neural2-A' }
 * });
 * ```
 */

export * from './convert_params.js';
export * from './convert_audio_options.js';
export * from './convert_process_options.js';
export * from './convert_ssml_options.js';
export * from './convert_text_options.js';
