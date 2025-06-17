import { VoiceLocale } from '../../common/locale/locale_model.js';
import { TtsProviders } from '../../common/tts/tts_providers.js';
import { VoiceLocaleHelpers } from '../../common/locale/locale_helpers.js';
import { VoiceBase, VoiceFilterOptions } from '../../common/voices/voices_base.js';

export class VoiceMicrosoft extends VoiceBase {
  sampleRateHertz?: string;
  styleList?: string[];
  status?: string;
  wordsPerMinute?: string;

  constructor({
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
      provider: TtsProviders.microsoft,
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

  /**
   * Override to provide Microsoft-specific sample rate
   */
  protected getSampleRate(): number | undefined {
    if (this.sampleRateHertz) {
      return parseInt(this.sampleRateHertz, 10);
    }
    return undefined;
  }

  /**
   * Override to add Microsoft-specific filtering
   */
  matchesFilter(filter: VoiceFilterOptions): boolean {
    // Call base filtering first
    if (!super.matchesFilter(filter)) {
      return false;
    }

    // Microsoft-specific sample rate filtering
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

    // Style filtering
    if (filter.styles && filter.styles.length > 0 && this.styleList) {
      const hasMatchingStyle = this.styleList.some(style =>
        filter.styles!.map(s => s.toLowerCase()).includes(style.toLowerCase())
      );
      if (!hasMatchingStyle) {
        return false;
      }
    }

    // Status filtering
    if (filter.status && filter.status.length > 0 && this.status) {
      if (!filter.status.map(s => s.toLowerCase()).includes(this.status.toLowerCase())) {
        return false;
      }
    }

    // Words per minute filtering
    if (filter.wordsPerMinuteRange && this.wordsPerMinute) {
      const wpm = parseInt(this.wordsPerMinute, 10);
      if (filter.wordsPerMinuteRange.min && wpm < filter.wordsPerMinuteRange.min) {
        return false;
      }
      if (filter.wordsPerMinuteRange.max && wpm > filter.wordsPerMinuteRange.max) {
        return false;
      }
    }

    // Neural/Premium filtering for Microsoft
    if (filter.neural !== undefined) {
      const isNeural = this.engines.some(e => 
        e.toLowerCase().includes('neural') || 
        e.toLowerCase().includes('premium')
      );
      if (filter.neural !== isNeural) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get available styles for this voice
   */
  getAvailableStyles(): string[] {
    return this.styleList || [];
  }

  /**
   * Get words per minute as number
   */
  getWordsPerMinute(): number | undefined {
    return this.wordsPerMinute ? parseInt(this.wordsPerMinute, 10) : undefined;
  }

  static fromJson(json: never): VoiceMicrosoft {
    const engines = this._toEngines(json['VoiceType']);
    const locale = this._toLocale(json['Locale']);

    return new VoiceMicrosoft({
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
