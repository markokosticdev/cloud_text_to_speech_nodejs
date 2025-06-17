import { VoiceLocale } from '../../common/locale/locale_model.js';
import { TtsProviders } from '../../common/tts/tts_providers.js';
import { VoiceLocaleHelpers } from '../../common/locale/locale_helpers.js';
import { VoiceBase, VoiceFilterOptions } from '../../common/voices/voices_base.js';

export class VoiceGoogle extends VoiceBase {
  sampleRateHertz?: string;

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
   * Override to provide Google-specific sample rate
   */
  protected getSampleRate(): number | undefined {
    if (this.sampleRateHertz) {
      return parseInt(this.sampleRateHertz, 10);
    }
    return undefined;
  }

  /**
   * Override to add Google-specific filtering
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

  private static _toEngines(name: string): string[] {
    if (name.includes('-')) {
      const nameSegments = name.split('-');
      return [nameSegments[2].toLowerCase()];
    } else {
      return [name.toLowerCase()];
    }
  }

  private static _toGender(ssmlGender: string): string {
    const lowercase = ssmlGender.toLowerCase();
    return lowercase.charAt(0).toUpperCase() + lowercase.slice(1);
  }

  private static _toLocale(languageCodes: string[]): VoiceLocale {
    const localeSegments = languageCodes[0].split('-');
    const localeObj = VoiceLocaleHelpers.segmentsToLocale(localeSegments);
    return VoiceLocaleHelpers.localeToVoiceLocale(localeObj);
  }

  private static _toSampleRateHertz(
    naturalSampleRateHertz: number,
  ): string | undefined {
    return naturalSampleRateHertz ? naturalSampleRateHertz.toString() : undefined;
  }
}
