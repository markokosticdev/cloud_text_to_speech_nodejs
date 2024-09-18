import { VoiceUniversal } from '../../universal/voices/voice_model.js';
import { VoiceLocale } from '../../common/locale/locale_model.js';
import { TtsProviders } from '../../common/tts/tts_providers.js';
import { VoiceLocaleHelpers } from '../../common/locale/locale_helpers.js';

export class VoiceMicrosoft extends VoiceUniversal {
  sampleRateHertz?: string;
  styleList?: string[];
  status?: string;
  wordsPerMinute?: string;

  constructor({
    provider = TtsProviders.microsoft,
    engines,
    code,
    name,
    nativeName,
    gender,
    locale,
    sampleRateHertz,
    styleList,
    status,
    wordsPerMinute,
  }: {
    provider: string;
    engines: string[];
    code: string;
    name: string;
    nativeName: string;
    gender: string;
    locale: VoiceLocale;
    sampleRateHertz?: string;
    styleList?: string[];
    status?: string;
    wordsPerMinute?: string;
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
    this.styleList = styleList;
    this.status = status;
    this.wordsPerMinute = wordsPerMinute;
  }

  static fromJson(json: never): VoiceMicrosoft {
    const engines = this._toEngines(json['VoiceType']);
    const locale = this._toLocale(json['Locale']);

    return new VoiceMicrosoft({
      provider: json['provider'] || TtsProviders.microsoft,
      engines,
      code: json['ShortName'],
      name: json['DisplayName'],
      nativeName: json['LocalName'],
      gender: json['Gender'],
      locale,
      sampleRateHertz: json['SampleRateHertz'],
      styleList: json['StyleList'],
      status: json['Status'],
      wordsPerMinute: json['WordsPerMinute'],
    });
  }

  private static _toEngines(voiceType: string): string[] {
    return [voiceType.toLowerCase()];
  }

  private static _toLocale(locale: string): VoiceLocale {
    const localeSegments = locale.split('-');
    const localeObj = VoiceLocaleHelpers.segmentsToLocale(localeSegments);
    return VoiceLocaleHelpers.localeToVoiceLocale(localeObj);
  }
}
