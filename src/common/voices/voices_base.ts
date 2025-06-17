import { VoiceLocale } from '../locale/locale_model.js';

export interface VoiceFilterOptions {
  providers?: string[];
  genders?: string[];
  engines?: string[];
  locales?: string[];
  languageCodes?: string[];
  regions?: string[];
  minSampleRate?: number;
  maxSampleRate?: number;
  nameContains?: string;
  excludeNames?: string[];
  styles?: string[];
  neural?: boolean;
  premium?: boolean;
  status?: string[];
  wordsPerMinuteRange?: { min?: number; max?: number };
}

export class VoiceBase {
  provider: string;
  engines: string[];
  code: string;
  name: string;
  nativeName: string;
  gender: string;
  locale: VoiceLocale;

  constructor({
    provider,
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
    this.provider = provider;
    this.engines = engines;
    this.code = code;
    this.name = name;
    this.nativeName = nativeName;
    this.gender = gender;
    this.locale = locale;
  }

  /**
   * Check if this voice matches the given filter criteria
   */
  matchesFilter(filter: VoiceFilterOptions): boolean {
    // Provider filter
    if (filter.providers && filter.providers.length > 0) {
      if (!filter.providers.includes(this.provider.toLowerCase())) {
        return false;
      }
    }

    // Gender filter
    if (filter.genders && filter.genders.length > 0) {
      if (!filter.genders.map(g => g.toLowerCase()).includes(this.gender.toLowerCase())) {
        return false;
      }
    }

    // Engine filter
    if (filter.engines && filter.engines.length > 0) {
      const hasMatchingEngine = this.engines.some(engine =>
        filter.engines!.map(e => e.toLowerCase()).includes(engine.toLowerCase())
      );
      if (!hasMatchingEngine) {
        return false;
      }
    }

    // Locale filter
    if (filter.locales && filter.locales.length > 0) {
      if (!filter.locales.map(l => l.toLowerCase()).includes(this.locale.code.toLowerCase())) {
        return false;
      }
    }

    // Language code filter
    if (filter.languageCodes && filter.languageCodes.length > 0) {
      const languageCode = this.locale.code.split('-')[0];
      if (!filter.languageCodes.map(l => l.toLowerCase()).includes(languageCode.toLowerCase())) {
        return false;
      }
    }

    // Region filter
    if (filter.regions && filter.regions.length > 0) {
      const region = this.locale.code.split('-')[1];
      if (region && !filter.regions.map(r => r.toLowerCase()).includes(region.toLowerCase())) {
        return false;
      }
    }

    // Name contains filter
    if (filter.nameContains) {
      if (!this.name.toLowerCase().includes(filter.nameContains.toLowerCase()) &&
          !this.nativeName.toLowerCase().includes(filter.nameContains.toLowerCase())) {
        return false;
      }
    }

    // Exclude names filter
    if (filter.excludeNames && filter.excludeNames.length > 0) {
      const excludeNamesLower = filter.excludeNames.map(n => n.toLowerCase());
      if (excludeNamesLower.includes(this.name.toLowerCase()) ||
          excludeNamesLower.includes(this.nativeName.toLowerCase())) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get voice quality rating based on engine and sample rate
   */
  getQualityRating(): number {
    let rating = 3; // Base rating

    // Engine-based rating
    if (this.engines.some(e => e.toLowerCase().includes('neural'))) {
      rating += 2;
    } else if (this.engines.some(e => e.toLowerCase().includes('premium'))) {
      rating += 1;
    }

    // Sample rate consideration (if available in derived classes)
    const sampleRate = this.getSampleRate();
    if (sampleRate) {
      if (sampleRate >= 24000) rating += 1;
      if (sampleRate >= 44100) rating += 1;
    }

    return Math.min(rating, 5); // Cap at 5
  }

  /**
   * Get sample rate - to be overridden by provider-specific classes
   */
  protected getSampleRate(): number | undefined {
    return undefined;
  }

  /**
   * Check if this is a neural voice
   */
  isNeural(): boolean {
    return this.engines.some(engine => 
      engine.toLowerCase().includes('neural') || 
      engine.toLowerCase().includes('premium')
    );
  }

  /**
   * Get voice characteristics as tags
   */
  getTags(): string[] {
    const tags: string[] = [
      this.provider.toLowerCase(),
      this.gender.toLowerCase(),
      this.locale.code.toLowerCase(),
      ...this.engines.map(e => e.toLowerCase())
    ];

    if (this.isNeural()) {
      tags.push('neural');
    }

    return tags;
  }

  /**
   * Get similarity score with another voice (0-1)
   */
  getSimilarityScore(other: VoiceBase): number {
    let score = 0;
    const maxScore = 7;

    // Same provider
    if (this.provider === other.provider) score += 2;

    // Same gender
    if (this.gender.toLowerCase() === other.gender.toLowerCase()) score += 2;

    // Same language
    const thisLang = this.locale.code.split('-')[0];
    const otherLang = other.locale.code.split('-')[0];
    if (thisLang === otherLang) score += 1;

    // Same locale
    if (this.locale.code === other.locale.code) score += 1;

    // Similar engines
    const commonEngines = this.engines.filter(e1 => 
      other.engines.some(e2 => e1.toLowerCase() === e2.toLowerCase())
    );
    if (commonEngines.length > 0) score += 1;

    return score / maxScore;
  }
}
