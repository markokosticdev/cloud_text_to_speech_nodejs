/**
 * @fileoverview Google Cloud Text-to-Speech Voice Request Parameters
 * 
 * This module defines parameter classes for Google Cloud Text-to-Speech voice
 * listing operations. It provides configuration options for voice filtering,
 * name mapping, and HTTP proxy settings when requesting available voices
 * from the Google TTS API.
 * 
 * The parameter system supports flexible voice selection criteria and
 * network configuration options for production environments with
 * proxy requirements or custom voice filtering needs.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link https://cloud.google.com/text-to-speech/docs/voices | Google TTS Voices}
 * 
 * @example Basic Voice Parameters
 * ```typescript
 * import { VoicesParamsGoogle } from './voices_params.js';
 * 
 * // Create default voice parameters
 * const params = new VoicesParamsGoogle();
 * 
 * // Use in voice listing
 * const voices = await TtsGoogle.getVoices(params);
 * console.log(`Found ${voices.voices.length} voices`);
 * ```
 * 
 * @example Custom Voice Name Options
 * ```typescript
 * import { VoicesParamsGoogle } from './voices_params.js';
 * import { VoicesNameOptionsGoogle } from './voices_name_options.js';
 * 
 * // Create custom name options
 * const nameOptions = new VoicesNameOptionsGoogle({
 *   maleNames: ['en-US-Neural2-A', 'en-US-Neural2-B'],
 *   femaleNames: ['en-US-Neural2-C', 'en-US-Neural2-F']
 * });
 * 
 * const params = new VoicesParamsGoogle({
 *   nameOptions
 * });
 * 
 * const voices = await TtsGoogle.getVoices(params);
 * ```
 * 
 * @example Proxy Configuration
 * ```typescript
 * import { VoicesParamsGoogle } from './voices_params.js';
 * import { HttpProxyMapperBase } from '../../common/http/http_proxy_base.js';
 * 
 * // Configure proxy for corporate environment
 * const proxyConfig = new HttpProxyMapperBase({
 *   host: 'proxy.company.com',
 *   port: 8080,
 *   auth: {
 *     username: 'user',
 *     password: 'pass'
 *   }
 * });
 * 
 * const params = new VoicesParamsGoogle({
 *   httpProxy: proxyConfig
 * });
 * 
 * // Voice requests will use proxy
 * const voices = await TtsGoogle.getVoices(params);
 * ```
 * 
 * @example Complete Configuration
 * ```typescript
 * import { VoicesParamsGoogle } from './voices_params.js';
 * import { VoicesNameOptionsGoogle } from './voices_name_options.js';
 * 
 * const params = new VoicesParamsGoogle({
 *   nameOptions: new VoicesNameOptionsGoogle({
 *     maleNames: ['en-US-Neural2-A'],
 *     femaleNames: ['en-US-Neural2-C']
 *   }),
 *   httpProxy: proxyConfig
 * });
 * 
 * const voices = await TtsGoogle.getVoices(params);
 * console.log('Filtered voices:', voices.voices.map(v => v.name));
 * ```
 */

import { HttpProxyMapperBase } from '../../common/http/http_proxy_base.js';
import { VoicesNameOptionsGoogle } from './voices_name_options.js';

/**
 * Parameters for Google Cloud Text-to-Speech voice listing operations
 * 
 * This class encapsulates all configuration options for requesting and filtering
 * voices from the Google TTS API. It includes voice name filtering options
 * and HTTP proxy configuration for network requests.
 * 
 * The parameters provide flexible voice selection and network configuration
 * capabilities for different deployment scenarios and voice filtering requirements.
 * 
 * @example Basic Usage
 * ```typescript
 * const params = new VoicesParamsGoogle();
 * const voices = await repository.getVoices(params);
 * ```
 * 
 * @example With Custom Filtering
 * ```typescript
 * const params = new VoicesParamsGoogle({
 *   nameOptions: new VoicesNameOptionsGoogle({
 *     femaleNames: ['en-US-Neural2-F', 'en-US-Neural2-C']
 *   })
 * });
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class VoicesParamsGoogle {
  /**
   * Voice name filtering and mapping options
   * Configures which voices to include and how to map voice names
   */
  nameOptions: VoicesNameOptionsGoogle;
  
  /**
   * HTTP proxy configuration for voice requests
   * Optional proxy settings for corporate or restricted network environments
   */
  httpProxy: HttpProxyMapperBase;

  /**
   * Creates new Google TTS voice parameters
   * 
   * @param nameOptions - Optional voice name filtering and mapping configuration
   * @param httpProxy - Optional HTTP proxy configuration for requests
   * 
   * @example Default Parameters
   * ```typescript
   * const params = new VoicesParamsGoogle();
   * // Uses default name options and no proxy
   * ```
   * 
   * @example Custom Name Filtering
   * ```typescript
   * const params = new VoicesParamsGoogle({
   *   nameOptions: new VoicesNameOptionsGoogle({
   *     maleNames: ['en-US-Neural2-A', 'en-US-Neural2-B'],
   *     femaleNames: ['en-US-Neural2-C', 'en-US-Neural2-F']
   *   })
   * });
   * ```
   * 
   * @example With Proxy Configuration
   * ```typescript
   * const params = new VoicesParamsGoogle({
   *   httpProxy: new HttpProxyMapperBase({
   *     host: 'proxy.example.com',
   *     port: 8080
   *   })
   * });
   * ```
   */
  constructor({
    nameOptions,
    httpProxy,
  }: {
    nameOptions?: VoicesNameOptionsGoogle;
    httpProxy?: HttpProxyMapperBase;
  } = {}) {
    this.nameOptions = nameOptions ?? new VoicesNameOptionsGoogle();
    this.httpProxy = httpProxy;
  }
}
