/**
 * @fileoverview Google Cloud Text-to-Speech Audio Output Format Definitions
 * 
 * This module defines the audio output formats supported by Google Cloud Text-to-Speech.
 * It provides enum values for different audio codecs and formats available in Google TTS,
 * allowing applications to specify the desired audio output format for their use case.
 * 
 * The formats range from uncompressed high-quality audio to compressed formats
 * optimized for streaming and bandwidth efficiency. Each format has different
 * characteristics in terms of quality, file size, and compatibility.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link https://cloud.google.com/text-to-speech/docs/audio-profiles | Google TTS Audio Profiles}
 * @see {@link AudioOutputStreamFormatGoogle} for streaming format variants
 * 
 * @example Basic Format Selection
 * ```typescript
 * import { AudioOutputFormatGoogle } from './audio_output_format.js';
 * import { ConvertAudioOptionsGoogle } from '../convert_audio_options.js';
 * 
 * // Use MP3 for balanced quality and file size
 * const audioOptions = new ConvertAudioOptionsGoogle({
 *   audioFormat: AudioOutputFormatGoogle.mp3
 * });
 * ```
 * 
 * @example High-Quality Audio Configuration
 * ```typescript
 * import { AudioOutputFormatGoogle } from './audio_output_format.js';
 * 
 * // Use LINEAR16 for highest quality uncompressed audio
 * const highQualityConfig = {
 *   audioFormat: AudioOutputFormatGoogle.linear16,
 *   sampleRateHertz: 48000
 * };
 * 
 * console.log(`Using ${highQualityConfig.audioFormat} format`); // "LINEAR16"
 * ```
 * 
 * @example Compressed Audio for Streaming
 * ```typescript
 * import { AudioOutputFormatGoogle } from './audio_output_format.js';
 * 
 * // Use OGG Opus for high-quality compressed streaming
 * const streamingConfig = {
 *   audioFormat: AudioOutputFormatGoogle.oggOpus
 * };
 * 
 * // Ideal for real-time applications
 * const params = new ConvertParamsGoogle({
 *   text: 'Streaming audio example',
 *   voice: { name: 'en-US-Neural2-A' },
 *   audioOptions: new ConvertAudioOptionsGoogle(streamingConfig)
 * });
 * ```
 * 
 * @example Format Comparison and Selection
 * ```typescript
 * import { AudioOutputFormatGoogle } from './audio_output_format.js';
 * 
 * // Different formats for different use cases
 * const formatExamples = {
 *   // Uncompressed, highest quality, largest file size
 *   studio: AudioOutputFormatGoogle.linear16,
 *   
 *   // Balanced quality/size, widely compatible
 *   web: AudioOutputFormatGoogle.mp3,
 *   
 *   // High compression, good quality, modern browsers
 *   modern: AudioOutputFormatGoogle.oggOpus,
 *   
 *   // Telephony applications
 *   phone: AudioOutputFormatGoogle.mulaw
 * };
 * 
 * function selectFormat(useCase: keyof typeof formatExamples) {
 *   return formatExamples[useCase];
 * }
 * 
 * const selectedFormat = selectFormat('web');
 * console.log(`Selected: ${selectedFormat}`); // "MP3"
 * ```
 */

/**
 * Audio output formats supported by Google Cloud Text-to-Speech
 * 
 * This enum defines the available audio output formats for Google TTS conversion.
 * Each format has different characteristics regarding quality, compression, file size,
 * and compatibility. Choose the format that best matches your application's requirements.
 * 
 * @example Format Selection
 * ```typescript
 * // High quality uncompressed
 * const hifiFormat = AudioOutputFormatGoogle.linear16;
 * 
 * // Balanced quality and size
 * const webFormat = AudioOutputFormatGoogle.mp3;
 * 
 * // Modern compressed format
 * const modernFormat = AudioOutputFormatGoogle.oggOpus;
 * ```
 * 
 * @example Dynamic Format Selection
 * ```typescript
 * function selectOptimalFormat(bandwidth: 'low' | 'medium' | 'high'): AudioOutputFormatGoogle {
 *   switch (bandwidth) {
 *     case 'low':
 *       return AudioOutputFormatGoogle.mulaw; // Lowest bandwidth
 *     case 'medium':
 *       return AudioOutputFormatGoogle.mp3;   // Balanced
 *     case 'high':
 *       return AudioOutputFormatGoogle.linear16; // Highest quality
 *   }
 * }
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export enum AudioOutputFormatGoogle {
  /**
   * Uncompressed 16-bit signed little-endian samples (Linear PCM)
   * 
   * Provides the highest audio quality with no compression artifacts.
   * Suitable for professional audio applications, post-processing, or
   * when file size is not a concern. Typically used at 16kHz or 24kHz.
   * 
   * @example High-Quality Studio Recording
   * ```typescript
   * const studioConfig = {
   *   audioFormat: AudioOutputFormatGoogle.linear16,
   *   sampleRateHertz: 48000 // Professional quality
   * };
   * ```
   */
  linear16 = 'LINEAR16',

  /**
   * MP3 audio format with variable bitrate
   * 
   * Widely compatible compressed format offering good quality-to-size ratio.
   * Excellent choice for web applications, mobile apps, and general use cases
   * where broad compatibility is important.
   * 
   * @example Web Application Audio
   * ```typescript
   * const webConfig = {
   *   audioFormat: AudioOutputFormatGoogle.mp3
   * };
   * // Automatically optimized bitrate based on content
   * ```
   */
  mp3 = 'MP3',

  /**
   * Opus codec in an OGG container
   * 
   * Modern, highly efficient codec providing excellent quality at low bitrates.
   * Ideal for real-time applications, streaming, and bandwidth-constrained
   * environments. Supported by modern browsers and applications.
   * 
   * @example Real-Time Streaming
   * ```typescript
   * const streamingConfig = {
   *   audioFormat: AudioOutputFormatGoogle.oggOpus
   * };
   * // Optimal for WebRTC and streaming applications
   * ```
   */
  oggOpus = 'OGG_OPUS',

  /**
   * 8-bit mu-law samples at 8kHz
   * 
   * Telephony-grade audio format commonly used in telecommunications.
   * Provides acceptable quality for speech at very low bitrates.
   * Primarily used for phone systems and legacy compatibility.
   * 
   * @example Telephony Integration
   * ```typescript
   * const phoneConfig = {
   *   audioFormat: AudioOutputFormatGoogle.mulaw,
   *   sampleRateHertz: 8000
   * };
   * // Compatible with traditional phone systems
   * ```
   */
  mulaw = 'MuLAW',

  /**
   * 8-bit A-law samples at 8kHz
   * 
   * Alternative telephony-grade audio format used primarily in European
   * telecommunications systems. Similar to mu-law but with different
   * compression characteristics.
   * 
   * @example European Telephony
   * ```typescript
   * const europeanPhoneConfig = {
   *   audioFormat: AudioOutputFormatGoogle.aLaw,
   *   sampleRateHertz: 8000
   * };
   * // Common in European telecom systems
   * ```
   */
  aLaw = 'ALAW',
}
