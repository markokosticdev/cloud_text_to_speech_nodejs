/**
 * @fileoverview Google Cloud Text-to-Speech Repository Pattern Implementation
 * 
 * This module implements the repository pattern for Google Cloud Text-to-Speech API
 * operations, providing a clean abstraction layer between the TTS service interface
 * and the underlying HTTP handlers. It manages authentication, request delegation,
 * and response handling for both voice listing and audio synthesis operations.
 * 
 * The repository pattern ensures separation of concerns, making the codebase more
 * maintainable and testable while providing a consistent interface for Google TTS
 * operations regardless of the underlying implementation details.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link https://cloud.google.com/text-to-speech/docs | Google Cloud TTS Documentation}
 * @see {@link https://martinfowler.com/eaaCatalog/repository.html | Repository Pattern}
 * 
 * @example Basic Repository Usage
 * ```typescript
 * import { RepositoryGoogle } from './tts_repository.js';
 * import { VoicesHandlerGoogle } from '../voices/voices_handler.js';
 * import { AudioHandlerGoogle } from '../convert/audio/audio_handler.js';
 * 
 * // Create repository with handlers
 * const repository = new RepositoryGoogle(
 *   new VoicesHandlerGoogle(),
 *   new AudioHandlerGoogle()
 * );
 * 
 * // Get available voices
 * const voices = await repository.getVoices();
 * console.log(`Found ${voices.voices.length} voices`);
 * 
 * // Convert text to speech
 * const audio = await repository.convertTts({
 *   text: 'Hello from Google TTS',
 *   voice: { name: 'en-US-Neural2-A' }
 * });
 * ```
 * 
 * @example Repository with Custom Parameters
 * ```typescript
 * import { RepositoryGoogle } from './tts_repository.js';
 * import { VoicesParamsGoogle } from '../voices/voices_params.js';
 * import { ConvertParamsGoogle } from '../convert/convert_params.js';
 * 
 * const repository = new RepositoryGoogle(voicesHandler, audioHandler);
 * 
 * // Get voices with language filter
 * const voicesParams = new VoicesParamsGoogle();
 * voicesParams.languageCode = 'en-US';
 * 
 * const englishVoices = await repository.getVoices(voicesParams);
 * 
 * // Convert with custom parameters
 * const convertParams = new ConvertParamsGoogle({
 *   text: 'Advanced Google TTS example',
 *   voice: { name: 'en-US-Neural2-F' },
 *   audioConfig: {
 *     audioEncoding: 'LINEAR16',
 *     sampleRateHertz: 24000
 *   }
 * });
 * 
 * const audio = await repository.convertTts(convertParams);
 * ```
 * 
 * @example Error Handling with Repository
 * ```typescript
 * import { RepositoryGoogle } from './tts_repository.js';
 * import { TtsError } from '../../common/errors/tts_error.js';
 * 
 * const repository = new RepositoryGoogle(voicesHandler, audioHandler);
 * 
 * try {
 *   const voices = await repository.getVoices();
 *   const audio = await repository.convertTts(params);
 *   
 *   console.log('TTS operations completed successfully');
 * } catch (error) {
 *   if (error instanceof TtsError) {
 *     console.error(`Google TTS Error: ${error.getUserMessage()}`);
 *     
 *     if (error.retryable) {
 *       console.log('Error is retryable, implementing backoff strategy');
 *     }
 *   }
 * }
 * ```
 * 
 * @example Repository Integration in Service Layer
 * ```typescript
 * import { RepositoryGoogle } from './tts_repository.js';
 * 
 * class GoogleTtsService {
 *   private repository: RepositoryGoogle;
 * 
 *   constructor(repository: RepositoryGoogle) {
 *     this.repository = repository;
 *   }
 * 
 *   async synthesizeSpeech(text: string, voiceName: string): Promise<Uint8Array> {
 *     const result = await this.repository.convertTts({
 *       text,
 *       voice: { name: voiceName }
 *     });
 *     
 *     return result.audio;
 *   }
 * 
 *   async getAvailableVoices(languageCode?: string): Promise<VoiceGoogle[]> {
 *     const params = languageCode ? { languageCode } : undefined;
 *     const result = await this.repository.getVoices(params);
 *     
 *     return result.voices;
 *   }
 * }
 * ```
 */

import { VoicesHandlerGoogle } from '../voices/voices_handler.js';
import { AudioHandlerGoogle } from '../convert/audio/audio_handler.js';
import { VoicesSuccessGoogle } from '../voices/voices_responses.js';
import { ApiKeyAuthenticationHeaderGoogle } from '../auth/authentication_types.js';
import { ConfigGoogle } from '../common/config.js';
import { ConvertParamsGoogle } from '../convert/convert_params.js';
import { AudioSuccessGoogle } from '../convert/audio/audio_responses.js';
import { VoicesParamsGoogle } from '../voices/voices_params.js';

/**
 * Repository pattern implementation for Google Cloud Text-to-Speech operations
 * 
 * This class provides a clean abstraction layer for Google TTS API operations,
 * implementing the repository pattern to separate business logic from data access.
 * It manages authentication, delegates requests to appropriate handlers, and
 * provides a consistent interface for voice management and audio synthesis.
 * 
 * The repository handles automatic authentication using the configured API key
 * and provides error handling and response mapping for all Google TTS operations.
 * It serves as the central coordination point for Google TTS functionality.
 * 
 * @example Creating and Using Repository
 * ```typescript
 * const repository = new RepositoryGoogle(
 *   new VoicesHandlerGoogle(),
 *   new AudioHandlerGoogle()
 * );
 * 
 * // Repository automatically handles authentication
 * const voices = await repository.getVoices();
 * const audio = await repository.convertTts(params);
 * ```
 * 
 * @example Dependency Injection Pattern
 * ```typescript
 * class TtsService {
 *   constructor(private repository: RepositoryGoogle) {}
 * 
 *   async processTextToSpeech(text: string): Promise<Uint8Array> {
 *     const result = await this.repository.convertTts({ text });
 *     return result.audio;
 *   }
 * }
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class RepositoryGoogle {
  /**
   * Handler for voice-related operations
   * @private
   */
  private voicesHandler: VoicesHandlerGoogle;
  
  /**
   * Handler for audio synthesis operations
   * @private
   */
  private audioHandler: AudioHandlerGoogle;

  /**
   * Creates a new Google TTS repository instance
   * 
   * @param voicesHandler - Handler for voice listing and management operations
   * @param audioHandler - Handler for audio synthesis and processing operations
   * 
   * @example
   * ```typescript
   * const repository = new RepositoryGoogle(
   *   new VoicesHandlerGoogle(),
   *   new AudioHandlerGoogle()
   * );
   * ```
   */
  constructor(
    voicesHandler: VoicesHandlerGoogle,
    audioHandler: AudioHandlerGoogle,
  ) {
    this.voicesHandler = voicesHandler;
    this.audioHandler = audioHandler;
  }

  /**
   * Retrieves available voices from Google Cloud Text-to-Speech
   * 
   * Fetches the list of available voices with optional filtering parameters.
   * The method automatically handles authentication using the configured API key
   * and delegates the actual request to the voices handler.
   * 
   * @param voicesParams - Optional parameters for filtering voices by language or other criteria
   * @returns Promise resolving to Google voices response with voice list and metadata
   * 
   * @throws {@link TtsError} When the request fails due to authentication, network, or API errors
   * 
   * @example Get All Voices
   * ```typescript
   * const voices = await repository.getVoices();
   * console.log(`Total voices: ${voices.voices.length}`);
   * 
   * voices.voices.forEach(voice => {
   *   console.log(`${voice.name} - ${voice.languageCodes.join(', ')}`);
   * });
   * ```
   * 
   * @example Filter Voices by Language
   * ```typescript
   * const voicesParams = new VoicesParamsGoogle();
   * voicesParams.languageCode = 'en-US';
   * 
   * const englishVoices = await repository.getVoices(voicesParams);
   * console.log(`English voices: ${englishVoices.voices.length}`);
   * ```
   * 
   * @example Error Handling
   * ```typescript
   * try {
   *   const voices = await repository.getVoices();
   *   // Process voices
   * } catch (error) {
   *   if (error instanceof TtsError) {
   *     console.error('Failed to get voices:', error.getUserMessage());
   *   }
   * }
   * ```
   * 
   * @since 3.0.0
   */
  async getVoices(
    voicesParams?: VoicesParamsGoogle,
  ): Promise<VoicesSuccessGoogle> {
    voicesParams = voicesParams ?? new VoicesParamsGoogle();
    return await this.voicesHandler.getVoices(
      voicesParams,
      new ApiKeyAuthenticationHeaderGoogle(ConfigGoogle.apiKey),
    );
  }

  /**
   * Converts text to speech using Google Cloud Text-to-Speech
   * 
   * Synthesizes speech from text or SSML input using the specified voice and
   * audio configuration. The method automatically handles authentication and
   * delegates the request to the audio handler for processing.
   * 
   * @param ttsParams - Conversion parameters including text/SSML, voice, and audio configuration
   * @returns Promise resolving to audio response containing synthesized speech data
   * 
   * @throws {@link TtsError} When conversion fails due to invalid parameters, quota limits, or API errors
   * 
   * @example Basic Text Conversion
   * ```typescript
   * const audio = await repository.convertTts({
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
   * console.log(`Generated ${audio.audio.length} bytes of audio`);
   * ```
   * 
   * @example SSML Conversion
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
   * const audio = await repository.convertTts({
   *   ssml: ssmlText,
   *   voice: { name: 'en-US-Neural2-F' },
   *   audioConfig: { audioEncoding: 'LINEAR16' }
   * });
   * ```
   * 
   * @example High-Quality Audio Synthesis
   * ```typescript
   * const audio = await repository.convertTts({
   *   text: 'High-quality Google TTS audio',
   *   voice: { name: 'en-US-Neural2-D' },
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
   * // Save high-quality audio
   * await fs.writeFile('high-quality.wav', audio.audio);
   * ```
   * 
   * @since 3.0.0
   */
  async convertTts(
    ttsParams: ConvertParamsGoogle,
  ): Promise<AudioSuccessGoogle> {
    return await this.audioHandler.getAudio(
      ttsParams,
      new ApiKeyAuthenticationHeaderGoogle(ConfigGoogle.apiKey),
    );
  }
}
