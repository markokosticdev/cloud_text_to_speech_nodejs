/**
 * @fileoverview Voice data processing utilities for TTS operations including name mapping, 
 * deduplication, sorting, and random selection algorithms. Provides deterministic shuffling 
 * based on text content and comprehensive voice management operations for multi-provider scenarios.
 * 
 * @author Marko Kostich
 * @since 1.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * 
 * @example Basic voice processing
 * ```typescript
 * import { Helpers } from './helpers.js';
 * 
 * // Remove duplicate voices
 * const uniqueVoices = Helpers.removeVoiceDuplicates(allVoices);
 * 
 * // Sort voices by locale and gender
 * const sortedVoices = Helpers.sortVoices(uniqueVoices);
 * 
 * // Apply custom name mapping
 * const namedVoices = Helpers.mapVoiceNames(sortedVoices, {
 *   maleNames: ['James', 'Robert', 'John'],
 *   femaleNames: ['Mary', 'Patricia', 'Jennifer'],
 *   neutralNames: ['Alex', 'Taylor', 'Jordan']
 * });
 * ```
 * 
 * @example Deterministic voice selection
 * ```typescript
 * // Shuffle voice names based on input text for consistent selection
 * const text = "Hello, how are you today?";
 * const maleNames = ['James', 'Robert', 'John', 'Michael'];
 * const shuffledNames = Helpers.shuffleNamesByText(maleNames, text);
 * 
 * console.log('Shuffled names:', shuffledNames);
 * // Same text will always produce the same shuffle order
 * ```
 */

import { integer, MersenneTwister19937 } from 'random-js';
import { Log } from './log.js';
import { VoiceBase } from '../voices/voices_base.js';
import { NameOptions } from '../voices/input/name_options.js';

/**
 * Utility class providing voice data processing operations for TTS systems.
 * Contains static methods for name shuffling, voice mapping, deduplication, and sorting
 * with deterministic algorithms suitable for multi-provider voice management.
 * 
 * @category Voice Management
 * 
 * @example Voice pipeline processing
 * ```typescript
 * // Complete voice processing pipeline
 * const processVoices = (rawVoices: VoiceBase[], nameOptions: NameOptions<VoiceBase>) => {
 *   // 1. Remove duplicates
 *   const uniqueVoices = Helpers.removeVoiceDuplicates(rawVoices);
 *   
 *   // 2. Apply custom names
 *   const namedVoices = Helpers.mapVoiceNames(uniqueVoices, nameOptions);
 *   
 *   // 3. Sort for consistent ordering
 *   const sortedVoices = Helpers.sortVoices(namedVoices);
 *   
 *   return sortedVoices;
 * };
 * ```
 */
export class Helpers {
  /**
   * Private constructor to prevent instantiation of utility class.
   * All methods are static and should be called directly on the class.
   */
  private constructor() {}

  /**
   * Shuffles an array of names using a deterministic algorithm based on input text.
   * Uses the Mersenne Twister PRNG with a seed derived from the text content to ensure
   * the same text always produces the same shuffle order.
   * 
   * @param names - Array of names to shuffle
   * @param text - Input text used to generate the deterministic seed
   * @returns Shuffled array of names with consistent ordering for the given text
   * 
   * @example Deterministic name shuffling
   * ```typescript
   * const names = ['Alice', 'Bob', 'Charlie', 'Diana'];
   * const text1 = "Hello world";
   * const text2 = "Goodbye world";
   * 
   * // Same text always produces same shuffle
   * const shuffle1a = Helpers.shuffleNamesByText(names, text1);
   * const shuffle1b = Helpers.shuffleNamesByText(names, text1);
   * console.log(shuffle1a === shuffle1b); // true (same order)
   * 
   * // Different text produces different shuffle
   * const shuffle2 = Helpers.shuffleNamesByText(names, text2);
   * console.log(shuffle1a !== shuffle2); // true (different order)
   * ```
   * 
   * @example Use case for voice selection
   * ```typescript
   * // Select voice based on text content for consistency
   * const maleVoices = ['James', 'Robert', 'John', 'Michael'];
   * const userText = "Read this message aloud";
   * 
   * const shuffledVoices = Helpers.shuffleNamesByText(maleVoices, userText);
   * const selectedVoice = shuffledVoices[0]; // Always same voice for same text
   * ```
   */
  static shuffleNamesByText(names: string[], text: string): string[] {
    if (names.length == 0) {
      return [];
    }

    const indices = Array.from({ length: names.length }, (_, index) => index);

    const seed = Array.from(text).reduce(
      (acc, char) => acc + char.charCodeAt(0),
      0,
    );

    const engine = MersenneTwister19937.seed(seed);

    // Shuffle logic using the Fisher-Yates algorithm
    for (let i = names.length - 1; i > 0; i--) {
      const distribution = integer(0, i);
      const j = distribution(engine);
      const temp = indices[i];
      indices[i] = indices[j];
      indices[j] = temp;
    }

    const shuffledNames = Array.from(names);

    for (let i = 0; i < names.length; i++) {
      shuffledNames[indices[i]] = names[i];
    }

    return shuffledNames;
  }

  /**
   * Maps custom names to voice objects based on gender and locale, with support for
   * name cycling and custom mapping functions. Provides deterministic name assignment
   * using locale-specific shuffling for consistent voice naming across sessions.
   * 
   * @template T - Voice type extending VoiceBase
   * @param voices - Array of voice objects to map names to
   * @param options - Name mapping options including name arrays and mapper functions
   * @returns Array of voices with updated name and nativeName properties
   * 
   * @example Basic name mapping
   * ```typescript
   * const voices: VoiceBase[] = [
   *   { gender: 'Male', locale: { code: 'en-US' }, name: 'en-US-Neural-Male-1' },
   *   { gender: 'Female', locale: { code: 'en-US' }, name: 'en-US-Neural-Female-1' },
   *   { gender: 'Male', locale: { code: 'fr-FR' }, name: 'fr-FR-Neural-Male-1' }
   * ];
   * 
   * const namedVoices = Helpers.mapVoiceNames(voices, {
   *   maleNames: ['James', 'Robert', 'John'],
   *   femaleNames: ['Mary', 'Patricia', 'Jennifer'],
   *   neutralNames: ['Alex', 'Taylor']
   * });
   * 
   * console.log(namedVoices[0].name); // 'James' (or other male name)
   * console.log(namedVoices[1].name); // 'Mary' (or other female name)
   * ```
   * 
   * @example Custom mapper functions
   * ```typescript
   * const customNamedVoices = Helpers.mapVoiceNames(voices, {
   *   maleNames: ['Alex', 'Sam'],
   *   maleNamesMapper: (voices, index) => {
   *     // Custom logic for male voice naming
   *     return `Speaker_${index + 1}`;
   *   },
   *   femaleNamesMapper: (voices, index) => {
   *     // Custom logic for female voice naming
   *     const voice = voices[index];
   *     return `${voice.locale.code}_Female_${index}`;
   *   }
   * });
   * ```
   * 
   * @example Locale-specific name cycling
   * ```typescript
   * // Multiple voices in same locale will cycle through available names
   * const usVoices = [
   *   { gender: 'Male', locale: { code: 'en-US' } },
   *   { gender: 'Male', locale: { code: 'en-US' } },
   *   { gender: 'Male', locale: { code: 'en-US' } }
   * ];
   * 
   * const namedVoices = Helpers.mapVoiceNames(usVoices, {
   *   maleNames: ['James', 'Robert'] // Only 2 names for 3 voices
   * });
   * 
   * // Names will cycle: James, Robert, James
   * ```
   */
  static mapVoiceNames<T extends VoiceBase>(
    voices: T[],
    options: NameOptions<T>,
  ): T[] {
    type NameRecord = {
      maleIndex: number;
      maleNames: string[];
      femaleIndex: number;
      femaleNames: string[];
      neutralIndex: number;
      neutralNames: string[];
    };

    const nameRecords: Record<string, NameRecord> = {};

    return voices.map((voice, index) => {
      const locale = voice.locale.code;
      const gender = voice.gender;

      if (!nameRecords[locale]) {
        nameRecords[locale] = {
          maleIndex: 0,
          maleNames: this.shuffleNamesByText(options.maleNames ?? [], locale),
          femaleIndex: 0,
          femaleNames: this.shuffleNamesByText(
            options.femaleNames ?? [],
            locale,
          ),
          neutralIndex: 0,
          neutralNames: this.shuffleNamesByText(
            options.neutralNames ?? [],
            locale,
          ),
        };
      }

      const nameRecord: NameRecord = nameRecords[locale];
      let name: string;

      switch (gender) {
        case 'Male':
          if (nameRecord.maleNames.length) {
            if (nameRecord.maleIndex >= nameRecord.maleNames.length) {
              nameRecord.maleIndex = 0;
            }
            name = nameRecord.maleNames[nameRecord.maleIndex];
            nameRecord.maleIndex++;
          } else if (options.maleNamesMapper) {
            name = options.maleNamesMapper(voices, index);
          } else {
            name = voice.name;
          }
          break;
        case 'Female':
          if (nameRecord.femaleNames.length) {
            if (nameRecord.femaleIndex >= nameRecord.femaleNames.length) {
              nameRecord.femaleIndex = 0;
            }
            name = nameRecord.femaleNames[nameRecord.femaleIndex];
            nameRecord.femaleIndex++;
          } else if (options.femaleNamesMapper) {
            name = options.femaleNamesMapper(voices, index);
          } else {
            name = voice.name;
          }
          break;
        case 'Neutral':
          if (nameRecord.neutralNames.length) {
            if (nameRecord.neutralIndex >= nameRecord.neutralNames.length) {
              nameRecord.neutralIndex = 0;
            }
            name = nameRecord.neutralNames[nameRecord.neutralIndex];
            nameRecord.neutralIndex++;
          } else if (options.neutralNamesMapper) {
            name = options.neutralNamesMapper(voices, index);
          } else {
            name = voice.name;
          }
          break;
        default:
          // For unknown genders, try neutral names first, then fallback
          if (nameRecord.neutralNames.length) {
            if (nameRecord.neutralIndex >= nameRecord.neutralNames.length) {
              nameRecord.neutralIndex = 0;
            }
            name = nameRecord.neutralNames[nameRecord.neutralIndex];
            nameRecord.neutralIndex++;
          } else if (options.neutralNamesMapper) {
            name = options.neutralNamesMapper(voices, index);
          } else {
            name = voice.name;
          }
      }

      voice.name = name;
      voice.nativeName = name;

      return voice;
    });
  }

  /**
   * Removes duplicate voices from an array based on voice codes, keeping only the first
   * occurrence of each unique voice. Essential for multi-provider scenarios where the
   * same voice might be available through different APIs or configurations.
   * 
   * @template T - Voice type extending VoiceBase
   * @param voices - Array of voices that may contain duplicates
   * @returns Array of unique voices with duplicates removed
   * 
   * @example Removing voice duplicates
   * ```typescript
   * const voicesWithDuplicates = [
   *   { code: 'en-US-AriaNeural', name: 'Aria', provider: 'microsoft' },
   *   { code: 'en-US-JennyNeural', name: 'Jenny', provider: 'microsoft' },
   *   { code: 'en-US-AriaNeural', name: 'Aria (Premium)', provider: 'microsoft' }, // Duplicate
   *   { code: 'en-US-GuyNeural', name: 'Guy', provider: 'microsoft' }
   * ];
   * 
   * const uniqueVoices = Helpers.removeVoiceDuplicates(voicesWithDuplicates);
   * console.log(uniqueVoices.length); // 3 (duplicate removed)
   * ```
   * 
   * @example Multi-provider deduplication
   * ```typescript
   * // Combine voices from multiple providers
   * const allVoices = [
   *   ...googleVoices,
   *   ...microsoftVoices,
   *   ...amazonVoices
   * ];
   * 
   * // Remove any duplicates that might exist across providers
   * const uniqueVoices = Helpers.removeVoiceDuplicates(allVoices);
   * 
   * console.log(`Total voices: ${allVoices.length}`);
   * console.log(`Unique voices: ${uniqueVoices.length}`);
   * ```
   */
  static removeVoiceDuplicates<T extends VoiceBase>(voices: T[]): T[] {
    const uniqueCodes = new Set<string>();

    return voices.filter((voice) => {
      if (uniqueCodes.has(voice.code)) {
        return false;
      }
      uniqueCodes.add(voice.code);
      return true;
    });
  }

  /**
   * Sorts an array of voices by locale name and gender for consistent ordering.
   * Filters out invalid voices with missing or empty locale names and logs warnings
   * for debugging purposes. Provides stable, predictable voice ordering for UI display.
   * 
   * @template T - Voice type extending VoiceBase
   * @param voices - Array of voices to sort
   * @returns Sorted array of valid voices, ordered by locale name then gender
   * 
   * @example Basic voice sorting
   * ```typescript
   * const unsortedVoices = [
   *   { locale: { name: 'French (France)' }, gender: 'Male', name: 'Pierre' },
   *   { locale: { name: 'English (US)' }, gender: 'Female', name: 'Sarah' },
   *   { locale: { name: 'English (US)' }, gender: 'Male', name: 'John' },
   *   { locale: { name: 'French (France)' }, gender: 'Female', name: 'Marie' }
   * ];
   * 
   * const sortedVoices = Helpers.sortVoices(unsortedVoices);
   * // Result order:
   * // 1. English (US) - Female - Sarah
   * // 2. English (US) - Male - John  
   * // 3. French (France) - Female - Marie
   * // 4. French (France) - Male - Pierre
   * ```
   * 
   * @example Error handling for invalid voices
   * ```typescript
   * const voicesWithInvalid = [
   *   { locale: { name: 'English (US)' }, gender: 'Male', name: 'John' },
   *   { locale: { name: '' }, gender: 'Female', name: 'Invalid' }, // Invalid
   *   { locale: { name: undefined }, gender: 'Male', name: 'Also Invalid' }, // Invalid
   *   { locale: { name: 'Spanish (Spain)' }, gender: 'Female', name: 'Maria' }
   * ];
   * 
   * const sortedVoices = Helpers.sortVoices(voicesWithInvalid);
   * // Invalid voices are filtered out and logged
   * console.log(sortedVoices.length); // 2 (valid voices only)
   * ```
   * 
   * @example Preparing voices for UI display
   * ```typescript
   * // Complete voice preparation pipeline for UI
   * const prepareVoicesForUI = (rawVoices: VoiceBase[]) => {
   *   const uniqueVoices = Helpers.removeVoiceDuplicates(rawVoices);
   *   const sortedVoices = Helpers.sortVoices(uniqueVoices);
   *   
   *   return sortedVoices.map(voice => ({
   *     ...voice,
   *     displayName: `${voice.name} (${voice.locale.name} - ${voice.gender})`
   *   }));
   * };
   * ```
   */
  static sortVoices<T extends VoiceBase>(voices: T[]): T[] {
    const validVoices = voices.filter((voice) => {
      if (
        typeof voice.locale.name !== 'string' ||
        voice.locale.name.length == 0
      ) {
        Log.d(
          `Invalid voice data, removing from sort: ${JSON.stringify(voice)}`,
        );
        return false;
      }
      return true;
    });

    validVoices.sort((a, b) => {
      const localeComparison = a.locale.name.localeCompare(b.locale.name);
      if (localeComparison !== 0) {
        return localeComparison;
      }
      return a.gender.localeCompare(b.gender);
    });

    return validVoices;
  }
}
