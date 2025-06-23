/**
 * @fileoverview Google Cloud Text-to-Speech Conversion Parameters
 * 
 * This module defines the main parameter class for Google Cloud Text-to-Speech
 * conversion operations. It encapsulates all configuration options including
 * voice selection, input content (text/SSML), audio settings, processing options,
 * and network configuration for TTS conversion requests.
 * 
 * The parameters provide comprehensive validation and flexible configuration
 * options for different conversion scenarios, supporting both simple text and
 * advanced SSML input with customizable audio output settings.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link https://cloud.google.com/text-to-speech/docs/reference/rest | Google TTS API Reference}
 * @see {@link https://cloud.google.com/text-to-speech/docs/ssml | Google SSML Guide}
 * 
 * @example Basic Text Conversion
 * ```typescript
 * import { ConvertParamsGoogle } from './convert_params.js';
 * 
 * const params = new ConvertParamsGoogle({
 *   text: 'Hello from Google Cloud Text-to-Speech!',
 *   voice: { name: 'en-US-Neural2-A' }
 * });
 * 
 * const audioBuffer = await ttsGoogle.convert(params);
 * ```
 * 
 * @example SSML Content Conversion
 * ```typescript
 * import { ConvertParamsGoogle } from './convert_params.js';
 * 
 * const ssmlContent = `
 *   <speak>
 *     <prosody rate="slow" pitch="+2st">
 *       Welcome to our application!
 *     </prosody>
 *     <break time="1s"/>
 *     <emphasis level="strong">Enjoy your experience.</emphasis>
 *   </speak>
 * `;
 * 
 * const params = new ConvertParamsGoogle({
 *   ssml: ssmlContent,
 *   voice: { name: 'en-US-Neural2-F' },
 *   audioOptions: new ConvertAudioOptionsGoogle({
 *     audioFormat: AudioOutputFormatGoogle.linear16
 *   })
 * });
 * ```
 * 
 * @example Advanced Configuration with Custom Options
 * ```typescript
 * import { ConvertParamsGoogle } from './convert_params.js';
 * 
 * const params = new ConvertParamsGoogle({
 *   text: 'Advanced TTS configuration example',
 *   voice: { name: 'en-US-Neural2-A' },
 *   rate: '1.2',  // 20% faster
 *   pitch: '+3st', // 3 semitones higher
 *   audioOptions: new ConvertAudioOptionsGoogle({
 *     audioFormat: AudioOutputFormatGoogle.mp3
 *   }),
 *   processOptions: new ConvertProcessOptionsGoogle({
 *     concurrency: 4,
 *     timeout: 30000
 *   })
 * });
 * ```
 * 
 * @example Chunked Content Processing
 * ```typescript
 * import { ConvertParamsGoogle } from './convert_params.js';
 * 
 * // Process pre-split text chunks
 * const textChunks = [
 *   'This is the first paragraph.',
 *   'This is the second paragraph.',
 *   'This is the final paragraph.'
 * ];
 * 
 * const params = new ConvertParamsGoogle({
 *   textChunks,
 *   voice: { name: 'en-US-Neural2-C' },
 *   textOptions: new ConvertTextOptionsGoogle({
 *     enableSentenceSplitting: true
 *   })
 * });
 * ```
 */

import { VoiceGoogle } from '../voices/voices_model.js';
import { ConvertAudioOptionsGoogle } from './convert_audio_options.js';
import { ConvertProcessOptionsGoogle } from './convert_process_options.js';
import { PITCH, RATE } from './convert_params_defaults.js';
import { ConvertSsmlOptionsGoogle } from './convert_ssml_options.js';
import { HttpProxyMapperBase } from '../../common/http/http_proxy_base.js';
import { ConvertTextOptionsGoogle } from './convert_text_options.js';

/**
 * Comprehensive parameters for Google Cloud Text-to-Speech conversion operations
 * 
 * This class encapsulates all configuration needed for TTS conversion including
 * voice selection, input content, audio formatting, processing behavior, and
 * network settings. It provides validation to ensure proper parameter combinations
 * and defaults for optimal performance.
 * 
 * The class supports multiple input types (text, SSML, pre-chunked content) and
 * flexible voice specification (object or ID). All audio and processing options
 * are configurable with sensible defaults.
 * 
 * @example Simple Text-to-Speech
 * ```typescript
 * const params = new ConvertParamsGoogle({
 *   text: 'Hello world',
 *   voice: { name: 'en-US-Neural2-A' }
 * });
 * ```
 * 
 * @example Voice ID Usage
 * ```typescript
 * const params = new ConvertParamsGoogle({
 *   text: 'Hello world',
 *   voiceId: 'en-US-Neural2-A'
 * });
 * ```
 * 
 * @example Production Configuration
 * ```typescript
 * const params = new ConvertParamsGoogle({
 *   text: 'Production TTS example',
 *   voice: { name: 'en-US-Neural2-F' },
 *   rate: '1.1',
 *   pitch: 'default',
 *   audioOptions: new ConvertAudioOptionsGoogle({
 *     audioFormat: AudioOutputFormatGoogle.mp3
 *   }),
 *   processOptions: new ConvertProcessOptionsGoogle({
 *     retryAttempts: 3,
 *     timeout: 15000
 *   })
 * });
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class ConvertParamsGoogle {
  /** Voice configuration object for TTS synthesis */
  voice: VoiceGoogle | undefined;
  
  /** Alternative voice identifier string */
  voiceId: string | undefined;
  
  /** SSML content for synthesis */
  ssml: string | undefined;
  
  /** Pre-split SSML content chunks */
  ssmlChunks: string[] | undefined;
  
  /** Plain text content for synthesis */
  text: string | undefined;
  
  /** Pre-split text content chunks */
  textChunks: string[] | undefined;
  
  /** Speaking rate adjustment (default, relative values, or absolute) */
  rate: string;
  
  /** Pitch adjustment (default, relative values, or absolute) */
  pitch: string;
  
  /** Audio output configuration options */
  audioOptions: ConvertAudioOptionsGoogle;
  
  /** Processing behavior configuration */
  processOptions: ConvertProcessOptionsGoogle;
  
  /** SSML-specific processing options */
  ssmlOptions: ConvertSsmlOptionsGoogle;
  
  /** Text-specific processing options */
  textOptions: ConvertTextOptionsGoogle;
  
  /** HTTP proxy configuration for requests */
  httpProxy: HttpProxyMapperBase;

  /**
   * Creates new Google TTS conversion parameters with validation
   * 
   * @param voice - Voice configuration object (mutually exclusive with voiceId)
   * @param voiceId - Voice identifier string (mutually exclusive with voice)
   * @param ssml - SSML content string (mutually exclusive with other content types)
   * @param ssmlChunks - Pre-split SSML chunks (mutually exclusive with other content types)
   * @param text - Plain text content (mutually exclusive with other content types)
   * @param textChunks - Pre-split text chunks (mutually exclusive with other content types)
   * @param rate - Speaking rate adjustment (defaults to 'default')
   * @param pitch - Pitch adjustment (defaults to 'default')
   * @param audioOptions - Audio configuration options
   * @param processOptions - Processing behavior options
   * @param ssmlOptions - SSML-specific processing options
   * @param textOptions - Text-specific processing options
   * @param httpProxy - HTTP proxy configuration
   * 
   * @throws {Error} When voice/voiceId validation fails
   * @throws {Error} When content validation fails
   * 
   * @example Basic Text Conversion
   * ```typescript
   * const params = new ConvertParamsGoogle({
   *   text: 'Hello from Google TTS',
   *   voice: { name: 'en-US-Neural2-A' }
   * });
   * ```
   * 
   * @example Custom Audio Configuration
   * ```typescript
   * const params = new ConvertParamsGoogle({
   *   text: 'Custom audio example',
   *   voiceId: 'en-US-Neural2-F',
   *   rate: '1.2',
   *   pitch: '+2st',
   *   audioOptions: new ConvertAudioOptionsGoogle({
   *     audioFormat: AudioOutputFormatGoogle.linear16
   *   })
   * });
   * ```
   * 
   * @example SSML with Processing Options
   * ```typescript
   * const params = new ConvertParamsGoogle({
   *   ssml: '<speak><prosody rate="slow">Hello world</prosody></speak>',
   *   voice: { name: 'en-US-Neural2-C' },
   *   ssmlOptions: new ConvertSsmlOptionsGoogle({
   *     validateSsml: true,
   *     removeUnsupportedTags: true
   *   })
   * });
   * ```
   * 
   * @example Chunked Processing
   * ```typescript
   * const longTextChunks = splitLongText(veryLongText);
   * const params = new ConvertParamsGoogle({
   *   textChunks: longTextChunks,
   *   voice: { name: 'en-US-Neural2-B' },
   *   processOptions: new ConvertProcessOptionsGoogle({
   *     concurrency: 6,
   *     progressCallback: (completed, total) => {
   *       console.log(`Progress: ${completed}/${total}`);
   *     }
   *   })
   * });
   * ```
   */
  constructor({
    voice,
    voiceId,
    ssml,
    ssmlChunks,
    text,
    textChunks,
    rate,
    pitch,
    audioOptions,
    processOptions,
    ssmlOptions,
    textOptions,
    httpProxy,
  }: {
    voice?: VoiceGoogle;
    voiceId?: string;
    ssml?: string;
    ssmlChunks?: string[];
    text?: string;
    textChunks?: string[];
    rate?: string;
    pitch?: string;
    audioOptions?: ConvertAudioOptionsGoogle;
    processOptions?: ConvertProcessOptionsGoogle;
    ssmlOptions?: ConvertSsmlOptionsGoogle;
    textOptions?: ConvertTextOptionsGoogle;
    httpProxy?: HttpProxyMapperBase;
  }) {
    if (!voice && !voiceId) {
      throw new Error('Either voice or voiceId must be provided.');
    }

    if (voice && voiceId) {
      throw new Error('Only voice or voiceId must be provided.');
    }

    if (!ssml && !ssmlChunks && !text && !textChunks) {
      throw new Error(
        'Either input, ssmlChunks, text or textChunks must be provided.',
      );
    }

    if ([ssml, ssmlChunks, text, textChunks].filter(Boolean).length >= 2) {
      throw new Error(
        'Only input, ssmlChunks, text or textChunks must be provided.',
      );
    }

    this.voice = voice;
    this.voiceId = voiceId;
    this.ssml = ssml;
    this.ssmlChunks = ssmlChunks;
    this.text = text;
    this.textChunks = textChunks;
    this.rate = rate ?? RATE;
    this.pitch = pitch ?? PITCH;
    this.audioOptions = audioOptions ?? new ConvertAudioOptionsGoogle();
    this.processOptions = processOptions ?? new ConvertProcessOptionsGoogle();
    this.ssmlOptions = ssmlOptions ?? new ConvertSsmlOptionsGoogle();
    this.textOptions = textOptions ?? new ConvertTextOptionsGoogle();
    this.httpProxy = httpProxy;
  }
}
