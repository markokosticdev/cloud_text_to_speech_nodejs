import { VoiceLocale } from '../../common/locale/locale_model.js';
import { TtsProviders } from '../../common/tts/tts_providers.js';
import { VoiceLocaleHelpers } from '../../common/locale/locale_helpers.js';
import { VoiceBase } from '../../common/voices/voices_base.js';

export class VoiceAmazon extends VoiceBase {
  constructor({
    provider = TtsProviders.amazon,
    engines,
    code,
    name,
    nativeName,
    gender,
    locale,
  }: {
    provider: string;
    engines: string[];
    code: string;
    name: string;
    nativeName: string;
    gender: string;
    locale: VoiceLocale;
  }) {
    super({
      provider,
      engines,
      code,
      name,
      nativeName,
      gender,
      locale,
    });
  }

  static fromJson(json: never): VoiceAmazon {
    const engines = this._toEngines(json['SupportedEngines']);
    const locale = this._toLocale(json['LanguageCode']);

    return new VoiceAmazon({
      provider: json['provider'] || TtsProviders.amazon,
      engines,
      code: json['Id'],
      name: json['Id'],
      nativeName: json['Name'],
      gender: json['Gender'],
      locale,
    });
  }

  private static _toEngines(supportedEngines: string[]): string[] {
    if (supportedEngines.length > 0) {
      return supportedEngines.map((e) => e.toLowerCase());
    }
    return [];
  }

  private static _toLocale(languageCode: string): VoiceLocale {
    const localeSegments = languageCode.split('-');
    const localeObj = VoiceLocaleHelpers.segmentsToLocale(localeSegments);
    return VoiceLocaleHelpers.localeToVoiceLocale(localeObj);
  }
}
