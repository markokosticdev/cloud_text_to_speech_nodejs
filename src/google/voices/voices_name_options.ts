/**
 * @fileoverview Google Cloud Text-to-Speech Voice Name Options and Mapping
 * 
 * This module defines voice name filtering and mapping functionality specific to
 * Google Cloud Text-to-Speech services. It provides type-safe voice name management
 * with gender-based categorization and custom mapping capabilities for Google voices.
 * 
 * The voice name options system extends the base name filtering functionality
 * with Google-specific voice categorization and allows for custom voice
 * selection workflows based on gender, quality, and other voice characteristics.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link https://cloud.google.com/text-to-speech/docs/voices | Google TTS Voices}
 * @see {@link VoiceGoogle} for the voice model implementation
 * 
 * @example Basic Voice Name Options
 * ```typescript
 * import { VoicesNameOptionsGoogle } from './voices_name_options.js';
 * 
 * // Create default voice name options
 * const nameOptions = new VoicesNameOptionsGoogle();
 * 
 * // Use with voice parameters
 * const params = new VoicesParamsGoogle({
 *   nameOptions
 * });
 * ```
 * 
 * @example Custom Voice Categorization
 * ```typescript
 * import { VoicesNameOptionsGoogle } from './voices_name_options.js';
 * 
 * const nameOptions = new VoicesNameOptionsGoogle({
 *   maleNames: [
 *     'en-US-Neural2-A',
 *     'en-US-Neural2-B',
 *     'en-US-WaveNet-A'
 *   ],
 *   femaleNames: [
 *     'en-US-Neural2-C',
 *     'en-US-Neural2-F',
 *     'en-US-WaveNet-C'
 *   ],
 *   neutralNames: [
 *     'en-US-Neural2-G'
 *   ]
 * });
 * ```
 * 
 * @example Voice Name Mapping
 * ```typescript
 * import { VoicesNameOptionsGoogle, VoicesGoogleNameMapper } from './voices_name_options.js';
 * 
 * // Create custom voice name mapper
 * const femaleMapper: VoicesGoogleNameMapper = (voice) => {
 *   if (voice.name.includes('Neural2')) {
 *     return `Premium Female Voice - ${voice.name}`;
 *   }
 *   return voice.name;
 * };
 * 
 * const nameOptions = new VoicesNameOptionsGoogle({
 *   femaleNames: ['en-US-Neural2-F', 'en-US-Neural2-C'],
 *   femaleNamesMapper: femaleMapper
 * });
 * ```
 * 
 * @example Quality-Based Voice Selection
 * ```typescript
 * import { VoicesNameOptionsGoogle } from './voices_name_options.js';
 * 
 * // Categorize voices by quality level
 * const premiumVoices = new VoicesNameOptionsGoogle({
 *   maleNames: [
 *     'en-US-Neural2-A',
 *     'en-US-Neural2-B',
 *     'en-US-Neural2-D'
 *   ],
 *   femaleNames: [
 *     'en-US-Neural2-C',
 *     'en-US-Neural2-F',
 *     'en-US-Neural2-G'
 *   ]
 * });
 * 
 * // Standard quality voices
 * const standardVoices = new VoicesNameOptionsGoogle({
 *   maleNames: [
 *     'en-US-Standard-A',
 *     'en-US-Standard-B'
 *   ],
 *   femaleNames: [
 *     'en-US-Standard-C',
 *     'en-US-Standard-E'
 *   ]
 * });
 * ```
 */

import {
  NameOptions,
  VoiceNameMapper,
} from '../../common/voices/input/name_options.js';
import { VoiceGoogle } from './voices_model.js';
import { VoiceNames } from '../../common/voices/voices_names.js';

/**
 * Type alias for Google-specific voice name mapping function
 * 
 * Defines a function that takes a Google voice model and returns a mapped name.
 * Used for custom voice name transformations and display formatting.
 * 
 * @example Custom Name Mapping
 * ```typescript
 * const mapper: VoicesGoogleNameMapper = (voice) => {
 *   if (voice.engines.includes('neural2')) {
 *     return `Neural2: ${voice.name}`;
 *   }
 *   return voice.name;
 * };
 * ```
 */
export type VoicesGoogleNameMapper = VoiceNameMapper<VoiceGoogle>;

/**
 * Voice name filtering and mapping options for Google Cloud Text-to-Speech
 * 
 * This class extends the base name options functionality to provide Google-specific
 * voice categorization and mapping. It allows for gender-based voice filtering
 * and custom name mapping functions for different voice categories.
 * 
 * The class provides type-safe voice management with default categorizations
 * from the common voice names registry, while allowing complete customization
 * for specific use cases.
 * 
 * @example Default Voice Categorization
 * ```typescript
 * // Uses default voice categories from VoiceNames registry
 * const options = new VoicesNameOptionsGoogle();
 * ```
 * 
 * @example Custom Voice Categories
 * ```typescript
 * const options = new VoicesNameOptionsGoogle({
 *   maleNames: ['en-US-Neural2-A', 'en-US-Neural2-B'],
 *   femaleNames: ['en-US-Neural2-C', 'en-US-Neural2-F'],
 *   neutralNames: ['en-US-Neural2-G']
 * });
 * ```
 * 
 * @example Voice Quality Filtering
 * ```typescript
 * // Filter for only Neural2 voices
 * const neuralOptions = new VoicesNameOptionsGoogle({
 *   maleNames: voices.filter(v => 
 *     v.name.includes('Neural2') && v.gender === 'Male'
 *   ).map(v => v.name),
 *   femaleNames: voices.filter(v => 
 *     v.name.includes('Neural2') && v.gender === 'Female'
 *   ).map(v => v.name)
 * });
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class VoicesNameOptionsGoogle extends NameOptions<VoiceGoogle> {
  /**
   * Creates new Google voice name options with categorization and mapping
   * 
   * @param maleNames - Optional array of male voice names to include
   * @param maleNamesMapper - Optional mapping function for male voice names
   * @param femaleNames - Optional array of female voice names to include
   * @param femaleNamesMapper - Optional mapping function for female voice names
   * @param neutralNames - Optional array of neutral/gender-neutral voice names
   * @param neutralNamesMapper - Optional mapping function for neutral voice names
   * 
   * @example Basic Usage with Defaults
   * ```typescript
   * const options = new VoicesNameOptionsGoogle();
   * // Uses default categorization from VoiceNames registry
   * ```
   * 
   * @example Custom Voice Selection
   * ```typescript
   * const options = new VoicesNameOptionsGoogle({
   *   maleNames: [
   *     'en-US-Neural2-A',
   *     'en-US-Neural2-B'
   *   ],
   *   femaleNames: [
   *     'en-US-Neural2-C',
   *     'en-US-Neural2-F'
   *   ]
   * });
   * ```
   * 
   * @example With Custom Name Mapping
   * ```typescript
   * const options = new VoicesNameOptionsGoogle({
   *   maleNames: ['en-US-Neural2-A'],
   *   maleNamesMapper: (voice) => `Premium Male: ${voice.name}`,
   *   femaleNames: ['en-US-Neural2-C'],
   *   femaleNamesMapper: (voice) => `Premium Female: ${voice.name}`
   * });
   * ```
   * 
   * @example Language-Specific Configuration
   * ```typescript
   * const spanishOptions = new VoicesNameOptionsGoogle({
   *   maleNames: [
   *     'es-ES-Neural2-A',
   *     'es-ES-Neural2-B'
   *   ],
   *   femaleNames: [
   *     'es-ES-Neural2-C',
   *     'es-ES-Neural2-D'
   *   ],
   *   femaleNamesMapper: (voice) => `Voz Femenina: ${voice.name}`
   * });
   * ```
   */
  constructor({
    maleNames,
    maleNamesMapper,
    femaleNames,
    femaleNamesMapper,
    neutralNames,
    neutralNamesMapper,
  }: {
    maleNames?: string[];
    maleNamesMapper?: VoicesGoogleNameMapper;
    femaleNames?: string[];
    femaleNamesMapper?: VoicesGoogleNameMapper;
    neutralNames?: string[];
    neutralNamesMapper?: VoicesGoogleNameMapper;
  } = {}) {
    super(
      { 
        maleNames: VoiceNames.male, 
        femaleNames: VoiceNames.female,
        neutralNames: VoiceNames.neutral
      },
      { 
        maleNames, 
        maleNamesMapper, 
        femaleNames, 
        femaleNamesMapper,
        neutralNames,
        neutralNamesMapper
      },
    );
  }
}
