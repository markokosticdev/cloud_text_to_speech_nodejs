/**
 * @fileoverview Google Cloud Text-to-Speech Voices Response Mapper
 * 
 * This module provides response mapping functionality for Google Cloud Text-to-Speech
 * voice operations. It transforms raw HTTP responses from the Google TTS voices API into
 * structured response objects with proper voice data processing, error handling, and
 * voice name mapping capabilities.
 * 
 * The mapper handles voice data parsing, deduplication, sorting, and custom name mapping
 * based on provided parameters. It processes the voices array from Google TTS API
 * responses and creates optimized voice collections for application use.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link https://cloud.google.com/text-to-speech/docs/voices | Google TTS Voices}
 * @see {@link BaseResponseMapper} for base response mapping functionality
 * 
 * @example Basic Voice Response Mapping
 * ```typescript
 * import { VoicesResponseMapperGoogle } from './voices_response_mapper.js';
 * import { VoicesParamsGoogle } from './voices_params.js';
 * import { VoicesSuccessGoogle } from './voices_responses.js';
 * 
 * const params = new VoicesParamsGoogle({
 *   nameOptions: {
 *     maleNames: ['male'],
 *     femaleNames: ['female'],
 *     neutralNames: ['neutral']
 *   }
 * });
 * 
 * const mapper = new VoicesResponseMapperGoogle(params);
 * const response = await httpClient.get('/v1/voices');
 * const mappedResponse = mapper.map(response);
 * 
 * if (mappedResponse instanceof VoicesSuccessGoogle) {
 *   console.log(`Found ${mappedResponse.voices.length} voices`);
 * }
 * ```
 * 
 * @example Advanced Voice Processing with Custom Mapping
 * ```typescript
 * import { VoicesResponseMapperGoogle } from './voices_response_mapper.js';
 * 
 * const params = new VoicesParamsGoogle({
 *   nameOptions: {
 *     maleNames: ['man', 'male', 'masculine'],
 *     femaleNames: ['woman', 'female', 'feminine'],
 *     neutralNames: ['neutral', 'unisex'],
 *     maleNamesMapper: (voice) => voice.name.includes('Male') ? 'man' : voice.name,
 *     femaleNamesMapper: (voice) => voice.name.includes('Female') ? 'woman' : voice.name
 *   }
 * });
 * 
 * const mapper = new VoicesResponseMapperGoogle(params);
 * const result = mapper.map(httpResponse);
 * 
 * // Voices are automatically deduplicated, sorted, and name-mapped
 * ```
 * 
 * @example Error Response Handling
 * ```typescript
 * import { VoicesResponseMapperGoogle } from './voices_response_mapper.js';
 * import { VoicesFailedUnauthorizedGoogle } from './voices_responses.js';
 * 
 * const mapper = new VoicesResponseMapperGoogle(params);
 * 
 * try {
 *   const httpResponse = await httpClient.get('/v1/voices');
 *   const result = mapper.map(httpResponse);
 *   
 *   if (result instanceof VoicesFailedUnauthorizedGoogle) {
 *     console.error('Authentication failed - check API key');
 *   }
 * } catch (error) {
 *   console.error('Request failed:', error);
 * }
 * ```
 * 
 * @example Production Voice Processing Pipeline
 * ```typescript
 * import { VoicesResponseMapperGoogle } from './voices_response_mapper.js';
 * import { VoicesSuccessGoogle } from './voices_responses.js';
 * 
 * class GoogleVoiceProcessor {
 *   private mapper: VoicesResponseMapperGoogle;
 * 
 *   constructor(params: VoicesParamsGoogle) {
 *     this.mapper = new VoicesResponseMapperGoogle(params);
 *   }
 * 
 *   async processVoicesResponse(httpResponse: AxiosResponse): Promise<VoiceGoogle[]> {
 *     const mappedResponse = this.mapper.map(httpResponse);
 *     
 *     if (mappedResponse instanceof VoicesSuccessGoogle) {
 *       // Log success metrics
 *       this.logVoicesSuccess(mappedResponse);
 *       
 *       // Apply additional filtering if needed
 *       return this.applyAdditionalFiltering(mappedResponse.voices);
 *     } else {
 *       // Log error metrics
 *       this.logVoicesError(mappedResponse);
 *       throw new Error(`Voice listing failed: ${mappedResponse.reason}`);
 *     }
 *   }
 * 
 *   private logVoicesSuccess(response: VoicesSuccessGoogle): void {
 *     const neuralCount = response.voices.filter(v => v.isNeural2()).length;
 *     const waveNetCount = response.voices.filter(v => v.isWaveNet()).length;
 *     console.log(`Voices: ${response.voices.length} total, ${neuralCount} Neural2, ${waveNetCount} WaveNet`);
 *   }
 * }
 * ```
 */

import { AxiosResponse } from 'axios';
import { BaseResponseMapper } from '../../common/http/base_response_mapper.js';
import { VoiceGoogle } from './voices_model.js';
import { Helpers } from '../../common/utils/helpers.js';
import {
  VoicesFailedBadGateWayGoogle,
  VoicesFailedBadRequestGoogle,
  VoicesFailedTooManyRequestsGoogle,
  VoicesFailedUnauthorizedGoogle,
  VoicesFailedUnknownErrorGoogle,
  VoicesSuccessGoogle,
} from './voices_responses.js';
import { HttpResponseBase } from '../../common/http/http_response_base.js';
import { VoicesParamsGoogle } from './voices_params.js';

/**
 * Google Cloud Text-to-Speech voices response mapper
 * 
 * Maps raw HTTP responses from the Google TTS voices API to structured response objects.
 * Processes voice data including parsing, deduplication, sorting, and custom name mapping
 * based on provided parameters. Creates optimized voice collections for application use.
 * 
 * The mapper automatically processes the voices array from Google API responses,
 * applies helper functions for deduplication and sorting, and implements custom
 * name mapping based on the configuration parameters.
 * 
 * @example Basic Mapping
 * ```typescript
 * const mapper = new VoicesResponseMapperGoogle(params);
 * const mappedResponse = mapper.map(httpResponse);
 * 
 * if (mappedResponse instanceof VoicesSuccessGoogle) {
 *   // Process voice data
 *   const voices = mappedResponse.voices;
 * }
 * ```
 * 
 * @example With Custom Name Mapping
 * ```typescript
 * const params = new VoicesParamsGoogle({
 *   nameOptions: {
 *     maleNamesMapper: (voice) => `${voice.name}-Male`,
 *     femaleNamesMapper: (voice) => `${voice.name}-Female`
 *   }
 * });
 * 
 * const mapper = new VoicesResponseMapperGoogle(params);
 * // Voices will be automatically processed with custom naming
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class VoicesResponseMapperGoogle implements BaseResponseMapper {
  /**
   * Voice processing parameters including name mapping configuration
   * 
   * Contains the configuration for voice processing including custom name
   * mappers, gender-specific naming options, and other voice filtering
   * and transformation parameters.
   */
  params: VoicesParamsGoogle;

  /**
   * Creates a new Google voices response mapper
   * 
   * Initializes the mapper with voice processing parameters that define
   * how voices should be processed, including name mapping, filtering,
   * and transformation options.
   * 
   * @param params - Voice processing parameters and configuration
   * 
   * @example Basic Mapper Creation
   * ```typescript
   * const params = new VoicesParamsGoogle({
   *   nameOptions: {
   *     maleNames: ['male'],
   *     femaleNames: ['female']
   *   }
   * });
   * 
   * const mapper = new VoicesResponseMapperGoogle(params);
   * ```
   * 
   * @example With Advanced Configuration
   * ```typescript
   * const params = new VoicesParamsGoogle({
   *   nameOptions: {
   *     maleNames: ['man', 'male'],
   *     femaleNames: ['woman', 'female'],
   *     maleNamesMapper: (voice) => `${voice.name}-M`,
   *     femaleNamesMapper: (voice) => `${voice.name}-F`
   *   }
   * });
   * 
   * const mapper = new VoicesResponseMapperGoogle(params);
   * ```
   */
  constructor(params: VoicesParamsGoogle) {
    this.params = params;
  }

  /**
   * Maps an HTTP response to a structured Google TTS voices response object
   * 
   * Processes the HTTP response from Google TTS voices API and creates appropriate
   * response objects. For successful responses (200), parses voice data, removes
   * duplicates, sorts voices, and applies custom name mapping. For error responses,
   * creates specific error response objects based on HTTP status codes.
   * 
   * @param response - The raw HTTP response from Google TTS voices API
   * @returns Structured response object (success or error)
   * 
   * @example Success Response Processing
   * ```typescript
   * const mapper = new VoicesResponseMapperGoogle(params);
   * 
   * // HTTP 200 response with voices data
   * const httpResponse = {
   *   status: 200,
   *   data: {
   *     voices: [
   *       { name: 'en-US-Neural2-A', languageCode: 'en-US', ssmlGender: 'FEMALE' },
   *       { name: 'en-US-Neural2-B', languageCode: 'en-US', ssmlGender: 'MALE' }
   *     ]
   *   }
   * };
   * 
   * const result = mapper.map(httpResponse);
   * // Returns VoicesSuccessGoogle with processed voice data
   * ```
   * 
   * @example Error Response Processing
   * ```typescript
   * const mapper = new VoicesResponseMapperGoogle(params);
   * 
   * // HTTP 401 unauthorized response
   * const httpResponse = {
   *   status: 401,
   *   statusText: 'Unauthorized'
   * };
   * 
   * const result = mapper.map(httpResponse);
   * // Returns VoicesFailedUnauthorizedGoogle
   * ```
   * 
   * @example Voice Processing Pipeline
   * ```typescript
   * // The mapper automatically:
   * // 1. Parses voice data from JSON
   * // 2. Converts to VoiceGoogle objects
   * // 3. Removes duplicates
   * // 4. Sorts voices
   * // 5. Applies custom name mapping
   * const result = mapper.map(httpResponse);
   * ```
   */
  map(response: AxiosResponse): HttpResponseBase {
    switch (response.status) {
      case 200:
        const jsonData = response.data['voices'] as Array<object>;

        let voices = jsonData.map((e) => VoiceGoogle.fromJson(e as never));

        voices = Helpers.removeVoiceDuplicates(voices);

        voices = Helpers.sortVoices(voices);

        voices = Helpers.mapVoiceNames(voices, this.params.nameOptions);

        return new VoicesSuccessGoogle(voices);
      case 400:
        return new VoicesFailedBadRequestGoogle(response.statusText);
      case 401:
        return new VoicesFailedUnauthorizedGoogle();
      case 429:
        return new VoicesFailedTooManyRequestsGoogle();
      case 502:
        return new VoicesFailedBadGateWayGoogle();
      default:
        return new VoicesFailedUnknownErrorGoogle(
          response.status,
          response.statusText || JSON.stringify(response.data),
        );
    }
  }
}
