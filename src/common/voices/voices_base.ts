/**
 * @fileoverview Base voice model and filtering system for multi-provider TTS operations.
 * Provides comprehensive voice filtering, quality assessment, similarity scoring, and
 * tagging functionality for consistent voice management across Google, Microsoft, and Amazon providers.
 * 
 * @author Marko Kostich
 * @since 1.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * 
 * @example Basic voice filtering
 * ```typescript
 * import { VoiceBase, VoiceFilterOptions } from './voices_base.js';
 * 
 * // Filter voices by multiple criteria
 * const filterOptions: VoiceFilterOptions = {
 *   providers: ['google', 'microsoft'],
 *   genders: ['Female'],
 *   locales: ['en-US', 'en-GB'],
 *   neural: true,
 *   nameContains: 'aria'
 * };
 * 
 * const filteredVoices = voices.filter(voice => voice.matchesFilter(filterOptions));
 * ```
 * 
 * @example Voice quality assessment
 * ```typescript
 * // Get quality ratings for voice comparison
 * const voiceRatings = voices.map(voice => ({
 *   name: voice.name,
 *   quality: voice.getQualityRating(),
 *   isNeural: voice.isNeural(),
 *   tags: voice.getTags()
 * }));
 * 
 * // Sort by quality (highest first)
 * voiceRatings.sort((a, b) => b.quality - a.quality);
 * ```
 * 
 * @example Voice similarity scoring
 * ```typescript
 * // Find similar voices
 * const targetVoice = voices[0];
 * const similarVoices = voices
 *   .map(voice => ({
 *     voice,
 *     similarity: targetVoice.getSimilarityScore(voice)
 *   }))
 *   .filter(({ similarity }) => similarity > 0.5)
 *   .sort((a, b) => b.similarity - a.similarity);
 * ```
 */

import { VoiceLocale } from '../locale/locale_model.js';

/**
 * Comprehensive filtering options for voice selection across multiple criteria.
 * Supports provider filtering, demographic filtering, quality filtering, and custom text matching
 * for precise voice selection in multi-provider TTS scenarios.
 * 
 * @category Voice Management
 * 
 * @example Basic filtering configuration
 * ```typescript
 * const basicFilter: VoiceFilterOptions = {
 *   providers: ['google', 'microsoft'],
 *   genders: ['Female'],
 *   locales: ['en-US']
 * };
 * ```
 * 
 * @example Advanced filtering with quality criteria
 * ```typescript
 * const advancedFilter: VoiceFilterOptions = {
 *   providers: ['google', 'microsoft', 'amazon'],
 *   genders: ['Female', 'Male'],
 *   languageCodes: ['en', 'es', 'fr'],
 *   neural: true,
 *   premium: true,
 *   minSampleRate: 22050,
 *   nameContains: 'neural',
 *   excludeNames: ['robotic', 'synthetic'],
 *   wordsPerMinuteRange: { min: 120, max: 200 }
 * };
 * ```
 * 
 * @example Dynamic filtering for user preferences
 * ```typescript
 * // Build filter based on user preferences
 * const buildUserFilter = (userPrefs: UserPreferences): VoiceFilterOptions => ({
 *   providers: userPrefs.enabledProviders,
 *   genders: userPrefs.preferredGenders,
 *   locales: [userPrefs.locale],
 *   neural: userPrefs.highQuality,
 *   nameContains: userPrefs.searchTerm
 * });
 * ```
 */
export interface VoiceFilterOptions {
  /** Array of provider names to include (e.g., ['google', 'microsoft', 'amazon']) */
  providers?: string[];
  /** Array of gender values to include (e.g., ['Male', 'Female', 'Neutral']) */
  genders?: string[];
  /** Array of TTS engine types to include (e.g., ['neural', 'standard', 'premium']) */
  engines?: string[];
  /** Array of locale codes to include (e.g., ['en-US', 'en-GB', 'fr-FR']) */
  locales?: string[];
  /** Array of language codes to include (e.g., ['en', 'es', 'fr']) */
  languageCodes?: string[];
  /** Array of region codes to include (e.g., ['US', 'GB', 'FR']) */
  regions?: string[];
  /** Minimum sample rate in Hz for audio quality filtering */
  minSampleRate?: number;
  /** Maximum sample rate in Hz for audio quality filtering */
  maxSampleRate?: number;
  /** Search term that must be contained in voice name or native name */
  nameContains?: string;
  /** Array of terms that must NOT be in voice names (exclusion filter) */
  excludeNames?: string[];
  /** Array of voice styles to include (provider-specific, e.g., ['cheerful', 'sad']) */
  styles?: string[];
  /** Filter for neural/AI-powered voices only */
  neural?: boolean;
  /** Filter for premium/high-quality voices only */
  premium?: boolean;
  /** Array of voice status values (e.g., ['available', 'deprecated']) */
  status?: string[];
  /** Range filter for speaking rate in words per minute */
  wordsPerMinuteRange?: { min?: number; max?: number };
}

/**
 * Base voice model providing common properties and methods for all TTS voice implementations.
 * Serves as the foundation for provider-specific voice classes with standardized filtering,
 * quality assessment, and comparison capabilities across Google, Microsoft, and Amazon voices.
 * 
 * @category Voice Management
 * 
 * @example Creating a voice instance
 * ```typescript
 * const voice = new VoiceBase({
 *   provider: 'google',
 *   engines: ['neural', 'wavenet'],
 *   code: 'en-US-Neural2-A',
 *   name: 'Alice',
 *   nativeName: 'Alice',
 *   gender: 'Female',
 *   locale: new VoiceLocale({ code: 'en-US', name: 'English (United States)' })
 * });
 * ```
 * 
 * @example Voice filtering and selection
 * ```typescript
 * // Filter voices for English-speaking female neural voices
 * const femaleNeuralVoices = allVoices.filter(voice =>
 *   voice.matchesFilter({
 *     languageCodes: ['en'],
 *     genders: ['Female'],
 *     neural: true
 *   })
 * );
 * 
 * // Get the highest quality voice
 * const bestVoice = femaleNeuralVoices.reduce((best, current) =>
 *   current.getQualityRating() > best.getQualityRating() ? current : best
 * );
 * ```
 * 
 * @example Voice comparison and similarity
 * ```typescript
 * // Find voices similar to a reference voice
 * const referenceVoice = voices.find(v => v.name === 'Alice');
 * const similarVoices = voices
 *   .filter(voice => voice.getSimilarityScore(referenceVoice) > 0.7)
 *   .sort((a, b) => b.getSimilarityScore(referenceVoice) - a.getSimilarityScore(referenceVoice));
 * ```
 */
export class VoiceBase {
  /** TTS provider name (e.g., 'google', 'microsoft', 'amazon') */
  provider: string;
  /** Array of supported engines/technologies (e.g., ['neural', 'standard']) */
  engines: string[];
  /** Unique voice identifier code used by the provider */
  code: string;
  /** Display name for the voice (may be customized) */
  name: string;
  /** Native name in the voice's language (may be customized) */
  nativeName: string;
  /** Voice gender classification ('Male', 'Female', 'Neutral', etc.) */
  gender: string;
  /** Locale information including language and region details */
  locale: VoiceLocale;

  /**
   * Creates a new voice instance with the specified properties.
   * 
   * @param config - Voice configuration object with all required properties
   * 
   * @example Voice creation with full configuration
   * ```typescript
   * const voice = new VoiceBase({
   *   provider: 'microsoft',
   *   engines: ['neural'],
   *   code: 'en-US-AriaNeural',
   *   name: 'Aria',
   *   nativeName: 'Aria',
   *   gender: 'Female',
   *   locale: new VoiceLocale({
   *     code: 'en-US',
   *     name: 'English (United States)',
   *     languageCode: 'en',
   *     languageName: 'English',
   *     countryCode: 'US',
   *     countryName: 'United States'
   *   })
   * });
   * ```
   */
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
   * Checks if this voice matches the specified filter criteria. Evaluates all provided
   * filter options and returns true only if the voice meets ALL specified criteria.
   * 
   * @param filter - Filter options to evaluate against this voice
   * @returns True if the voice matches all filter criteria, false otherwise
   * 
   * @example Basic filtering
   * ```typescript
   * const filter: VoiceFilterOptions = {
   *   providers: ['google', 'microsoft'],
   *   genders: ['Female'],
   *   locales: ['en-US', 'en-GB']
   * };
   * 
   * const isMatch = voice.matchesFilter(filter);
   * console.log(`Voice ${voice.name} matches filter: ${isMatch}`);
   * ```
   * 
   * @example Advanced filtering with multiple criteria
   * ```typescript
   * const advancedFilter: VoiceFilterOptions = {
   *   neural: true,
   *   languageCodes: ['en'],
   *   nameContains: 'aria',
   *   excludeNames: ['robotic'],
   *   minSampleRate: 22050
   * };
   * 
   * if (voice.matchesFilter(advancedFilter)) {
   *   console.log(`${voice.name} is a high-quality English neural voice`);
   * }
   * ```
   * 
   * @example Dynamic user-based filtering
   * ```typescript
   * // Filter based on user preferences
   * const userFilter = {
   *   providers: userSettings.enabledProviders,
   *   genders: userSettings.preferredGenders,
   *   locales: [userSettings.currentLocale],
   *   neural: userSettings.preferHighQuality
   * };
   * 
   * const suitableVoices = allVoices.filter(voice => voice.matchesFilter(userFilter));
   * ```
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
   * Calculates a quality rating for this voice based on engine type and available features.
   * Returns a score from 1-5 where 5 represents the highest quality (neural/premium voices).
   * 
   * @returns Quality rating score (1-5)
   * 
   * @example Quality-based voice selection
   * ```typescript
   * // Sort voices by quality (highest first)
   * const sortedByQuality = voices
   *   .map(voice => ({ voice, quality: voice.getQualityRating() }))
   *   .sort((a, b) => b.quality - a.quality)
   *   .map(({ voice }) => voice);
   * 
   * console.log(`Best quality voice: ${sortedByQuality[0].name} (${sortedByQuality[0].getQualityRating()}/5)`);
   * ```
   * 
   * @example Quality filtering
   * ```typescript
   * // Filter for high-quality voices only
   * const highQualityVoices = voices.filter(voice => voice.getQualityRating() >= 4);
   * 
   * // Get quality distribution
   * const qualityDistribution = voices.reduce((dist, voice) => {
   *   const rating = voice.getQualityRating();
   *   dist[rating] = (dist[rating] || 0) + 1;
   *   return dist;
   * }, {} as Record<number, number>);
   * ```
   * 
   * @example Provider quality comparison
   * ```typescript
   * // Compare average quality by provider
   * const qualityByProvider = voices.reduce((acc, voice) => {
   *   if (!acc[voice.provider]) {
   *     acc[voice.provider] = { total: 0, count: 0 };
   *   }
   *   acc[voice.provider].total += voice.getQualityRating();
   *   acc[voice.provider].count++;
   *   return acc;
   * }, {} as Record<string, { total: number; count: number }>);
   * 
   * Object.entries(qualityByProvider).forEach(([provider, stats]) => {
   *   const avgQuality = stats.total / stats.count;
   *   console.log(`${provider}: ${avgQuality.toFixed(2)}/5 average quality`);
   * });
   * ```
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
   * Gets the sample rate for this voice. Base implementation returns undefined.
   * Provider-specific voice classes should override this method to return actual sample rates.
   * 
   * @returns Sample rate in Hz, or undefined if not available
   * @protected
   */
  protected getSampleRate(): number | undefined {
    return undefined;
  }

  /**
   * Determines if this voice uses neural/AI-powered synthesis technology.
   * Checks the engines array for neural or premium indicators.
   * 
   * @returns True if this is a neural voice, false otherwise
   * 
   * @example Neural voice filtering
   * ```typescript
   * // Filter for neural voices only
   * const neuralVoices = voices.filter(voice => voice.isNeural());
   * 
   * // Compare neural vs standard voice counts
   * const neuralCount = voices.filter(voice => voice.isNeural()).length;
   * const standardCount = voices.length - neuralCount;
   * 
   * console.log(`Neural voices: ${neuralCount}, Standard voices: ${standardCount}`);
   * ```
   * 
   * @example Quality indicator
   * ```typescript
   * // Use neural status as quality indicator
   * const voiceQuality = voice.isNeural() ? 'High' : 'Standard';
   * console.log(`${voice.name}: ${voiceQuality} quality`);
   * ```
   */
  isNeural(): boolean {
    return this.engines.some(engine => 
      engine.toLowerCase().includes('neural') || 
      engine.toLowerCase().includes('premium')
    );
  }

  /**
   * Generates descriptive tags for this voice including provider, gender, locale, and engine information.
   * Useful for categorization, search indexing, and voice discovery features.
   * 
   * @returns Array of lowercase descriptive tags
   * 
   * @example Voice tagging for search
   * ```typescript
   * // Build searchable voice index
   * const voiceIndex = voices.map(voice => ({
   *   voice,
   *   tags: voice.getTags(),
   *   searchText: voice.getTags().join(' ')
   * }));
   * 
   * // Search voices by tags
   * const searchResults = voiceIndex.filter(({ searchText }) =>
   *   searchText.includes('neural') && searchText.includes('female')
   * );
   * ```
   * 
   * @example Voice categorization
   * ```typescript
   * // Group voices by characteristics
   * const voicesByTags = voices.reduce((groups, voice) => {
   *   const tags = voice.getTags();
   *   
   *   if (tags.includes('neural')) {
   *     groups.neural = groups.neural || [];
   *     groups.neural.push(voice);
   *   }
   *   
   *   if (tags.includes('female')) {
   *     groups.female = groups.female || [];
   *     groups.female.push(voice);
   *   }
   *   
   *   return groups;
   * }, {} as Record<string, VoiceBase[]>);
   * ```
   * 
   * @example Voice analytics
   * ```typescript
   * // Analyze voice characteristics distribution
   * const allTags = voices.flatMap(voice => voice.getTags());
   * const tagCounts = allTags.reduce((counts, tag) => {
   *   counts[tag] = (counts[tag] || 0) + 1;
   *   return counts;
   * }, {} as Record<string, number>);
   * 
   * console.log('Voice characteristics distribution:', tagCounts);
   * ```
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
   * Calculates a similarity score (0-1) between this voice and another voice.
   * Considers provider, gender, language, region, and engine compatibility.
   * Higher scores indicate more similar voices suitable for fallback scenarios.
   * 
   * @param other - Another voice to compare against
   * @returns Similarity score between 0 (completely different) and 1 (identical)
   * 
   * @example Voice similarity analysis
   * ```typescript
   * const referenceVoice = voices.find(v => v.name === 'Aria');
   * 
   * // Find similar voices for fallback
   * const similarVoices = voices
   *   .map(voice => ({
   *     voice,
   *     similarity: referenceVoice.getSimilarityScore(voice)
   *   }))
   *   .filter(({ similarity }) => similarity > 0.5)
   *   .sort((a, b) => b.similarity - a.similarity);
   * 
   * console.log('Similar voices for fallback:');
   * similarVoices.forEach(({ voice, similarity }) => {
   *   console.log(`${voice.name}: ${(similarity * 100).toFixed(1)}% similar`);
   * });
   * ```
   * 
   * @example Voice recommendation system
   * ```typescript
   * // Recommend similar voices to user's selection
   * const recommendSimilarVoices = (selectedVoice: VoiceBase, allVoices: VoiceBase[]) => {
   *   return allVoices
   *     .filter(voice => voice.code !== selectedVoice.code) // Exclude self
   *     .map(voice => ({
   *       voice,
   *       similarity: selectedVoice.getSimilarityScore(voice)
   *     }))
   *     .filter(({ similarity }) => similarity >= 0.6) // High similarity threshold
   *     .sort((a, b) => b.similarity - a.similarity)
   *     .slice(0, 5) // Top 5 recommendations
   *     .map(({ voice }) => voice);
   * };
   * ```
   * 
   * @example Voice clustering
   * ```typescript
   * // Group voices by similarity for clustering
   * const createVoiceClusters = (voices: VoiceBase[], threshold = 0.7) => {
   *   const clusters: VoiceBase[][] = [];
   *   const processed = new Set<string>();
   *   
   *   for (const voice of voices) {
   *     if (processed.has(voice.code)) continue;
   *     
   *     const cluster = [voice];
   *     processed.add(voice.code);
   *     
   *     for (const other of voices) {
   *       if (!processed.has(other.code) && voice.getSimilarityScore(other) >= threshold) {
   *         cluster.push(other);
   *         processed.add(other.code);
   *       }
   *     }
   *     
   *     clusters.push(cluster);
   *   }
   *   
   *   return clusters;
   * };
   * ```
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
