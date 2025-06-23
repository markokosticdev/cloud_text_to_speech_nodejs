/**
 * @fileoverview Universal Text-to-Speech Conversion Parameters for Multi-Provider Support
 * 
 * This module provides the unified parameter structure for TTS conversion operations
 * across Google Cloud TTS, Microsoft Azure TTS, and Amazon Polly. The ConvertParamsUniversal
 * class acts as a provider-agnostic interface that gets mapped to specific provider
 * parameters during conversion operations.
 * 
 * @author Cloud TTS Team
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 */

import { VoiceUniversal } from '../voices/voices_model.js';
import { ConvertAudioOptionsUniversal } from './convert_audio_options.js';
import { ConvertProcessOptionsUniversal } from './convert_process_options.js';
import { PITCH, RATE } from './convert_params_defaults.js';
import {
  ConvertSsmlOptionsUniversal,
  ConvertTextOptionsUniversal,
} from './convert_options.js';
import { ConvertSsmlOptionsGoogle } from '../../google/convert/convert_ssml_options.js';
import { ConvertSsmlOptionsMicrosoft } from '../../microsoft/convert/convert_ssml_options.js';
import { ConvertSsmlOptionsAmazon } from '../../amazon/convert/convert_ssml_options.js';
import { ConvertTextOptionsGoogle } from '../../google/convert/convert_text_options.js';
import { ConvertTextOptionsMicrosoft } from '../../microsoft/convert/convert_text_options.js';
import { ConvertTextOptionsAmazon } from '../../amazon/convert/convert_text_options.js';
import { HttpProxyMapperOptionsUniversal } from '../voices/voices_options.js';

/**
 * Universal text-to-speech conversion parameters for multi-provider support
 * 
 * Provides a unified interface for TTS conversion parameters that can be used
 * across Google Cloud TTS, Microsoft Azure TTS, and Amazon Polly. The class
 * handles input validation, default value assignment, and provider-specific
 * option configuration.
 * 
 * @example Basic Text Conversion Parameters
 * ```typescript
 * import { ConvertParamsUniversal, VoiceUniversal } from 'cloud-text-to-speech';
 * 
 * const voice = new VoiceUniversal({
 *   provider: 'google',
 *   engines: ['standard'],
 *   code: 'en-US-Standard-A',
 *   name: 'en-US-Standard-A',
 *   nativeName: 'English (US) - Standard A',
 *   gender: 'female',
 *   locale: { code: 'en-US', name: 'English (United States)' }
 * });
 * 
 * const params = new ConvertParamsUniversal({
 *   voice,
 *   text: 'Hello world, this is a test message.',
 *   rate: '1.0',
 *   pitch: '0'
 * });
 * 
 * console.log('Text to convert:', params.text);
 * console.log('Voice selected:', params.voice.name);
 * ```
 * 
 * @example SSML Conversion Parameters
 * ```typescript
 * const ssmlText = `
 *   <speak>
 *     <voice name="en-US-Standard-A">
 *       Hello <break time="500ms"/> world!
 *       <prosody rate="slow" pitch="low">This is slower and lower.</prosody>
 *     </voice>
 *   </speak>
 * `;
 * 
 * const params = new ConvertParamsUniversal({
 *   voice,
 *   ssml: ssmlText,
 *   rate: '1.2',
 *   pitch: '+2st',
 *   audioOptions: new ConvertAudioOptionsUniversal({
 *     format: 'mp3',
 *     sampleRate: 44100
 *   })
 * });
 * ```
 * 
 * @example Chunked Text Processing
 * ```typescript
 * const longText = [
 *   'This is the first chunk of a long text.',
 *   'This is the second chunk that will be processed separately.',
 *   'This is the final chunk of the text.'
 * ];
 * 
 * const params = new ConvertParamsUniversal({
 *   voice,
 *   textChunks: longText,
 *   processOptions: new ConvertProcessOptionsUniversal({
 *     enableChunking: true,
 *     maxChunkSize: 1000
 *   })
 * });
 * 
 * console.log(`Processing ${params.textChunks.length} text chunks`);
 * ```
 * 
 * @example Advanced Configuration with Provider-Specific Options
 * ```typescript
 * import { 
 *   ConvertSsmlOptionsUniversal, 
 *   ConvertTextOptionsUniversal,
 *   ConvertSsmlOptionsGoogle,
 *   ConvertTextOptionsGoogle
 * } from 'cloud-text-to-speech';
 * 
 * const params = new ConvertParamsUniversal({
 *   voice,
 *   text: 'Advanced TTS configuration example',
 *   rate: '0.9',
 *   pitch: '+1st',
 *   ssmlOptions: new ConvertSsmlOptionsUniversal({
 *     google: new ConvertSsmlOptionsGoogle({
 *       enableTimePointing: true,
 *       validateSsml: true
 *     }),
 *     microsoft: new ConvertSsmlOptionsMicrosoft({
 *       enableProsodyTags: true
 *     }),
 *     amazon: new ConvertSsmlOptionsAmazon({
 *       enableBreathingSounds: true
 *     })
 *   }),
 *   textOptions: new ConvertTextOptionsUniversal({
 *     google: new ConvertTextOptionsGoogle({
 *       enableAutomaticPunctuation: true
 *     }),
 *     microsoft: new ConvertTextOptionsMicrosoft({
 *       enableEmphasisGeneration: true
 *     }),
 *     amazon: new ConvertTextOptionsAmazon({
 *       enableNeuralSpeaking: true
 *     })
 *   })
 * });
 * ```
 * 
 * @example HTTP Proxy Configuration
 * ```typescript
 * const params = new ConvertParamsUniversal({
 *   voice,
 *   text: 'Text to convert through proxy',
 *   httpProxy: {
 *     host: 'proxy.company.com',
 *     port: 8080,
 *     auth: {
 *       username: 'user',
 *       password: 'pass'
 *     }
 *   }
 * });
 * ```
 * 
 * @category Universal API
 * @since 3.0.0
 */
export class ConvertParamsUniversal {
  /** Voice configuration for the conversion */
  voice: VoiceUniversal;
  /** SSML content for conversion (mutually exclusive with other input types) */
  ssml: string | undefined;
  /** Array of SSML chunks for batch processing */
  ssmlChunks: string[] | undefined;
  /** Plain text content for conversion (mutually exclusive with other input types) */
  text: string | undefined;
  /** Array of text chunks for batch processing */
  textChunks: string[] | undefined;
  /** Speech rate modifier (e.g., '1.0', '0.5', '2.0') */
  rate: string;
  /** Speech pitch modifier (e.g., '0', '+2st', '-1st') */
  pitch: string;
  /** Audio output configuration options */
  audioOptions: ConvertAudioOptionsUniversal;
  /** Processing configuration options */
  processOptions: ConvertProcessOptionsUniversal;
  /** SSML-specific processing options for all providers */
  ssmlOptions: ConvertSsmlOptionsUniversal;
  /** Text-specific processing options for all providers */
  textOptions: ConvertTextOptionsUniversal;
  /** HTTP proxy configuration for network requests */
  httpProxy: HttpProxyMapperOptionsUniversal | undefined;

  /**
   * Creates universal conversion parameters with input validation and defaults
   * 
   * Validates that exactly one input type is provided (ssml, ssmlChunks, text, or textChunks)
   * and applies appropriate defaults for unspecified options. Provider-specific options
   * are initialized with sensible defaults for each TTS provider.
   * 
   * @param voice - Voice configuration to use for conversion
   * @param ssml - SSML content to convert (optional)
   * @param ssmlChunks - Array of SSML chunks to process (optional)
   * @param text - Plain text content to convert (optional)
   * @param textChunks - Array of text chunks to process (optional)
   * @param rate - Speech rate modifier (default: '1.0')
   * @param pitch - Speech pitch modifier (default: '0')
   * @param audioOptions - Audio output configuration (optional)
   * @param processOptions - Processing configuration (optional)
   * @param ssmlOptions - SSML processing options (optional)
   * @param textOptions - Text processing options (optional)
   * @param httpProxy - HTTP proxy configuration (optional)
   * 
   * @throws {@link Error} When no input content is provided
   * @throws {@link Error} When multiple input types are provided simultaneously
   * 
   * @example Basic Text Parameters
   * ```typescript
   * const params = new ConvertParamsUniversal({
   *   voice: myVoice,
   *   text: 'Hello world'
   * });
   * ```
   * 
   * @example SSML with Custom Rate and Pitch
   * ```typescript
   * const params = new ConvertParamsUniversal({
   *   voice: myVoice,
   *   ssml: '<speak>Hello <break time="500ms"/> world!</speak>',
   *   rate: '1.2',
   *   pitch: '+2st'
   * });
   * ```
   * 
   * @example Chunked Processing
   * ```typescript
   * const params = new ConvertParamsUniversal({
   *   voice: myVoice,
   *   textChunks: ['First chunk', 'Second chunk', 'Third chunk'],
   *   processOptions: new ConvertProcessOptionsUniversal({
   *     enableChunking: true
   *   })
   * });
   * ```
   * 
   * @since 3.0.0
   */
  constructor({
    voice,
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
    voice: VoiceUniversal;
    ssml?: string;
    ssmlChunks?: string[];
    text?: string;
    textChunks?: string[];
    rate?: string;
    pitch?: string;
    audioOptions?: ConvertAudioOptionsUniversal;
    processOptions?: ConvertProcessOptionsUniversal;
    ssmlOptions?: ConvertSsmlOptionsUniversal;
    textOptions?: ConvertTextOptionsUniversal;
    httpProxy?: HttpProxyMapperOptionsUniversal;
  }) {
    // Validate that at least one input type is provided
    if (!ssml && !ssmlChunks && !text && !textChunks) {
      throw new Error(
        'Either input, ssmlChunks, text or textChunks must be provided.',
      );
    }

    // Validate that only one input type is provided
    if ([ssml, ssmlChunks, text, textChunks].filter(Boolean).length >= 2) {
      throw new Error(
        'Only input, ssmlChunks, text or textChunks must be provided.',
      );
    }

    this.voice = voice;
    this.ssml = ssml;
    this.ssmlChunks = ssmlChunks;
    this.text = text;
    this.textChunks = textChunks;
    this.rate = rate ?? RATE;
    this.pitch = pitch ?? PITCH;
    this.audioOptions = audioOptions ?? new ConvertAudioOptionsUniversal();
    this.processOptions =
      processOptions ?? new ConvertProcessOptionsUniversal();
    this.ssmlOptions =
      ssmlOptions ??
      new ConvertSsmlOptionsUniversal({
        google: new ConvertSsmlOptionsGoogle(),
        microsoft: new ConvertSsmlOptionsMicrosoft(),
        amazon: new ConvertSsmlOptionsAmazon(),
      });
    this.textOptions =
      textOptions ??
      new ConvertTextOptionsUniversal({
        google: new ConvertTextOptionsGoogle(),
        microsoft: new ConvertTextOptionsMicrosoft(),
        amazon: new ConvertTextOptionsAmazon(),
      });
    this.httpProxy = httpProxy;
  }
}
