import { VoiceLocale } from './locale_model.js';
import { Locale } from './locale_extension.js';

export class VoiceLocaleHelpers {
  private constructor() {}

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

  static segmentsToLocale(localeSegments: string[]): Locale {
    const languageCodeMap: { [key: string]: string } = {
      cmn: 'zh',
      arb: 'ar',
    };

    const countryCodeMap: { [key: string]: string | null } = {
      XA: null,
    };

    let languageCode = localeSegments[0];
    let scriptCode: string | undefined;
    let countryCode: string | undefined;

    switch (localeSegments.length) {
      case 2:
        if (localeSegments[1].toUpperCase() == localeSegments[1]) {
          countryCode = localeSegments[1];
        } else {
          scriptCode = localeSegments[1];
        }
        break;
      case 3:
        if (localeSegments[1].toUpperCase() == localeSegments[1]) {
          countryCode = localeSegments[1];
        } else {
          scriptCode = localeSegments[1];
        }

        if (localeSegments[2].toUpperCase() == localeSegments[2]) {
          countryCode = localeSegments[2];
        }
        break;
      case 4:
        scriptCode = localeSegments[1];
        countryCode = localeSegments[2];
        break;
    }

    if (languageCodeMap[languageCode]) {
      languageCode = languageCodeMap[languageCode];
    }

    if (countryCodeMap[countryCode]) {
      countryCode = countryCodeMap[countryCode];
    }

    return Locale.fromSubtags({
      languageCode: languageCode || 'en',
      scriptCode: scriptCode || null,
      countryCode: countryCode || null,
    });
  }

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
