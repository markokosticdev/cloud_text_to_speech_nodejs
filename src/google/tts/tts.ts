/**
 * @fileoverview Google Cloud Text-to-Speech API Implementation
 * 
 * This module provides the core TTS functionality for Google Cloud Text-to-Speech including
 * audio synthesis, voice management, and SSML processing. It handles authentication,
 * request formatting, response parsing, and error handling specific to Google's API.
 * 
 * The implementation includes rate limiting, retry logic, and comprehensive error
 * mapping to provide a consistent interface regardless of Google-specific quirks.
 * It supports all Google TTS features including Neural2 voices, WaveNet voices,
 * custom voice models, and advanced SSML processing.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link https://cloud.google.com/text-to-speech/docs | Google Cloud TTS Documentation}
 * 
 * @example Basic Google TTS Usage
 * ```typescript
 * import { TtsGoogle } from 'cloud-text-to-speech';
 * 
 * // Initialize with API key
 * TtsGoogle.init({
 *   params: { apiKey: 'your-google-api-key' },
 *   withLogs: true
 * });
 * 
 * // Convert text to speech
 * const result = await TtsGoogle.convertTts({
 *   text: 'Hello from Google Cloud TTS',
 *   voice: { 
 *     name: 'en-US-Neural2-A',
 *     languageCode: 'en-US'
 *   },
 *   audioConfig: {
 *     audioEncoding: 'MP3'
 *   }
 * });
 * 
 * console.log(`Generated ${result.audio.length} bytes of audio`);
 * ```
 * 
 * @example Advanced Usage with Voice Selection
 * ```typescript
 * import { TtsGoogle } from 'cloud-text-to-speech';
 * 
 * // Initialize Google TTS
 * TtsGoogle.init({
 *   params: { 
 *     apiKey: 'your-api-key',
 *     projectId: 'your-project-id'
 *   },
 *   withLogs: false
 * });
 * 
 * // Get available voices
 * const voices = await TtsGoogle.getVoices({
 *   languageCode: 'en-US'
 * });
 * 
 * console.log(`Found ${voices.voices.length} English voices`);
 * 
 * // Use Neural2 voice with custom audio settings
 * const result = await TtsGoogle.convertTts({
 *   text: 'Advanced Google TTS with custom settings',
 *   voice: {
 *     name: 'en-US-Neural2-F',
 *     languageCode: 'en-US'
 *   },
 *   audioConfig: {
 *     audioEncoding: 'OGG_OPUS',
 *     speakingRate: 1.2,
 *     pitch: 2.0,
 *     volumeGainDb: 1.0
 *   }
 * });
 * ```
 * 
 * @example SSML Processing with Google Features
 * ```typescript
 * import { TtsGoogle } from 'cloud-text-to-speech';
 * 
 * // Initialize Google TTS
 * TtsGoogle.init({
 *   params: { apiKey: 'your-api-key' },
 *   withLogs: true
 * });
 * 
 * // Use Google-specific SSML features
 * const ssmlText = `
 *   <speak>
 *     <par>
 *       <media xml:id="intro" begin="0.5s">
 *         <speak>Welcome to Google Cloud TTS</speak>
 *       </media>
 *       <media xml:id="background" begin="1.0s" fadeOutDur="2.0s">
 *         <audio src="https://example.com/background.mp3"/>
 *       </media>
 *     </par>
 *     <break time="1s"/>
 *     <prosody rate="slow" pitch="+2st">
 *       This is enhanced speech synthesis
 *     </prosody>
 *   </speak>
 * `;
 * 
 * const result = await TtsGoogle.convertTts({
 *   ssml: ssmlText,
 *   voice: { 
 *     name: 'en-US-Neural2-D',
 *     languageCode: 'en-US'
 *   },
 *   audioConfig: {
 *     audioEncoding: 'LINEAR16',
 *     sampleRateHertz: 24000
 *   }
 * });
 * ```
 * 
 * @example Error Handling and Retry Logic
 * ```typescript
 * import { TtsGoogle } from 'cloud-text-to-speech';
 * import { TtsError } from 'cloud-text-to-speech/common';
 * 
 * try {
 *   TtsGoogle.init({
 *     params: { apiKey: 'your-api-key' },
 *     withLogs: true
 *   });
 * 
 *   const result = await TtsGoogle.convertTts({
 *     text: 'Test Google TTS error handling',
 *     voice: { name: 'en-US-Standard-A' }
 *   });
 * 
 *   // Save audio to file
 *   await fs.writeFile('google-output.mp3', result.audio);
 *   
 * } catch (error) {
 *   if (error instanceof TtsError) {
 *     console.error(`Google TTS Error: ${error.getUserMessage()}`);
 *     
 *     if (error.code === 'QUOTA_EXCEEDED') {
 *       console.log('Rate limit hit, implement exponential backoff');
 *     } else if (error.code === 'INVALID_ARGUMENT') {
 *       console.log('Check voice name and parameters');
 *     }
 *   }
 * }
 * ```
 */

// Assuming necessary imports are done above
import { AudioHandlerGoogle } from '../convert/audio/audio_handler.js';
import { VoicesHandlerGoogle } from '../voices/voices_handler.js';
import { RepositoryGoogle } from './tts_repository.js';
import { InitParamsGoogle } from '../common/init.js';
import { ConfigGoogle } from '../common/config.js';
import { Log } from '../../common/utils/log.js';
import { ConvertParamsGoogle } from '../convert/convert_params.js';
import { AudioSuccessGoogle } from '../convert/audio/audio_responses.js';
import { VoicesSuccessGoogle } from '../voices/voices_responses.js';
import { VoicesParamsGoogle } from '../voices/voices_params.js';

/**
 * Google Cloud Text-to-Speech API client implementation
 * 
 * This class provides a complete interface for Google Cloud Text-to-Speech services,
 * including voice synthesis, voice listing, and comprehensive error handling.
 * It supports all Google TTS features including Neural2 voices, WaveNet voices,
 * custom voice models, and advanced SSML processing with Google-specific extensions.
 * 
 * The client handles authentication via API keys, manages rate limiting,
 * implements retry logic with exponential backoff, and provides detailed
 * error reporting for production applications.
 * 
 * @example Basic Text-to-Speech
 * ```typescript
 * // Initialize the Google TTS client
 * TtsGoogle.init({
 *   params: { apiKey: 'your-google-api-key' },
 *   withLogs: true
 * });
 * 
 * // Convert text to speech
 * const result = await TtsGoogle.convertTts({
 *   text: 'Hello from Google Cloud',
 *   voice: { 
 *     name: 'en-US-Neural2-A',
 *     languageCode: 'en-US'
 *   }
 * });
 * 
 * console.log(`Audio generated: ${result.audio.length} bytes`);
 * ```
 * 
 * @example Voice Management
 * ```typescript
 * // Get all available voices
 * const allVoices = await TtsGoogle.getVoices();
 * 
 * // Filter voices by language
 * const englishVoices = await TtsGoogle.getVoices({
 *   languageCode: 'en-US'
 * });
 * 
 * // Find Neural2 voices
 * const neuralVoices = allVoices.voices.filter(voice => 
 *   voice.name.includes('Neural2')
 * );
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class TtsGoogle {
  /**
   * Audio processing handler for Google TTS operations
   * @internal
   */
  private static audioHandler: AudioHandlerGoogle = new AudioHandlerGoogle();
  
  /**
   * Voice management handler for Google TTS operations
   * @internal
   */
  private static voicesHandler: VoicesHandlerGoogle = new VoicesHandlerGoogle();
  
  /**
   * Repository instance for Google TTS API interactions
   * @internal
   */
  private static repo: RepositoryGoogle;

  /**
   * Private constructor to prevent instantiation
   * @internal
   */
  private constructor() {}

  /**
   * Internal initialization state tracker
   * @internal
   */
  private static _initDone: boolean = false;

  /**
   * Indicates whether the Google TTS client has been initialized
   * 
   * @returns True if initialization has been completed
   * 
   * @example
   * ```typescript
   * if (!TtsGoogle.initDone) {
   *   TtsGoogle.init({
   *     params: { apiKey: 'your-api-key' },
   *     withLogs: true
   *   });
   * }
   * ```
   */
  public static get initDone(): boolean {
    return TtsGoogle._initDone;
  }

  /**
   * Initializes the Google Cloud Text-to-Speech client
   * 
   * This method MUST be called first before any other operations can be performed.
   * It sets up authentication, configures logging, and initializes internal components
   * required for TTS operations.
   * 
   * @param params - Google initialization parameters containing API key and optional project ID
   * @param withLogs - Enable detailed logging for debugging and monitoring
   * 
   * @throws {@link Error} When API key is missing or invalid
   * 
   * @example Basic Initialization
   * ```typescript
   * TtsGoogle.init({
   *   params: { 
   *     apiKey: 'your-google-api-key'
   *   },
   *   withLogs: true
   * });
   * ```
   * 
   * @example Initialization with Project ID
   * ```typescript
   * TtsGoogle.init({
   *   params: { 
   *     apiKey: 'your-google-api-key',
   *     projectId: 'your-gcp-project-id'
   *   },
   *   withLogs: false
   * });
   * ```
   * 
   * @example Environment Variable Configuration
   * ```typescript
   * TtsGoogle.init({
   *   params: { 
   *     apiKey: process.env.GOOGLE_TTS_API_KEY!,
   *     projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
   *   },
   *   withLogs: process.env.NODE_ENV === 'development'
   * });
   * ```
   * 
   * @since 3.0.0
   */
  public static init({
    params,
    withLogs = true,
  }: {
    params: InitParamsGoogle;
    withLogs: boolean;
  }): void {
    this._init(params.apiKey, withLogs);
  }

  /**
   * Retrieves available voices from Google Cloud Text-to-Speech
   * 
   * Fetches the complete list of available voices, optionally filtered by language code.
   * The response includes voice metadata such as supported languages, gender,
   * sample rates, and voice types (Standard, WaveNet, Neural2).
   * 
   * @param voicesParams - Optional parameters to filter voices by language or other criteria
   * @returns Promise resolving to Google voices response with voice list and metadata
   * 
   * @throws {@link TtsError} When the API request fails due to authentication, rate limiting, or network issues
   * 
   * @example Get All Voices
   * ```typescript
   * const allVoices = await TtsGoogle.getVoices();
   * 
   * console.log(`Total voices: ${allVoices.voices.length}`);
   * allVoices.voices.forEach(voice => {
   *   console.log(`${voice.name} - ${voice.languageCodes.join(', ')}`);
   * });
   * ```
   * 
   * @example Filter by Language
   * ```typescript
   * const englishVoices = await TtsGoogle.getVoices({
   *   languageCode: 'en-US'
   * });
   * 
   * const neuralVoices = englishVoices.voices.filter(voice => 
   *   voice.name.includes('Neural2')
   * );
   * 
   * console.log(`Found ${neuralVoices.length} Neural2 English voices`);
   * ```
   * 
   * @example Voice Selection Helper
   * ```typescript
   * const voices = await TtsGoogle.getVoices({ languageCode: 'es-ES' });
   * 
   * // Find premium voices
   * const premiumVoices = voices.voices.filter(voice => 
   *   voice.name.includes('Neural2') || voice.name.includes('WaveNet')
   * );
   * 
   * // Select voice by gender
   * const femaleVoices = voices.voices.filter(voice => 
   *   voice.ssmlGender === 'FEMALE'
   * );
   * ```
   * 
   * @since 3.0.0
   */
  public static async getVoices(
    voicesParams?: VoicesParamsGoogle,
  ): Promise<VoicesSuccessGoogle> {
    return TtsGoogle.repo.getVoices(voicesParams);
  }

  /**
   * Converts text to speech using Google Cloud Text-to-Speech
   * 
   * Synthesizes speech from text or SSML input using the specified voice and audio configuration.
   * Supports all Google TTS features including Neural2 voices, custom speaking rates,
   * pitch adjustment, volume control, and advanced SSML markup.
   * 
   * @param ttsParams - Conversion parameters including text/SSML, voice selection, and audio configuration
   * @returns Promise resolving to audio response containing synthesized speech data
   * 
   * @throws {@link TtsError} When conversion fails due to invalid parameters, quota limits, or API errors
   * 
   * @example Basic Text Conversion
   * ```typescript
   * const result = await TtsGoogle.convertTts({
   *   text: 'Welcome to Google Cloud Text-to-Speech',
   *   voice: {
   *     name: 'en-US-Neural2-A',
   *     languageCode: 'en-US'
   *   },
   *   audioConfig: {
   *     audioEncoding: 'MP3'
   *   }
   * });
   * 
   * // Save audio to file
   * await fs.writeFile('output.mp3', result.audio);
   * ```
   * 
   * @example Advanced SSML Conversion
   * ```typescript
   * const ssmlText = `
   *   <speak>
   *     <prosody rate="slow" pitch="+2st">
   *       Hello, this is <emphasis level="strong">Google</emphasis> TTS
   *     </prosody>
   *     <break time="1s"/>
   *     <say-as interpret-as="date" format="mdy">12/25/2024</say-as>
   *   </speak>
   * `;
   * 
   * const result = await TtsGoogle.convertTts({
   *   ssml: ssmlText,
   *   voice: {
   *     name: 'en-US-Neural2-F',
   *     languageCode: 'en-US'
   *   },
   *   audioConfig: {
   *     audioEncoding: 'LINEAR16',
   *     sampleRateHertz: 24000,
   *     speakingRate: 1.1,
   *     pitch: 0.5,
   *     volumeGainDb: 2.0
   *   }
   * });
   * ```
   * 
   * @example High-Quality Audio Configuration
   * ```typescript
   * const result = await TtsGoogle.convertTts({
   *   text: 'High-quality audio output',
   *   voice: {
   *     name: 'en-US-Neural2-D',
   *     languageCode: 'en-US'
   *   },
   *   audioConfig: {
   *     audioEncoding: 'LINEAR16',
   *     sampleRateHertz: 48000,
   *     speakingRate: 1.0,
   *     pitch: 0.0,
   *     volumeGainDb: 0.0,
   *     effectsProfileId: ['headphone-class-device']
   *   }
   * });
   * 
   * console.log(`Generated ${result.audio.length} bytes of high-quality audio`);
   * ```
   * 
   * @since 3.0.0
   */
  public static async convertTts(
    ttsParams: ConvertParamsGoogle,
  ): Promise<AudioSuccessGoogle> {
    return TtsGoogle.repo.convertTts(ttsParams);
  }

  /**
   * Internal initialization method
   * 
   * @param apiKey - Google Cloud TTS API key
   * @param withLogs - Whether to enable logging
   * @internal
   */
  public static _init(apiKey: string, withLogs = true): void {
    if (!TtsGoogle._initDone) {
      ConfigGoogle.init({ apiKey });
      TtsGoogle._initRepository();
      TtsGoogle._initLogs(withLogs);
      TtsGoogle._initDone = true;
      Log.d('TtsGoogle initialised');
    } else {
      Log.d('TtsGoogle initialised already!');
    }
  }

  /**
   * Initializes the internal repository with handlers
   * @internal
   */
  private static _initRepository(): void {
    TtsGoogle.repo = new RepositoryGoogle(
      TtsGoogle.voicesHandler,
      TtsGoogle.audioHandler,
    );
  }

  /**
   * Configures logging based on user preference
   * @param withLogs - Whether to enable logging
   * @internal
   */
  private static _initLogs(withLogs: boolean): void {
    if (withLogs) {
      Log.enable();
    } else {
      Log.disable();
    }
  }
}
