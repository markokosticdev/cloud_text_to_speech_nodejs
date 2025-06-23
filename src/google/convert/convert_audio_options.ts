/**
 * @fileoverview Google Cloud Text-to-Speech Audio Configuration Options
 * 
 * This module defines audio output configuration for Google Cloud Text-to-Speech
 * conversion operations. It provides settings for audio format selection,
 * streaming format configuration, and audio quality parameters to optimize
 * TTS output for different use cases and deployment scenarios.
 * 
 * The audio options support various Google TTS audio formats including MP3,
 * Linear16, and OGG, with both regular and streaming variants for different
 * application requirements.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link https://cloud.google.com/text-to-speech/docs/audio-profiles | Google TTS Audio Profiles}
 * @see {@link AudioOutputFormatGoogle} for available audio formats
 * 
 * @example Basic Audio Configuration
 * ```typescript
 * import { ConvertAudioOptionsGoogle } from './convert_audio_options.js';
 * import { AudioOutputFormatGoogle } from './audio/audio_output_format.js';
 * 
 * const audioOptions = new ConvertAudioOptionsGoogle({
 *   audioFormat: AudioOutputFormatGoogle.mp3
 * });
 * 
 * const params = new ConvertParamsGoogle({
 *   text: 'Hello world',
 *   voice: { name: 'en-US-Neural2-A' },
 *   audioOptions
 * });
 * ```
 * 
 * @example High-Quality Audio Configuration
 * ```typescript
 * import { ConvertAudioOptionsGoogle } from './convert_audio_options.js';
 * import { 
 *   AudioOutputFormatGoogle, 
 *   AudioOutputStreamFormatGoogle 
 * } from './audio/index.js';
 * 
 * // Configure for high-quality audio
 * const highQualityOptions = new ConvertAudioOptionsGoogle({
 *   audioFormat: AudioOutputFormatGoogle.linear16,
 *   audioStreamFormat: AudioOutputStreamFormatGoogle.linear16
 * });
 * 
 * const params = new ConvertParamsGoogle({
 *   text: 'High quality audio example',
 *   voice: { name: 'en-US-Neural2-F' },
 *   audioOptions: highQualityOptions
 * });
 * ```
 * 
 * @example Streaming Audio Configuration
 * ```typescript
 * import { ConvertAudioOptionsGoogle } from './convert_audio_options.js';
 * import { AudioOutputStreamFormatGoogle } from './audio/audio_output_stream_format.js';
 * 
 * // Optimized for real-time streaming
 * const streamingOptions = new ConvertAudioOptionsGoogle({
 *   audioFormat: AudioOutputFormatGoogle.mp3,
 *   audioStreamFormat: AudioOutputStreamFormatGoogle.mp3
 * });
 * 
 * // Use with streaming TTS
 * const streamResponse = await ttsGoogle.convertStream(params);
 * ```
 * 
 * @example Default Audio Settings
 * ```typescript
 * import { ConvertAudioOptionsGoogle } from './convert_audio_options.js';
 * 
 * // Uses default MP3 format for balanced quality/size
 * const defaultOptions = new ConvertAudioOptionsGoogle();
 * 
 * console.log(defaultOptions.audioFormat); // AudioOutputFormatGoogle.mp3
 * console.log(defaultOptions.audioStreamFormat); // AudioOutputStreamFormatGoogle.mp3
 * ```
 */

import {
  AUDIO_FORMAT,
  AUDIO_STREAM_FORMAT,
} from './convert_params_defaults.js';
import { AudioOutputStreamFormatGoogle } from './audio/audio_output_stream_format.js';
import { AudioOutputFormatGoogle } from './audio/audio_output_format.js';

/**
 * Audio output configuration options for Google Cloud Text-to-Speech
 * 
 * This class encapsulates audio format and streaming configuration for Google TTS
 * operations. It provides control over audio quality, format selection, and
 * streaming behavior to optimize audio output for different application needs.
 * 
 * The configuration supports both standard and streaming audio formats, allowing
 * applications to balance audio quality, file size, and streaming performance
 * based on their specific requirements.
 * 
 * @example Basic MP3 Configuration
 * ```typescript
 * const options = new ConvertAudioOptionsGoogle({
 *   audioFormat: AudioOutputFormatGoogle.mp3
 * });
 * ```
 * 
 * @example High-Quality Linear16 Configuration
 * ```typescript
 * const options = new ConvertAudioOptionsGoogle({
 *   audioFormat: AudioOutputFormatGoogle.linear16,
 *   audioStreamFormat: AudioOutputStreamFormatGoogle.linear16
 * });
 * ```
 * 
 * @example Default Configuration
 * ```typescript
 * // Uses MP3 format for both regular and streaming audio
 * const options = new ConvertAudioOptionsGoogle();
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class ConvertAudioOptionsGoogle {
  /**
   * Audio output format for TTS conversion
   * Determines the audio codec and quality of the generated audio file
   */
  audioFormat: AudioOutputFormatGoogle;
  
  /**
   * Audio streaming format for real-time TTS
   * Optimized format for streaming audio delivery and progressive playback
   */
  audioStreamFormat: AudioOutputStreamFormatGoogle;

  /**
   * Creates new Google TTS audio configuration options
   * 
   * @param audioFormat - Audio output format (defaults to MP3)
   * @param audioStreamFormat - Audio streaming format (defaults to MP3)
   * 
   * @example Default Audio Options
   * ```typescript
   * const options = new ConvertAudioOptionsGoogle();
   * // Uses MP3 format for both regular and streaming audio
   * ```
   * 
   * @example Custom Audio Format
   * ```typescript
   * const options = new ConvertAudioOptionsGoogle({
   *   audioFormat: AudioOutputFormatGoogle.linear16
   * });
   * // Uses Linear16 for high quality, MP3 for streaming
   * ```
   * 
   * @example Complete Audio Configuration
   * ```typescript
   * const options = new ConvertAudioOptionsGoogle({
   *   audioFormat: AudioOutputFormatGoogle.ogg_opus,
   *   audioStreamFormat: AudioOutputStreamFormatGoogle.ogg_opus
   * });
   * // Uses OGG Opus for both regular and streaming audio
   * ```
   * 
   * @example Quality vs. Size Trade-off
   * ```typescript
   * // High quality configuration
   * const highQuality = new ConvertAudioOptionsGoogle({
   *   audioFormat: AudioOutputFormatGoogle.linear16
   * });
   * 
   * // Balanced quality/size configuration
   * const balanced = new ConvertAudioOptionsGoogle({
   *   audioFormat: AudioOutputFormatGoogle.mp3
   * });
   * 
   * // Optimized for bandwidth
   * const compressed = new ConvertAudioOptionsGoogle({
   *   audioFormat: AudioOutputFormatGoogle.ogg_opus
   * });
   * ```
   */
  constructor({
    audioFormat,
    audioStreamFormat,
  }: {
    audioFormat?: AudioOutputFormatGoogle;
    audioStreamFormat?: AudioOutputStreamFormatGoogle;
  } = {}) {
    this.audioFormat = audioFormat ?? AUDIO_FORMAT;
    this.audioStreamFormat = audioStreamFormat ?? AUDIO_STREAM_FORMAT;
  }
}
