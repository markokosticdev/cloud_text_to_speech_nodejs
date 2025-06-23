/**
 * @fileoverview Extended locale implementation with deprecated subtag mapping and display name resolution.
 * Provides comprehensive locale handling with automatic deprecated code migration, native/English display names,
 * and RFC 5646 language tag formatting for robust internationalization support in TTS operations.
 * 
 * @author Marko Kostich
 * @since 1.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link https://www.rfc-editor.org/rfc/rfc5646.html RFC 5646 Language Tags}
 * 
 * @example Basic locale creation and usage
 * ```typescript
 * import { Locale } from './locale_extension.js';
 * 
 * // Create locales with language and country codes
 * const english = new Locale('en', 'US');
 * const french = new Locale('fr', 'FR');
 * const chinese = new Locale('zh', 'CN');
 * 
 * // Get display names
 * console.log(english.defaultDisplayLanguage); // "English"
 * console.log(french.nativeDisplayLanguage); // "Français"
 * console.log(chinese.toLanguageTag()); // "zh-CN"
 * ```
 * 
 * @example Advanced locale features with script codes
 * ```typescript
 * // Create locale with script subtag
 * const traditionalChinese = Locale.fromSubtags({
 *   languageCode: 'zh',
 *   scriptCode: 'Hant',
 *   countryCode: 'TW'
 * });
 * 
 * console.log(traditionalChinese.toLanguageTag()); // "zh-Hant-TW"
 * console.log(traditionalChinese.defaultDisplayLanguage); // "Chinese"
 * console.log(traditionalChinese.defaultDisplayCountry); // "Taiwan"
 * ```
 * 
 * @example Deprecated code handling
 * ```typescript
 * // Deprecated language codes are automatically migrated
 * const indonesian1 = new Locale('in', 'ID'); // 'in' is deprecated
 * const indonesian2 = new Locale('id', 'ID'); // Current code
 * 
 * console.log(indonesian1.languageCode); // "id" (migrated)
 * console.log(indonesian2.languageCode); // "id"
 * console.log(indonesian1.equals(indonesian2)); // true
 * 
 * // Deprecated region codes are also migrated
 * const burmese = new Locale('my', 'BU'); // 'BU' is deprecated
 * console.log(burmese.countryCode); // "MM" (migrated to Myanmar)
 * ```
 * 
 * @example Locale comparison and validation
 * ```typescript
 * // Compare locales for equality
 * const locale1 = new Locale('en', 'US');
 * const locale2 = new Locale('en', 'US');
 * const locale3 = new Locale('en', 'GB');
 * 
 * console.log(locale1.equals(locale2)); // true
 * console.log(locale1.equals(locale3)); // false
 * 
 * // Use in voice filtering
 * const isEnglish = (voice: Voice) => voice.locale.languageCode === 'en';
 * const isAmerican = (voice: Voice) => voice.locale.countryCode === 'US';
 * ```
 */

import pkg from 'country-codes-list';

const { customList } = pkg;

/**
 * Extended locale implementation with deprecated subtag mapping and comprehensive display name resolution.
 * Provides automatic migration of deprecated language and region codes, native/English display names,
 * and RFC 5646 compliant language tag formatting for robust internationalization support.
 * 
 * @category Locale Management
 * 
 * @example Creating and using locales
 * ```typescript
 * // Create locales for different regions
 * const locales = [
 *   new Locale('en', 'US'),    // English (United States)
 *   new Locale('fr', 'CA'),    // French (Canada)
 *   new Locale('pt', 'BR'),    // Portuguese (Brazil)
 *   new Locale('ar', 'SA')     // Arabic (Saudi Arabia)
 * ];
 * 
 * // Get display information
 * locales.forEach(locale => {
 *   console.log(`
 *     Language Tag: ${locale.toLanguageTag()}
 *     English: ${locale.defaultDisplayLanguage} (${locale.defaultDisplayCountry})
 *     Native: ${locale.nativeDisplayLanguage} (${locale.nativeDisplayCountry})
 *   `);
 * });
 * ```
 * 
 * @example Working with script codes
 * ```typescript
 * // Chinese locales with different scripts
 * const simplified = Locale.fromSubtags({
 *   languageCode: 'zh',
 *   scriptCode: 'Hans',
 *   countryCode: 'CN'
 * });
 * 
 * const traditional = Locale.fromSubtags({
 *   languageCode: 'zh',
 *   scriptCode: 'Hant',
 *   countryCode: 'TW'
 * });
 * 
 * console.log(simplified.toLanguageTag());  // "zh-Hans-CN"
 * console.log(traditional.toLanguageTag()); // "zh-Hant-TW"
 * ```
 * 
 * @example Deprecated code migration
 * ```typescript
 * // Test deprecated language codes
 * const deprecatedCodes = [
 *   { old: 'in', new: 'id', name: 'Indonesian' },
 *   { old: 'iw', new: 'he', name: 'Hebrew' },
 *   { old: 'ji', new: 'yi', name: 'Yiddish' },
 *   { old: 'jw', new: 'jv', name: 'Javanese' }
 * ];
 * 
 * deprecatedCodes.forEach(({ old, new: newCode, name }) => {
 *   const locale = new Locale(old, 'ID');
 *   console.log(`${name}: ${old} → ${locale.languageCode} (${newCode})`);
 * });
 * ```
 */
export class Locale {
  /**
   * Mapping of deprecated language subtags to their current equivalents.
   * Based on IANA Language Subtag Registry updates and RFC 5646 recommendations.
   */
  private static _deprecatedLanguageSubtagMap: { [key: string]: string } = {
    in: 'id',  // Indonesian
    iw: 'he',  // Hebrew
    ji: 'yi',  // Yiddish
    jw: 'jv',  // Javanese
    mo: 'ro',  // Moldovan → Romanian
    aam: 'aas',
    adp: 'dz',
    aue: 'ktz',
    ayx: 'nun',
    bgm: 'bcg',
    bjd: 'drl',
    ccq: 'rki',
    cjr: 'mom',
    cka: 'cmr',
    cmk: 'xch',
    coy: 'pij',
    cqu: 'quh',
    drh: 'khk',
    drw: 'prs',
    gav: 'dev',
    gfx: 'vaj',
    ggn: 'gvr',
    gti: 'nyc',
    guv: 'duz',
    hrr: 'jal',
    ibi: 'opa',
    ilw: 'gal',
    jeg: 'oyb',
    kgc: 'tdf',
    kgh: 'kml',
    koj: 'kwv',
    krm: 'bmf',
    ktr: 'dtp',
    kvs: 'gdj',
    kwq: 'yam',
    kxe: 'tvd',
    kzj: 'dtp',
    kzt: 'dtp',
    lii: 'raq',
    lmm: 'rmx',
    meg: 'cir',
    mst: 'mry',
    mwj: 'vaj',
    myt: 'mry',
    nad: 'xny',
    ncp: 'kdz',
    nnx: 'ngv',
    nts: 'pij',
    oun: 'vaj',
    pcr: 'adx',
    pmc: 'huw',
    pmu: 'phr',
    ppa: 'bfy',
    ppr: 'lcq',
    pry: 'prt',
    puz: 'pub',
    sca: 'hle',
    skk: 'oyb',
    tdu: 'dtp',
    thc: 'tpo',
    thx: 'oyb',
    tie: 'ras',
    tkk: 'twm',
    tlw: 'weo',
    tmp: 'tyj',
    tne: 'kak',
    tnf: 'prs',
    tsf: 'taj',
    uok: 'ema',
    xba: 'cax',
    xia: 'acn',
    xkh: 'waw',
    xsj: 'suj',
    ybd: 'rki',
    yma: 'lrr',
    ymt: 'mtm',
    yos: 'zom',
    yuu: 'yug',
  };

  /**
   * Mapping of deprecated region subtags to their current equivalents.
   * Based on ISO 3166-1 updates and country code changes.
   */
  private static _deprecatedRegionSubtagMap: { [key: string]: string } = {
    BU: 'MM',  // Burma → Myanmar
    DD: 'DE',  // East Germany → Germany
    FX: 'FR',  // Metropolitan France → France
    TP: 'TL',  // East Timor → Timor-Leste
    YD: 'YE',  // South Yemen → Yemen
    ZR: 'CD',  // Zaire → Democratic Republic of Congo
  };

  /** Optional ISO 15924 script code (e.g., 'Latn', 'Cyrl', 'Hans') */
  public scriptCode?: string;

  /**
   * Creates a new Locale instance with the specified language and optional country code.
   * Automatically validates the language code and stores the original values for later migration.
   * 
   * @param languageCode - ISO 639-1 or ISO 639-2 language code (e.g., 'en', 'zh', 'ar')
   * @param countryCode - Optional ISO 3166-1 alpha-2 country code (e.g., 'US', 'CN', 'SA')
   * 
   * @throws {Error} When languageCode is empty or undefined
   * 
   * @example Creating locales for different regions
   * ```typescript
   * // Major world languages
   * const english = new Locale('en', 'US');
   * const chinese = new Locale('zh', 'CN');
   * const arabic = new Locale('ar', 'SA');
   * const spanish = new Locale('es', 'ES');
   * const hindi = new Locale('hi', 'IN');
   * 
   * // Languages without specific country
   * const esperanto = new Locale('eo');
   * const latin = new Locale('la');
   * ```
   * 
   * @example Error handling
   * ```typescript
   * try {
   *   const invalidLocale = new Locale(''); // Throws error
   * } catch (error) {
   *   console.error('Language code cannot be empty');
   * }
   * 
   * try {
   *   const validLocale = new Locale('en', 'US');
   *   console.log('Locale created successfully');
   * } catch (error) {
   *   console.error('Failed to create locale:', error.message);
   * }
   * ```
   */
  constructor(languageCode: string, countryCode?: string) {
    if (!languageCode) throw new Error('languageCode cannot be empty');
    this._languageCode = languageCode;
    this._countryCode = countryCode;
    this.scriptCode = null;
  }

  /** Private storage for the original language code before migration */
  private _languageCode: string;

  /**
   * Gets the current language code, automatically migrating deprecated codes to their modern equivalents.
   * Uses the deprecated language subtag mapping to ensure compatibility with current standards.
   * 
   * @returns Current ISO 639-1 or ISO 639-2 language code
   * 
   * @example Language code migration
   * ```typescript
   * // Deprecated codes are automatically migrated
   * const indonesian = new Locale('in', 'ID'); // 'in' is deprecated
   * console.log(indonesian.languageCode); // 'id' (current)
   * 
   * const hebrew = new Locale('iw', 'IL'); // 'iw' is deprecated
   * console.log(hebrew.languageCode); // 'he' (current)
   * 
   * const yiddish = new Locale('ji'); // 'ji' is deprecated
   * console.log(yiddish.languageCode); // 'yi' (current)
   * ```
   * 
   * @example Modern codes remain unchanged
   * ```typescript
   * const english = new Locale('en', 'US');
   * const french = new Locale('fr', 'FR');
   * const japanese = new Locale('ja', 'JP');
   * 
   * console.log(english.languageCode);  // 'en' (unchanged)
   * console.log(french.languageCode);   // 'fr' (unchanged)
   * console.log(japanese.languageCode); // 'ja' (unchanged)
   * ```
   */
  get languageCode(): string {
    return (
      Locale._deprecatedLanguageSubtagMap[this._languageCode] ||
      this._languageCode
    );
  }

  /** Private storage for the original country code before migration */
  private _countryCode?: string;

  /**
   * Gets the current country code, automatically migrating deprecated codes to their modern equivalents.
   * Uses the deprecated region subtag mapping to ensure compatibility with current ISO 3166-1 standards.
   * 
   * @returns Current ISO 3166-1 alpha-2 country code, or undefined if not specified
   * 
   * @example Country code migration
   * ```typescript
   * // Deprecated region codes are automatically migrated
   * const burma = new Locale('my', 'BU'); // 'BU' is deprecated
   * console.log(burma.countryCode); // 'MM' (Myanmar)
   * 
   * const eastGermany = new Locale('de', 'DD'); // 'DD' is deprecated
   * console.log(eastGermany.countryCode); // 'DE' (Germany)
   * 
   * const zaire = new Locale('fr', 'ZR'); // 'ZR' is deprecated
   * console.log(zaire.countryCode); // 'CD' (Democratic Republic of Congo)
   * ```
   * 
   * @example Modern codes remain unchanged
   * ```typescript
   * const usa = new Locale('en', 'US');
   * const canada = new Locale('en', 'CA');
   * const australia = new Locale('en', 'AU');
   * 
   * console.log(usa.countryCode);       // 'US' (unchanged)
   * console.log(canada.countryCode);    // 'CA' (unchanged)
   * console.log(australia.countryCode); // 'AU' (unchanged)
   * ```
   */
  get countryCode(): string | undefined {
    return (
      Locale._deprecatedRegionSubtagMap[this._countryCode ?? ''] ||
      this._countryCode
    );
  }

  /**
   * Gets the default display language name in English.
   * Uses the country-codes-list package to resolve language names from ISO codes.
   * 
   * @returns English language name, or undefined if not found
   * 
   * @example Getting English language names
   * ```typescript
   * const locales = [
   *   new Locale('en', 'US'),  // English
   *   new Locale('zh', 'CN'),  // Chinese
   *   new Locale('ar', 'SA'),  // Arabic
   *   new Locale('hi', 'IN'),  // Hindi
   *   new Locale('es', 'MX'),  // Spanish
   *   new Locale('fr', 'FR'),  // French
   *   new Locale('ru', 'RU'),  // Russian
   *   new Locale('ja', 'JP')   // Japanese
   * ];
   * 
   * locales.forEach(locale => {
   *   console.log(`${locale.languageCode}: ${locale.defaultDisplayLanguage}`);
   * });
   * ```
   */
  get defaultDisplayLanguage(): string {
    const languages = customList(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      'officialLanguageCode',
      '{officialLanguageNameEn}',
    );
    return languages[this._languageCode];
  }

  /**
   * Gets the native display language name in the language's own script.
   * Uses the country-codes-list package to resolve native language names from ISO codes.
   * 
   * @returns Native language name, or undefined if not found
   * 
   * @example Getting native language names
   * ```typescript
   * const locales = [
   *   new Locale('zh', 'CN'),  // 中文
   *   new Locale('ar', 'SA'),  // العربية
   *   new Locale('hi', 'IN'),  // हिन्दी
   *   new Locale('ja', 'JP'),  // 日本語
   *   new Locale('ko', 'KR'),  // 한국어
   *   new Locale('th', 'TH'),  // ไทย
   *   new Locale('ru', 'RU'),  // Русский
   *   new Locale('fr', 'FR')   // Français
   * ];
   * 
   * locales.forEach(locale => {
   *   console.log(`${locale.languageCode}: ${locale.nativeDisplayLanguage}`);
   * });
   * ```
   * 
   * @example Creating bilingual UI elements
   * ```typescript
   * const createLanguageOption = (locale: Locale) => ({
   *   value: locale.languageCode,
   *   label: `${locale.defaultDisplayLanguage} (${locale.nativeDisplayLanguage})`,
   *   nativeLabel: locale.nativeDisplayLanguage
   * });
   * 
   * const chinese = new Locale('zh', 'CN');
   * const option = createLanguageOption(chinese);
   * // { value: 'zh', label: 'Chinese (中文)', nativeLabel: '中文' }
   * ```
   */
  get nativeDisplayLanguage(): string {
    const languages = customList(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      'officialLanguageCode',
      '{officialLanguageNameLocal}',
    );
    return languages[this._languageCode];
  }

  /**
   * Gets the default display country name in English.
   * Uses the country-codes-list package to resolve country names from ISO codes.
   * 
   * @returns English country name, or undefined if not found
   * 
   * @example Getting English country names
   * ```typescript
   * const locales = [
   *   new Locale('en', 'US'),  // United States
   *   new Locale('en', 'GB'),  // United Kingdom
   *   new Locale('en', 'CA'),  // Canada
   *   new Locale('en', 'AU'),  // Australia
   *   new Locale('fr', 'FR'),  // France
   *   new Locale('fr', 'CA'),  // Canada
   *   new Locale('es', 'ES'),  // Spain
   *   new Locale('es', 'MX')   // Mexico
   * ];
   * 
   * locales.forEach(locale => {
   *   console.log(`${locale.toLanguageTag()}: ${locale.defaultDisplayCountry}`);
   * });
   * ```
   */
  get defaultDisplayCountry(): string {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const countries = customList('countryCode', '{countryNameEn}');
    return countries[this._countryCode];
  }

  /**
   * Gets the native display country name in the local language.
   * Uses the country-codes-list package to resolve native country names from ISO codes.
   * 
   * @returns Native country name, or undefined if not found
   * 
   * @example Getting native country names
   * ```typescript
   * const locales = [
   *   new Locale('zh', 'CN'),  // 中国
   *   new Locale('ja', 'JP'),  // 日本
   *   new Locale('ko', 'KR'),  // 대한민국
   *   new Locale('ar', 'SA'),  // السعودية
   *   new Locale('ru', 'RU'),  // Россия
   *   new Locale('fr', 'FR'),  // France
   *   new Locale('de', 'DE'),  // Deutschland
   *   new Locale('it', 'IT')   // Italia
   * ];
   * 
   * locales.forEach(locale => {
   *   console.log(`${locale.languageCode}-${locale.countryCode}: ${locale.nativeDisplayCountry}`);
   * });
   * ```
   */
  get nativeDisplayCountry(): string {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const countries = customList('countryCode', '{countryNameLocal}');
    return countries[this._countryCode];
  }

  /**
   * Gets the default display script name in English.
   * Uses the country-codes-list package to resolve script names from ISO codes.
   * 
   * @returns English script name, or undefined if not found
   */
  get defaultDisplayScript(): string {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const scripts = customList('countryCode', '{countryNameLocal}');
    return scripts[this.scriptCode];
  }

  /**
   * Gets the native display script name in the local language.
   * Uses the country-codes-list package to resolve native script names from ISO codes.
   * 
   * @returns Native script name, or undefined if not found
   */
  get nativeDisplayScript(): string {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const scripts = customList('countryCode', '{countryNameLocal}');
    return scripts[this.scriptCode];
  }

  /**
   * Factory method to create a Locale instance from individual subtags.
   * Provides flexible locale creation with optional script and country components
   * following RFC 5646 language tag structure.
   * 
   * @param options - Locale subtag configuration
   * @param options.languageCode - ISO 639-1 or ISO 639-2 language code (default: 'und' for undetermined)
   * @param options.scriptCode - Optional ISO 15924 script code
   * @param options.countryCode - Optional ISO 3166-1 alpha-2 country code
   * @returns New Locale instance with the specified subtags
   * 
   * @throws {Error} When languageCode is empty
   * 
   * @example Creating locales with script codes
   * ```typescript
   * // Chinese with different scripts
   * const simplifiedChinese = Locale.fromSubtags({
   *   languageCode: 'zh',
   *   scriptCode: 'Hans',
   *   countryCode: 'CN'
   * });
   * 
   * const traditionalChinese = Locale.fromSubtags({
   *   languageCode: 'zh',
   *   scriptCode: 'Hant',
   *   countryCode: 'TW'
   * });
   * 
   * console.log(simplifiedChinese.toLanguageTag());  // "zh-Hans-CN"
   * console.log(traditionalChinese.toLanguageTag()); // "zh-Hant-TW"
   * ```
   * 
   * @example Creating locales for different scripts
   * ```typescript
   * // Serbian in different scripts
   * const serbianCyrillic = Locale.fromSubtags({
   *   languageCode: 'sr',
   *   scriptCode: 'Cyrl',
   *   countryCode: 'RS'
   * });
   * 
   * const serbianLatin = Locale.fromSubtags({
   *   languageCode: 'sr',
   *   scriptCode: 'Latn',
   *   countryCode: 'RS'
   * });
   * 
   * // Uzbek in different scripts
   * const uzbekCyrillic = Locale.fromSubtags({
   *   languageCode: 'uz',
   *   scriptCode: 'Cyrl',
   *   countryCode: 'UZ'
   * });
   * 
   * const uzbekLatin = Locale.fromSubtags({
   *   languageCode: 'uz',
   *   scriptCode: 'Latn',
   *   countryCode: 'UZ'
   * });
   * ```
   * 
   * @example Minimal locale creation
   * ```typescript
   * // Language only
   * const esperanto = Locale.fromSubtags({
   *   languageCode: 'eo'
   * });
   * 
   * // Language with country
   * const canadianFrench = Locale.fromSubtags({
   *   languageCode: 'fr',
   *   countryCode: 'CA'
   * });
   * 
   * // Undetermined language (fallback)
   * const undetermined = Locale.fromSubtags({});
   * console.log(undetermined.languageCode); // 'und'
   * ```
   */
  static fromSubtags({
    languageCode = 'und',
    scriptCode,
    countryCode,
  }: {
    languageCode?: string;
    scriptCode?: string;
    countryCode?: string;
  }): Locale {
    if (!languageCode) throw new Error('languageCode cannot be empty');
    // if (scriptCode !== undefined) throw new Error("scriptCode cannot be empty");
    // if (countryCode !== undefined) throw new Error("countryCode cannot be empty");
    const locale = new Locale(languageCode, countryCode);
    locale.scriptCode = scriptCode;
    return locale;
  }

  /**
   * Compares this locale with another locale for equality.
   * Considers language code, script code, and country code with flexible country code handling
   * for cases where empty strings and undefined values should be treated as equivalent.
   * 
   * @param other - Another Locale instance to compare against
   * @returns True if the locales are considered equal, false otherwise
   * 
   * @example Basic locale comparison
   * ```typescript
   * const locale1 = new Locale('en', 'US');
   * const locale2 = new Locale('en', 'US');
   * const locale3 = new Locale('en', 'GB');
   * 
   * console.log(locale1.equals(locale2)); // true
   * console.log(locale1.equals(locale3)); // false
   * ```
   * 
   * @example Deprecated code comparison
   * ```typescript
   * // Deprecated codes are normalized before comparison
   * const indonesian1 = new Locale('in', 'ID'); // Deprecated 'in'
   * const indonesian2 = new Locale('id', 'ID'); // Current 'id'
   * 
   * console.log(indonesian1.equals(indonesian2)); // true (normalized)
   * 
   * const burmese1 = new Locale('my', 'BU'); // Deprecated 'BU'
   * const burmese2 = new Locale('my', 'MM'); // Current 'MM'
   * 
   * console.log(burmese1.equals(burmese2)); // true (normalized)
   * ```
   * 
   * @example Script code comparison
   * ```typescript
   * const chinese1 = Locale.fromSubtags({
   *   languageCode: 'zh',
   *   scriptCode: 'Hans',
   *   countryCode: 'CN'
   * });
   * 
   * const chinese2 = Locale.fromSubtags({
   *   languageCode: 'zh',
   *   scriptCode: 'Hans',
   *   countryCode: 'CN'
   * });
   * 
   * const chinese3 = Locale.fromSubtags({
   *   languageCode: 'zh',
   *   scriptCode: 'Hant',
   *   countryCode: 'CN'
   * });
   * 
   * console.log(chinese1.equals(chinese2)); // true
   * console.log(chinese1.equals(chinese3)); // false (different script)
   * ```
   * 
   * @example Flexible country code handling
   * ```typescript
   * const locale1 = new Locale('en', '');
   * const locale2 = new Locale('en');
   * 
   * console.log(locale1.equals(locale2)); // true (empty string equals undefined)
   * ```
   */
  equals(other: Locale): boolean {
    if (this === other) {
      return true;
    }
    const thisCountryCode = this.countryCode;
    const otherCountryCode = other.countryCode;
    return (
      other.languageCode === this.languageCode &&
      other.scriptCode === this.scriptCode &&
      (other.countryCode === thisCountryCode ||
        (otherCountryCode !== undefined &&
          otherCountryCode === '' &&
          thisCountryCode === undefined) ||
        (thisCountryCode !== undefined &&
          thisCountryCode === '' &&
          other.countryCode === undefined))
    );
  }

  /**
   * Returns the string representation of this locale as an RFC 5646 language tag.
   * Delegates to toLanguageTag() for consistent formatting.
   * 
   * @returns RFC 5646 compliant language tag string
   * 
   * @example String conversion
   * ```typescript
   * const locale = new Locale('en', 'US');
   * console.log(locale.toString()); // "en-US"
   * console.log(`User locale: ${locale}`); // "User locale: en-US"
   * ```
   */
  toString(): string {
    const localeString = this.toLanguageTag();
    return localeString;
  }

  /**
   * Formats this locale as an RFC 5646 compliant language tag.
   * Combines language, script, and country codes in the proper order:
   * language[-script][-country]
   * 
   * @returns RFC 5646 language tag string
   * 
   * @example Basic language tags
   * ```typescript
   * // Language only
   * const esperanto = new Locale('eo');
   * console.log(esperanto.toLanguageTag()); // "eo"
   * 
   * // Language + country
   * const american = new Locale('en', 'US');
   * console.log(american.toLanguageTag()); // "en-US"
   * 
   * const british = new Locale('en', 'GB');
   * console.log(british.toLanguageTag()); // "en-GB"
   * ```
   * 
   * @example Language tags with script codes
   * ```typescript
   * // Language + script + country
   * const simplifiedChinese = Locale.fromSubtags({
   *   languageCode: 'zh',
   *   scriptCode: 'Hans',
   *   countryCode: 'CN'
   * });
   * console.log(simplifiedChinese.toLanguageTag()); // "zh-Hans-CN"
   * 
   * // Language + script (no country)
   * const chineseSimplified = Locale.fromSubtags({
   *   languageCode: 'zh',
   *   scriptCode: 'Hans'
   * });
   * console.log(chineseSimplified.toLanguageTag()); // "zh-Hans"
   * ```
   * 
   * @example Usage in TTS applications
   * ```typescript
   * // Generate voice identifiers
   * const voices = [
   *   new Locale('en', 'US'),
   *   new Locale('zh', 'CN'),
   *   new Locale('ar', 'SA')
   * ];
   * 
   * const voiceIds = voices.map(locale => `voice_${locale.toLanguageTag()}`);
   * // ['voice_en-US', 'voice_zh-CN', 'voice_ar-SA']
   * 
   * // Use as cache keys
   * const cacheKey = `tts_voices_${locale.toLanguageTag()}`;
   * ```
   */
  toLanguageTag(): string {
    let result = this.languageCode;
    if (this.scriptCode) {
      result += `-${this.scriptCode}`;
    }
    if (this._countryCode) {
      result += `-${this.countryCode}`;
    }
    return result;
  }
}
