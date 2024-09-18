import { VoiceUniversal } from '../../universal/voices/voice_model.js';
import { VoiceLocale } from '../../common/locale/locale_model.js';
import { TtsProviders } from '../../common/tts/tts_providers.js';
import { VoiceLocaleHelpers } from '../../common/locale/locale_helpers.js';

export class VoiceGoogle extends VoiceUniversal {
  sampleRateHertz?: string;

  constructor({
    provider = TtsProviders.google,
    engines,
    code,
    name,
    nativeName,
    gender,
    locale,
    sampleRateHertz,
  }: {
    provider: string;
    engines: string[];
    code: string;
    name: string;
    nativeName: string;
    gender: string;
    locale: VoiceLocale;
    sampleRateHertz?: string;
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
    this.sampleRateHertz = sampleRateHertz;
  }

  static fromJson(json: never): VoiceGoogle {
    const engines = this._toEngines(json['name']);
    const gender = this._toGender(json['ssmlGender']);
    const locale = this._toLocale(json['languageCodes']);

    return new VoiceGoogle({
      provider: json['provider'] || TtsProviders.google,
      engines,
      code: json['name'],
      name: json['name'],
      nativeName: json['name'],
      gender,
      locale,
      sampleRateHertz: this._toSampleRateHertz(json['naturalSampleRateHertz']),
    });
  }

  private static _toEngines(name: string): string[] {
    const nameSegments = name.split('-');
    return [nameSegments[2].toLowerCase()];
  }

  private static _toGender(ssmlGender: string): string {
    const lowercase = ssmlGender.toLowerCase();
    return lowercase.charAt(0).toUpperCase() + lowercase.slice(1);
  }

  private static _toLocale(languageCodes: string[]): VoiceLocale {
    if (languageCodes.length > 0) {
      const localeSegments = languageCodes[0].split('-');
      const localeObj = VoiceLocaleHelpers.segmentsToLocale(localeSegments);
      return VoiceLocaleHelpers.localeToVoiceLocale(localeObj);
    }
    return new VoiceLocale({ code: '' });
  }

  private static _toSampleRateHertz(naturalSampleRateHertz: number): string {
    return naturalSampleRateHertz.toString();
  }
}
