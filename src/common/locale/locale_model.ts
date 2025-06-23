/**
 * @fileoverview Locale data model for internationalization support in TTS operations.
 * Provides comprehensive locale information including language codes, country codes, script codes,
 * and native name representations for multi-language voice synthesis and voice selection.
 * 
 * @author Marko Kostich
 * @since 1.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * 
 * @example Basic locale creation
 * ```typescript
 * import { VoiceLocale } from './locale_model.js';
 * 
 * // Create a simple locale with just code
 * const simpleLocale = VoiceLocale.fromCode('en-US');
 * 
 * // Create a detailed locale with full information
 * const detailedLocale = new VoiceLocale({
 *   code: 'en-US',
 *   name: 'English (United States)',
 *   nativeName: 'English (United States)',
 *   languageCode: 'en',
 *   languageName: 'English',
 *   nativeLanguageName: 'English',
 *   countryCode: 'US',
 *   countryName: 'United States',
 *   nativeCountryName: 'United States'
 * });
 * ```
 * 
 * @example Multi-language locale examples
 * ```typescript
 * // French locale with native names
 * const frenchLocale = new VoiceLocale({
 *   code: 'fr-FR',
 *   name: 'French (France)',
 *   nativeName: 'Français (France)',
 *   languageCode: 'fr',
 *   languageName: 'French',
 *   nativeLanguageName: 'Français',
 *   countryCode: 'FR',
 *   countryName: 'France',
 *   nativeCountryName: 'France'
 * });
 * 
 * // Chinese locale with script information
 * const chineseLocale = new VoiceLocale({
 *   code: 'zh-CN',
 *   name: 'Chinese (Simplified, China)',
 *   nativeName: '中文（简体，中国）',
 *   languageCode: 'zh',
 *   languageName: 'Chinese',
 *   nativeLanguageName: '中文',
 *   countryCode: 'CN',
 *   countryName: 'China',
 *   nativeCountryName: '中国',
 *   scriptCode: 'Hans',
 *   scriptName: 'Simplified Han',
 *   nativeScriptName: '简体字'
 * });
 * ```
 * 
 * @example Voice locale usage in TTS
 * ```typescript
 * // Use locales for voice filtering
 * const voices = await tts.getVoices();
 * const englishVoices = voices.filter(voice => 
 *   voice.locale.languageCode === 'en'
 * );
 * 
 * // Display voice names with locale information
 * englishVoices.forEach(voice => {
 *   console.log(`${voice.name} - ${voice.locale.name}`);
 * });
 * ```
 */

/**
 * Comprehensive locale data model supporting internationalization across multiple dimensions.
 * Contains language, country, script, and region information with both English and native
 * name representations for comprehensive multi-language TTS voice support.
 * 
 * @category Locale Management
 * 
 * @example Creating locale instances
 * ```typescript
 * // Simple locale creation
 * const locale1 = VoiceLocale.fromCode('en-US');
 * 
 * // Detailed locale with all properties
 * const locale2 = new VoiceLocale({
 *   code: 'ja-JP',
 *   name: 'Japanese (Japan)',
 *   nativeName: '日本語（日本）',
 *   languageCode: 'ja',
 *   languageName: 'Japanese',
 *   nativeLanguageName: '日本語',
 *   countryCode: 'JP',
 *   countryName: 'Japan',
 *   nativeCountryName: '日本',
 *   scriptCode: 'Jpan',
 *   scriptName: 'Japanese',
 *   nativeScriptName: '日本の文字'
 * });
 * ```
 * 
 * @example Locale-based voice filtering
 * ```typescript
 * // Filter voices by language
 * const englishVoices = voices.filter(voice => 
 *   voice.locale.languageCode === 'en'
 * );
 * 
 * // Filter voices by country
 * const usVoices = voices.filter(voice => 
 *   voice.locale.countryCode === 'US'
 * );
 * 
 * // Filter voices by script (useful for Chinese, Arabic, etc.)
 * const simplifiedChineseVoices = voices.filter(voice => 
 *   voice.locale.scriptCode === 'Hans'
 * );
 * ```
 * 
 * @example Locale information display
 * ```typescript
 * // Display locale information in UI
 * const displayLocaleInfo = (locale: VoiceLocale) => {
 *   console.log(`
 *     Code: ${locale.code}
 *     Display Name: ${locale.name}
 *     Native Name: ${locale.nativeName}
 *     Language: ${locale.languageName} (${locale.nativeLanguageName})
 *     Country: ${locale.countryName} (${locale.nativeCountryName})
 *     Script: ${locale.scriptName} (${locale.nativeScriptName})
 *   `);
 * };
 * ```
 */
export class VoiceLocale {
  /** RFC 5646 language tag (e.g., 'en-US', 'zh-CN', 'fr-FR') */
  code: string;
  /** Human-readable locale name in English (e.g., 'English (United States)') */
  name?: string;
  /** Human-readable locale name in the native language (e.g., 'English (United States)', 'Français (France)') */
  nativeName?: string;
  /** ISO 639-1 or ISO 639-2 language code (e.g., 'en', 'zh', 'fr') */
  languageCode?: string;
  /** Language name in English (e.g., 'English', 'Chinese', 'French') */
  languageName?: string;
  /** Language name in the native language (e.g., 'English', '中文', 'Français') */
  nativeLanguageName?: string;
  /** ISO 3166-1 alpha-2 country code (e.g., 'US', 'CN', 'FR') */
  countryCode?: string;
  /** Country name in English (e.g., 'United States', 'China', 'France') */
  countryName?: string;
  /** Country name in the native language (e.g., 'United States', '中国', 'France') */
  nativeCountryName?: string;
  /** ISO 15924 script code (e.g., 'Latn', 'Hans', 'Hant', 'Arab') */
  scriptCode?: string;
  /** Script name in English (e.g., 'Latin', 'Simplified Han', 'Traditional Han') */
  scriptName?: string;
  /** Script name in the native language (e.g., 'Latin', '简体字', '繁體字') */
  nativeScriptName?: string;

  /**
   * Creates a new VoiceLocale instance with the specified properties.
   * All properties except code are optional and can be populated based on available locale data.
   * 
   * @param config - Locale configuration object
   * 
   * @example Creating a comprehensive locale
   * ```typescript
   * const koreanLocale = new VoiceLocale({
   *   code: 'ko-KR',
   *   name: 'Korean (South Korea)',
   *   nativeName: '한국어 (대한민국)',
   *   languageCode: 'ko',
   *   languageName: 'Korean',
   *   nativeLanguageName: '한국어',
   *   countryCode: 'KR',
   *   countryName: 'South Korea',
   *   nativeCountryName: '대한민국',
   *   scriptCode: 'Hang',
   *   scriptName: 'Hangul',
   *   nativeScriptName: '한글'
   * });
   * ```
   * 
   * @example Creating a minimal locale
   * ```typescript
   * // Minimal locale with just required code
   * const minimalLocale = new VoiceLocale({
   *   code: 'de-DE'
   * });
   * 
   * // Can be enhanced later with additional information
   * minimalLocale.name = 'German (Germany)';
   * minimalLocale.nativeName = 'Deutsch (Deutschland)';
   * ```
   */
  constructor({
    code,
    name,
    nativeName,
    languageCode,
    languageName,
    nativeLanguageName,
    countryCode,
    countryName,
    nativeCountryName,
    scriptCode,
    scriptName,
    nativeScriptName,
  }: {
    code: string;
    name?: string;
    nativeName?: string;
    languageCode?: string;
    languageName?: string;
    nativeLanguageName?: string;
    countryCode?: string;
    countryName?: string;
    nativeCountryName?: string;
    scriptCode?: string;
    scriptName?: string;
    nativeScriptName?: string;
  }) {
    this.code = code;
    this.name = name;
    this.nativeName = nativeName;
    this.languageCode = languageCode;
    this.languageName = languageName;
    this.nativeLanguageName = nativeLanguageName;
    this.countryCode = countryCode;
    this.countryName = countryName;
    this.nativeCountryName = nativeCountryName;
    this.scriptCode = scriptCode;
    this.scriptName = scriptName;
    this.nativeScriptName = nativeScriptName;
  }

  /**
   * Factory method to create a VoiceLocale instance with only the locale code.
   * Useful for quick locale creation when detailed information is not immediately available
   * but can be populated later through locale data services or API responses.
   * 
   * @param code - RFC 5646 language tag (e.g., 'en-US', 'zh-CN', 'ar-SA')
   * @returns New VoiceLocale instance with the specified code
   * 
   * @example Quick locale creation
   * ```typescript
   * // Create locales for common languages
   * const english = VoiceLocale.fromCode('en-US');
   * const spanish = VoiceLocale.fromCode('es-ES');
   * const mandarin = VoiceLocale.fromCode('zh-CN');
   * const arabic = VoiceLocale.fromCode('ar-SA');
   * 
   * // Use in voice filtering
   * const supportedLocales = ['en-US', 'es-ES', 'fr-FR', 'de-DE'];
   * const localeObjects = supportedLocales.map(code => VoiceLocale.fromCode(code));
   * ```
   * 
   * @example Bulk locale creation
   * ```typescript
   * // Create locales from API response
   * const apiResponse = ['en-US', 'en-GB', 'fr-FR', 'de-DE', 'it-IT'];
   * const availableLocales = apiResponse.map(localeCode => 
   *   VoiceLocale.fromCode(localeCode)
   * );
   * 
   * // Filter voices by available locales
   * const filteredVoices = voices.filter(voice => 
   *   availableLocales.some(locale => locale.code === voice.locale.code)
   * );
   * ```
   * 
   * @example Dynamic locale creation
   * ```typescript
   * // Create locale based on user's browser language
   * const userLanguage = navigator.language || 'en-US';
   * const userLocale = VoiceLocale.fromCode(userLanguage);
   * 
   * // Find voices matching user's locale
   * const matchingVoices = voices.filter(voice => 
   *   voice.locale.code === userLocale.code
   * );
   * ```
   */
  static fromCode(code: string): VoiceLocale {
    return new VoiceLocale({ code });
  }

  /**
   * Returns a comprehensive string representation of the locale object.
   * Includes all available properties formatted for debugging and logging purposes.
   * 
   * @returns Formatted string containing all locale properties
   * 
   * @example Debugging locale information
   * ```typescript
   * const locale = new VoiceLocale({
   *   code: 'ja-JP',
   *   name: 'Japanese (Japan)',
   *   nativeName: '日本語（日本）',
   *   languageCode: 'ja',
   *   languageName: 'Japanese',
   *   nativeLanguageName: '日本語'
   * });
   * 
   * console.log(locale.toString());
   * // Output: VoiceLocale{code: ja-JP, name: Japanese (Japan), nativeName: 日本語（日本）, ...}
   * ```
   * 
   * @example Logging locale details
   * ```typescript
   * // Log all voice locales for debugging
   * voices.forEach((voice, index) => {
   *   console.log(`Voice ${index + 1}: ${voice.name}`);
   *   console.log(`  Locale: ${voice.locale.toString()}`);
   * });
   * ```
   * 
   * @example Locale comparison for troubleshooting
   * ```typescript
   * // Compare expected vs actual locale
   * const expectedLocale = VoiceLocale.fromCode('en-US');
   * const actualLocale = voice.locale;
   * 
   * if (expectedLocale.code !== actualLocale.code) {
   *   console.error(`Locale mismatch!`);
   *   console.error(`Expected: ${expectedLocale.toString()}`);
   *   console.error(`Actual: ${actualLocale.toString()}`);
   * }
   * ```
   */
  toString(): string {
    return `VoiceLocale{code: ${this.code}, name: ${this.name}, nativeName: ${this.nativeName}, languageCode: ${this.languageCode}, languageName: ${this.languageName}, nativeLanguageName: ${this.nativeLanguageName}, countryCode: ${this.countryCode}, countryName: ${this.countryName}, nativeCountryName: ${this.nativeCountryName}, scriptCode: ${this.scriptCode}, scriptName: ${this.scriptName}, nativeScriptName: ${this.nativeScriptName}}`;
  }
}
