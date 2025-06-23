import { InitParamsGoogle } from '../../google/common/init.js';
import { InitParamsMicrosoft } from '../../microsoft/common/init.js';
import { InitParamsAmazon } from '../../amazon/common/init.js';
import { VoicesSuccessUniversal } from '../voices/voices_responses.js';
import { TtsProviders } from '../../common/tts/tts_providers.js';
import { TtsGoogle } from '../../google/tts/tts.js';
import { TtsMicrosoft } from '../../microsoft/tts/tts.js';
import { TtsAmazon } from '../../amazon/tts/tts.js';
import { ConvertParamsUniversal } from '../convert/convert_params.js';
import { AudioSuccessUniversal } from '../convert/audio/audio_responses.js';
import { ConvertParamsMapper } from '../convert/convert_params_mapper.js';
import { Log } from '../../common/utils/log.js';
import { Helpers } from '../../common/utils/helpers.js';
import { VoicesParamsUniversal } from '../voices/voices_params.js';
import { VoicesParamsMapper } from '../voices/voices_params_mapper.js';

/**
 * Universal Text-to-Speech interface supporting multiple cloud providers
 * 
 * This class provides a unified API for accessing Google Cloud Text-to-Speech,
 * Microsoft Azure Cognitive Services Speech, and Amazon Polly services.
 * It handles provider abstraction, parameter mapping, and response normalization
 * to provide a consistent interface regardless of the underlying provider.
 * 
 * The class supports both single-provider and multi-provider modes, allowing
 * developers to either work with a specific provider or aggregate results from
 * multiple providers simultaneously.
 * 
 * @example Basic Initialization and Usage
 * ```typescript
 * import { TtsUniversal } from 'cloud-text-to-speech';
 * 
 * // Initialize with Google Cloud TTS
 * TtsUniversal.init({
 *   provider: 'google',
 *   googleParams: { 
 *     apiKey: 'your-google-api-key'
 *   },
 *   microsoftParams: { 
 *     subscriptionKey: 'your-microsoft-key', 
 *     region: 'eastus' 
 *   },
 *   amazonParams: { 
 *     accessKeyId: 'your-aws-key',
 *     secretAccessKey: 'your-aws-secret',
 *     region: 'us-east-1'
 *   },
 *   withLogs: true
 * });
 * 
 * // Get available voices
 * const voices = await TtsUniversal.getVoices();
 * console.log(`Found ${voices.voices.length} available voices`);
 * 
 * // Convert text to speech
 * const result = await TtsUniversal.convertTts({
 *   text: 'Hello, world! This is a test of text-to-speech.',
 *   voice: { name: 'en-US-Standard-A' }
 * });
 * 
 * console.log(`Generated ${result.audio.length} bytes of audio data`);
 * ```
 * 
 * @example Multi-Provider Voice Aggregation
 * ```typescript
 * // Initialize with 'combine' to aggregate voices from all providers
 * TtsUniversal.init({
 *   provider: 'combine',
 *   googleParams: { apiKey: 'google-key' },
 *   microsoftParams: { subscriptionKey: 'microsoft-key', region: 'eastus' },
 *   amazonParams: { 
 *     accessKeyId: 'aws-key', 
 *     secretAccessKey: 'aws-secret', 
 *     region: 'us-east-1' 
 *   },
 *   withLogs: false
 * });
 * 
 * // Get voices from all initialized providers
 * const allVoices = await TtsUniversal.getVoices();
 * console.log(`Total voices across all providers: ${allVoices.voices.length}`);
 * 
 * // Voices are automatically sorted and deduplicated
 * const englishVoices = allVoices.voices.filter(v => 
 *   v.languageCodes?.some(lang => lang.startsWith('en'))
 * );
 * ```
 * 
 * @example Provider-Specific Conversion
 * ```typescript
 * // Convert using a specific provider by setting voice.provider
 * const result = await TtsUniversal.convertTts({
 *   text: 'This will use Google TTS specifically',
 *   voice: { 
 *     name: 'en-US-Neural2-A',
 *     provider: 'google'
 *   },
 *   audioConfig: {
 *     audioEncoding: 'MP3',
 *     speakingRate: 1.2,
 *     pitch: 0.5
 *   }
 * });
 * ```
 * 
 * @example Error Handling
 * ```typescript
 * try {
 *   const result = await TtsUniversal.convertTts({
 *     text: 'Test text',
 *     voice: { name: 'invalid-voice-name' }
 *   });
 * } catch (error) {
 *   if (error instanceof TtsAuthenticationError) {
 *     console.error('Authentication failed:', error.getUserMessage());
 *   } else if (error instanceof TtsRateLimitError) {
 *     console.error(`Rate limited, retry after ${error.retryAfter} seconds`);
 *   } else if (error instanceof TtsValidationError) {
 *     console.error('Validation error:', error.validationErrors);
 *   }
 * }
 * ```
 * 
 * @category Universal API
 * @since 3.0.0
 * @see {@link TtsGoogle} for Google Cloud TTS specific implementation
 * @see {@link TtsMicrosoft} for Microsoft Azure TTS specific implementation  
 * @see {@link TtsAmazon} for Amazon Polly specific implementation
 */
export class TtsUniversal {
  /**
   * Currently selected TTS provider
   * @internal
   */
  private static _provider: string;
  
  /**
   * Initialization state flag
   * @internal
   */
  private static _initDone: boolean = false;

  /**
   * Gets the initialization status of the TTS Universal service
   * 
   * @returns True if the service has been initialized, false otherwise
   * @readonly
   */
  static get initDone(): boolean {
    return TtsUniversal._initDone;
  }

  /**
   * Sets the active TTS provider
   * 
   * @param provider - The provider identifier ('google', 'microsoft', 'amazon', or 'combine')
   * @internal
   */
  static setProvider(provider: string): void {
    TtsUniversal._provider = provider.toLowerCase();
  }

  /**
   * Initializes the Universal TTS service with provider configurations
   * 
   * This method must be called before any other TTS operations. It configures
   * the authentication and settings for all specified providers. You can initialize
   * one or more providers simultaneously, and use 'combine' as the provider to
   * aggregate results from multiple services.
   * 
   * @param config - Configuration object for initialization
   * @param config.provider - TTS provider to use ('google', 'microsoft', 'amazon', or 'combine')
   * @param config.googleParams - Google Cloud TTS authentication and configuration
   * @param config.microsoftParams - Microsoft Azure TTS authentication and configuration  
   * @param config.amazonParams - Amazon Polly authentication and configuration
   * @param config.withLogs - Enable or disable logging (default: true)
   * 
   * @throws {@link TtsError} When initialization fails due to invalid configuration
   * @throws {@link TtsAuthenticationError} When provider credentials are invalid
   * @throws {@link TtsValidationError} When required parameters are missing
   * 
   * @example Single Provider Initialization
   * ```typescript
   * TtsUniversal.init({
   *   provider: 'google',
   *   googleParams: { 
   *     apiKey: 'your-api-key',
   *     // Optional: custom endpoint, timeout settings
   *   },
   *   microsoftParams: { subscriptionKey: '', region: '' }, // Still required but can be empty
   *   amazonParams: { accessKeyId: '', secretAccessKey: '', region: '' },
   *   withLogs: true
   * });
   * ```
   * 
   * @example Multi-Provider Initialization
   * ```typescript
   * TtsUniversal.init({
   *   provider: 'combine',
   *   googleParams: { 
   *     apiKey: process.env.GOOGLE_TTS_API_KEY!
   *   },
   *   microsoftParams: { 
   *     subscriptionKey: process.env.AZURE_SPEECH_KEY!,
   *     region: process.env.AZURE_SPEECH_REGION!
   *   },
   *   amazonParams: {
   *     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
   *     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
   *     region: process.env.AWS_REGION!
   *   },
   *   withLogs: false
   * });
   * ```
   * 
   * @since 3.0.0
   * @category Universal API
   */
  static init({
    provider,
    googleParams,
    microsoftParams,
    amazonParams,
    withLogs,
  }: {
    provider: string;
    googleParams: InitParamsGoogle;
    microsoftParams: InitParamsMicrosoft;
    amazonParams: InitParamsAmazon;
    withLogs: boolean;
  }): void {
    TtsUniversal._init(
      provider,
      googleParams,
      microsoftParams,
      amazonParams,
      withLogs,
    );
  }

  /**
   * Retrieves available voices from the configured TTS provider(s)
   * 
   * This method returns a list of voices available for text-to-speech conversion.
   * When using 'combine' provider, voices from all initialized providers are
   * aggregated, sorted, and deduplicated for a comprehensive voice list.
   * 
   * @param voicesParams - Optional parameters to filter or configure voice retrieval
   * @returns Promise resolving to voice list with metadata
   * 
   * @throws {@link TtsAuthenticationError} When API credentials are invalid or expired
   * @throws {@link TtsRateLimitError} When rate limits are exceeded  
   * @throws {@link TtsNetworkError} When network connectivity issues occur
   * @throws {@link TtsServiceError} When the TTS service is temporarily unavailable
   * @throws {@link TtsError} For other unexpected errors
   * 
   * @example Basic Voice Retrieval
   * ```typescript
   * // Get all available voices
   * const voices = await TtsUniversal.getVoices();
   * 
   * console.log(`Found ${voices.voices.length} voices`);
   * voices.voices.forEach(voice => {
   *   console.log(`${voice.name} - ${voice.languageCodes?.join(', ')}`);
   * });
   * ```
   * 
   * @example Filtered Voice Retrieval
   * ```typescript
   * // Get voices with specific language filter
   * const voices = await TtsUniversal.getVoices({
   *   languageCode: 'en-US'
   * });
   * 
   * // Find neural voices only
   * const neuralVoices = voices.voices.filter(voice =>
   *   voice.name.includes('Neural') || voice.name.includes('Standard')
   * );
   * ```
   * 
   * @example Multi-Provider Voice Aggregation  
   * ```typescript
   * // When provider is 'combine', voices from all providers are returned
   * const allVoices = await TtsUniversal.getVoices();
   * 
   * // Group voices by provider
   * const voicesByProvider = allVoices.voices.reduce((acc, voice) => {
   *   const provider = voice.provider || 'unknown';
   *   if (!acc[provider]) acc[provider] = [];
   *   acc[provider].push(voice);
   *   return acc;
   * }, {} as Record<string, typeof allVoices.voices>);
   * 
   * console.log(`Google voices: ${voicesByProvider.google?.length || 0}`);
   * console.log(`Microsoft voices: ${voicesByProvider.microsoft?.length || 0}`);
   * console.log(`Amazon voices: ${voicesByProvider.amazon?.length || 0}`);
   * ```
   * 
   * @since 3.0.0
   * @category Universal API
   */
  static async getVoices(
    voicesParams?: VoicesParamsUniversal,
  ): Promise<VoicesSuccessUniversal> {
    return this.handleProvider<Promise<VoicesSuccessUniversal>>({
      google: () => this._getVoices(TtsProviders.google, voicesParams),
      microsoft: () => this._getVoices(TtsProviders.microsoft, voicesParams),
      amazon: () => this._getVoices(TtsProviders.amazon, voicesParams),
      combine: async () => {
        const providers = [
          TtsProviders.google,
          TtsProviders.microsoft,
          TtsProviders.amazon,
        ];

        // Only query providers that have been initialized
        const activeProviders = providers.filter((provider) =>
          this.isProviderInitDone(provider),
        );

        const allVoicesPromises = activeProviders.map((provider) =>
          this._getVoices(provider, voicesParams),
        );

        const allVoices = await Promise.all(allVoicesPromises);

        const aggregatedVoices = new VoicesSuccessUniversal(
          [],
          200,
          'Aggregated voices from multiple providers',
        );
        let voices = allVoices.flatMap((voicesResult) => voicesResult.voices);

        // Sort and deduplicate voices
        voices = Helpers.sortVoices(voices);

        aggregatedVoices.voices = voices;

        return aggregatedVoices;
      },
    });
  }

  /**
   * Converts text to speech and returns audio data
   * 
   * This method processes the input text using the specified voice and returns
   * audio data in the requested format. The method handles provider-specific
   * parameter mapping and response normalization automatically.
   * 
   * @param ttsParams - Text-to-speech conversion parameters
   * @returns Promise resolving to audio response with metadata
   * 
   * @throws {@link TtsAuthenticationError} When API credentials are invalid or expired
   * @throws {@link TtsValidationError} When input parameters are invalid (e.g., unsupported voice, invalid SSML)
   * @throws {@link TtsRateLimitError} When rate limits are exceeded
   * @throws {@link TtsNetworkError} When network connectivity issues occur
   * @throws {@link TtsServiceError} When the TTS service encounters an internal error
   * @throws {@link TtsError} For other unexpected errors during conversion
   * 
   * @example Basic Text Conversion
   * ```typescript
   * const result = await TtsUniversal.convertTts({
   *   text: 'Hello, world! Welcome to text-to-speech.',
   *   voice: { 
   *     name: 'en-US-Standard-A'
   *   }
   * });
   * 
   * // Save audio to file
   * await fs.writeFile('output.mp3', result.audio);
   * console.log(`Generated ${result.audio.length} bytes of audio`);
   * ```
   * 
   * @example Advanced Conversion with Audio Configuration
   * ```typescript
   * const result = await TtsUniversal.convertTts({
   *   text: 'This is advanced text-to-speech with custom settings.',
   *   voice: { 
   *     name: 'en-US-Neural2-A',
   *     provider: 'google' // Force specific provider
   *   },
   *   audioConfig: {
   *     audioEncoding: 'MP3',
   *     speakingRate: 1.2,  // 20% faster
   *     pitch: 0.5,         // Slightly higher pitch
   *     volumeGainDb: 2.0   // Increase volume
   *   }
   * });
   * ```
   * 
   * @example SSML Text Conversion
   * ```typescript
   * const ssmlText = `
   *   <speak>
   *     <p>Welcome to our service!</p>
   *     <break time="1s"/>
   *     <p>Here's an important announcement:</p>
   *     <emphasis level="strong">This is very important!</emphasis>
   *     <break time="500ms"/>
   *     <prosody rate="slow" pitch="low">Thank you for listening.</prosody>
   *   </speak>
   * `;
   * 
   * const result = await TtsUniversal.convertTts({
   *   text: ssmlText,
   *   voice: { name: 'en-US-Standard-B' },
   *   audioConfig: {
   *     audioEncoding: 'MP3'
   *   }
   * });
   * ```
   * 
   * @example Error Handling and Retry Logic
   * ```typescript
   * async function convertWithRetry(text: string, maxRetries = 3) {
   *   for (let attempt = 1; attempt <= maxRetries; attempt++) {
   *     try {
   *       return await TtsUniversal.convertTts({
   *         text,
   *         voice: { name: 'en-US-Standard-A' }
   *       });
   *     } catch (error) {
   *       if (error instanceof TtsRateLimitError) {
   *         const delay = error.retryAfter || Math.pow(2, attempt) * 1000;
   *         console.log(`Rate limited, waiting ${delay}ms before retry ${attempt}/${maxRetries}`);
   *         await new Promise(resolve => setTimeout(resolve, delay));
   *       } else if (error instanceof TtsNetworkError && attempt < maxRetries) {
   *         console.log(`Network error, retrying attempt ${attempt}/${maxRetries}`);
   *         await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
   *       } else {
   *         throw error; // Re-throw non-retryable errors
   *       }
   *     }
   *   }
   *   throw new Error(`Failed after ${maxRetries} attempts`);
   * }
   * ```
   * 
   * @since 3.0.0
   * @category Universal API
   */
  static async convertTts(
    ttsParams: ConvertParamsUniversal,
  ): Promise<AudioSuccessUniversal> {
    return TtsUniversal.handleProvider<Promise<AudioSuccessUniversal>>({
      google: async () => {
        const audio = await TtsGoogle.convertTts(
          ConvertParamsMapper.toGoogle(ttsParams),
        );
        return new AudioSuccessUniversal(audio.audio, audio.code, audio.reason);
      },
      microsoft: async () => {
        const audio = await TtsMicrosoft.convertTts(
          ConvertParamsMapper.toMicrosoft(ttsParams),
        );
        return new AudioSuccessUniversal(audio.audio, audio.code, audio.reason);
      },
      amazon: async () => {
        const audio = await TtsAmazon.convertTts(
          ConvertParamsMapper.toAmazon(ttsParams),
        );
        return new AudioSuccessUniversal(audio.audio, audio.code, audio.reason);
      },
      provider: ttsParams.voice.provider,
    });
  }

  /**
   * Internal method to get voices from a specific provider
   * 
   * @param provider - The provider identifier
   * @param voicesParams - Optional voice retrieval parameters
   * @returns Promise resolving to universal voice response
   * @internal
   */
  private static async _getVoices(
    provider: string,
    voicesParams?: VoicesParamsUniversal,
  ): Promise<VoicesSuccessUniversal> {
    return this.handleProvider<Promise<VoicesSuccessUniversal>>({
      google: async () => {
        const voicesParamsGoogle = voicesParams
          ? VoicesParamsMapper.toGoogle(voicesParams)
          : undefined;
        const voices = await TtsGoogle.getVoices(voicesParamsGoogle);
        return new VoicesSuccessUniversal(
          voices.voices,
          voices.code,
          voices.reason,
        );
      },
      microsoft: async () => {
        const voicesParamsMicrosoft = voicesParams
          ? VoicesParamsMapper.toMicrosoft(voicesParams)
          : undefined;
        const voices = await TtsMicrosoft.getVoices(voicesParamsMicrosoft);
        return new VoicesSuccessUniversal(
          voices.voices,
          voices.code,
          voices.reason,
        );
      },
      amazon: async () => {
        const voicesParamsAmazon = voicesParams
          ? VoicesParamsMapper.toAmazon(voicesParams)
          : undefined;
        const voices = await TtsAmazon.getVoices(voicesParamsAmazon);
        return new VoicesSuccessUniversal(
          voices.voices,
          voices.code,
          voices.reason,
        );
      },
      provider: provider,
    });
  }

  /**
   * Internal initialization implementation
   * 
   * @param provider - TTS provider identifier
   * @param google - Google initialization parameters
   * @param microsoft - Microsoft initialization parameters  
   * @param amazon - Amazon initialization parameters
   * @param withLogs - Enable logging flag
   * @internal
   */
  private static _init(
    provider: string,
    google?: InitParamsGoogle,
    microsoft?: InitParamsMicrosoft,
    amazon?: InitParamsAmazon,
    withLogs: boolean = true,
  ): void {
    TtsUniversal._assertInitParams(provider, google, microsoft, amazon);
    TtsUniversal._initLogs(withLogs);

    TtsUniversal._provider = provider.toLowerCase();
    Log.d(`TtsUniversal provider set to: ${provider}`);

    const initializedProviders = [];

    if (!TtsUniversal._initDone) {
      if (google) {
        TtsGoogle.init({ params: google, withLogs });
        initializedProviders.push(TtsProviders.google);
      }
      if (microsoft) {
        TtsMicrosoft.init({ params: microsoft, withLogs });
        initializedProviders.push(TtsProviders.microsoft);
      }
      if (amazon) {
        TtsAmazon.init({ params: amazon, withLogs });
        initializedProviders.push(TtsProviders.amazon);
      }

      TtsUniversal._initDone = true;
      Log.d(`TtsUniversal initialised for: ${initializedProviders.join(', ')}`);
    } else {
      Log.d('TtsUniversal initialised already!');
    }
  }

  /**
   * Validates initialization parameters for the specified provider
   * 
   * Ensures that the required authentication and configuration parameters
   * are provided for the selected TTS provider. For the 'combine' provider,
   * at least one provider's parameters must be provided.
   * 
   * @param provider - The provider identifier to validate
   * @param google - Google Cloud TTS initialization parameters  
   * @param microsoft - Microsoft Azure TTS initialization parameters
   * @param amazon - Amazon Polly initialization parameters
   * @throws {Error} When no parameters are provided for any provider
   * @throws {Error} When required parameters are missing for the specified provider
   * @throws {Error} When an unknown provider is specified
   * @internal
   */
  private static _assertInitParams(
    provider: string,
    google?: InitParamsGoogle,
    microsoft?: InitParamsMicrosoft,
    amazon?: InitParamsAmazon,
  ): void {
    if (!google && !microsoft && !amazon) {
      throw new Error(
        'Initialization parameters are missing for all providers.',
      );
    }

    switch (provider) {
      case TtsProviders.google:
        if (!google)
          throw new Error('Google initialization parameters are missing.');
        break;
      case TtsProviders.microsoft:
        if (!microsoft)
          throw new Error('Microsoft initialization parameters are missing.');
        break;
      case TtsProviders.amazon:
        if (!amazon)
          throw new Error('Amazon initialization parameters are missing.');
        break;
      case TtsProviders.combine:
        // For combine mode, at least one provider should be configured
        break;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  /**
   * Routes operations to the appropriate provider implementation
   * 
   * This method acts as a dispatcher, routing method calls to the correct
   * provider implementation based on the current configuration or the
   * provider specified in the request. It ensures type safety while
   * providing a unified interface across different providers.
   * 
   * @param options - Provider operation options
   * @param options.google - Google provider operation function
   * @param options.microsoft - Microsoft provider operation function
   * @param options.amazon - Amazon provider operation function
   * @param options.combine - Multi-provider combine operation function
   * @param options.provider - Override provider for this specific operation
   * @returns Result from the appropriate provider operation
   * @throws {Error} When provider-specific operation function is missing
   * @throws {Error} When an unknown provider is specified
   * @internal
   */
  private static handleProvider<T>(options: {
    google?: () => T;
    microsoft?: () => T;
    amazon?: () => T;
    combine?: () => T;
    provider?: string;
  }): T {
    const provider = options.provider || TtsUniversal._provider;
    switch (provider) {
      case TtsProviders.google:
        if (!options.google)
          throw new Error('Google handle function is missing.');
        return options.google();
      case TtsProviders.microsoft:
        if (!options.microsoft)
          throw new Error('Microsoft handle function is missing.');
        return options.microsoft();
      case TtsProviders.amazon:
        if (!options.amazon)
          throw new Error('Amazon handle function is missing.');
        return options.amazon();
      case TtsProviders.combine:
        if (!options.combine)
          throw new Error('Combine handle function is missing.');
        return options.combine();
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  /**
   * Initializes the logging system based on configuration
   * 
   * Enables or disables logging throughout the TTS system based on the
   * provided configuration. When enabled, detailed logs are written for
   * debugging and monitoring purposes.
   * 
   * @param withLogs - Enable (true) or disable (false) logging
   * @internal
   */
  private static _initLogs(withLogs: boolean): void {
    if (withLogs) {
      Log.enable();
    } else {
      Log.disable();
    }
  }

  /**
   * Checks if a specific provider has been properly initialized
   * 
   * Verifies that the specified provider has completed its initialization
   * process and is ready to handle TTS requests. This is used internally
   * to ensure providers are available before attempting operations.
   * 
   * @param provider - Provider identifier to check
   * @returns True if the provider is initialized and ready, false otherwise
   * @throws {Error} When an unknown provider identifier is provided
   * @internal
   */
  private static isProviderInitDone(provider: string): boolean {
    switch (provider) {
      case TtsProviders.google:
        return TtsGoogle.initDone;
      case TtsProviders.microsoft:
        return TtsMicrosoft.initDone;
      case TtsProviders.amazon:
        return TtsAmazon.initDone;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }
}
