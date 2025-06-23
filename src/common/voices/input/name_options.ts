/**
 * @fileoverview Voice name mapping options and utilities for TTS voice customization.
 * Provides interfaces and classes for mapping custom names to voices based on gender,
 * with support for both static name arrays and dynamic name mapping functions.
 * 
 * @author Marko Kostich
 * @since 1.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link VoiceBase} for the voice data model
 * @see {@link Helpers.mapVoiceNames} for the voice name mapping implementation
 * 
 * @example Basic voice name mapping
 * ```typescript
 * import { NameOptions } from './name_options.js';
 * 
 * // Create name options with static arrays
 * const nameOptions = new NameOptions({}, {
 *   maleNames: ['James', 'Robert', 'John'],
 *   femaleNames: ['Mary', 'Patricia', 'Jennifer'],
 *   neutralNames: ['Alex', 'Taylor', 'Jordan']
 * });
 * 
 * // Get names for specific gender
 * const maleNames = nameOptions.getNamesForGender('male');
 * console.log(maleNames); // ['James', 'Robert', 'John']
 * ```
 * 
 * @example Dynamic name mapping with functions
 * ```typescript
 * // Create name options with mapper functions
 * const dynamicOptions = new NameOptions({}, {
 *   maleNamesMapper: (voices, index) => `Speaker_M${index + 1}`,
 *   femaleNamesMapper: (voices, index) => `Speaker_F${index + 1}`,
 *   neutralNamesMapper: (voices, index) => `Speaker_N${index + 1}`
 * });
 * 
 * // Use with voice mapping
 * const mapper = dynamicOptions.getMapperForGender('male');
 * if (mapper) {
 *   const voiceName = mapper(maleVoices, 0); // 'Speaker_M1'
 * }
 * ```
 * 
 * @example Combined defaults and overrides
 * ```typescript
 * // Set up defaults and override specific options
 * const defaults = {
 *   maleNames: ['DefaultMale1', 'DefaultMale2'],
 *   femaleNames: ['DefaultFemale1', 'DefaultFemale2']
 * };
 * 
 * const options = new NameOptions(defaults, {
 *   maleNames: ['CustomMale1', 'CustomMale2'] // Override male names only
 *   // femaleNames will use defaults
 * });
 * ```
 */

import { VoiceBase } from '../voices_base.js';

/**
 * Function type for dynamically generating voice names based on voice data and index.
 * Provides flexibility for custom naming schemes that consider voice characteristics,
 * provider information, locale, or other dynamic factors.
 * 
 * @template T - Voice type extending VoiceBase
 * @param voices - Array of voices being processed for context
 * @param index - Current index in the voice array being named
 * @returns Generated name string for the voice
 * 
 * @example Simple index-based naming
 * ```typescript
 * const simpleMapper: VoiceNameMapper<VoiceBase> = (voices, index) => {
 *   return `Voice${index + 1}`;
 * };
 * 
 * // Usage: Voice1, Voice2, Voice3, etc.
 * ```
 * 
 * @example Provider-based naming
 * ```typescript
 * const providerMapper: VoiceNameMapper<VoiceBase> = (voices, index) => {
 *   const voice = voices[index];
 *   return `${voice.provider}_${voice.locale.code}_${index + 1}`;
 * };
 * 
 * // Usage: google_en-US_1, microsoft_en-US_2, etc.
 * ```
 * 
 * @example Quality-based naming
 * ```typescript
 * const qualityMapper: VoiceNameMapper<VoiceBase> = (voices, index) => {
 *   const voice = voices[index];
 *   const quality = voice.quality >= 9.0 ? 'Premium' : 
 *                  voice.quality >= 8.0 ? 'Standard' : 'Basic';
 *   return `${quality}_Voice_${index + 1}`;
 * };
 * 
 * // Usage: Premium_Voice_1, Standard_Voice_2, etc.
 * ```
 * 
 * @example Locale-aware naming
 * ```typescript
 * const localeMapper: VoiceNameMapper<VoiceBase> = (voices, index) => {
 *   const voice = voices[index];
 *   const language = voice.locale.languageCode;
 *   const country = voice.locale.countryCode || 'Global';
 *   return `${language}_${country}_Speaker_${index + 1}`;
 * };
 * 
 * // Usage: en_US_Speaker_1, fr_FR_Speaker_2, etc.
 * ```
 * 
 * @category Voice Management
 */
export type VoiceNameMapper<T extends VoiceBase> = (
  voices: T[],
  index: number,
) => string;

/**
 * Configuration class for voice name mapping with gender-based categorization.
 * Supports both static name arrays and dynamic name generation functions,
 * with validation to ensure only one naming method is used per gender category.
 * 
 * @template T - Voice type extending VoiceBase
 * @category Voice Management
 * 
 * @example Basic static name configuration
 * ```typescript
 * // Configure voice names with static arrays
 * const nameConfig = new NameOptions<VoiceBase>({}, {
 *   maleNames: [
 *     'Alexander', 'Benjamin', 'Christopher', 'Daniel', 'Edward',
 *     'Frederick', 'Gabriel', 'Harrison', 'Isaac', 'Jonathan'
 *   ],
 *   femaleNames: [
 *     'Alexandra', 'Beatrice', 'Catherine', 'Danielle', 'Eleanor',
 *     'Francesca', 'Gabrielle', 'Helena', 'Isabella', 'Jacqueline'
 *   ],
 *   neutralNames: [
 *     'Alex', 'Blake', 'Cameron', 'Dakota', 'Emery',
 *     'Finley', 'Gray', 'Harper', 'Indigo', 'Justice'
 *   ]
 * });
 * 
 * // Use in voice processing
 * const maleVoiceNames = nameConfig.getNamesForGender('male');
 * console.log(`Available male names: ${maleVoiceNames?.length}`);
 * ```
 * 
 * @example Dynamic name generation
 * ```typescript
 * // Configure with dynamic name generators
 * const dynamicConfig = new NameOptions<VoiceBase>({}, {
 *   maleNamesMapper: (voices, index) => {
 *     const voice = voices[index];
 *     return `Mr_${voice.locale.languageCode}_${index + 1}`;
 *   },
 *   femaleNamesMapper: (voices, index) => {
 *     const voice = voices[index];
 *     return `Ms_${voice.locale.languageCode}_${index + 1}`;
 *   },
 *   neutralNamesMapper: (voices, index) => {
 *     return `Speaker_${index + 1}`;
 *   }
 * });
 * 
 * // Generate names dynamically
 * const mapper = dynamicConfig.getMapperForGender('female');
 * if (mapper) {
 *   const generatedName = mapper(femaleVoices, 0); // 'Ms_en_1'
 * }
 * ```
 * 
 * @example Production voice naming strategy
 * ```typescript
 * // Professional voice naming for production apps
 * const productionDefaults = {
 *   maleNames: ['David', 'Michael', 'James', 'Robert', 'William'],
 *   femaleNames: ['Sarah', 'Emily', 'Jessica', 'Ashley', 'Amanda'],
 *   neutralNames: ['Taylor', 'Jordan', 'Casey', 'Riley', 'Avery']
 * };
 * 
 * const productionConfig = new NameOptions(productionDefaults, {
 *   // Override with brand-specific names if needed
 *   maleNames: ['BrandVoice_Alpha', 'BrandVoice_Beta', 'BrandVoice_Gamma']
 * });
 * 
 * // Fallback to defaults for female and neutral voices
 * const femaleNames = productionConfig.getNamesForGender('female');
 * // Uses productionDefaults.femaleNames
 * ```
 * 
 * @example Multi-language voice naming
 * ```typescript
 * // Language-aware voice naming
 * const multilingualConfig = new NameOptions<VoiceBase>({}, {
 *   maleNamesMapper: (voices, index) => {
 *     const voice = voices[index];
 *     const languageNames = {
 *       'en': ['William', 'James', 'Robert'],
 *       'es': ['Carlos', 'Diego', 'Miguel'],
 *       'fr': ['Pierre', 'Jean', 'Claude'],
 *       'de': ['Hans', 'Klaus', 'Wolfgang']
 *     };
 *     const names = languageNames[voice.locale.languageCode] || ['Speaker'];
 *     return names[index % names.length] || `Male_${index + 1}`;
 *   },
 *   femaleNamesMapper: (voices, index) => {
 *     const voice = voices[index];
 *     const languageNames = {
 *       'en': ['Elizabeth', 'Margaret', 'Susan'],
 *       'es': ['Maria', 'Carmen', 'Isabella'],
 *       'fr': ['Marie', 'Claire', 'Sophie'],
 *       'de': ['Greta', 'Ingrid', 'Helga']
 *     };
 *     const names = languageNames[voice.locale.languageCode] || ['Speaker'];
 *     return names[index % names.length] || `Female_${index + 1}`;
 *   }
 * });
 * ```
 */
export class NameOptions<T extends VoiceBase> {
  /** Array of names to use for male voices, mutually exclusive with maleNamesMapper */
  maleNames: string[] | undefined;
  
  /** Function to dynamically generate names for male voices, mutually exclusive with maleNames */
  maleNamesMapper: VoiceNameMapper<T> | undefined;
  
  /** Array of names to use for female voices, mutually exclusive with femaleNamesMapper */
  femaleNames: string[] | undefined;
  
  /** Function to dynamically generate names for female voices, mutually exclusive with femaleNames */
  femaleNamesMapper: VoiceNameMapper<T> | undefined;
  
  /** Array of names to use for neutral/unknown gender voices, mutually exclusive with neutralNamesMapper */
  neutralNames: string[] | undefined;
  
  /** Function to dynamically generate names for neutral/unknown gender voices, mutually exclusive with neutralNames */
  neutralNamesMapper: VoiceNameMapper<T> | undefined;

  /**
   * Creates a new NameOptions instance with default values and option overrides.
   * Validates that only one naming method (array or mapper) is provided per gender.
   * Options take precedence over defaults, with fallback to defaults when options are not provided.
   * 
   * @param defaults - Default naming configuration to use as fallback values
   * @param options - Specific naming configuration that overrides defaults
   * 
   * @throws {Error} When both name array and mapper are provided for the same gender
   * 
   * @example Constructor with validation
   * ```typescript
   * // Valid configuration - uses arrays for all genders
   * const validConfig = new NameOptions({}, {
   *   maleNames: ['John', 'Mike'],
   *   femaleNames: ['Jane', 'Sarah'],
   *   neutralNames: ['Alex', 'Taylor']
   * });
   * 
   * // Valid configuration - uses mappers for all genders
   * const validMapperConfig = new NameOptions({}, {
   *   maleNamesMapper: (voices, index) => `Male_${index}`,
   *   femaleNamesMapper: (voices, index) => `Female_${index}`,
   *   neutralNamesMapper: (voices, index) => `Neutral_${index}`
   * });
   * 
   * // Invalid configuration - throws error
   * try {
   *   const invalidConfig = new NameOptions({}, {
   *     maleNames: ['John', 'Mike'],
   *     maleNamesMapper: (voices, index) => `Male_${index}` // Error: both provided
   *   });
   * } catch (error) {
   *   console.error('Validation failed:', error.message);
   * }
   * ```
   * 
   * @example Defaults and overrides pattern
   * ```typescript
   * // Set up comprehensive defaults
   * const corporateDefaults = {
   *   maleNames: ['Professional_Male_1', 'Professional_Male_2'],
   *   femaleNames: ['Professional_Female_1', 'Professional_Female_2'],
   *   neutralNames: ['Professional_Neutral_1', 'Professional_Neutral_2']
   * };
   * 
   * // Override specific categories while keeping others
   * const customizedConfig = new NameOptions(corporateDefaults, {
   *   maleNames: ['Custom_Male_1', 'Custom_Male_2']
   *   // femaleNames and neutralNames will use corporateDefaults
   * });
   * 
   * console.log(customizedConfig.getMaleNames()); // Custom male names
   * console.log(customizedConfig.getFemaleNames()); // Default female names
   * ```
   * 
   * @example Dynamic configuration based on environment
   * ```typescript
   * // Environment-based configuration
   * const createEnvironmentConfig = (environment: 'development' | 'production') => {
   *   const baseDefaults = {
   *     maleNames: ['Dev_Male_1', 'Dev_Male_2'],
   *     femaleNames: ['Dev_Female_1', 'Dev_Female_2']
   *   };
   * 
   *   if (environment === 'production') {
   *     return new NameOptions(baseDefaults, {
   *       maleNames: ['Prod_Male_1', 'Prod_Male_2'],
   *       femaleNames: ['Prod_Female_1', 'Prod_Female_2']
   *     });
   *   }
   * 
   *   return new NameOptions(baseDefaults, {});
   * };
   * ```
   */
  constructor(
    defaults: {
      maleNames?: string[];
      maleNamesMapper?: VoiceNameMapper<T>;
      femaleNames?: string[];
      femaleNamesMapper?: VoiceNameMapper<T>;
      neutralNames?: string[];
      neutralNamesMapper?: VoiceNameMapper<T>;
    },
    options: {
      maleNames?: string[];
      maleNamesMapper?: VoiceNameMapper<T>;
      femaleNames?: string[];
      femaleNamesMapper?: VoiceNameMapper<T>;
      neutralNames?: string[];
      neutralNamesMapper?: VoiceNameMapper<T>;
    },
  ) {
    // Validate male name options
    if (options.maleNames && options.maleNamesMapper) {
      throw new Error('Only maleNames or maleNamesMapper must be provided.');
    }

    // Validate female name options
    if (options.femaleNames && options.femaleNamesMapper) {
      throw new Error(
        'Only femaleNames or femaleNamesMapper must be provided.',
      );
    }

    // Validate neutral name options
    if (options.neutralNames && options.neutralNamesMapper) {
      throw new Error(
        'Only neutralNames or neutralNamesMapper must be provided.',
      );
    }

    // Set male names/mapper
    if (!options.maleNamesMapper) {
      this.maleNames = options.maleNames ?? defaults.maleNames;
    }

    if (!options.maleNames) {
      this.maleNamesMapper =
        options.maleNamesMapper ?? defaults.maleNamesMapper;
    }

    // Set female names/mapper
    if (!options.femaleNamesMapper) {
      this.femaleNames = options.femaleNames ?? defaults.femaleNames;
    }

    if (!options.femaleNames) {
      this.femaleNamesMapper =
        options.femaleNamesMapper ?? defaults.femaleNamesMapper;
    }

    // Set neutral names/mapper
    if (!options.neutralNamesMapper) {
      this.neutralNames = options.neutralNames ?? defaults.neutralNames;
    }

    if (!options.neutralNames) {
      this.neutralNamesMapper =
        options.neutralNamesMapper ?? defaults.neutralNamesMapper;
    }
  }

  /**
   * Retrieves the name array for a specific gender category.
   * Returns the configured name array for the specified gender, or undefined if not configured
   * or if a mapper function is being used instead. Defaults to neutral names for unknown genders.
   * 
   * @param gender - Gender category ('male', 'female', 'neutral', or other)
   * @returns Array of names for the gender, or undefined if not configured or using mapper
   * 
   * @example Basic gender name retrieval
   * ```typescript
   * const config = new NameOptions({}, {
   *   maleNames: ['John', 'Mike', 'Dave'],
   *   femaleNames: ['Jane', 'Sarah', 'Emma'],
   *   neutralNames: ['Alex', 'Taylor', 'Jordan']
   * });
   * 
   * console.log(config.getNamesForGender('male'));    // ['John', 'Mike', 'Dave']
   * console.log(config.getNamesForGender('female'));  // ['Jane', 'Sarah', 'Emma']
   * console.log(config.getNamesForGender('neutral')); // ['Alex', 'Taylor', 'Jordan']
   * console.log(config.getNamesForGender('unknown')); // ['Alex', 'Taylor', 'Jordan'] (defaults to neutral)
   * ```
   * 
   * @example Case-insensitive gender handling
   * ```typescript
   * // Gender strings are normalized to lowercase
   * console.log(config.getNamesForGender('MALE'));   // ['John', 'Mike', 'Dave']
   * console.log(config.getNamesForGender('Female')); // ['Jane', 'Sarah', 'Emma']
   * console.log(config.getNamesForGender('NEUTRAL')); // ['Alex', 'Taylor', 'Jordan']
   * ```
   * 
   * @example Handling mapper configurations
   * ```typescript
   * const mapperConfig = new NameOptions({}, {
   *   maleNamesMapper: (voices, index) => `Male_${index}`,
   *   femaleNames: ['Jane', 'Sarah'] // Mixed configuration
   * });
   * 
   * console.log(mapperConfig.getNamesForGender('male'));   // undefined (using mapper)
   * console.log(mapperConfig.getNamesForGender('female')); // ['Jane', 'Sarah']
   * ```
   * 
   * @example Voice selection workflow
   * ```typescript
   * // Use in voice selection logic
   * const selectVoiceName = (gender: string, index: number, config: NameOptions<VoiceBase>) => {
   *   const names = config.getNamesForGender(gender);
   *   if (names && names.length > 0) {
   *     return names[index % names.length]; // Cycle through available names
   *   }
   *   
   *   // Fallback to mapper if names not available
   *   const mapper = config.getMapperForGender(gender);
   *   if (mapper) {
   *     return mapper(voices, index);
   *   }
   *   
   *   return `Voice_${index + 1}`; // Ultimate fallback
   * };
   * ```
   */
  getNamesForGender(gender: string): string[] | undefined {
    const normalizedGender = gender.toLowerCase();
    switch (normalizedGender) {
      case 'male':
        return this.maleNames;
      case 'female':
        return this.femaleNames;
      case 'neutral':
        return this.neutralNames;
      default:
        return this.neutralNames; // Default to neutral for unknown genders
    }
  }

  /**
   * Retrieves the name mapper function for a specific gender category.
   * Returns the configured mapper function for the specified gender, or undefined if not configured
   * or if a static name array is being used instead. Defaults to neutral mapper for unknown genders.
   * 
   * @param gender - Gender category ('male', 'female', 'neutral', or other)
   * @returns Mapper function for the gender, or undefined if not configured or using static names
   * 
   * @example Basic gender mapper retrieval
   * ```typescript
   * const config = new NameOptions({}, {
   *   maleNamesMapper: (voices, index) => `Mr_Voice_${index + 1}`,
   *   femaleNamesMapper: (voices, index) => `Ms_Voice_${index + 1}`,
   *   neutralNamesMapper: (voices, index) => `Voice_${index + 1}`
   * });
   * 
   * const maleMapper = config.getMapperForGender('male');
   * if (maleMapper) {
   *   console.log(maleMapper(voices, 0)); // 'Mr_Voice_1'
   * }
   * 
   * const unknownMapper = config.getMapperForGender('unknown');
   * // Returns neutralNamesMapper (defaults to neutral)
   * ```
   * 
   * @example Dynamic name generation workflow
   * ```typescript
   * // Use mappers in voice processing pipeline
   * const processVoicesWithMappers = (voices: VoiceBase[], config: NameOptions<VoiceBase>) => {
   *   return voices.map((voice, index) => {
   *     const mapper = config.getMapperForGender(voice.gender);
   *     if (mapper) {
   *       return {
   *         ...voice,
   *         customName: mapper(voices, index)
   *       };
   *     }
   *     return voice;
   *   });
   * };
   * ```
   * 
   * @example Conditional naming strategy
   * ```typescript
   * // Choose between static names and dynamic generation
   * const getVoiceName = (
   *   voice: VoiceBase, 
   *   index: number, 
   *   voices: VoiceBase[], 
   *   config: NameOptions<VoiceBase>
   * ): string => {
   *   // Try static names first
   *   const names = config.getNamesForGender(voice.gender);
   *   if (names && names.length > 0) {
   *     return names[index % names.length];
   *   }
   *   
   *   // Fallback to mapper
   *   const mapper = config.getMapperForGender(voice.gender);
   *   if (mapper) {
   *     return mapper(voices, index);
   *   }
   *   
   *   // Ultimate fallback
   *   return `${voice.gender}_Voice_${index + 1}`;
   * };
   * ```
   */
  getMapperForGender(gender: string): VoiceNameMapper<T> | undefined {
    const normalizedGender = gender.toLowerCase();
    switch (normalizedGender) {
      case 'male':
        return this.maleNamesMapper;
      case 'female':
        return this.femaleNamesMapper;
      case 'neutral':
        return this.neutralNamesMapper;
      default:
        return this.neutralNamesMapper; // Default to neutral for unknown genders
    }
  }

  /**
   * Checks if any naming configuration (array or mapper) exists for a specific gender.
   * Returns true if either a name array or mapper function is configured for the gender,
   * false otherwise. Useful for validation and conditional processing logic.
   * 
   * @param gender - Gender category to check ('male', 'female', 'neutral', or other)
   * @returns True if names or mapper configured for the gender, false otherwise
   * 
   * @example Configuration validation
   * ```typescript
   * const config = new NameOptions({}, {
   *   maleNames: ['John', 'Mike'],
   *   femaleNamesMapper: (voices, index) => `Female_${index}`,
   *   // No neutral configuration
   * });
   * 
   * console.log(config.hasNamesForGender('male'));    // true (has names array)
   * console.log(config.hasNamesForGender('female'));  // true (has mapper)
   * console.log(config.hasNamesForGender('neutral')); // false (no configuration)
   * console.log(config.hasNamesForGender('unknown')); // false (defaults to neutral, which has none)
   * ```
   * 
   * @example Conditional voice processing
   * ```typescript
   * // Process only voices with configured naming
   * const processConfiguredVoices = (voices: VoiceBase[], config: NameOptions<VoiceBase>) => {
   *   return voices.filter(voice => {
   *     const hasConfig = config.hasNamesForGender(voice.gender);
   *     if (!hasConfig) {
   *       console.warn(`No naming configuration for gender: ${voice.gender}`);
   *     }
   *     return hasConfig;
   *   });
   * };
   * ```
   * 
   * @example Feature availability check
   * ```typescript
   * // Check what naming features are available
   * const analyzeNamingConfig = (config: NameOptions<VoiceBase>) => {
   *   const genders = ['male', 'female', 'neutral'];
   *   const analysis = {};
   *   
   *   genders.forEach(gender => {
   *     analysis[gender] = {
   *       hasConfiguration: config.hasNamesForGender(gender),
   *       hasStaticNames: !!config.getNamesForGender(gender),
   *       hasMapper: !!config.getMapperForGender(gender)
   *     };
   *   });
   *   
   *   return analysis;
   * };
   * 
   * // Usage
   * const analysis = analyzeNamingConfig(config);
   * console.log('Naming configuration analysis:', analysis);
   * ```
   * 
   * @example Voice catalog preparation
   * ```typescript
   * // Prepare voice catalog with naming support
   * const prepareVoiceCatalog = (voices: VoiceBase[], config: NameOptions<VoiceBase>) => {
   *   const supportedVoices = [];
   *   const unsupportedVoices = [];
   *   
   *   voices.forEach(voice => {
   *     if (config.hasNamesForGender(voice.gender)) {
   *       supportedVoices.push(voice);
   *     } else {
   *       unsupportedVoices.push(voice);
   *     }
   *   });
   *   
   *   return {
   *     supported: supportedVoices,
   *     unsupported: unsupportedVoices,
   *     supportRatio: supportedVoices.length / voices.length
   *   };
   * };
   * ```
   */
  hasNamesForGender(gender: string): boolean {
    return this.getNamesForGender(gender) !== undefined || 
           this.getMapperForGender(gender) !== undefined;
  }
}
