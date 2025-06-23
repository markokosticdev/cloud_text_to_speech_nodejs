/**
 * @fileoverview Locale conversion and helper utilities for TTS voice locale management.
 * Provides conversion between Locale and VoiceLocale types, locale string parsing,
 * and display name formatting for comprehensive internationalization support.
 * 
 * @author Marko Kostich
 * @since 1.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link VoiceLocale} for the target locale model
 * @see {@link Locale} for the extended locale implementation
 * 
 * @example Basic locale conversion
 * ```typescript
 * import { VoiceLocaleHelpers } from './locale_helpers.js';
 * import { Locale } from './locale_extension.js';
 * 
 * // Convert extended Locale to VoiceLocale
 * const extendedLocale = new Locale('zh', 'CN');
 * const voiceLocale = VoiceLocaleHelpers.localeToVoiceLocale(extendedLocale);
 * 
 * console.log(voiceLocale.code); // "zh-CN"
 * console.log(voiceLocale.name); // "Chinese (China)"
 * console.log(voiceLocale.nativeName); // "中文 (中国)"
 * ```
 * 
 * @example Locale string parsing
 * ```typescript
 * // Parse locale strings into Locale objects
 * const localeStrings = [
 *   'en-US',           // English (United States)
 *   'zh-Hans-CN',      // Chinese Simplified (China)
 *   'ar-SA',           // Arabic (Saudi Arabia)
 *   'pt-BR'            // Portuguese (Brazil)
 * ];
 * 
 * const locales = localeStrings.map(str => {
 *   const segments = str.split('-');
 *   return VoiceLocaleHelpers.segmentsToLocale(segments);
 * });
 * 
 * locales.forEach(locale => {
 *   console.log(`${locale.toLanguageTag()}: ${locale.defaultDisplayLanguage}`);
 * });
 * ```
 * 
 * @example Display name formatting
 * ```typescript
 * // Format display names for UI
 * const formattedNames = [
 *   VoiceLocaleHelpers.formatName('English', undefined, 'United States'),
 *   VoiceLocaleHelpers.formatName('Chinese', 'Simplified', 'China'),
 *   VoiceLocaleHelpers.formatName('Arabic', undefined, 'Saudi Arabia'),
 *   VoiceLocaleHelpers.formatName('Portuguese', undefined, 'Brazil')
 * ];
 * 
 * // Results: ["English (United States)", "Chinese (Simplified, China)", "Arabic (Saudi Arabia)", "Portuguese (Brazil)"]
 * ```
 */

import { VoiceLocale } from './locale_model.js';
import { Locale } from './locale_extension.js';

/**
 * Utility class providing helper functions for locale conversion, parsing, and formatting.
 * Contains static methods for converting between different locale representations,
 * parsing locale strings, and formatting display names for UI components.
 * 
 * @category Locale Management
 * 
 * @example Complete locale processing pipeline
 * ```typescript
 * // Process locale strings from API responses
 * const apiLocaleStrings = ['en-US', 'zh-Hans-CN', 'fr-FR', 'es-MX'];
 * 
 * const processedLocales = apiLocaleStrings.map(localeString => {
 *   // 1. Parse string into segments
 *   const segments = localeString.split('-');
 *   
 *   // 2. Create Locale object from segments
 *   const locale = VoiceLocaleHelpers.segmentsToLocale(segments);
 *   
 *   // 3. Convert to VoiceLocale for TTS operations
 *   const voiceLocale = VoiceLocaleHelpers.localeToVoiceLocale(locale);
 *   
 *   return voiceLocale;
 * });
 * 
 * // Use in voice filtering and UI display
 * processedLocales.forEach(voiceLocale => {
 *   console.log(`Code: ${voiceLocale.code}, Display: ${voiceLocale.name}`);
 * });
 * ```
 * 
 * @example Voice locale integration
 * ```typescript
 * // Create voice locale data for TTS operations
 * const createVoiceLocaleData = (localeCode: string) => {
 *   const segments = localeCode.split('-');
 *   const locale = VoiceLocaleHelpers.segmentsToLocale(segments);
 *   const voiceLocale = VoiceLocaleHelpers.localeToVoiceLocale(locale);
 *   
 *   return {
 *     code: voiceLocale.code,
 *     displayName: voiceLocale.name,
 *     nativeDisplayName: voiceLocale.nativeName,
 *     language: voiceLocale.languageName,
 *     country: voiceLocale.countryName,
 *     isRTL: ['ar', 'he', 'fa', 'ur'].includes(voiceLocale.languageCode || '')
 *   };
 * };
 * ```
 */
export class VoiceLocaleHelpers {
  /**
   * Private constructor to prevent instantiation of utility class.
   * All methods are static and should be called directly on the class.
   */
  private constructor() {}

  /**
   * Converts an extended Locale instance to a VoiceLocale instance.
   * Transfers all locale information including display names, native names,
   * and script information to create a comprehensive VoiceLocale for TTS operations.
   * 
   * @param locale - Extended Locale instance with display name resolution capabilities
   * @returns VoiceLocale instance with full internationalization data
   * 
   * @example Basic conversion
   * ```typescript
   * // Convert simple locales
   * const english = new Locale('en', 'US');
   * const voiceLocale = VoiceLocaleHelpers.localeToVoiceLocale(english);
   * 
   * console.log(voiceLocale.code);        // "en-US"
   * console.log(voiceLocale.name);        // "English (United States)"
   * console.log(voiceLocale.languageCode); // "en"
   * console.log(voiceLocale.countryCode);  // "US"
   * ```
   * 
   * @example Converting locales with script codes
   * ```typescript
   * // Convert locale with script information
   * const traditionalChinese = Locale.fromSubtags({
   *   languageCode: 'zh',
   *   scriptCode: 'Hant',
   *   countryCode: 'TW'
   * });
   * 
   * const voiceLocale = VoiceLocaleHelpers.localeToVoiceLocale(traditionalChinese);
   * 
   * console.log(voiceLocale.code);           // "zh-Hant-TW"
   * console.log(voiceLocale.scriptCode);     // "Hant"
   * console.log(voiceLocale.scriptName);     // "Traditional Han" (if available)
   * console.log(voiceLocale.nativeScriptName); // "繁體字" (if available)
   * ```
   * 
   * @example Batch conversion for voice processing
   * ```typescript
   * // Convert multiple locales for voice catalog
   * const sourceLocales = [
   *   new Locale('en', 'US'),
   *   new Locale('en', 'GB'),
   *   new Locale('fr', 'FR'),
   *   new Locale('es', 'ES'),
   *   new Locale('de', 'DE'),
   *   new Locale('it', 'IT'),
   *   new Locale('pt', 'BR'),
   *   new Locale('ru', 'RU'),
   *   new Locale('ja', 'JP'),
   *   new Locale('ko', 'KR')
   * ];
   * 
   * const voiceLocales = sourceLocales.map(locale => 
   *   VoiceLocaleHelpers.localeToVoiceLocale(locale)
   * );
   * 
   * // Use for voice filtering and UI display
   * voiceLocales.forEach(voiceLocale => {
   *   console.log(`${voiceLocale.code}: ${voiceLocale.name} / ${voiceLocale.nativeName}`);
   * });
   * ```
   * 
   * @example Integration with TTS voice data
   * ```typescript
   * // Convert locale for voice metadata
   * const createVoiceMetadata = (localeCode: string, voiceId: string) => {
   *   const segments = localeCode.split('-');
   *   const locale = VoiceLocaleHelpers.segmentsToLocale(segments);
   *   const voiceLocale = VoiceLocaleHelpers.localeToVoiceLocale(locale);
   *   
   *   return {
   *     id: voiceId,
   *     locale: voiceLocale,
   *     displayText: `${voiceId} (${voiceLocale.name})`,
   *     nativeDisplayText: `${voiceId} (${voiceLocale.nativeName})`,
   *     searchableText: [
   *       voiceLocale.languageName,
   *       voiceLocale.nativeLanguageName,
   *       voiceLocale.countryName,
   *       voiceLocale.nativeCountryName
   *     ].filter(Boolean).join(' ')
   *   };
   * };
   * ```
   */
  static localeToVoiceLocale(locale: Locale): VoiceLocale {
    return new VoiceLocale({
      code: locale.toString(),
      name: this.formatName(
        locale.defaultDisplayLanguage,
        locale.defaultDisplayScript,
        locale.defaultDisplayCountry,
      ),
      nativeName: this.formatName(
        locale.nativeDisplayLanguage,
        locale.nativeDisplayScript,
        locale.nativeDisplayCountry,
      ),
      languageCode: locale.languageCode,
      languageName: locale.defaultDisplayLanguage,
      nativeLanguageName: locale.nativeDisplayLanguage,
      countryCode: locale.countryCode,
      countryName: locale.defaultDisplayCountry,
      nativeCountryName: locale.nativeDisplayCountry,
      scriptCode: locale.scriptCode,
      scriptName: locale.defaultDisplayScript,
      nativeScriptName: locale.nativeDisplayScript,
    });
  }

  /**
   * Converts an array of locale string segments into a Locale instance.
   * Parses locale components (language, script, country) from string segments
   * with automatic mapping of deprecated codes and special handling for known variants.
   * 
   * @param localeSegments - Array of locale string segments (e.g., ['zh', 'Hans', 'CN'])
   * @returns Locale instance constructed from the parsed segments
   * 
   * @example Parsing different locale formats
   * ```typescript
   * // Parse language-only locales
   * const esperanto = VoiceLocaleHelpers.segmentsToLocale(['eo']);
   * console.log(esperanto.toLanguageTag()); // "eo"
   * 
   * // Parse language-country locales
   * const american = VoiceLocaleHelpers.segmentsToLocale(['en', 'US']);
   * console.log(american.toLanguageTag()); // "en-US"
   * 
   * // Parse language-script-country locales
   * const simplified = VoiceLocaleHelpers.segmentsToLocale(['zh', 'Hans', 'CN']);
   * console.log(simplified.toLanguageTag()); // "zh-Hans-CN"
   * ```
   * 
   * @example Handling deprecated and special codes
   * ```typescript
   * // Deprecated language codes are automatically mapped
   * const indonesian = VoiceLocaleHelpers.segmentsToLocale(['cmn', 'CN']); // cmn → zh
   * console.log(indonesian.languageCode); // "zh" (mapped from cmn)
   * 
   * const arabic = VoiceLocaleHelpers.segmentsToLocale(['arb', 'SA']); // arb → ar
   * console.log(arabic.languageCode); // "ar" (mapped from arb)
   * 
   * // Special region codes are handled
   * const synthetic = VoiceLocaleHelpers.segmentsToLocale(['en', 'XA']); // XA → null
   * console.log(synthetic.countryCode); // undefined (XA mapped to null)
   * ```
   * 
   * @example Parsing complex locale strings
   * ```typescript
   * // Parse locale strings from different sources
   * const parseLocaleString = (localeString: string) => {
   *   const segments = localeString.split(/[-_]/); // Handle both - and _
   *   return VoiceLocaleHelpers.segmentsToLocale(segments);
   * };
   * 
   * const locales = [
   *   'en-US',           // American English
   *   'zh_Hans_CN',      // Simplified Chinese (China)
   *   'sr-Cyrl-RS',      // Serbian Cyrillic (Serbia)
   *   'uz-Latn-UZ',      // Uzbek Latin (Uzbekistan)
   *   'pt-BR',           // Portuguese (Brazil)
   *   'fr-CA'            // French (Canada)
   * ].map(parseLocaleString);
   * 
   * locales.forEach(locale => {
   *   console.log(`${locale.toLanguageTag()}: ${locale.defaultDisplayLanguage}`);
   * });
   * ```
   * 
   * @example Integration with API responses
   * ```typescript
   * // Process locale data from TTS provider APIs
   * const processApiLocales = (apiResponse: { voices: Array<{ locale: string }> }) => {
   *   return apiResponse.voices.map(voice => {
   *     const segments = voice.locale.split('-');
   *     const locale = VoiceLocaleHelpers.segmentsToLocale(segments);
   *     const voiceLocale = VoiceLocaleHelpers.localeToVoiceLocale(locale);
   *     
   *     return {
   *       originalLocale: voice.locale,
   *       parsedLocale: locale,
   *       voiceLocale: voiceLocale,
   *       isValid: voiceLocale.languageCode !== undefined
   *     };
   *   });
   * };
   * ```
   * 
   * @example Error-resistant parsing
   * ```typescript
   * // Safe parsing with fallbacks
   * const safeParseLocale = (localeString: string) => {
   *   try {
   *     const segments = localeString.trim().split(/[-_]/).filter(Boolean);
   *     if (segments.length === 0) {
   *       return VoiceLocaleHelpers.segmentsToLocale(['en']); // Fallback to English
   *     }
   *     return VoiceLocaleHelpers.segmentsToLocale(segments);
   *   } catch (error) {
   *     console.warn(`Failed to parse locale "${localeString}", using English fallback`);
   *     return VoiceLocaleHelpers.segmentsToLocale(['en']);
   *   }
   * };
   * ```
   */
  static segmentsToLocale(localeSegments: string[]): Locale {
    /** Mapping for deprecated or alternative language codes */
    const languageCodeMap: { [key: string]: string } = {
      cmn: 'zh',  // Mandarin Chinese → Chinese
      arb: 'ar',  // Modern Standard Arabic → Arabic
    };

    /** Mapping for special or deprecated region codes */
    const countryCodeMap: { [key: string]: string | null } = {
      XA: null,   // Synthetic/Test region → null
    };

    let languageCode = localeSegments[0];
    let scriptCode: string | undefined;
    let countryCode: string | undefined;

    // Parse segments based on length and content
    switch (localeSegments.length) {
      case 2:
        // Two segments: language-script or language-country
        if (localeSegments[1].toUpperCase() == localeSegments[1]) {
          // Uppercase = country code
          countryCode = localeSegments[1];
        } else {
          // Mixed case = script code
          scriptCode = localeSegments[1];
        }
        break;
      case 3:
        // Three segments: language-script-country or language-country-variant
        if (localeSegments[1].toUpperCase() == localeSegments[1]) {
          // Second segment is uppercase = country
          countryCode = localeSegments[1];
        } else {
          // Second segment is mixed case = script
          scriptCode = localeSegments[1];
        }

        // Third segment handling
        if (localeSegments[2].toUpperCase() == localeSegments[2]) {
          // Third segment is uppercase = country (overrides previous)
          countryCode = localeSegments[2];
        }
        break;
      case 4:
        // Four segments: language-script-country-variant
        scriptCode = localeSegments[1];
        countryCode = localeSegments[2];
        // Fourth segment (variant) is ignored
        break;
    }

    // Apply language code mapping
    if (languageCodeMap[languageCode]) {
      languageCode = languageCodeMap[languageCode];
    }

    // Apply country code mapping
    if (countryCodeMap[countryCode]) {
      countryCode = countryCodeMap[countryCode];
    }

    return Locale.fromSubtags({
      languageCode: languageCode || 'en',
      scriptCode: scriptCode || null,
      countryCode: countryCode || null,
    });
  }

  /**
   * Formats a display name from language, script, and country components.
   * Creates human-readable locale names following standard conventions:
   * - "Language (Country)" for language + country
   * - "Language (Script, Country)" for language + script + country (when script differs from country)
   * - "Language" for language only
   * 
   * @param language - Language name (e.g., "English", "Chinese", "Arabic")
   * @param script - Optional script name (e.g., "Simplified", "Traditional", "Cyrillic")
   * @param country - Optional country name (e.g., "United States", "China", "Saudi Arabia")
   * @returns Formatted display name, or undefined if no valid components provided
   * 
   * @example Basic display name formatting
   * ```typescript
   * // Language + country combinations
   * console.log(VoiceLocaleHelpers.formatName('English', undefined, 'United States'));
   * // "English (United States)"
   * 
   * console.log(VoiceLocaleHelpers.formatName('French', undefined, 'Canada'));
   * // "French (Canada)"
   * 
   * console.log(VoiceLocaleHelpers.formatName('Spanish', undefined, 'Mexico'));
   * // "Spanish (Mexico)"
   * ```
   * 
   * @example Script-specific formatting
   * ```typescript
   * // Language + script + country (when script differs from country)
   * console.log(VoiceLocaleHelpers.formatName('Chinese', 'Simplified', 'China'));
   * // "Chinese (Simplified, China)"
   * 
   * console.log(VoiceLocaleHelpers.formatName('Serbian', 'Cyrillic', 'Serbia'));
   * // "Serbian (Cyrillic, Serbia)"
   * 
   * console.log(VoiceLocaleHelpers.formatName('Uzbek', 'Latin', 'Uzbekistan'));
   * // "Uzbek (Latin, Uzbekistan)"
   * ```
   * 
   * @example Edge cases and fallbacks
   * ```typescript
   * // Language only
   * console.log(VoiceLocaleHelpers.formatName('Esperanto', undefined, undefined));
   * // "Esperanto"
   * 
   * // Script same as country (avoid redundancy)
   * console.log(VoiceLocaleHelpers.formatName('French', 'France', 'France'));
   * // "French (France)" (not "French (France, France)")
   * 
   * // Empty or invalid inputs
   * console.log(VoiceLocaleHelpers.formatName('', undefined, 'Country'));
   * // undefined
   * 
   * console.log(VoiceLocaleHelpers.formatName(undefined, undefined, undefined));
   * // undefined
   * ```
   * 
   * @example Creating display options for UI
   * ```typescript
   * // Generate locale options for dropdown menus
   * const createLocaleOptions = (locales: VoiceLocale[]) => {
   *   return locales.map(locale => ({
   *     value: locale.code,
   *     label: VoiceLocaleHelpers.formatName(
   *       locale.languageName,
   *       locale.scriptName,
   *       locale.countryName
   *     ) || locale.code,
   *     nativeLabel: VoiceLocaleHelpers.formatName(
   *       locale.nativeLanguageName,
   *       locale.nativeScriptName,
   *       locale.nativeCountryName
   *     ) || locale.code
   *   }));
   * };
   * ```
   * 
   * @example Internationalization support
   * ```typescript
   * // Format names for different display contexts
   * const formatForContext = (locale: VoiceLocale, context: 'full' | 'compact' | 'native') => {
   *   switch (context) {
   *     case 'full':
   *       return VoiceLocaleHelpers.formatName(
   *         locale.languageName,
   *         locale.scriptName,
   *         locale.countryName
   *       );
   *     case 'compact':
   *       return VoiceLocaleHelpers.formatName(
   *         locale.languageName,
   *         undefined,
   *         locale.countryName
   *       );
   *     case 'native':
   *       return VoiceLocaleHelpers.formatName(
   *         locale.nativeLanguageName,
   *         locale.nativeScriptName,
   *         locale.nativeCountryName
   *       );
   *     default:
   *       return locale.code;
   *   }
   * };
   * ```
   * 
   * @example Voice catalog display
   * ```typescript
   * // Format voice names for catalog display
   * const formatVoiceDisplayName = (voice: { name: string; locale: VoiceLocale }) => {
   *   const localeName = VoiceLocaleHelpers.formatName(
   *     voice.locale.languageName,
   *     voice.locale.scriptName,
   *     voice.locale.countryName
   *   );
   *   
   *   return localeName ? `${voice.name} - ${localeName}` : voice.name;
   * };
   * 
   * // Usage example
   * const voice = {
   *   name: 'Aria',
   *   locale: new VoiceLocale({
   *     code: 'en-US',
   *     languageName: 'English',
   *     countryName: 'United States'
   *   })
   * };
   * 
   * console.log(formatVoiceDisplayName(voice)); // "Aria - English (United States)"
   * ```
   */
  static formatName(
    language?: string,
    script?: string,
    country?: string,
  ): string | undefined {
    const hasLanguage = language && language.length > 0;
    const hasScript = script && script.length > 0;
    const hasCountry = country && country.length > 0;

    if (hasLanguage && hasScript && hasCountry && script !== country) {
      return `${language} (${script}, ${country})`;
    } else if (hasLanguage && hasCountry) {
      return `${language} (${country})`;
    } else if (hasLanguage) {
      return language;
    } else {
      return undefined;
    }
  }
}
