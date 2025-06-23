/**
 * @fileoverview Google Cloud Text-to-Speech Text Processing Options
 * 
 * This module defines text-specific processing configuration for Google Cloud
 * Text-to-Speech operations. It provides Google-optimized defaults for plain
 * text processing including content splitting limits and text handling
 * behavior optimized for Google TTS requirements.
 * 
 * The text options extend the base text configuration with Google-specific
 * split limits and processing parameters to ensure optimal performance
 * and compatibility with Google's text-to-speech API constraints.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link https://cloud.google.com/text-to-speech/docs | Google TTS Documentation}
 * @see {@link TEXT_SPLIT_LIMIT} for default split configuration
 * 
 * @example Basic Text Options
 * ```typescript
 * import { ConvertTextOptionsGoogle } from './convert_text_options.js';
 * 
 * const textOptions = new ConvertTextOptionsGoogle();
 * 
 * const params = new ConvertParamsGoogle({
 *   text: 'This is a simple text-to-speech example using Google Cloud TTS.',
 *   voice: { name: 'en-US-Neural2-A' },
 *   textOptions
 * });
 * ```
 * 
 * @example Custom Split Limit
 * ```typescript
 * import { ConvertTextOptionsGoogle } from './convert_text_options.js';
 * 
 * const customOptions = new ConvertTextOptionsGoogle({
 *   splitLimit: 3000 // Smaller chunks for faster processing
 * });
 * 
 * const longText = generateLongTextContent(); // > 3000 characters
 * const params = new ConvertParamsGoogle({
 *   text: longText,
 *   voice: { name: 'en-US-Neural2-F' },
 *   textOptions: customOptions
 * });
 * ```
 * 
 * @example Large Document Processing
 * ```typescript
 * import { ConvertTextOptionsGoogle } from './convert_text_options.js';
 * 
 * // Optimized for processing large documents
 * const documentOptions = new ConvertTextOptionsGoogle({
 *   splitLimit: 2000 // Smaller chunks for better memory management
 * });
 * 
 * const largeDocument = await fs.readFile('large-document.txt', 'utf8');
 * const params = new ConvertParamsGoogle({
 *   text: largeDocument,
 *   voice: { name: 'en-US-Neural2-C' },
 *   textOptions: documentOptions
 * });
 * 
 * // Text will be automatically split into manageable chunks
 * const audioBuffer = await ttsGoogle.convert(params);
 * ```
 * 
 * @example Performance Tuning
 * ```typescript
 * import { ConvertTextOptionsGoogle } from './convert_text_options.js';
 * 
 * // Different split limits for different use cases
 * const fastProcessing = new ConvertTextOptionsGoogle({
 *   splitLimit: 1500 // Faster processing, more requests
 * });
 * 
 * const balancedProcessing = new ConvertTextOptionsGoogle({
 *   splitLimit: 4000 // Balanced approach (default: 5000)
 * });
 * 
 * const efficientProcessing = new ConvertTextOptionsGoogle({
 *   splitLimit: 5000 // Maximum efficiency, fewer requests
 * });
 * 
 * // Choose based on requirements
 * const selectedOptions = shouldOptimizeForSpeed ? 
 *   fastProcessing : efficientProcessing;
 * ```
 */

import { TEXT_SPLIT_LIMIT } from './convert_params_defaults.js';
import { TextOptions } from '../../common/convert/input/text/text_options.js';

/**
 * Text processing configuration for Google Cloud Text-to-Speech
 * 
 * This class extends the base text options with Google-specific defaults
 * for plain text processing. It provides optimized configuration for Google TTS
 * text handling including content splitting strategies and processing parameters.
 * 
 * The configuration ensures text content is processed efficiently within
 * Google's API constraints while providing flexibility for different
 * text processing requirements and use cases.
 * 
 * @example Default Configuration
 * ```typescript
 * const options = new ConvertTextOptionsGoogle();
 * // Uses Google default split limit of 5000 characters
 * ```
 * 
 * @example Custom Split Limit
 * ```typescript
 * const options = new ConvertTextOptionsGoogle({
 *   splitLimit: 3000 // Custom split for specific requirements
 * });
 * ```
 * 
 * @example Large Content Processing
 * ```typescript
 * const options = new ConvertTextOptionsGoogle({
 *   splitLimit: 2000 // Smaller chunks for large documents
 * });
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class ConvertTextOptionsGoogle extends TextOptions {
  /**
   * Creates new Google text processing options
   * 
   * @param splitLimit - Maximum text content size before splitting (defaults to 5000)
   * 
   * @example Default Text Options
   * ```typescript
   * const options = new ConvertTextOptionsGoogle();
   * // Uses Google default split limit of 5000 characters
   * ```
   * 
   * @example Custom Split Configuration
   * ```typescript
   * const options = new ConvertTextOptionsGoogle({
   *   splitLimit: 3000
   * });
   * 
   * // Text longer than 3000 characters will be automatically split
   * const longText = "Very long text content...";
   * const params = new ConvertParamsGoogle({
   *   text: longText,
   *   voice: { name: 'en-US-Neural2-A' },
   *   textOptions: options
   * });
   * ```
   * 
   * @example Optimized for Different Content Types
   * ```typescript
   * // For short messages - use default
   * const shortOptions = new ConvertTextOptionsGoogle();
   * 
   * // For articles/documents - smaller chunks
   * const articleOptions = new ConvertTextOptionsGoogle({
   *   splitLimit: 2500
   * });
   * 
   * // For books/large content - very small chunks
   * const bookOptions = new ConvertTextOptionsGoogle({
   *   splitLimit: 1500
   * });
   * ```
   * 
   * @example Dynamic Split Limit Based on Content
   * ```typescript
   * function createTextOptions(contentLength: number): ConvertTextOptionsGoogle {
   *   let splitLimit: number;
   *   
   *   if (contentLength < 1000) {
   *     splitLimit = 5000; // Default for short content
   *   } else if (contentLength < 10000) {
   *     splitLimit = 3000; // Medium content
   *   } else {
   *     splitLimit = 2000; // Large content
   *   }
   *   
   *   return new ConvertTextOptionsGoogle({ splitLimit });
   * }
   * 
   * const text = await loadTextContent();
   * const textOptions = createTextOptions(text.length);
   * ```
   * 
   * @example Memory-Optimized Configuration
   * ```typescript
   * // For memory-constrained environments
   * const memoryOptimized = new ConvertTextOptionsGoogle({
   *   splitLimit: 1000 // Very small chunks to minimize memory usage
   * });
   * 
   * // Process very large text files without memory issues
   * const hugeText = await fs.readFile('huge-file.txt', 'utf8');
   * const params = new ConvertParamsGoogle({
   *   text: hugeText,
   *   voice: { name: 'en-US-Neural2-F' },
   *   textOptions: memoryOptimized
   * });
   * ```
   */
  constructor({
    splitLimit,
  }: {
    splitLimit?: number;
  } = {}) {
    super(
      {
        splitLimit: TEXT_SPLIT_LIMIT,
      },
      { splitLimit },
    );
  }
}
