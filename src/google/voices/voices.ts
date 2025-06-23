/**
 * @fileoverview Google Cloud Text-to-Speech Voice Management Exports
 * 
 * This module provides centralized exports for all Google Cloud Text-to-Speech
 * voice management functionality including models, parameters, options, and
 * response types. It serves as the main entry point for Google-specific voice
 * operations and voice metadata handling.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link https://cloud.google.com/text-to-speech/docs/voices | Google Cloud TTS Voices}
 * 
 * @example Importing All Voice Components
 * ```typescript
 * // Import all voice management components
 * import * as GoogleVoices from './voices.js';
 * 
 * // Create voice parameters
 * const params = new GoogleVoices.VoicesParamsGoogle({
 *   nameOptions: new GoogleVoices.VoicesNameOptionsGoogle({
 *     femaleNames: ['en-US-Neural2-F']
 *   })
 * });
 * 
 * // Use voice model
 * const voice: GoogleVoices.VoiceGoogle = {
 *   name: 'en-US-Neural2-A',
 *   gender: 'Male',
 *   engines: ['neural2']
 * };
 * ```
 * 
 * @example Individual Component Imports
 * ```typescript
 * import { 
 *   VoiceGoogle, 
 *   VoicesParamsGoogle,
 *   VoicesNameOptionsGoogle 
 * } from './voices.js';
 * 
 * // Create voice filtering configuration
 * const nameOptions = new VoicesNameOptionsGoogle({
 *   maleNames: ['en-US-Neural2-A', 'en-US-Neural2-B'],
 *   femaleNames: ['en-US-Neural2-C', 'en-US-Neural2-F']
 * });
 * 
 * const params = new VoicesParamsGoogle({ nameOptions });
 * ```
 * 
 * @example Voice Model Usage
 * ```typescript
 * import { VoiceGoogle } from './voices.js';
 * 
 * // Type-safe voice model
 * const voice: VoiceGoogle = {
 *   name: 'en-US-Neural2-F',
 *   gender: 'Female',
 *   engines: ['neural2'],
 *   language: 'en-US',
 *   naturalSampleRateHertz: 24000
 * };
 * 
 * console.log(`Voice: ${voice.name}, Gender: ${voice.gender}`);
 * ```
 * 
 * @example Voice Response Processing
 * ```typescript
 * import { VoicesResponseGoogle } from './voices.js';
 * 
 * // Process voice list response
 * function processVoicesResponse(response: VoicesResponseGoogle) {
 *   return response.voices
 *     .filter(voice => voice.engines.includes('neural2'))
 *     .map(voice => ({
 *       name: voice.name,
 *       quality: 'Premium',
 *       gender: voice.gender
 *     }));
 * }
 * ```
 */

export * from './voices_model.js';
export * from './voices_params.js';
export * from './voices_name_options.js';
export * from './voices_responses.js';
