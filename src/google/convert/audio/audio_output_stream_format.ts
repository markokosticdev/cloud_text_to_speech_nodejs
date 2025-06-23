/**
 * @fileoverview Google Cloud Text-to-Speech Audio Output Stream Format Definitions
 * 
 * This module defines the audio output stream formats for Google Cloud Text-to-Speech
 * streaming operations. These formats are specifically designed for real-time audio
 * streaming and progressive audio playback scenarios where audio data is received
 * and processed incrementally.
 * 
 * Stream formats optimize for low latency and efficient data transmission while
 * maintaining compatibility with the standard audio output formats. They are
 * essential for real-time applications like live speech synthesis and interactive
 * voice applications.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link https://cloud.google.com/text-to-speech/docs/streaming | Google TTS Streaming}
 * @see {@link AudioOutputFormatGoogle} for non-streaming format variants
 * 
 * @example Basic Streaming Configuration
 * ```typescript
 * import { AudioOutputStreamFormatGoogle } from './audio_output_stream_format.js';
 * import { ConvertProcessOptionsGoogle } from '../convert_process_options.js';
 * 
 * // Configure for real-time streaming
 * const streamOptions = new ConvertProcessOptionsGoogle({
 *   streamFormat: AudioOutputStreamFormatGoogle.mp3,
 *   enableStreaming: true
 * });
 * ```
 * 
 * @example WebRTC Integration
 * ```typescript
 * import { AudioOutputStreamFormatGoogle } from './audio_output_stream_format.js';
 * 
 * // Optimal format for WebRTC applications
 * const webRtcConfig = {
 *   streamFormat: AudioOutputStreamFormatGoogle.oggOpus,
 *   sampleRateHertz: 48000,
 *   enableRealTime: true
 * };
 * 
 * console.log(`Streaming format: ${webRtcConfig.streamFormat}`); // "OGG_OPUS"
 * ```
 * 
 * @example Progressive Audio Loading
 * ```typescript
 * import { AudioOutputStreamFormatGoogle } from './audio_output_stream_format.js';
 * 
 * // Stream uncompressed audio for immediate processing
 * const progressiveConfig = {
 *   streamFormat: AudioOutputStreamFormatGoogle.linear16,
 *   bufferSize: 1024,
 *   processInChunks: true
 * };
 * 
 * async function streamTTS(text: string) {
 *   const stream = await tts.convertStream(text, {
 *     audioOptions: { streamFormat: progressiveConfig.streamFormat }
 *   });
 *   
 *   // Process audio chunks as they arrive
 *   stream.on('data', (chunk) => {
 *     processAudioChunk(chunk);
 *   });
 * }
 * ```
 * 
 * @example Adaptive Quality Streaming
 * ```typescript
 * import { AudioOutputStreamFormatGoogle } from './audio_output_stream_format.js';
 * 
 * // Adapt stream format based on connection quality
 * class AdaptiveStreaming {
 *   selectStreamFormat(bandwidth: number): AudioOutputStreamFormatGoogle {
 *     if (bandwidth > 1000000) { // > 1 Mbps
 *       return AudioOutputStreamFormatGoogle.linear16; // High quality
 *     } else if (bandwidth > 256000) { // > 256 kbps
 *       return AudioOutputStreamFormatGoogle.mp3; // Balanced
 *     } else {
 *       return AudioOutputStreamFormatGoogle.mulaw; // Low bandwidth
 *     }
 *   }
 * }
 * ```
 */

/**
 * Audio output stream formats supported by Google Cloud Text-to-Speech
 * 
 * This enum defines the available audio stream formats for Google TTS streaming operations.
 * Stream formats are optimized for real-time transmission and progressive playback,
 * providing efficient data flow for interactive applications and live audio synthesis.
 * 
 * @example Stream Format Selection
 * ```typescript
 * // Real-time streaming
 * const realtimeFormat = AudioOutputStreamFormatGoogle.oggOpus;
 * 
 * // Progressive loading
 * const progressiveFormat = AudioOutputStreamFormatGoogle.mp3;
 * 
 * // Low-latency telephony
 * const phoneFormat = AudioOutputStreamFormatGoogle.mulaw;
 * ```
 * 
 * @example Dynamic Stream Configuration
 * ```typescript
 * function configureStream(
 *   latencyRequirement: 'ultra-low' | 'low' | 'standard'
 * ): AudioOutputStreamFormatGoogle {
 *   switch (latencyRequirement) {
 *     case 'ultra-low':
 *       return AudioOutputStreamFormatGoogle.mulaw; // Minimal processing
 *     case 'low':
 *       return AudioOutputStreamFormatGoogle.oggOpus; // Efficient compression
 *     case 'standard':
 *       return AudioOutputStreamFormatGoogle.mp3; // Balanced quality
 *   }
 * }
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export enum AudioOutputStreamFormatGoogle {
  /**
   * Uncompressed 16-bit signed little-endian samples for streaming (Linear PCM)
   * 
   * Provides the highest audio quality for streaming applications with no
   * compression overhead. Ideal for low-latency requirements and applications
   * that need immediate audio processing without decompression delays.
   * 
   * @example Real-Time Audio Processing
   * ```typescript
   * const streamConfig = {
   *   streamFormat: AudioOutputStreamFormatGoogle.linear16,
   *   sampleRateHertz: 24000, // High quality streaming
   *   bufferDuration: 50 // 50ms buffer for low latency
   * };
   * ```
   */
  linear16 = 'LINEAR16',

  /**
   * MP3 audio stream format with optimized encoding
   * 
   * Balanced stream format providing good quality-to-bandwidth ratio
   * for streaming applications. Offers wide compatibility and efficient
   * transmission suitable for most real-time use cases.
   * 
   * @example Web Streaming Application
   * ```typescript
   * const webStreamConfig = {
   *   streamFormat: AudioOutputStreamFormatGoogle.mp3,
   *   adaptiveBitrate: true // Adjust based on network conditions
   * };
   * ```
   */
  mp3 = 'MP3',

  /**
   * Opus codec in OGG container optimized for streaming
   * 
   * Modern, highly efficient streaming codec providing excellent quality
   * at low bitrates with minimal latency. Perfect for real-time applications,
   * WebRTC integration, and bandwidth-constrained streaming scenarios.
   * 
   * @example WebRTC Voice Chat
   * ```typescript
   * const webRtcStreamConfig = {
   *   streamFormat: AudioOutputStreamFormatGoogle.oggOpus,
   *   enableVoiceActivityDetection: true,
   *   adaptiveFrameDuration: true
   * };
   * ```
   */
  oggOpus = 'OGG_OPUS',

  /**
   * 8-bit mu-law streaming samples at 8kHz
   * 
   * Ultra-low latency telephony streaming format with minimal processing
   * overhead. Optimized for phone systems and applications requiring
   * immediate audio transmission with acceptable speech quality.
   * 
   * @example Real-Time Telephony
   * ```typescript
   * const phoneStreamConfig = {
   *   streamFormat: AudioOutputStreamFormatGoogle.mulaw,
   *   sampleRateHertz: 8000,
   *   latencyMode: 'ultra-low' // < 10ms latency
   * };
   * ```
   */
  mulaw = 'MuLAW',

  /**
   * 8-bit A-law streaming samples at 8kHz
   * 
   * European telephony streaming format providing low-latency transmission
   * for traditional telecommunications systems. Optimized for minimal
   * processing delay and legacy system compatibility.
   * 
   * @example European Telecom Streaming
   * ```typescript
   * const europeanStreamConfig = {
   *   streamFormat: AudioOutputStreamFormatGoogle.aLaw,
   *   sampleRateHertz: 8000,
   *   regionOptimization: 'eu' // European optimization
   * };
   * ```
   */
  aLaw = 'ALAW',
}
