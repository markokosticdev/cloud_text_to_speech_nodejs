/**
 * @fileoverview Google Cloud Text-to-Speech Audio Processing Module Exports
 * 
 * This module serves as the central export point for all Google Cloud Text-to-Speech
 * audio processing components. It provides access to audio formats, response types,
 * and audio processing utilities specific to Google TTS implementation.
 * 
 * The module aggregates various audio-related functionality including output formats,
 * streaming formats, and response handling, providing a clean and organized API
 * for consumers of the Google TTS audio processing system.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link https://cloud.google.com/text-to-speech/docs/audio-profiles | Google TTS Audio Profiles}
 * 
 * @example Complete Audio Processing Setup
 * ```typescript
 * import {
 *   AudioOutputFormatGoogle,
 *   AudioOutputStreamFormatGoogle,
 *   AudioResponseGoogle
 * } from './audio.js';
 * 
 * // Configure audio output format
 * const format = AudioOutputFormatGoogle.mp3;
 * 
 * // Configure streaming format
 * const streamFormat = AudioOutputStreamFormatGoogle.oggOpus;
 * 
 * // Process TTS response
 * const response: AudioResponseGoogle = await tts.convert(text, {
 *   audioFormat: format
 * });
 * ```
 * 
 * @example Audio Format Selection Helper
 * ```typescript
 * import { AudioOutputFormatGoogle } from './audio.js';
 * 
 * class GoogleAudioConfig {
 *   static getOptimalFormat(useCase: 'web' | 'mobile' | 'telephony'): AudioOutputFormatGoogle {
 *     switch (useCase) {
 *       case 'web':
 *         return AudioOutputFormatGoogle.mp3;
 *       case 'mobile':
 *         return AudioOutputFormatGoogle.oggOpus;
 *       case 'telephony':
 *         return AudioOutputFormatGoogle.mulaw;
 *     }
 *   }
 * }
 * ```
 * 
 * @example Streaming Audio Configuration
 * ```typescript
 * import { AudioOutputStreamFormatGoogle } from './audio.js';
 * 
 * // Real-time streaming setup
 * const streamingConfig = {
 *   format: AudioOutputStreamFormatGoogle.linear16,
 *   enableRealTime: true,
 *   bufferSize: 1024
 * };
 * 
 * console.log(`Using format: ${streamingConfig.format}`); // "LINEAR16"
 * ```
 * 
 * @example Production Audio Pipeline
 * ```typescript
 * import { AudioOutputFormatGoogle, AudioResponseGoogle } from './audio.js';
 * 
 * class GoogleAudioPipeline {
 *   private format = AudioOutputFormatGoogle.mp3;
 * 
 *   async processText(text: string): Promise<Buffer> {
 *     const response: AudioResponseGoogle = await this.tts.convert(text, {
 *       audioFormat: this.format,
 *       sampleRateHertz: 24000
 *     });
 * 
 *     return response.audioContent;
 *   }
 * }
 * ```
 * 
 * @category Google Cloud TTS
 */

export * from './audio_responses.js';
export * from './audio_output_format.js';
export * from './audio_output_stream_format.js';
