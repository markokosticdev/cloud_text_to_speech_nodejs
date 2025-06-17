import axios, { AxiosInstance } from 'axios';
import { VoicesSuccessGoogle } from './voices_responses.js';
import { VoicesClientGoogle } from './voices_client.js';
import { VoicesResponseMapperGoogle } from './voices_response_mapper.js';
import { EndpointsGoogle } from '../common/constants.js';
import { AuthenticationHeaderGoogle } from '../auth/authentication_types.js';
import { VoicesParamsGoogle } from './voices_params.js';
import { CacheInstances } from '../../common/cache/cache_manager.js';

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
