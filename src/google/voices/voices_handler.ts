/**
 * @fileoverview Google Cloud Text-to-Speech Voices Handler
 * 
 * This module provides the main voices handler for Google Cloud Text-to-Speech
 * operations. It manages voice discovery, caching, and processing with comprehensive
 * voice filtering, name mapping, and performance optimization capabilities.
 * 
 * The handler implements intelligent caching strategies, supports custom voice
 * name mapping, provides cache management utilities, and ensures optimal
 * performance for voice listing operations. It integrates seamlessly with
 * Google TTS API and provides enterprise-grade voice management features.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link https://cloud.google.com/text-to-speech/docs/voices | Google TTS Voices}
 * @see {@link CacheInstances} for cache management functionality
 * 
 * @example Basic Voice Discovery
 * ```typescript
 * import { VoicesHandlerGoogle } from './voices_handler.js';
 * import { VoicesParamsGoogle } from './voices_params.js';
 * import { AuthenticationHeaderGoogle } from '../auth/authentication_types.js';
 * 
 * const handler = new VoicesHandlerGoogle();
 * const authHeader: AuthenticationHeaderGoogle = {
 *   type: 'Authorization',
 *   headerValue: 'Bearer your-access-token'
 * };
 * 
 * const params = new VoicesParamsGoogle({
 *   nameOptions: {
 *     maleNames: ['male'],
 *     femaleNames: ['female'],
 *     neutralNames: ['neutral']
 *   }
 * });
 * 
 * const voicesResponse = await handler.getVoices(params, authHeader);
 * console.log(`Found ${voicesResponse.voices.length} voices`);
 * ```
 * 
 * @example Advanced Voice Processing with Custom Mapping
 * ```typescript
 * import { VoicesHandlerGoogle } from './voices_handler.js';
 * 
 * const handler = new VoicesHandlerGoogle();
 * 
 * const params = new VoicesParamsGoogle({
 *   nameOptions: {
 *     maleNames: ['man', 'male', 'masculine'],
 *     femaleNames: ['woman', 'female', 'feminine'],
 *     maleNamesMapper: (voice) => {
 *       return voice.isNeural2() ? `${voice.name}-Neural` : voice.name;
 *     },
 *     femaleNamesMapper: (voice) => {
 *       return voice.isWaveNet() ? `${voice.name}-Wave` : voice.name;
 *     }
 *   }
 * });
 * 
 * const voicesResponse = await handler.getVoices(params, authHeader);
 * // Voices automatically processed with custom naming
 * ```
 * 
 * @example Production Voice Management with Caching
 * ```typescript
 * import { VoicesHandlerGoogle } from './voices_handler.js';
 * 
 * class GoogleVoiceManager {
 *   private handler = new VoicesHandlerGoogle();
 * 
 *   async discoverVoices(authHeader: AuthenticationHeaderGoogle): Promise<VoiceGoogle[]> {
 *     try {
 *       // Check cache statistics
 *       const stats = VoicesHandlerGoogle.getCacheStats();
 *       console.log(`Cache hit rate: ${stats.hitRate}%`);
 * 
 *       const params = new VoicesParamsGoogle({
 *         nameOptions: this.getStandardNameOptions()
 *       });
 * 
 *       const result = await this.handler.getVoices(params, authHeader);
 *       return result.voices;
 *     } catch (error) {
 *       console.error('Voice discovery failed:', error);
 *       throw error;
 *     }
 *   }
 * 
 *   async refreshVoiceCache(): Promise<void> {
 *     VoicesHandlerGoogle.clearCache();
 *     console.log('Voice cache cleared');
 *   }
 * 
 *   private getStandardNameOptions() {
 *     return {
 *       maleNames: ['male', 'man'],
 *       femaleNames: ['female', 'woman'],
 *       neutralNames: ['neutral', 'unisex']
 *     };
 *   }
 * }
 * ```
 * 
 * @example Language-Specific Voice Discovery
 * ```typescript
 * import { VoicesHandlerGoogle } from './voices_handler.js';
 * 
 * const handler = new VoicesHandlerGoogle();
 * 
 * // Configure for specific language processing
 * const params = new VoicesParamsGoogle({
 *   nameOptions: {
 *     maleNames: ['masculino', 'hombre'], // Spanish male names
 *     femaleNames: ['femenino', 'mujer'], // Spanish female names
 *     neutralNames: ['neutro']
 *   }
 * });
 * 
 * const voicesResponse = await handler.getVoices(params, authHeader);
 * const spanishVoices = voicesResponse.voices.filter(v => 
 *   v.languageCode.startsWith('es-')
 * );
 * ```
 */

import axios, { AxiosInstance } from 'axios';
import { VoicesSuccessGoogle } from './voices_responses.js';
import { VoicesClientGoogle } from './voices_client.js';
import { VoicesResponseMapperGoogle } from './voices_response_mapper.js';
import { EndpointsGoogle } from '../common/constants.js';
import { AuthenticationHeaderGoogle } from '../auth/authentication_types.js';
import { VoicesParamsGoogle } from './voices_params.js';
import { CacheInstances } from '../../common/cache/cache_manager.js';

/**
 * Google Cloud Text-to-Speech voices handler
 * 
 * Main handler class for Google TTS voice operations including discovery,
 * caching, and processing. Provides comprehensive voice management with
 * intelligent caching, custom name mapping, and performance optimization.
 * 
 * The handler automatically caches voice responses based on parameters,
 * implements cache invalidation strategies, and provides utilities for
 * cache management and performance monitoring.
 * 
 * @example Basic Voice Listing
 * ```typescript
 * const handler = new VoicesHandlerGoogle();
 * const voices = await handler.getVoices(params, authHeader);
 * console.log(`Available voices: ${voices.voices.length}`);
 * ```
 * 
 * @example With Cache Management
 * ```typescript
 * // Clear cache when needed
 * VoicesHandlerGoogle.clearCache();
 * 
 * // Check cache performance
 * const stats = VoicesHandlerGoogle.getCacheStats();
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class VoicesHandlerGoogle {
  public async getVoices(
    params: VoicesParamsGoogle,
    authHeader: AuthenticationHeaderGoogle,
  ): Promise<VoicesSuccessGoogle> {
    const cache = CacheInstances.getVoiceCache();
    
    // Create cache key based on parameters (excluding sensitive auth info)
    const cacheKey = this.createCacheKey(params);
    
    // Try to get from cache first
    const cached = cache.get(cacheKey) as VoicesSuccessGoogle;
    if (cached) {
      return cached;
    }

    const client: AxiosInstance = axios.create();
    const voicesClient: VoicesClientGoogle = new VoicesClientGoogle(
      client,
      authHeader,
    );
    const mapper = new VoicesResponseMapperGoogle(params);

    try {
      const httpProxy = params.httpProxy?.();

      const response = await voicesClient.send({
        url: httpProxy?.url ?? EndpointsGoogle.voices,
        ...(httpProxy?.headers && { headers: httpProxy.headers }),
        ...(httpProxy?.params && { params: httpProxy.params }),
        method: 'GET',
      });

      const voicesResponse = mapper.map(response);

      if (voicesResponse instanceof VoicesSuccessGoogle) {
        // Cache the successful response
        cache.set(cacheKey, voicesResponse, this.getCacheTtl(params));
        return voicesResponse;
      } else {
        throw voicesResponse;
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   * Create a cache key based on voice parameters
   */
  private createCacheKey(params: VoicesParamsGoogle): string {
    const keyParts = [
      'google',
      'voices',
      params.nameOptions.maleNames ? params.nameOptions.maleNames.join(',') : 'default-male',
      params.nameOptions.femaleNames ? params.nameOptions.femaleNames.join(',') : 'default-female',
      params.nameOptions.neutralNames ? params.nameOptions.neutralNames.join(',') : 'default-neutral',
      params.nameOptions.maleNamesMapper ? 'custom-male-mapper' : 'no-male-mapper',
      params.nameOptions.femaleNamesMapper ? 'custom-female-mapper' : 'no-female-mapper',
      params.nameOptions.neutralNamesMapper ? 'custom-neutral-mapper' : 'no-neutral-mapper',
    ];
    
    return keyParts.join(':');
  }

  /**
   * Get cache TTL based on parameters
   */
  private getCacheTtl(params: VoicesParamsGoogle): number {
    // Use longer cache for default parameters (30 minutes)
    // Use shorter cache for custom name mappings (10 minutes)
    if (params.nameOptions.maleNamesMapper || 
        params.nameOptions.femaleNamesMapper || 
        params.nameOptions.neutralNamesMapper) {
      return 600000; // 10 minutes for custom mappers
    }
    
    return 1800000; // 30 minutes for standard requests
  }

  /**
   * Clear voice cache for Google
   */
  public static clearCache(): void {
    const cache = CacheInstances.getVoiceCache();
    cache.invalidatePattern('^google:voices:');
  }

  /**
   * Get cache statistics for Google voices
   */
  public static getCacheStats(): { entries: number; hitRate: number } {
    const cache = CacheInstances.getVoiceCache();
    const stats = cache.getStats();
    const googleEntries = cache.keys().filter(key => key.startsWith('google:voices:')).length;
    
    return {
      entries: googleEntries,
      hitRate: stats.hitRate,
    };
  }
}
