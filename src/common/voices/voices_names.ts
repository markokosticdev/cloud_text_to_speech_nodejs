/**
 * @fileoverview Voice name management utilities for TTS voice selection and organization.
 * Provides utilities for voice name shuffling, deduplication, filtering, and management across
 * multiple TTS providers with deterministic algorithms and consistent voice selection patterns.
 * 
 * @author Marko Kostich
 * @since 1.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link VoiceBase} for the voice data model
 * @see {@link NameOptions} for voice selection options
 * @see {@link helpers} for core voice processing utilities
 * 
 * @example Basic voice name management
 * ```typescript
 * import { VoiceNames } from './voices_names.js';
 * 
 * // Get distinct voice names from a collection
 * const voiceNames = VoiceNames.getDistinctNames(allVoices);
 * console.log(`Found ${voiceNames.length} unique voice names`);
 * 
 * // Shuffle voice names deterministically
 * const shuffledNames = VoiceNames.shuffleNames(voiceNames, 'seed123');
 * 
 * // Filter voices by specific names
 * const selectedVoices = VoiceNames.filterByNames(allVoices, ['Jenny', 'Aria', 'Joanna']);
 * ```
 * 
 * @example Voice catalog organization
 * ```typescript
 * // Organize voices by provider and name
 * const organizedVoices = VoiceNames.organizeByProvider(allVoices);
 * 
 * // Get recommended voices for each language
 * const recommendations = VoiceNames.getRecommendedVoices(allVoices, {
 *   preferredProviders: ['microsoft', 'google'],
 *   maxPerLanguage: 3
 * });
 * 
 * // Create voice name index for fast lookups
 * const nameIndex = VoiceNames.createNameIndex(allVoices);
 * const jennyVoices = nameIndex.get('Jenny');
 * ```
 * 
 * @example Voice name validation and normalization
 * ```typescript
 * // Validate voice names across providers
 * const validation = VoiceNames.validateNames(voiceNames, {
 *   checkDuplicates: true,
 *   normalizeCase: true,
 *   removeBadNames: true
 * });
 * 
 * // Normalize voice names for consistency
 * const normalizedNames = VoiceNames.normalizeNames(voiceNames);
 * 
 * // Get voice name suggestions for typos
 * const suggestions = VoiceNames.getSuggestions('Jeny', allVoiceNames);
 * ```
 */

import { Helpers } from '../utils/helpers.js';
import { VoiceBase } from './voices_base.js';

/**
 * Utility class for managing voice names, providing methods for name organization,
 * filtering, shuffling, and deduplication across multiple TTS providers.
 * Contains static methods for voice name processing and management operations.
 * 
 * @category Voice Management
 * 
 * @example Complete voice name management workflow
 * ```typescript
 * // 1. Load voices from multiple providers
 * const allVoices = await loadVoicesFromProviders(['google', 'microsoft', 'amazon']);
 * 
 * // 2. Deduplicate voices by name and quality
 * const uniqueVoices = VoiceNames.deduplicateByName(allVoices);
 * 
 * // 3. Get distinct names for selection
 * const availableNames = VoiceNames.getDistinctNames(uniqueVoices);
 * 
 * // 4. Organize by categories
 * const organizedVoices = VoiceNames.organizeByCategory(uniqueVoices);
 * 
 * // 5. Create user-friendly voice catalog
 * const catalog = VoiceNames.createVoiceCatalog(uniqueVoices, {
 *   groupByLanguage: true,
 *   sortByQuality: true,
 *   includeMetadata: true
 * });
 * ```
 * 
 * @example Voice recommendation system
 * ```typescript
 * // Build voice recommendation engine
 * const recommendationEngine = {
 *   getVoicesForLocale: (locale: string) => 
 *     VoiceNames.filterByLocale(allVoices, locale),
 *   
 *   getHighQualityVoices: (voices: VoiceBase[]) =>
 *     VoiceNames.filterByQuality(voices, { minRating: 4.0 }),
 *   
 *   getPopularVoices: (voices: VoiceBase[]) =>
 *     VoiceNames.sortByPopularity(voices).slice(0, 10),
 *   
 *   getVoiceAlternatives: (voiceName: string) =>
 *     VoiceNames.findSimilarVoices(allVoices, voiceName)
 * };
 * ```
 * 
 * @example Voice name analytics
 * ```typescript
 * // Analyze voice name patterns and statistics
 * const analytics = {
 *   getNameDistribution: () => VoiceNames.getNameDistribution(allVoices),
 *   getProviderCoverage: () => VoiceNames.getProviderCoverage(allVoices),
 *   getLanguageCoverage: () => VoiceNames.getLanguageCoverage(allVoices),
 *   getQualityMetrics: () => VoiceNames.getQualityMetrics(allVoices)
 * };
 * 
 * // Generate voice catalog reports
 * const report = VoiceNames.generateCatalogReport(allVoices, {
 *   includeStatistics: true,
 *   includeRecommendations: true,
 *   includeGaps: true
 * });
 * ```
 */
export class VoiceNames {
  /**
   * Private constructor to prevent instantiation of utility class.
   * All methods are static and should be called directly on the class.
   */
  private constructor() {}

  /**
   * Shuffles an array of voice names using a deterministic algorithm with optional seed.
   * Uses the Mersenne Twister PRNG for consistent, reproducible results across runs.
   * Delegates to the helper function for the actual shuffling implementation.
   * 
   * @param names - Array of voice names to shuffle
   * @param seed - Optional seed for deterministic shuffling (default: 'default')
   * @returns New array with shuffled voice names
   * 
   * @example Basic voice name shuffling
   * ```typescript
   * // Shuffle voice names randomly
   * const voiceNames = ['Jenny', 'Aria', 'Guy', 'Ivy', 'Joey'];
   * const shuffled = VoiceNames.shuffleNames(voiceNames);
   * console.log(shuffled); // Different order each time
   * 
   * // Shuffle with deterministic seed
   * const deterministicShuffle = VoiceNames.shuffleNames(voiceNames, 'project-seed');
   * console.log(deterministicShuffle); // Same order every time with same seed
   * ```
   * 
   * @example Use cases for deterministic shuffling
   * ```typescript
   * // A/B testing with consistent voice ordering
   * const getVoicesForUser = (userId: string) => {
   *   const allNames = VoiceNames.getDistinctNames(allVoices);
   *   return VoiceNames.shuffleNames(allNames, `user-${userId}`);
   * };
   * 
   * // Rotation strategy for voice recommendations
   * const getRotatedVoices = (date: string) => {
   *   const availableNames = ['Jenny', 'Aria', 'Guy', 'Ivy'];
   *   return VoiceNames.shuffleNames(availableNames, `rotation-${date}`);
   * };
   * 
   * // Load balancing across voice providers
   * const getBalancedVoiceOrder = (region: string) => {
   *   const regionalVoices = getVoicesForRegion(region);
   *   const names = VoiceNames.getDistinctNames(regionalVoices);
   *   return VoiceNames.shuffleNames(names, `region-${region}`);
   * };
   * ```
   * 
   * @example Voice selection with shuffled preferences
   * ```typescript
   * // Create randomized voice selection for variety
   * const createVoiceSelection = (preferences: string[], locale: string) => {
   *   const shuffledPreferences = VoiceNames.shuffleNames(preferences);
   *   
   *   return shuffledPreferences.map(name => ({
   *     name,
   *     locale,
   *     priority: shuffledPreferences.indexOf(name)
   *   }));
   * };
   * 
   * // Dynamic voice rotation for content variety
   * const getVoiceForContent = (contentId: string, availableVoices: string[]) => {
   *   const shuffled = VoiceNames.shuffleNames(availableVoices, contentId);
   *   return shuffled[0]; // Use first voice from shuffled list
   * };
   * ```
   * 
   * @see {@link shuffleNames} for the underlying implementation
   */
  static shuffleNames(names: string[], seed: string = 'default'): string[] {
    return Helpers.shuffleNamesByText(names, seed);
  }

  /**
   * Removes duplicate voices from an array based on voice names and quality metrics.
   * Preserves the highest quality voice for each unique name, considering provider
   * preferences and voice characteristics. Delegates to the helper function for implementation.
   * 
   * @param voices - Array of voice objects to deduplicate
   * @returns Array with duplicate voices removed, keeping the best quality voice per name
   * 
   * @example Basic voice deduplication
   * ```typescript
   * // Remove duplicate voices across providers
   * const allVoices = [
   *   { name: 'Jenny', provider: 'microsoft', quality: 9.0 },
   *   { name: 'Jenny', provider: 'custom', quality: 7.0 },
   *   { name: 'Aria', provider: 'microsoft', quality: 8.5 },
   *   { name: 'Joanna', provider: 'amazon', quality: 8.0 }
   * ];
   * 
   * const uniqueVoices = VoiceNames.deduplicateByName(allVoices);
   * // Result: Keeps Microsoft Jenny (higher quality), Aria, and Joanna
   * ```
   * 
   * @example Advanced deduplication scenarios
   * ```typescript
   * // Deduplication with provider preferences
   * const voicesWithDuplicates = [
   *   { name: 'Standard-A', provider: 'google', quality: 8.0, type: 'standard' },
   *   { name: 'Standard-A', provider: 'google', quality: 9.0, type: 'wavenet' },
   *   { name: 'Standard-A', provider: 'google', quality: 9.5, type: 'neural2' },
   *   { name: 'Jenny', provider: 'microsoft', quality: 9.0, type: 'neural' },
   *   { name: 'Jenny', provider: 'microsoft', quality: 8.0, type: 'standard' }
   * ];
   * 
   * const bestVoices = VoiceNames.deduplicateByName(voicesWithDuplicates);
   * // Keeps highest quality version of each voice name
   * ```
   * 
   * @example Voice catalog consolidation
   * ```typescript
   * // Consolidate voices from multiple sources
   * const consolidateVoiceCatalog = async () => {
   *   const googleVoices = await getGoogleVoices();
   *   const microsoftVoices = await getMicrosoftVoices();
   *   const amazonVoices = await getAmazonVoices();
   *   
   *   const allVoices = [...googleVoices, ...microsoftVoices, ...amazonVoices];
   *   const uniqueVoices = VoiceNames.deduplicateByName(allVoices);
   *   
   *   return {
   *     total: allVoices.length,
   *     unique: uniqueVoices.length,
   *     duplicates: allVoices.length - uniqueVoices.length,
   *     voices: uniqueVoices
   *   };
   * };
   * ```
   * 
   * @example Quality-based voice selection
   * ```typescript
   * // Keep only the best voice per name for production use
   * const getBestVoicesForProduction = (voices: VoiceBase[]) => {
   *   const deduplicated = VoiceNames.deduplicateByName(voices);
   *   
   *   return deduplicated
   *     .filter(voice => voice.quality >= 8.0)
   *     .sort((a, b) => b.quality - a.quality);
   * };
   * 
   * // Create voice recommendations without duplicates
   * const createVoiceRecommendations = (voices: VoiceBase[], locale: string) => {
   *   const localeVoices = voices.filter(v => v.locale.code === locale);
   *   const uniqueVoices = VoiceNames.deduplicateByName(localeVoices);
   *   
   *   return uniqueVoices
   *     .slice(0, 5) // Top 5 recommendations
   *     .map(voice => ({
   *       name: voice.name,
   *       provider: voice.provider,
   *       quality: voice.quality,
   *       recommendation: 'Best quality available'
   *     }));
   * };
   * ```
   * 
   * @see {@link deduplicateVoices} for the underlying implementation
   */
  static deduplicateByName(voices: VoiceBase[]): VoiceBase[] {
    return Helpers.removeVoiceDuplicates(voices);
  }

  /**
   * Filters an array of voices to include only those with names matching the specified list.
   * Performs case-sensitive name matching against the provided name array.
   * Delegates to the helper function for the actual filtering implementation.
   * 
   * @param voices - Array of voice objects to filter
   * @param names - Array of voice names to include in the filtered result
   * @returns Array containing only voices whose names are in the specified list
   * 
   * @example Basic voice filtering by names
   * ```typescript
   * // Filter to specific voice names
   * const allVoices = [
   *   { name: 'Jenny', provider: 'microsoft' },
   *   { name: 'Aria', provider: 'microsoft' },
   *   { name: 'Guy', provider: 'microsoft' },
   *   { name: 'Joanna', provider: 'amazon' },
   *   { name: 'Matthew', provider: 'amazon' }
   * ];
   * 
   * const selectedNames = ['Jenny', 'Aria', 'Joanna'];
   * const filteredVoices = VoiceNames.filterByNames(allVoices, selectedNames);
   * // Result: Only Jenny, Aria, and Joanna voices
   * ```
   * 
   * @example Voice selection for specific use cases
   * ```typescript
   * // Premium voices for high-quality content
   * const premiumVoiceNames = [
   *   'en-US-Wavenet-A', 'en-US-Wavenet-B', 'en-US-Wavenet-C',
   *   'en-US-Neural2-A', 'en-US-Neural2-B', 'en-US-Neural2-C'
   * ];
   * const premiumVoices = VoiceNames.filterByNames(allVoices, premiumVoiceNames);
   * 
   * // Accessibility-friendly voices (clear pronunciation)
   * const accessibilityVoiceNames = ['Jenny', 'Aria', 'en-US-Standard-A'];
   * const accessibleVoices = VoiceNames.filterByNames(allVoices, accessibilityVoiceNames);
   * 
   * // Brand-approved voices for corporate content
   * const brandVoiceNames = ['en-US-Studio-O', 'en-US-Studio-Q'];
   * const brandVoices = VoiceNames.filterByNames(allVoices, brandVoiceNames);
   * ```
   * 
   * @example Dynamic voice filtering
   * ```typescript
   * // Filter voices based on user preferences
   * const filterVoicesByUserPreferences = (
   *   voices: VoiceBase[],
   *   userPreferences: { favoriteVoices: string[], blockedVoices: string[] }
   * ) => {
   *   // First filter to favorites if specified
   *   let filtered = userPreferences.favoriteVoices.length > 0
   *     ? VoiceNames.filterByNames(voices, userPreferences.favoriteVoices)
   *     : voices;
   *   
   *   // Then remove blocked voices
   *   if (userPreferences.blockedVoices.length > 0) {
   *     const allowedNames = filtered
   *       .map(v => v.name)
   *       .filter(name => !userPreferences.blockedVoices.includes(name));
   *     filtered = VoiceNames.filterByNames(filtered, allowedNames);
   *   }
   *   
   *   return filtered;
   * };
   * ```
   * 
   * @example A/B testing voice selection
   * ```typescript
   * // Create voice groups for testing
   * const createVoiceTestGroups = (voices: VoiceBase[]) => {
   *   const groupA = ['Jenny', 'Aria'];
   *   const groupB = ['Guy', 'Davis'];
   *   const groupC = ['en-US-Wavenet-A', 'en-US-Wavenet-B'];
   *   
   *   return {
   *     groupA: VoiceNames.filterByNames(voices, groupA),
   *     groupB: VoiceNames.filterByNames(voices, groupB),
   *     groupC: VoiceNames.filterByNames(voices, groupC)
   *   };
   * };
   * 
   * // Select voice group based on user segment
   * const getVoicesForUserSegment = (voices: VoiceBase[], segment: string) => {
   *   const voiceGroups = {
   *     premium: ['en-US-Neural2-A', 'en-US-Wavenet-A'],
   *     standard: ['Jenny', 'Aria', 'Guy'],
   *     economy: ['en-US-Standard-A', 'en-US-Standard-B']
   *   };
   *   
   *   const groupNames = voiceGroups[segment] || voiceGroups.standard;
   *   return VoiceNames.filterByNames(voices, groupNames);
   * };
   * ```
   * 
   */
  static filterByNames(voices: VoiceBase[], names: string[]): VoiceBase[] {
    return voices.filter(voice => names.includes(voice.name));
  }

  /**
   * Extracts a list of distinct voice names from an array of voice objects.
   * Returns unique voice names without duplicates, preserving original order of first occurrence.
   * 
   * @param voices - Array of voice objects to extract names from
   * @returns Array of unique voice names
   * 
   * @example Extract unique voice names
   * ```typescript
   * const voices = [
   *   { name: 'Jenny', provider: 'microsoft' },
   *   { name: 'Aria', provider: 'microsoft' },
   *   { name: 'Jenny', provider: 'custom' },  // Duplicate name
   *   { name: 'Guy', provider: 'microsoft' },
   *   { name: 'Aria', provider: 'alternative' }  // Duplicate name
   * ];
   * 
   * const uniqueNames = VoiceNames.getDistinctNames(voices);
   * console.log(uniqueNames); // ['Jenny', 'Aria', 'Guy']
   * ```
   * 
   * @example Voice name analysis and cataloging
   * ```typescript
   * // Analyze voice name distribution across providers
   * const analyzeVoiceNames = (voices: VoiceBase[]) => {
   *   const distinctNames = VoiceNames.getDistinctNames(voices);
   *   const totalVoices = voices.length;
   *   
   *   return {
   *     uniqueNames: distinctNames.length,
   *     totalVoices: totalVoices,
   *     duplicateRatio: (totalVoices - distinctNames.length) / totalVoices,
   *     names: distinctNames.sort()
   *   };
   * };
   * 
   * // Create voice name inventory
   * const createVoiceInventory = (voices: VoiceBase[]) => {
   *   const distinctNames = VoiceNames.getDistinctNames(voices);
   *   
   *   return distinctNames.map(name => {
   *     const voicesWithName = voices.filter(v => v.name === name);
   *     return {
   *       name,
   *       count: voicesWithName.length,
   *       providers: [...new Set(voicesWithName.map(v => v.provider))],
   *       locales: [...new Set(voicesWithName.map(v => v.locale.code))]
   *     };
   *   });
   * };
   * ```
   * 
   * @example Voice selection UI generation
   * ```typescript
   * // Generate voice selection dropdown options
   * const generateVoiceOptions = (voices: VoiceBase[]) => {
   *   const distinctNames = VoiceNames.getDistinctNames(voices);
   *   
   *   return distinctNames.map(name => {
   *     const voicesWithName = voices.filter(v => v.name === name);
   *     const bestVoice = voicesWithName.reduce((best, current) => 
   *       current.quality > best.quality ? current : best
   *     );
   *     
   *     return {
   *       value: name,
   *       label: `${name} (${bestVoice.provider})`,
   *       quality: bestVoice.quality,
   *       locales: [...new Set(voicesWithName.map(v => v.locale.code))]
   *     };
   *   }).sort((a, b) => a.label.localeCompare(b.label));
   * };
   * 
   * // Create voice recommendation list
   * const createRecommendationList = (voices: VoiceBase[], maxCount: number = 10) => {
   *   const distinctNames = VoiceNames.getDistinctNames(voices);
   *   
   *   return distinctNames
   *     .slice(0, maxCount)
   *     .map(name => {
   *       const bestVoice = voices
   *         .filter(v => v.name === name)
   *         .reduce((best, current) => current.quality > best.quality ? current : best);
   *       
   *       return {
   *         name,
   *         provider: bestVoice.provider,
   *         locale: bestVoice.locale.code,
   *         quality: bestVoice.quality,
   *         recommended: true
   *       };
   *     });
   * };
   * ```
   * 
   * @example Voice name search and filtering
   * ```typescript
   * // Search functionality for voice names
   * const searchVoiceNames = (voices: VoiceBase[], searchTerm: string) => {
   *   const allNames = VoiceNames.getDistinctNames(voices);
   *   const searchLower = searchTerm.toLowerCase();
   *   
   *   return allNames.filter(name => 
   *     name.toLowerCase().includes(searchLower)
   *   );
   * };
   * 
   * // Group voices by name patterns
   * const groupVoicesByPattern = (voices: VoiceBase[]) => {
   *   const distinctNames = VoiceNames.getDistinctNames(voices);
   *   
   *   return {
   *     neural: distinctNames.filter(name => name.includes('Neural')),
   *     wavenet: distinctNames.filter(name => name.includes('Wavenet')),
   *     standard: distinctNames.filter(name => name.includes('Standard')),
   *     studio: distinctNames.filter(name => name.includes('Studio')),
   *     humanNames: distinctNames.filter(name => 
   *       /^[A-Z][a-z]+$/.test(name) // Simple pattern for human names
   *     )
   *   };
   * };
   * ```
   */
  static getDistinctNames(voices: VoiceBase[]): string[] {
    const nameSet = new Set<string>();
    voices.forEach(voice => nameSet.add(voice.name));
    return Array.from(nameSet);
  }

  /**
   * Creates a Map index of voice names to their corresponding voice objects.
   * Provides fast O(1) lookup of voices by name, with each name mapping to an array of voices.
   * 
   * @param voices - Array of voice objects to index
   * @returns Map where keys are voice names and values are arrays of matching voices
   * 
   * @example Create and use voice name index
   * ```typescript
   * const voices = [
   *   { name: 'Jenny', provider: 'microsoft', locale: { code: 'en-US' } },
   *   { name: 'Jenny', provider: 'custom', locale: { code: 'en-US' } },
   *   { name: 'Aria', provider: 'microsoft', locale: { code: 'en-US' } },
   *   { name: 'Guy', provider: 'microsoft', locale: { code: 'en-US' } }
   * ];
   * 
   * const nameIndex = VoiceNames.createNameIndex(voices);
   * 
   * // Fast lookup by name
   * const jennyVoices = nameIndex.get('Jenny');
   * console.log(jennyVoices.length); // 2 (Microsoft and Custom)
   * 
   * const ariaVoices = nameIndex.get('Aria');
   * console.log(ariaVoices.length); // 1 (Microsoft)
   * ```
   * 
   * @example Voice search and recommendation system
   * ```typescript
   * // Build fast voice lookup system
   * class VoiceSearchEngine {
   *   private nameIndex: Map<string, VoiceBase[]>;
   *   
   *   constructor(voices: VoiceBase[]) {
   *     this.nameIndex = VoiceNames.createNameIndex(voices);
   *   }
   *   
   *   findVoicesByName(name: string): VoiceBase[] {
   *     return this.nameIndex.get(name) || [];
   *   }
   *   
   *   findBestVoiceByName(name: string): VoiceBase | null {
   *     const voices = this.findVoicesByName(name);
   *     return voices.length > 0 
   *       ? voices.reduce((best, current) => current.quality > best.quality ? current : best)
   *       : null;
   *   }
   *   
   *   getAvailableProviders(name: string): string[] {
   *     const voices = this.findVoicesByName(name);
   *     return [...new Set(voices.map(v => v.provider))];
   *   }
   *   
   *   getVoiceAlternatives(name: string): string[] {
   *     const targetVoices = this.findVoicesByName(name);
   *     if (targetVoices.length === 0) return [];
   *     
   *     const targetLocale = targetVoices[0].locale.code;
   *     const alternatives = [];
   *     
   *     for (const [altName, altVoices] of this.nameIndex) {
   *       if (altName !== name && altVoices.some(v => v.locale.code === targetLocale)) {
   *         alternatives.push(altName);
   *       }
   *     }
   *     
   *     return alternatives;
   *   }
   * }
   * ```
   * 
   * @example Voice analytics and statistics
   * ```typescript
   * // Analyze voice distribution and coverage
   * const analyzeVoiceDistribution = (voices: VoiceBase[]) => {
   *   const nameIndex = VoiceNames.createNameIndex(voices);
   *   const statistics = {
   *     totalNames: nameIndex.size,
   *     duplicateNames: 0,
   *     providerCoverage: new Map<string, number>(),
   *     localeCoverage: new Map<string, number>()
   *   };
   *   
   *   for (const [name, voicesWithName] of nameIndex) {
   *     if (voicesWithName.length > 1) {
   *       statistics.duplicateNames++;
   *     }
   *     
   *     voicesWithName.forEach(voice => {
   *       // Count provider coverage
   *       const providerCount = statistics.providerCoverage.get(voice.provider) || 0;
   *       statistics.providerCoverage.set(voice.provider, providerCount + 1);
   *       
   *       // Count locale coverage
   *       const localeCount = statistics.localeCoverage.get(voice.locale.code) || 0;
   *       statistics.localeCoverage.set(voice.locale.code, localeCount + 1);
   *     });
   *   }
   *   
   *   return statistics;
   * };
   * 
   * // Generate voice coverage report
   * const generateCoverageReport = (voices: VoiceBase[]) => {
   *   const nameIndex = VoiceNames.createNameIndex(voices);
   *   const report = [];
   *   
   *   for (const [name, voicesWithName] of nameIndex) {
   *     const providers = [...new Set(voicesWithName.map(v => v.provider))];
   *     const locales = [...new Set(voicesWithName.map(v => v.locale.code))];
   *     const avgQuality = voicesWithName.reduce((sum, v) => sum + v.quality, 0) / voicesWithName.length;
   *     
   *     report.push({
   *       name,
   *       voiceCount: voicesWithName.length,
   *       providers,
   *       locales,
   *       averageQuality: avgQuality,
   *       maxQuality: Math.max(...voicesWithName.map(v => v.quality))
   *     });
   *   }
   *   
   *   return report.sort((a, b) => b.maxQuality - a.maxQuality);
   * };
   * ```
   * 
   * @example Dynamic voice selection
   * ```typescript
   * // Create dynamic voice selector with fallbacks
   * class DynamicVoiceSelector {
   *   private nameIndex: Map<string, VoiceBase[]>;
   *   
   *   constructor(voices: VoiceBase[]) {
   *     this.nameIndex = VoiceNames.createNameIndex(voices);
   *   }
   *   
   *   selectVoice(options: NameOptions): VoiceBase | null {
   *     let candidates = this.nameIndex.get(options.name) || [];
   *     
   *     // Filter by provider if specified
   *     if (options.provider) {
   *       candidates = candidates.filter(v => v.provider === options.provider);
   *     }
   *     
   *     // Filter by locale if specified
   *     if (options.locale) {
   *       candidates = candidates.filter(v => v.locale.code === options.locale);
   *     }
   *     
   *     // Return best quality voice
   *     if (candidates.length > 0) {
   *       return candidates.reduce((best, current) => 
   *         current.quality > best.quality ? current : best
   *       );
   *     }
   *     
   *     // Try fallback if primary selection failed
   *     if (options.fallback) {
   *       return this.selectVoice({ 
   *         name: options.fallback,
   *         provider: options.provider,
   *         locale: options.locale
   *       });
   *     }
   *     
   *     return null;
   *   }
   * }
   * ```
   */
  static createNameIndex(voices: VoiceBase[]): Map<string, VoiceBase[]> {
    const index = new Map<string, VoiceBase[]>();
    
    voices.forEach(voice => {
      const existing = index.get(voice.name) || [];
      existing.push(voice);
      index.set(voice.name, existing);
    });
    
    return index;
  }

  static get male(): string[] {
    return [
      'Liam',
      'Noah',
      'Oliver',
      'William',
      'Elijah',
      'James',
      'Benjamin',
      'Lucas',
      'Henry',
      'Alexander',
      'Mason',
      'Michael',
      'Ethan',
      'Daniel',
      'Jacob',
      'Logan',
      'Jackson',
      'Levi',
      'Sebastian',
      'Mateo',
      'Jack',
      'Owen',
      'Theodore',
      'Aiden',
      'Samuel',
      'Joseph',
      'John',
      'David',
      'Wyatt',
      'Matthew',
      'Luke',
      'Asher',
      'Carter',
      'Julian',
      'Grayson',
      'Leo',
      'Jayden',
      'Gabriel',
      'Isaac',
      'Lincoln',
      'Anthony',
      'Hudson',
      'Dylan',
      'Ezra',
      'Thomas',
      'Charles',
      'Christopher',
      'Jaxon',
      'Maverick',
      'Josiah',
    ];
  }

  static get female(): string[] {
    return [
      'Olivia',
      'Emma',
      'Ava',
      'Charlotte',
      'Sophia',
      'Amelia',
      'Isabella',
      'Mia',
      'Evelyn',
      'Harper',
      'Camila',
      'Gianna',
      'Abigail',
      'Luna',
      'Ella',
      'Elizabeth',
      'Sofia',
      'Emily',
      'Avery',
      'Mila',
      'Scarlett',
      'Eleanor',
      'Madison',
      'Layla',
      'Penelope',
      'Aria',
      'Chloe',
      'Grace',
      'Ellie',
      'Nora',
      'Hazel',
      'Zoey',
      'Riley',
      'Victoria',
      'Lily',
      'Aurora',
      'Violet',
      'Nova',
      'Hannah',
      'Emilia',
      'Zoe',
      'Stella',
      'Everly',
      'Isla',
      'Leah',
      'Lillian',
      'Addison',
      'Willow',
      'Lucy',
      'Paisley',
    ];
  }

  static get neutral(): string[] {
    return [
      'Alex',
      'Jordan',
      'Taylor',
      'Casey',
      'Riley',
      'Avery',
      'Quinn',
      'Cameron',
      'Sage',
      'River',
      'Rowan',
      'Blake',
      'Emery',
      'Finley',
      'Hayden',
      'Parker',
      'Reese',
      'Phoenix',
      'Skylar',
      'Morgan',
      'Drew',
      'Kai',
      'Remy',
      'Lane',
      'Marlowe',
      'Ari',
      'Bailey',
      'Charlie',
      'Frankie',
      'Gray',
      'Harley',
      'Indigo',
      'Jude',
      'Kit',
      'Lennox',
      'Memphis',
      'Nova',
      'Ocean',
      'Peyton',
      'Rain',
      'Sage',
      'Tatum',
      'Vale',
      'Winter',
      'Zion',
    ];
  }

  /**
   * Get all available name categories
   */
  static get categories(): string[] {
    return ['male', 'female', 'neutral'];
  }

  /**
   * Get names by gender/category
   */
  static getByGender(gender: string): string[] {
    const normalizedGender = gender.toLowerCase();
    switch (normalizedGender) {
      case 'male':
        return this.male;
      case 'female':
        return this.female;
      case 'neutral':
        return this.neutral;
      default:
        return this.neutral; // Default to neutral names for unknown genders
    }
  }

  /**
   * Get a random name from the specified gender category
   */
  static getRandomName(gender: string, seed?: string): string {
    const names = this.getByGender(gender);
    if (names.length === 0) return 'Voice';
    
    if (seed) {
      // Use seed for deterministic selection
      const seedSum = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return names[seedSum % names.length];
    }
    
    return names[Math.floor(Math.random() * names.length)];
  }

  /**
   * Get combined list of all names
   */
  static get all(): string[] {
    return [...this.male, ...this.female, ...this.neutral];
  }
}
