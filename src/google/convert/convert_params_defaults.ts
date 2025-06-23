/**
 * @fileoverview Google Cloud Text-to-Speech Default Parameters and Constants
 * 
 * This module defines default values, constants, and configuration parameters for
 * Google Cloud Text-to-Speech conversion operations. It provides sensible defaults
 * for audio formats, processing options, SSML elements, and text splitting limits
 * to ensure optimal performance and compatibility across different use cases.
 * 
 * The defaults are optimized for common scenarios while providing flexibility
 * for advanced configurations. They include audio quality settings, processing
 * limits, and SSML validation rules specific to Google TTS capabilities.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link https://cloud.google.com/text-to-speech/docs/ssml | Google TTS SSML Guide}
 * @see {@link https://cloud.google.com/text-to-speech/docs/audio-profiles | Google Audio Profiles}
 * 
 * @example Using Default Parameters
 * ```typescript
 * import { 
 *   RATE, 
 *   PITCH, 
 *   AUDIO_FORMAT, 
 *   PROCESS_LIMIT 
 * } from './convert_params_defaults.js';
 * 
 * // Apply default values in conversion
 * const convertParams = {
 *   text: 'Hello world',
 *   voice: { name: 'en-US-Neural2-A' },
 *   rate: RATE,              // 'default'
 *   pitch: PITCH,            // 'default'
 *   audioFormat: AUDIO_FORMAT, // AudioOutputFormatGoogle.mp3
 *   processLimit: PROCESS_LIMIT // 4
 * };
 * ```
 * 
 * @example SSML Processing with Allowed Elements
 * ```typescript
 * import { SSML_ALLOWED_ELEMENTS, SSML_SPLIT_LIMIT } from './convert_params_defaults.js';
 * 
 * // Validate SSML elements before processing
 * function validateSsmlElement(elementName: string, attributes: string[]): boolean {
 *   const allowedAttributes = SSML_ALLOWED_ELEMENTS[elementName];
 *   if (!allowedAttributes) return false;
 *   
 *   return attributes.every(attr => allowedAttributes.includes(attr));
 * }
 * 
 * // Split long SSML content
 * function splitSsmlContent(ssml: string): string[] {
 *   if (ssml.length <= SSML_SPLIT_LIMIT) return [ssml];
 *   
 *   // Split logic here...
 *   return [];
 * }
 * ```
 * 
 * @example Custom Audio Configuration
 * ```typescript
 * import { 
 *   AUDIO_FORMAT, 
 *   AUDIO_STREAM_FORMAT,
 *   PROCESS_ASYNC 
 * } from './convert_params_defaults.js';
 * 
 * // Override defaults for high-quality audio
 * const customConfig = {
 *   audioFormat: AudioOutputFormatGoogle.linear16, // Override default MP3
 *   streamFormat: AUDIO_STREAM_FORMAT,
 *   async: PROCESS_ASYNC,
 *   sampleRate: 48000 // Custom sample rate
 * };
 * 
 * console.log(`Using async processing: ${PROCESS_ASYNC}`);
 * ```
 * 
 * @example Text Processing Limits
 * ```typescript
 * import { TEXT_SPLIT_LIMIT } from './convert_params_defaults.js';
 * 
 * function processLongText(text: string): string[] {
 *   if (text.length <= TEXT_SPLIT_LIMIT) {
 *     return [text];
 *   }
 *   
 *   const chunks: string[] = [];
 *   let currentChunk = '';
 *   
 *   const sentences = text.split(/[.!?]+/);
 *   
 *   for (const sentence of sentences) {
 *     if ((currentChunk + sentence).length > TEXT_SPLIT_LIMIT) {
 *       if (currentChunk) chunks.push(currentChunk.trim());
 *       currentChunk = sentence;
 *     } else {
 *       currentChunk += sentence + '. ';
 *     }
 *   }
 *   
 *   if (currentChunk) chunks.push(currentChunk.trim());
 *   return chunks;
 * }
 * ```
 */

import { AudioOutputStreamFormatGoogle } from './audio/audio_output_stream_format.js';
import { AudioOutputFormatGoogle } from './audio/audio_output_format.js';

/**
 * Default speaking rate for Google TTS synthesis
 * 
 * Uses Google's default rate which provides natural speech tempo.
 * Can be overridden with specific rate values or relative adjustments.
 * 
 * @example
 * ```typescript
 * const params = {
 *   text: 'Hello world',
 *   rate: RATE // Uses 'default' rate
 * };
 * ```
 */
export const RATE = 'default';

/**
 * Default pitch level for Google TTS synthesis
 * 
 * Uses Google's default pitch which provides natural voice tone.
 * Can be overridden with specific pitch values or relative adjustments.
 * 
 * @example
 * ```typescript
 * const params = {
 *   text: 'Hello world',
 *   pitch: PITCH // Uses 'default' pitch
 * };
 * ```
 */
export const PITCH = 'default';

/**
 * Default audio output format for Google TTS
 * 
 * MP3 format provides good quality with reasonable file sizes,
 * making it suitable for most applications and streaming scenarios.
 * 
 * @example
 * ```typescript
 * const audioConfig = {
 *   audioEncoding: AUDIO_FORMAT // MP3 format
 * };
 * ```
 */
export const AUDIO_FORMAT = AudioOutputFormatGoogle.mp3;

/**
 * Default audio stream format for Google TTS
 * 
 * MP3 streaming format optimized for real-time audio delivery
 * and progressive download scenarios.
 * 
 * @example
 * ```typescript
 * const streamConfig = {
 *   streamFormat: AUDIO_STREAM_FORMAT // MP3 streaming
 * };
 * ```
 */
export const AUDIO_STREAM_FORMAT = AudioOutputStreamFormatGoogle.mp3;

/**
 * Default asynchronous processing mode
 * 
 * Enables async processing for better performance and non-blocking
 * operations when handling multiple TTS requests.
 * 
 * @example
 * ```typescript
 * const processingConfig = {
 *   async: PROCESS_ASYNC // true - enables async processing
 * };
 * ```
 */
export const PROCESS_ASYNC = true;

/**
 * Default concurrent processing limit
 * 
 * Limits the number of simultaneous TTS operations to prevent
 * resource exhaustion and maintain optimal performance.
 * 
 * @example
 * ```typescript
 * const concurrentRequests = PROCESS_LIMIT; // 4 simultaneous requests
 * 
 * // Use in queue management
 * if (activeRequests.length < PROCESS_LIMIT) {
 *   processNextRequest();
 * }
 * ```
 */
export const PROCESS_LIMIT = 4;

/**
 * Allowed SSML elements and their permitted attributes for Google TTS
 * 
 * Defines the comprehensive list of SSML elements supported by Google Cloud
 * Text-to-Speech and their allowed attributes. This ensures SSML validation
 * and prevents errors from unsupported markup.
 * 
 * @example SSML Validation
 * ```typescript
 * function validateSsmlElement(element: string, attrs: string[]): boolean {
 *   const allowedAttrs = SSML_ALLOWED_ELEMENTS[element];
 *   return allowedAttrs && attrs.every(attr => allowedAttrs.includes(attr));
 * }
 * 
 * // Validate prosody element
 * const isValid = validateSsmlElement('prosody', ['rate', 'pitch']); // true
 * ```
 * 
 * @example Dynamic SSML Generation
 * ```typescript
 * function createSsmlElement(tag: string, attrs: Record<string, string>, content: string): string {
 *   const allowedAttrs = SSML_ALLOWED_ELEMENTS[tag] || [];
 *   const validAttrs = Object.entries(attrs)
 *     .filter(([attr]) => allowedAttrs.includes(attr))
 *     .map(([attr, value]) => `${attr}="${value}"`)
 *     .join(' ');
 *   
 *   return `<${tag} ${validAttrs}>${content}</${tag}>`;
 * }
 * ```
 */
export const SSML_ALLOWED_ELEMENTS = {
  audio: [
    'src',
    'clipBegin',
    'clipEnd',
    'speed',
    'repeatCount',
    'repeatDur',
    'soundLevel',
  ],
  break: ['time', 'strength'],
  emphasis: ['level'],
  lang: ['xml:lang'],
  mark: ['name'],
  media: [
    'xml:id',
    'begin',
    'end',
    'repeatCount',
    'repeatDur',
    'soundLevel',
    'fadeInDur',
    'fadeOutDur',
  ],
  p: [],
  par: [],
  phoneme: ['alphabet', 'ph'],
  s: [],
  'say-as': ['interpret-as', 'language', 'google:style', 'format', 'detail'],
  seq: [],
  sub: ['alias'],
};

/**
 * Maximum character limit for SSML content before splitting
 * 
 * Google TTS has limits on SSML content size. This constant ensures
 * content is split appropriately to prevent API errors and maintain
 * optimal processing performance.
 * 
 * @example SSML Content Splitting
 * ```typescript
 * function splitSsmlContent(ssml: string): string[] {
 *   if (ssml.length <= SSML_SPLIT_LIMIT) {
 *     return [ssml];
 *   }
 *   
 *   // Implementation for intelligent SSML splitting
 *   return splitAtSsmlBoundaries(ssml, SSML_SPLIT_LIMIT);
 * }
 * ```
 */
export const SSML_SPLIT_LIMIT = 5000;

/**
 * Maximum character limit for plain text before splitting
 * 
 * Ensures text content is within Google TTS processing limits
 * and provides optimal performance for text-to-speech conversion.
 * 
 * @example Text Content Splitting
 * ```typescript
 * function splitTextContent(text: string): string[] {
 *   if (text.length <= TEXT_SPLIT_LIMIT) {
 *     return [text];
 *   }
 *   
 *   // Split at sentence boundaries for natural speech
 *   return splitAtSentenceBoundaries(text, TEXT_SPLIT_LIMIT);
 * }
 * 
 * const longText = "Very long text content...";
 * const chunks = splitTextContent(longText);
 * console.log(`Split into ${chunks.length} chunks`);
 * ```
 */
export const TEXT_SPLIT_LIMIT = 5000;
