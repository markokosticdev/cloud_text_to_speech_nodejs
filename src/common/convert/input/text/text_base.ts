/**
 * @fileoverview Abstract Base Class for Text-to-Speech Input Processing
 * 
 * This module provides the foundational abstract class for text input processing across
 * all TTS providers. It handles text validation, sanitization, minimization, and splitting
 * with consistent behavior regardless of the underlying provider implementation.
 * 
 * The TextBase class manages the complete text processing pipeline including input validation,
 * chunk processing, and template application. It supports both single text input and 
 * pre-chunked text arrays with comprehensive error handling for invalid configurations.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link TextSanitizer} for text cleaning utilities
 * @see {@link TextMinimizer} for text compression utilities
 * @see {@link TextSplitter} for text chunking utilities
 * 
 * @example Basic Text Processing
 * ```typescript
 * import { TextBase, TextOptions } from './text_base.js';
 * 
 * class MyTextProcessor extends TextBase<string, TextOptions> {
 *   protected textRootTemplate(text: string): string {
 *     return `<speak>${text}</speak>`;
 *   }
 * }
 * 
 * const processor = new MyTextProcessor({
 *   text: 'Hello world! How are you today?',
 *   rate: '1.0',
 *   pitch: '0',
 *   voiceId: 'en-US-Standard-A',
 *   options: new TextOptions({ splitLimit: 5000 }, {})
 * });
 * 
 * const chunks = processor.processedTextChunks();
 * console.log(chunks); // ['<speak>Hello world! How are you today?</speak>']
 * ```
 * 
 * @example Advanced Processing with Voice Object
 * ```typescript
 * interface Voice {
 *   name: string;
 *   language: string;
 * }
 * 
 * class AdvancedTextProcessor extends TextBase<Voice, TextOptions> {
 *   protected textRootTemplate(text: string): string {
 *     return `<speak voice="${this.voice?.name}" lang="${this.voice?.language}">${text}</speak>`;
 *   }
 * }
 * 
 * const processor = new AdvancedTextProcessor({
 *   textChunks: ['Hello world!', 'How are you?', 'Nice to meet you.'],
 *   rate: '1.2',
 *   pitch: '2.0',
 *   voice: { name: 'en-US-Neural2-A', language: 'en-US' },
 *   options: new TextOptions({ splitLimit: 5000 }, { splitLimit: 1000 })
 * });
 * 
 * const processedChunks = processor.processedTextChunks();
 * processedChunks.forEach((chunk, index) => {
 *   console.log(`Chunk ${index + 1}: ${chunk}`);
 * });
 * ```
 * 
 * @example Error Handling and Validation
 * ```typescript
 * try {
 *   // This will throw an error - both voice and voiceId provided
 *   const invalidProcessor = new MyTextProcessor({
 *     text: 'Hello world',
 *     rate: '1.0',
 *     pitch: '0',
 *     voice: { name: 'test-voice' },
 *     voiceId: 'test-voice-id', // ERROR: Cannot provide both
 *     options: new TextOptions({ splitLimit: 5000 }, {})
 *   });
 * } catch (error) {
 *   console.error('Validation error:', error.message);
 *   // "Only voice or voiceId must be provided."
 * }
 * 
 * try {
 *   // This will throw an error - no text or textChunks provided
 *   const emptyProcessor = new MyTextProcessor({
 *     rate: '1.0',
 *     pitch: '0',
 *     voiceId: 'test-voice',
 *     options: new TextOptions({ splitLimit: 5000 }, {})
 *   });
 * } catch (error) {
 *   console.error('Input error:', error.message);
 *   // "Either input or textChunks must be provided."
 * }
 * ```
 * 
 * @example Production Text Processing Pipeline
 * ```typescript
 * import { TextOptions } from './text_options.js';
 * 
 * class ProductionTextProcessor extends TextBase<Voice, TextOptions> {
 *   protected textRootTemplate(text: string): string {
 *     // Add production-ready SSML wrapper with proper escaping
 *     const rate = parseFloat(this.rate);
 *     const pitch = parseFloat(this.pitch);
 *     
 *     return `<speak>
 *       <prosody rate="${rate > 1 ? 'fast' : rate < 1 ? 'slow' : 'medium'}" 
 *                pitch="${pitch > 0 ? 'high' : pitch < 0 ? 'low' : 'medium'}">
 *         ${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
 *       </prosody>
 *     </speak>`;
 *   }
 * }
 * 
 * // Process large document with chunking
 * const largeText = `
 *   This is a very long document that needs to be processed in chunks.
 *   It contains multiple sentences and paragraphs that will be automatically
 *   split based on the configured limits and natural text boundaries.
 * `.repeat(100);
 * 
 * const processor = new ProductionTextProcessor({
 *   text: largeText,
 *   rate: '1.1',
 *   pitch: '0.5',
 *   voice: { name: 'en-US-Standard-A', language: 'en-US' },
 *   options: new TextOptions({ splitLimit: 5000 }, { splitLimit: 2000 })
 * });
 * 
 * const chunks = processor.processedTextChunks();
 * console.log(`Processed ${chunks.length} chunks from ${largeText.length} characters`);
 * ```
 */

import { TextSanitizer } from './text_sanitizer.js';
import { TextMinimizer } from './text_minimizer.js';
import { TextSplitter } from './text_splitter.js';
import { TextOptions } from '../text/text_options.js';

/**
 * Abstract base class for text input processing in TTS operations
 * 
 * This class provides the foundation for text processing across all TTS providers,
 * handling input validation, text sanitization, minimization, and intelligent splitting.
 * It supports both single text inputs and pre-chunked text arrays with comprehensive
 * validation and error handling.
 * 
 * The class implements a complete text processing pipeline that ensures consistent
 * behavior across different TTS providers while allowing for provider-specific
 * customization through the abstract textRootTemplate method.
 * 
 * @template V - Type of voice object used by the specific TTS provider
 * @template O - Type of options object extending TextOptions
 * 
 * @example Implementing Provider-Specific Text Processor
 * ```typescript
 * interface GoogleVoice {
 *   name: string;
 *   languageCode: string;
 *   gender: 'MALE' | 'FEMALE' | 'NEUTRAL';
 * }
 * 
 * class GoogleTextProcessor extends TextBase<GoogleVoice, TextOptions> {
 *   protected textRootTemplate(text: string): string {
 *     return `<speak>${text}</speak>`;
 *   }
 * }
 * 
 * const processor = new GoogleTextProcessor({
 *   text: 'Hello from Google TTS!',
 *   rate: '1.0',
 *   pitch: '0',
 *   voice: {
 *     name: 'en-US-Standard-A',
 *     languageCode: 'en-US',
 *     gender: 'FEMALE'
 *   },
 *   options: new TextOptions({ splitLimit: 5000 }, {})
 * });
 * ```
 * 
 * @category Common Utilities
 * @since 3.0.0
 */
export abstract class TextBase<V, O extends TextOptions> {
  /**
   * Original text input for processing
   * @readonly
   */
  text: string | undefined;
  
  /**
   * Pre-chunked text array for batch processing
   * @readonly
   */
  textChunks: string[] | undefined;
  
  /**
   * Speech rate multiplier as string
   * @remarks Must be parseable as float, typically between 0.25 and 4.0
   * @readonly
   */
  rate: string;
  
  /**
   * Speech pitch adjustment as string
   * @remarks Must be parseable as float, typically between -20.0 and 20.0
   * @readonly
   */
  pitch: string;
  
  /**
   * Voice configuration object for TTS synthesis
   * @readonly
   */
  voice: V | undefined;
  
  /**
   * Voice identifier string as alternative to voice object
   * @readonly
   */
  voiceId: string | undefined;
  
  /**
   * Processing options including split limits and behavior settings
   * @readonly
   */
  options: O;

  /**
   * Creates a new TextBase instance with input validation
   * 
   * Validates that either voice or voiceId is provided (but not both),
   * and that either text or textChunks is provided (but not both).
   * Sets up the complete configuration for text processing.
   * 
   * @param config - Configuration object for text processing
   * @param config.text - Single text input for processing
   * @param config.textChunks - Pre-chunked text array for batch processing
   * @param config.rate - Speech rate multiplier as string
   * @param config.pitch - Speech pitch adjustment as string
   * @param config.voice - Voice configuration object
   * @param config.voiceId - Voice identifier string
   * @param config.options - Processing options extending TextOptions
   * 
   * @throws {Error} When both voice and voiceId are provided
   * @throws {Error} When neither voice nor voiceId is provided
   * @throws {Error} When both text and textChunks are provided
   * @throws {Error} When neither text nor textChunks is provided
   * 
   * @example Valid Constructor Usage
   * ```typescript
   * // Using voice object
   * const processor1 = new MyTextProcessor({
   *   text: 'Hello world',
   *   rate: '1.0',
   *   pitch: '0',
   *   voice: { name: 'en-US-Standard-A' },
   *   options: new TextOptions({ splitLimit: 5000 }, {})
   * });
   * 
   * // Using voiceId string
   * const processor2 = new MyTextProcessor({
   *   textChunks: ['Chunk 1', 'Chunk 2'],
   *   rate: '1.2',
   *   pitch: '2.0',
   *   voiceId: 'en-US-Standard-A',
   *   options: new TextOptions({ splitLimit: 5000 }, {})
   * });
   * ```
   * 
   * @since 3.0.0
   */
  constructor({
    text,
    textChunks,
    rate,
    pitch,
    voice,
    voiceId,
    options,
  }: {
    text?: string;
    textChunks?: string[];
    rate: string;
    pitch: string;
    voice?: V;
    voiceId?: string;
    options: O;
  }) {
    // Validate voice configuration - exactly one must be provided
    if (!voice && !voiceId) {
      throw new Error('Either voice or voiceId must be provided.');
    }

    if (voice && voiceId) {
      throw new Error('Only voice or voiceId must be provided.');
    }

    // Validate text input - exactly one must be provided
    if (!text && !textChunks) {
      throw new Error('Either input or textChunks must be provided.');
    }

    if (text && textChunks) {
      throw new Error('Only input or textChunks must be provided.');
    }

    this.text = text;
    this.textChunks = textChunks;
    this.rate = rate;
    this.pitch = pitch;
    this.voice = voice;
    this.voiceId = voiceId;
    this.options = options;
  }

  /**
   * Processes text input through the complete sanitization and splitting pipeline
   * 
   * Applies the full text processing pipeline including sanitization, minimization,
   * and intelligent splitting. For pre-chunked input, processes each chunk individually.
   * For single text input, applies splitting based on configured limits and natural
   * text boundaries.
   * 
   * The processing pipeline consists of:
   * 1. Text sanitization (HTML removal, entity decoding)
   * 2. Text minimization (whitespace normalization)
   * 3. Template application (provider-specific formatting)
   * 4. Intelligent splitting (for single text inputs only)
   * 
   * @returns Array of processed text chunks ready for TTS synthesis
   * 
   * @example Processing Pre-Chunked Text
   * ```typescript
   * const processor = new MyTextProcessor({
   *   textChunks: [
   *     'First chunk with <b>HTML</b> content.',
   *     'Second chunk with    extra   whitespace.',
   *     'Third chunk with &amp; entities.'
   *   ],
   *   rate: '1.0',
   *   pitch: '0',
   *   voiceId: 'test-voice',
   *   options: new TextOptions({ splitLimit: 5000 }, {})
   * });
   * 
   * const processed = processor.processedTextChunks();
   * // Each chunk is sanitized and minimized but not split further
   * console.log(processed.length); // 3
   * ```
   * 
   * @example Processing Single Text with Splitting
   * ```typescript
   * const processor = new MyTextProcessor({
   *   text: 'This is a long text. It has multiple sentences. And will be split intelligently.',
   *   rate: '1.0',
   *   pitch: '0',
   *   voiceId: 'test-voice',
   *   options: new TextOptions({ splitLimit: 5000 }, { splitLimit: 50 })
   * });
   * 
   * const processed = processor.processedTextChunks();
   * // Text is split at natural boundaries (periods, commas, spaces)
   * console.log(processed.length); // May be > 1 depending on split limit
   * ```
   * 
   * @since 3.0.0
   */
  processedTextChunks(): string[] {
    if (this.textChunks) {
      // Process each pre-existing chunk individually
      return this.textChunks.map((text) => {
        // Apply sanitization to remove HTML and normalize entities
        const sanitizedText = TextSanitizer.sanitize(text);
        // Apply minimization to normalize whitespace
        const minimizedText = TextMinimizer.minimize(sanitizedText);
        // Apply provider-specific template formatting
        return this.textRootTemplate(minimizedText);
      });
    } else {
      // Process single text input with splitting
      const sanitizedText = TextSanitizer.sanitize(this.text);
      const minimizedText = TextMinimizer.minimize(sanitizedText);
      // Split text intelligently based on configured limits and natural boundaries
      return TextSplitter.split(
        minimizedText,
        (text) => this.textRootTemplate(text),
        this.options,
      );
    }
  }

  /**
   * Abstract method for applying provider-specific text formatting
   * 
   * This method must be implemented by subclasses to provide provider-specific
   * text formatting such as SSML wrapping, voice parameters, or other
   * provider-specific markup. The method receives sanitized and minimized text
   * and should return the final formatted text ready for TTS synthesis.
   * 
   * @param ssml - Preprocessed text ready for template application
   * @returns Formatted text with provider-specific markup applied
   * 
   * @example Google Cloud TTS Implementation
   * ```typescript
   * protected textRootTemplate(text: string): string {
   *   return `<speak>
   *     <prosody rate="${this.rate}" pitch="${this.pitch}">
   *       ${text}
   *     </prosody>
   *   </speak>`;
   * }
   * ```
   * 
   * @example Amazon Polly Implementation
   * ```typescript
   * protected textRootTemplate(text: string): string {
   *   return `<speak>
   *     <amazon:effect name="drc">
   *       <prosody rate="${this.rate}" pitch="${this.pitch}">
   *         ${text}
   *       </prosody>
   *     </amazon:effect>
   *   </speak>`;
   * }
   * ```
   * 
   * @since 3.0.0
   */
  protected textRootTemplate(ssml: string): string {
    return ssml;
  }
}
