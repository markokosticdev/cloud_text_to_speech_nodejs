/**
 * @fileoverview Google Cloud Text-to-Speech Voice Models and Data Structures
 * 
 * This module defines voice model classes and data structures specific to Google Cloud
 * Text-to-Speech services. It provides comprehensive voice metadata management including
 * voice filtering, sample rate handling, and Google-specific voice features like
 * Neural2, WaveNet, and Journey voice types.
 * 
 * The voice model system extends the base voice functionality with Google-specific
 * features such as sample rate configuration, engine type detection, and advanced
 * filtering capabilities for production voice selection workflows.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link https://cloud.google.com/text-to-speech/docs/voices | Google TTS Voices}
 * @see {@link https://cloud.google.com/text-to-speech/docs/neural2 | Google Neural2 Voices}
 * 
 * @example Basic Voice Model Usage
 * ```typescript
 * import { VoiceGoogle } from './voices_model.js';
 * 
 * // Create a Google voice model
 * const voice = new VoiceGoogle({
 *   engines: ['neural2'],
 *   code: 'en-US-Neural2-A',
 *   name: 'en-US-Neural2-A',
 *   nativeName: 'en-US-Neural2-A',
 *   gender: 'Female',
 *   locale: { language: 'en', country: 'US' },
 *   sampleRateHertz: '24000'
 * });
 * 
 * console.log(`Voice: ${voice.name}, Gender: ${voice.gender}`);
 * console.log(`Sample Rate: ${voice.getSampleRate()}Hz`);
 * ```
 * 
 * @example Voice Filtering and Selection
 * ```typescript
 * import { VoiceGoogle } from './voices_model.js';
 * 
 * const voices: VoiceGoogle[] = [
 *   // ... array of Google voices
 * ];
 * 
 * // Filter for Neural2 voices
 * const neuralVoices = voices.filter(voice => 
 *   voice.matchesFilter({ neural: true })
 * );
 * 
 * // Filter by sample rate
 * const highQualityVoices = voices.filter(voice =>
 *   voice.matchesFilter({ minSampleRate: 24000 })
 * );
 * 
 * // Filter by gender and language
 * const femaleEnglishVoices = voices.filter(voice =>
 *   voice.matchesFilter({
 *     gender: 'Female',
 *     language: 'en'
 *   })
 * );
 * ```
 * 
 * @example Voice Model JSON Conversion
 * ```typescript
 * import { VoiceGoogle } from './voices_model.js';
 * 
 * // Convert from Google API response
 * const apiResponse = {
 *   name: 'en-US-Neural2-A',
 *   ssmlGender: 'FEMALE',
 *   languageCodes: ['en-US'],
 *   naturalSampleRateHertz: 24000
 * };
 * 
 * const voice = VoiceGoogle.fromJson(apiResponse);
 * console.log(`Created voice: ${voice.name}`);
 * console.log(`Gender: ${voice.gender}`);
 * console.log(`Sample Rate: ${voice.sampleRateHertz}Hz`);
 * ```
 * 
 * @example Advanced Voice Selection Logic
 * ```typescript
 * import { VoiceGoogle } from './voices_model.js';
 * 
 * class GoogleVoiceSelector {
 *   static selectBestVoice(
 *     voices: VoiceGoogle[], 
 *     preferences: {
 *       language?: string;
 *       gender?: string;
 *       neural?: boolean;
 *       minSampleRate?: number;
 *     }
 *   ): VoiceGoogle | null {
 *     // Filter voices by preferences
 *     const filtered = voices.filter(voice => 
 *       voice.matchesFilter(preferences)
 *     );
 * 
 *     if (filtered.length === 0) return null;
 * 
 *     // Prefer Neural2 voices, then WaveNet, then Standard
 *     const sortedVoices = filtered.sort((a, b) => {
 *       const aScore = this.getVoiceQualityScore(a);
 *       const bScore = this.getVoiceQualityScore(b);
 *       return bScore - aScore;
 *     });
 * 
 *     return sortedVoices[0];
 *   }
 * 
 *   private static getVoiceQualityScore(voice: VoiceGoogle): number {
 *     if (voice.engines.includes('neural2')) return 3;
 *     if (voice.engines.includes('wavenet')) return 2;
 *     if (voice.engines.includes('journey')) return 2;
 *     return 1; // Standard voices
 *   }
 * }
 * ```
 */

import { VoiceLocale } from '../../common/locale/locale_model.js';
import { TtsProviders } from '../../common/tts/tts_providers.js';
import { VoiceLocaleHelpers } from '../../common/locale/locale_helpers.js';
import { VoiceBase, VoiceFilterOptions } from '../../common/voices/voices_base.js';

/**
 * Google Cloud Text-to-Speech voice model with Google-specific features
 * 
 * This class extends the base voice model to provide Google-specific functionality
 * including sample rate management, engine type detection, and advanced filtering
 * capabilities. It supports all Google TTS voice types including Standard, WaveNet,
 * Neural2, and Journey voices with proper metadata handling.
 * 
 * The voice model provides comprehensive filtering and selection capabilities
 * for production applications, including neural voice detection, sample rate
 * filtering, and quality-based voice ranking.
 * 
 * @example Creating a Google Voice
 * ```typescript
 * const voice = new VoiceGoogle({
 *   engines: ['neural2'],
 *   code: 'en-US-Neural2-F',
 *   name: 'en-US-Neural2-F',
 *   nativeName: 'en-US-Neural2-F',
 *   gender: 'Female',
 *   locale: { language: 'en', country: 'US' },
 *   sampleRateHertz: '24000'
 * });
 * 
 * console.log(`Voice quality: ${voice.getSampleRate()}Hz`);
 * ```
 * 
 * @example Voice Feature Detection
 * ```typescript
 * const voice = new VoiceGoogle({ ... });
 * 
 * // Check if voice is neural
 * const isNeural = voice.matchesFilter({ neural: true });
 * 
 * // Check sample rate capability
 * const isHighQuality = voice.getSampleRate() >= 24000;
 * 
 * // Get voice type
 * const voiceType = voice.engines[0]; // 'neural2', 'wavenet', etc.
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class VoiceGoogle extends VoiceBase {
  /**
   * Sample rate in Hz for this voice (as string)
   * Google-specific property for voice quality configuration
   */
  sampleRateHertz?: string;

  /**
   * Creates a new Google Cloud TTS voice model
   * 
   * @param engines - Array of voice engine types (e.g., ['neural2'], ['wavenet'])
   * @param code - Unique voice identifier code
   * @param name - Display name of the voice
   * @param nativeName - Native name representation of the voice
   * @param gender - Voice gender (Male, Female, etc.)
   * @param locale - Voice locale information with language and country
   * @param sampleRateHertz - Optional sample rate in Hz as string
   * 
   * @example
   * ```typescript
   * const voice = new VoiceGoogle({
   *   engines: ['neural2'],
   *   code: 'en-US-Neural2-A',
   *   name: 'en-US-Neural2-A',
   *   nativeName: 'en-US-Neural2-A',
   *   gender: 'Female',
   *   locale: { language: 'en', country: 'US' },
   *   sampleRateHertz: '24000'
   * });
   * ```
   */
  constructor({
    engines,
    code,
    name,
    nativeName,
    gender,
    locale,
    sampleRateHertz,
  }: {
    engines: string[];
    code: string;
    name: string;
    nativeName: string;
    gender: string;
    locale: VoiceLocale;
    sampleRateHertz?: string;
  }) {
    super({
      provider: TtsProviders.google,
      engines,
      code,
      name,
      nativeName,
      gender,
      locale,
    });
    this.sampleRateHertz = sampleRateHertz;
  }

  /**
   * Gets the sample rate for this voice as a number
   * 
   * Provides Google-specific sample rate information for audio quality
   * determination and configuration. Higher sample rates typically
   * indicate better audio quality.
   * 
   * @returns The sample rate in Hz, or undefined if not specified
   * 
   * @example
   * ```typescript
   * const voice = new VoiceGoogle({ 
   *   // ... other properties
   *   sampleRateHertz: '24000' 
   * });
   * 
   * const sampleRate = voice.getSampleRate();
   * console.log(`Sample rate: ${sampleRate}Hz`); // "Sample rate: 24000Hz"
   * 
   * if (sampleRate >= 24000) {
   *   console.log('High-quality voice detected');
   * }
   * ```
   */
  protected getSampleRate(): number | undefined {
    if (this.sampleRateHertz) {
      return parseInt(this.sampleRateHertz, 10);
    }
    return undefined;
  }

  /**
   * Checks if this voice matches the specified filter criteria
   * 
   * Extends base filtering with Google-specific features including sample rate
   * filtering and neural voice detection. Supports complex filtering scenarios
   * for voice selection workflows.
   * 
   * @param filter - Filter criteria to check against this voice
   * @returns True if the voice matches all specified filter criteria
   * 
   * @example Basic Filtering
   * ```typescript
   * const voice = new VoiceGoogle({ ... });
   * 
   * // Check if voice is female and English
   * const matches = voice.matchesFilter({
   *   gender: 'Female',
   *   language: 'en'
   * });
   * ```
   * 
   * @example Sample Rate Filtering
   * ```typescript
   * const voice = new VoiceGoogle({ 
   *   // ... other properties
   *   sampleRateHertz: '24000' 
   * });
   * 
   * // Filter for high-quality voices
   * const isHighQuality = voice.matchesFilter({
   *   minSampleRate: 22050
   * });
   * 
   * // Filter for specific sample rate range
   * const isStandardQuality = voice.matchesFilter({
   *   minSampleRate: 16000,
   *   maxSampleRate: 24000
   * });
   * ```
   * 
   * @example Neural Voice Detection
   * ```typescript
   * const voice = new VoiceGoogle({
   *   engines: ['neural2'],
   *   // ... other properties
   * });
   * 
   * // Check if voice is neural
   * const isNeural = voice.matchesFilter({ neural: true });
   * console.log(`Neural voice: ${isNeural}`); // true
   * 
   * // Filter for non-neural voices
   * const isStandard = voice.matchesFilter({ neural: false });
   * ```
   */
  matchesFilter(filter: VoiceFilterOptions): boolean {
    // Call base filtering first
    if (!super.matchesFilter(filter)) {
      return false;
    }

    // Google-specific sample rate filtering
    if (filter.minSampleRate || filter.maxSampleRate) {
      const sampleRate = this.getSampleRate();
      if (sampleRate) {
        if (filter.minSampleRate && sampleRate < filter.minSampleRate) {
          return false;
        }
        if (filter.maxSampleRate && sampleRate > filter.maxSampleRate) {
          return false;
        }
      }
    }

    // Neural/Premium filtering for Google
    if (filter.neural !== undefined) {
      const isNeural = this.engines.some(e => 
        e.toLowerCase().includes('neural') || 
        e.toLowerCase().includes('wavenet') ||
        e.toLowerCase().includes('journey')
      );
      if (filter.neural !== isNeural) {
        return false;
      }
    }

    return true;
  }

  /**
   * Creates a VoiceGoogle instance from Google API JSON response
   * 
   * Converts raw Google TTS API voice data into a structured VoiceGoogle object
   * with proper type conversion and metadata extraction. Handles Google-specific
   * response format including language codes, gender mapping, and sample rates.
   * 
   * @param json - Raw JSON response from Google TTS voices API
   * @returns A new VoiceGoogle instance with parsed data
   * 
   * @example
   * ```typescript
   * // Google API response format
   * const apiResponse = {
   *   name: 'en-US-Neural2-A',
   *   ssmlGender: 'FEMALE',
   *   languageCodes: ['en-US'],
   *   naturalSampleRateHertz: 24000
   * };
   * 
   * const voice = VoiceGoogle.fromJson(apiResponse);
   * console.log(`Created voice: ${voice.name}`);
   * console.log(`Gender: ${voice.gender}`);
   * console.log(`Sample Rate: ${voice.sampleRateHertz}Hz`);
   * ```
   * 
   * @example Batch Conversion
   * ```typescript
   * const apiResponses = [
   *   { name: 'en-US-Neural2-A', ssmlGender: 'FEMALE', languageCodes: ['en-US'] },
   *   { name: 'en-US-Neural2-B', ssmlGender: 'MALE', languageCodes: ['en-US'] }
   * ];
   * 
   * const voices = apiResponses.map(response => 
   *   VoiceGoogle.fromJson(response)
   * );
   * 
   * console.log(`Converted ${voices.length} voices`);
   * ```
   */
  static fromJson(json: never): VoiceGoogle {
    const engines = this._toEngines(json['name']);
    const gender = this._toGender(json['ssmlGender']);
    const locale = this._toLocale(json['languageCodes']);

    return new VoiceGoogle({
      engines,
      code: json['name'],
      name: json['name'],
      nativeName: json['name'],
      gender,
      locale,
      sampleRateHertz: this._toSampleRateHertz(json['naturalSampleRateHertz']),
    });
  }

  /**
   * Extracts engine types from Google voice name
   * @param name - Google voice name
   * @returns Array of engine types
   * @internal
   */
  private static _toEngines(name: string): string[] {
    if (name.includes('-')) {
      const nameSegments = name.split('-');
      return [nameSegments[2].toLowerCase()];
    } else {
      return [name.toLowerCase()];
    }
  }

  /**
   * Converts Google SSML gender format to standard format
   * @param ssmlGender - Google SSML gender string
   * @returns Formatted gender string
   * @internal
   */
  private static _toGender(ssmlGender: string): string {
    const lowercase = ssmlGender.toLowerCase();
    return lowercase.charAt(0).toUpperCase() + lowercase.slice(1);
  }

  /**
   * Converts Google language codes to voice locale
   * @param languageCodes - Array of Google language codes
   * @returns VoiceLocale object
   * @internal
   */
  private static _toLocale(languageCodes: string[]): VoiceLocale {
    const localeSegments = languageCodes[0].split('-');
    const localeObj = VoiceLocaleHelpers.segmentsToLocale(localeSegments);
    return VoiceLocaleHelpers.localeToVoiceLocale(localeObj);
  }

  /**
   * Converts natural sample rate to string format
   * @param naturalSampleRateHertz - Sample rate as number
   * @returns Sample rate as string or undefined
   * @internal
   */
  private static _toSampleRateHertz(
    naturalSampleRateHertz: number,
  ): string | undefined {
    return naturalSampleRateHertz ? naturalSampleRateHertz.toString() : undefined;
  }
}
