/**
 * @fileoverview TTS provider constants and utilities for multi-provider text-to-speech operations.
 * Provides standardized provider identifiers and utility methods for managing
 * supported TTS providers including Google Cloud TTS, Microsoft Azure Speech, and Amazon Polly.
 * 
 * @author Marko Kostich
 * @since 1.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link https://cloud.google.com/text-to-speech | Google Cloud Text-to-Speech}
 * @see {@link https://azure.microsoft.com/en-us/services/cognitive-services/text-to-speech/ | Microsoft Azure Speech}
 * @see {@link https://aws.amazon.com/polly/ | Amazon Polly}
 * 
 * @example Basic provider usage
 * ```typescript
 * import { TtsProviders } from './tts_providers.js';
 * 
 * // Use provider constants
 * console.log(TtsProviders.google);    // 'google'
 * console.log(TtsProviders.microsoft); // 'microsoft'
 * console.log(TtsProviders.amazon);    // 'amazon'
 * console.log(TtsProviders.combine);   // 'combine'
 * 
 * // Get all available providers
 * const allProviders = TtsProviders.all();
 * console.log(allProviders); // ['google', 'microsoft', 'amazon', 'combine']
 * ```
 * 
 * @example Provider validation
 * ```typescript
 * // Validate user input against supported providers
 * const validateProvider = (provider: string): boolean => {
 *   return TtsProviders.all().includes(provider);
 * };
 * 
 * console.log(validateProvider('google'));    // true
 * console.log(validateProvider('invalid'));   // false
 * ```
 * 
 * @example Single provider operations
 * ```typescript
 * // Work with single providers only (excluding 'combine')
 * const singleProviders = TtsProviders.allSingle();
 * console.log(singleProviders); // ['google', 'microsoft', 'amazon']
 * 
 * // Process each single provider
 * singleProviders.forEach(provider => {
 *   console.log(`Processing ${provider} voices...`);
 * });
 * ```
 * 
 * @example Configuration and routing
 * ```typescript
 * // Route requests based on provider
 * const routeRequest = (provider: string, text: string) => {
 *   switch (provider) {
 *     case TtsProviders.google:
 *       return processGoogleRequest(text);
 *     case TtsProviders.microsoft:
 *       return processMicrosoftRequest(text);
 *     case TtsProviders.amazon:
 *       return processAmazonRequest(text);
 *     case TtsProviders.combine:
 *       return processCombinedRequest(text);
 *     default:
 *       throw new Error(`Unsupported provider: ${provider}`);
 *   }
 * };
 * ```
 */

/**
 * Utility class providing standardized constants and methods for TTS provider management.
 * Contains string constants for all supported providers and helper methods for provider operations.
 * Uses a static-only design pattern to prevent instantiation and ensure consistent provider identifiers.
 * 
 * @category TTS Core
 * 
 * @example Provider identification
 * ```typescript
 * // Use provider constants for consistency
 * const currentProvider = TtsProviders.google;
 * const isGoogleProvider = currentProvider === TtsProviders.google;
 * 
 * // Avoid magic strings - use constants instead
 * // Bad: const provider = 'google';
 * // Good: const provider = TtsProviders.google;
 * ```
 * 
 * @example Provider enumeration
 * ```typescript
 * // Get all providers including combined mode
 * const allProviders = TtsProviders.all();
 * console.log(`Total providers: ${allProviders.length}`); // 4
 * 
 * // Get only single providers (no combined mode)
 * const singleProviders = TtsProviders.allSingle();
 * console.log(`Single providers: ${singleProviders.length}`); // 3
 * ```
 * 
 * @example Provider-specific configuration
 * ```typescript
 * // Configure different settings per provider
 * const providerConfigs = {
 *   [TtsProviders.google]: {
 *     apiKey: 'google-api-key',
 *     endpoint: 'https://texttospeech.googleapis.com'
 *   },
 *   [TtsProviders.microsoft]: {
 *     subscriptionKey: 'azure-key',
 *     region: 'eastus'
 *   },
 *   [TtsProviders.amazon]: {
 *     accessKeyId: 'aws-access-key',
 *     secretAccessKey: 'aws-secret-key',
 *     region: 'us-east-1'
 *   }
 * };
 * 
 * // Access configuration by provider
 * const googleConfig = providerConfigs[TtsProviders.google];
 * ```
 * 
 * @example Provider capability matrix
 * ```typescript
 * // Define capabilities per provider
 * const providerCapabilities = {
 *   [TtsProviders.google]: {
 *     ssmlSupport: true,
 *     voiceCount: 220,
 *     languageCount: 40,
 *     audioFormats: ['MP3', 'WAV', 'OGG']
 *   },
 *   [TtsProviders.microsoft]: {
 *     ssmlSupport: true,
 *     voiceCount: 400,
 *     languageCount: 75,
 *     audioFormats: ['MP3', 'WAV', 'RIFF']
 *   },
 *   [TtsProviders.amazon]: {
 *     ssmlSupport: true,
 *     voiceCount: 60,
 *     languageCount: 29,
 *     audioFormats: ['MP3', 'OGG', 'PCM']
 *   }
 * };
 * 
 * // Check provider capabilities
 * const checkCapability = (provider: string, capability: string) => {
 *   return providerCapabilities[provider]?.[capability] || false;
 * };
 * ```
 * 
 * @example Load balancing and failover
 * ```typescript
 * // Implement provider failover logic
 * const attemptTtsWithFailover = async (text: string) => {
 *   const providers = TtsProviders.allSingle();
 *   
 *   for (const provider of providers) {
 *     try {
 *       const result = await callTtsProvider(provider, text);
 *       console.log(`Success with provider: ${provider}`);
 *       return result;
 *     } catch (error) {
 *       console.warn(`Failed with ${provider}, trying next...`);
 *     }
 *   }
 *   
 *   throw new Error('All providers failed');
 * };
 * ```
 * 
 * @example Provider statistics tracking
 * ```typescript
 * // Track usage statistics per provider
 * class ProviderStats {
 *   private stats = new Map<string, { calls: number; errors: number; totalLatency: number }>();
 *   
 *   constructor() {
 *     // Initialize stats for all providers
 *     TtsProviders.allSingle().forEach(provider => {
 *       this.stats.set(provider, { calls: 0, errors: 0, totalLatency: 0 });
 *     });
 *   }
 *   
 *   recordCall(provider: string, latency: number, error: boolean = false) {
 *     const stat = this.stats.get(provider);
 *     if (stat) {
 *       stat.calls++;
 *       stat.totalLatency += latency;
 *       if (error) stat.errors++;
 *     }
 *   }
 *   
 *   getBestProvider(): string {
 *     let bestProvider = TtsProviders.google;
 *     let bestScore = 0;
 *     
 *     this.stats.forEach((stat, provider) => {
 *       const successRate = (stat.calls - stat.errors) / stat.calls;
 *       const avgLatency = stat.totalLatency / stat.calls;
 *       const score = successRate / avgLatency; // Higher is better
 *       
 *       if (score > bestScore) {
 *         bestScore = score;
 *         bestProvider = provider;
 *       }
 *     });
 *     
 *     return bestProvider;
 *   }
 * }
 * ```
 */
export class TtsProviders {
  /** Google Cloud Text-to-Speech provider identifier */
  static readonly google: string = 'google';
  
  /** Microsoft Azure Speech Services provider identifier */
  static readonly microsoft: string = 'microsoft';
  
  /** Amazon Polly provider identifier */
  static readonly amazon: string = 'amazon';
  
  /** Combined/Multi-provider mode identifier for aggregating multiple providers */
  static readonly combine: string = 'combine';

  /** Prevents instantiation of this utility class */
  private constructor() {} // Prevent instantiation

  /**
   * Returns an array of all supported provider identifiers including combined mode.
   * Includes all single providers plus the special 'combine' mode for multi-provider operations.
   * Use this when you need to validate against all possible provider values.
   * 
   * @returns Array containing all provider identifiers: google, microsoft, amazon, combine
   * 
   * @example Complete provider validation
   * ```typescript
   * // Validate user input against all possible providers
   * const isValidProvider = (provider: string): boolean => {
   *   return TtsProviders.all().includes(provider);
   * };
   * 
   * console.log(isValidProvider('google'));   // true
   * console.log(isValidProvider('combine'));  // true
   * console.log(isValidProvider('invalid'));  // false
   * ```
   * 
   * @example Provider selection UI
   * ```typescript
   * // Generate dropdown options for all providers
   * const createProviderOptions = () => {
   *   return TtsProviders.all().map(provider => ({
   *     value: provider,
   *     label: provider.charAt(0).toUpperCase() + provider.slice(1),
   *     description: getProviderDescription(provider)
   *   }));
   * };
   * 
   * const getProviderDescription = (provider: string): string => {
   *   switch (provider) {
   *     case TtsProviders.google: return 'Google Cloud Text-to-Speech';
   *     case TtsProviders.microsoft: return 'Microsoft Azure Speech';
   *     case TtsProviders.amazon: return 'Amazon Polly';
   *     case TtsProviders.combine: return 'Combined Multi-Provider';
   *     default: return 'Unknown Provider';
   *   }
   * };
   * ```
   * 
   * @example Configuration iteration
   * ```typescript
   * // Process configuration for all providers
   * const initializeAllProviders = async (config: any) => {
   *   const providers = TtsProviders.all();
   *   const results = [];
   *   
   *   for (const provider of providers) {
   *     try {
   *       if (provider === TtsProviders.combine) {
   *         // Special handling for combined mode
   *         const combinedResult = await initializeCombinedMode(config);
   *         results.push({ provider, status: 'success', result: combinedResult });
   *       } else {
   *         // Single provider initialization
   *         const singleResult = await initializeSingleProvider(provider, config);
   *         results.push({ provider, status: 'success', result: singleResult });
   *       }
   *     } catch (error) {
   *       results.push({ provider, status: 'error', error: error.message });
   *     }
   *   }
   *   
   *   return results;
   * };
   * ```
   * 
   * @example Feature detection
   * ```typescript
   * // Check which providers support specific features
   * const checkFeatureSupport = (feature: string) => {
   *   const supportMatrix = {};
   *   
   *   TtsProviders.all().forEach(provider => {
   *     supportMatrix[provider] = checkProviderFeature(provider, feature);
   *   });
   *   
   *   return supportMatrix;
   * };
   * 
   * // Usage
   * const ssmlSupport = checkFeatureSupport('ssml');
   * console.log(ssmlSupport);
   * // { google: true, microsoft: true, amazon: true, combine: true }
   * ```
   */
  static all(): string[] {
    return [
      TtsProviders.google,
      TtsProviders.microsoft,
      TtsProviders.amazon,
      TtsProviders.combine,
    ];
  }

  /**
   * Returns an array of single provider identifiers, excluding the combined mode.
   * Use this when you need to work with individual TTS providers without multi-provider aggregation.
   * Excludes the 'combine' mode which is used for multi-provider operations.
   * 
   * @returns Array containing single provider identifiers: google, microsoft, amazon
   * 
   * @example Single provider processing
   * ```typescript
   * // Process each individual provider separately
   * const processEachProvider = async (text: string) => {
   *   const providers = TtsProviders.allSingle();
   *   const results = {};
   *   
   *   for (const provider of providers) {
   *     try {
   *       results[provider] = await convertTextWithProvider(provider, text);
   *       console.log(`${provider}: Success`);
   *     } catch (error) {
   *       results[provider] = { error: error.message };
   *       console.log(`${provider}: Failed - ${error.message}`);
   *     }
   *   }
   *   
   *   return results;
   * };
   * ```
   * 
   * @example Provider comparison
   * ```typescript
   * // Compare results from all single providers
   * const compareProviders = async (text: string) => {
   *   const providers = TtsProviders.allSingle();
   *   const comparisons = [];
   *   
   *   for (const provider of providers) {
   *     const startTime = Date.now();
   *     
   *     try {
   *       const result = await synthesizeText(provider, text);
   *       const duration = Date.now() - startTime;
   *       
   *       comparisons.push({
   *         provider,
   *         success: true,
   *         duration,
   *         audioSize: result.audioData.length,
   *         quality: result.quality
   *       });
   *     } catch (error) {
   *       comparisons.push({
   *         provider,
   *         success: false,
   *         duration: Date.now() - startTime,
   *         error: error.message
   *       });
   *     }
   *   }
   *   
   *   return comparisons.sort((a, b) => a.duration - b.duration);
   * };
   * ```
   * 
   * @example Round-robin provider selection
   * ```typescript
   * // Implement round-robin selection among single providers
   * class ProviderRoundRobin {
   *   private providers: string[];
   *   private currentIndex: number = 0;
   *   
   *   constructor() {
   *     this.providers = TtsProviders.allSingle();
   *   }
   *   
   *   getNextProvider(): string {
   *     const provider = this.providers[this.currentIndex];
   *     this.currentIndex = (this.currentIndex + 1) % this.providers.length;
   *     return provider;
   *   }
   *   
   *   resetRotation(): void {
   *     this.currentIndex = 0;
   *   }
   * }
   * 
   * // Usage
   * const roundRobin = new ProviderRoundRobin();
   * console.log(roundRobin.getNextProvider()); // 'google'
   * console.log(roundRobin.getNextProvider()); // 'microsoft'
   * console.log(roundRobin.getNextProvider()); // 'amazon'
   * console.log(roundRobin.getNextProvider()); // 'google' (cycles back)
   * ```
   * 
   * @example Provider health checking
   * ```typescript
   * // Monitor health of all single providers
   * const monitorProviderHealth = async () => {
   *   const providers = TtsProviders.allSingle();
   *   const healthStatus = {};
   *   
   *   await Promise.all(providers.map(async (provider) => {
   *     try {
   *       const startTime = Date.now();
   *       await performHealthCheck(provider);
   *       const responseTime = Date.now() - startTime;
   *       
   *       healthStatus[provider] = {
   *         status: 'healthy',
   *         responseTime,
   *         lastChecked: new Date().toISOString()
   *       };
   *     } catch (error) {
   *       healthStatus[provider] = {
   *         status: 'unhealthy',
   *         error: error.message,
   *         lastChecked: new Date().toISOString()
   *       };
   *     }
   *   }));
   *   
   *   return healthStatus;
   * };
   * 
   * // Usage
   * const health = await monitorProviderHealth();
   * console.log('Provider Health Status:', health);
   * ```
   * 
   * @example Load balancing configuration
   * ```typescript
   * // Configure load balancing weights for single providers
   * class WeightedProviderSelector {
   *   private providers: string[];
   *   private weights: Map<string, number>;
   *   
   *   constructor(weights?: Record<string, number>) {
   *     this.providers = TtsProviders.allSingle();
   *     this.weights = new Map();
   *     
   *     // Default equal weights
   *     this.providers.forEach(provider => {
   *       this.weights.set(provider, weights?.[provider] || 1);
   *     });
   *   }
   *   
   *   selectProvider(): string {
   *     const totalWeight = Array.from(this.weights.values()).reduce((sum, weight) => sum + weight, 0);
   *     let random = Math.random() * totalWeight;
   *     
   *     for (const [provider, weight] of this.weights) {
   *       random -= weight;
   *       if (random <= 0) {
   *         return provider;
   *       }
   *     }
   *     
   *     return this.providers[0]; // Fallback
   *   }
   * }
   * 
   * // Usage with custom weights
   * const selector = new WeightedProviderSelector({
   *   [TtsProviders.google]: 3,    // 50% weight
   *   [TtsProviders.microsoft]: 2, // 33% weight
   *   [TtsProviders.amazon]: 1     // 17% weight
   * });
   * ```
   */
  static allSingle(): string[] {
    return [TtsProviders.google, TtsProviders.microsoft, TtsProviders.amazon];
  }
}
