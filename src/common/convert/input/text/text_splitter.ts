/**
 * @fileoverview Intelligent Text Splitting for TTS Chunk Management
 * 
 * This module provides sophisticated text splitting functionality that breaks large
 * texts into optimal chunks for TTS synthesis while respecting natural language
 * boundaries. Implements intelligent splitting algorithms that prioritize sentence
 * endings, punctuation marks, and word boundaries to maintain speech flow quality.
 * 
 * The TextSplitter considers template overhead, enforces minimum content lengths,
 * and uses hierarchical delimiter prioritization to ensure optimal chunk sizes
 * while preserving readability and natural speech patterns in TTS output.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link TextOptions} for split configuration options
 * @see {@link TextBase} for complete text processing pipeline
 * @see {@link SsmlMinimizer} for template size calculation
 * 
 * @example Basic Text Splitting
 * ```typescript
 * import { TextSplitter, TextOptions } from './text_splitter.js';
 * 
 * const longText = 'First sentence. Second sentence; third part, fourth part and more.';
 * const options = new TextOptions({ splitLimit: 5000 }, { splitLimit: 30 });
 * 
 * const chunks = TextSplitter.split(
 *   longText,
 *   (text) => `<speak>${text}</speak>`,
 *   options
 * );
 * 
 * chunks.forEach((chunk, index) => {
 *   console.log(`Chunk ${index + 1}: ${chunk}`);
 * });
 * ```
 * 
 * @example Advanced Splitting with Template Overhead
 * ```typescript
 * import { TextSplitter, TextOptions } from './text_splitter.js';
 * 
 * // Template that adds significant markup overhead
 * const complexTemplate = (text: string) => `
 *   <speak>
 *     <prosody rate="1.2" pitch="+2st" volume="loud">
 *       <emphasis level="strong">${text}</emphasis>
 *     </prosody>
 *   </speak>
 * `;
 * 
 * const document = 'Very long document content...'.repeat(100);
 * const options = new TextOptions({ splitLimit: 1000 }, {});
 * 
 * const chunks = TextSplitter.split(document, complexTemplate, options);
 * console.log(`Split into ${chunks.length} chunks with template overhead considered`);
 * ```
 * 
 * @example Production Document Processing
 * ```typescript
 * import { TextSplitter, TextOptions } from './text_splitter.js';
 * 
 * function processLargeDocument(content: string, provider: string): string[] {
 *   const providerLimits = {
 *     google: 5000,
 *     amazon: 3000,
 *     microsoft: 8000
 *   };
 *   
 *   const limit = providerLimits[provider] || 5000;
 *   const options = new TextOptions({ splitLimit: limit }, {});
 *   
 *   return TextSplitter.split(
 *     content,
 *     (text) => `<speak>${text}</speak>`,
 *     options
 *   );
 * }
 * 
 * const bookChapter = generateLargeText(); // Assume this exists
 * const googleChunks = processLargeDocument(bookChapter, 'google');
 * const amazonChunks = processLargeDocument(bookChapter, 'amazon');
 * 
 * console.log({
 *   google: `${googleChunks.length} chunks`,
 *   amazon: `${amazonChunks.length} chunks`
 * });
 * ```
 */

import { TextOptions } from './text_options.js';
import { SsmlMinimizer } from '../ssml/ssml_minimizer.js';

/**
 * Function type for applying templates to text chunks
 * 
 * Defines the signature for template functions that wrap text content
 * with provider-specific markup like SSML tags, voice parameters,
 * or other formatting. The template function receives plain text
 * and returns formatted text ready for TTS synthesis.
 * 
 * @param text - Plain text content to be wrapped with template markup
 * @returns Formatted text with template markup applied
 * 
 * @example Simple SSML Template
 * ```typescript
 * const ssmlTemplate: TextRootTemplateMapper = (text: string) => {
 *   return `<speak>${text}</speak>`;
 * };
 * ```
 * 
 * @example Complex Provider Template
 * ```typescript
 * const advancedTemplate: TextRootTemplateMapper = (text: string) => {
 *   return `<speak>
 *     <prosody rate="1.1" pitch="+1st">
 *       <amazon:effect name="drc">
 *         ${text}
 *       </amazon:effect>
 *     </prosody>
 *   </speak>`;
 * };
 * ```
 * 
 * @category Common Utilities
 * @since 3.0.0
 */
export type TextRootTemplateMapper = (text: string) => string;

/**
 * Intelligent text splitting utility for optimal TTS chunk management
 * 
 * Implements sophisticated text splitting algorithms that break large texts
 * into manageable chunks while preserving natural language flow and respecting
 * TTS provider limitations. Uses hierarchical delimiter prioritization and
 * template overhead calculation to ensure optimal chunk sizes.
 * 
 * The splitting algorithm prioritizes natural language boundaries in this order:
 * 1. Sentence endings (periods, handling multiple consecutive periods)
 * 2. Clause separators (semicolons)
 * 3. Phrase separators (commas)
 * 4. Word boundaries (spaces)
 * 5. Character boundaries (as last resort)
 * 
 * @example Delimiter Priority Demonstration
 * ```typescript
 * import { TextSplitter, TextOptions } from './text_splitter.js';
 * 
 * const text = 'Sentence one. Clause; part, word boundary here and more content.';
 * const options = new TextOptions({ splitLimit: 100 }, { splitLimit: 25 });
 * 
 * const chunks = TextSplitter.split(
 *   text,
 *   (text) => text, // No template for clarity
 *   options
 * );
 * 
 * // Will split at period first, then semicolon, then comma, then spaces
 * chunks.forEach(chunk => console.log(`"${chunk}"`));
 * ```
 * 
 * @category Common Utilities
 * @since 3.0.0
 */
export class TextSplitter {
  /**
   * Private constructor prevents instantiation of utility class
   * @internal
   */
  private constructor() {}

  /**
   * Splits text into optimal chunks considering template overhead and natural boundaries
   * 
   * Implements intelligent text splitting that accounts for template markup overhead,
   * enforces minimum content requirements, and uses hierarchical boundary detection
   * to create chunks that maintain natural speech flow while respecting size limits.
   * 
   * The splitting process:
   * 1. Calculate template overhead and adjust split limit
   * 2. Validate that split limit allows for minimum content
   * 3. Iterate through text finding optimal split points
   * 4. Apply hierarchical delimiter prioritization
   * 5. Apply template and validate chunk sizes
   * 
   * @template O - Type of options object extending TextOptions
   * @param text - Input text to be split into chunks
   * @param rootTemplate - Template function to apply to each chunk
   * @param options - Configuration options including split limits
   * @returns Array of formatted text chunks ready for TTS synthesis
   * 
   * @throws {Error} When split limit is too small for minimum content requirements
   * 
   * @example Basic Splitting with Natural Boundaries
   * ```typescript
   * const text = 'First sentence. Second sentence; with clause, and phrase.';
   * const options = new TextOptions({ splitLimit: 200 }, { splitLimit: 30 });
   * 
   * const chunks = TextSplitter.split(
   *   text,
   *   (text) => `<speak>${text}</speak>`,
   *   options
   * );
   * 
   * console.log(chunks);
   * // Output will split at periods first, maintaining natural speech flow
   * ```
   * 
   * @example Template Overhead Calculation
   * ```typescript
   * const heavyTemplate = (text: string) => `
   *   <speak>
   *     <prosody rate="1.2" pitch="+2st" volume="loud">
   *       <emphasis level="strong">
   *         <amazon:effect name="drc">
   *           ${text}
   *         </amazon:effect>
   *       </emphasis>
   *     </prosody>
   *   </speak>
   * `;
   * 
   * const options = new TextOptions({ splitLimit: 1000 }, {});
   * const longText = 'Content that will be split...'.repeat(50);
   * 
   * const chunks = TextSplitter.split(longText, heavyTemplate, options);
   * // Split limit automatically adjusted for template size
   * console.log(`Created ${chunks.length} chunks accounting for template overhead`);
   * ```
   * 
   * @example Error Handling for Invalid Limits
   * ```typescript
   * try {
   *   const options = new TextOptions({ splitLimit: 100 }, { splitLimit: 60 });
   *   const largeTemplate = (text: string) => `<speak><very><long><nested>${text}</nested></long></very></speak>`;
   *   
   *   TextSplitter.split('test', largeTemplate, options);
   * } catch (error) {
   *   console.error(error.message);
   *   // "Split limit is too small to split the text. It must be greater than..."
   * }
   * ```
   * 
   * @example Production Splitting Strategy
   * ```typescript
   * function smartSplit(content: string, provider: 'google' | 'amazon' | 'microsoft'): string[] {
   *   const configs = {
   *     google: { limit: 5000, template: (t: string) => `<speak>${t}</speak>` },
   *     amazon: { limit: 3000, template: (t: string) => `<speak><amazon:effect name="drc">${t}</amazon:effect></speak>` },
   *     microsoft: { limit: 8000, template: (t: string) => `<speak><voice name="en-US-AriaNeural">${t}</voice></speak>` }
   *   };
   *   
   *   const config = configs[provider];
   *   const options = new TextOptions({ splitLimit: config.limit }, {});
   *   
   *   return TextSplitter.split(content, config.template, options);
   * }
   * ```
   * 
   * @since 3.0.0
   */
  static split<O extends TextOptions>(
    text: string,
    rootTemplate: TextRootTemplateMapper,
    options: O,
  ): string[] {
    // Calculate template overhead by measuring empty template size
    const rootTemplateMinimized = (text: string): string =>
      SsmlMinimizer.minimize(rootTemplate(text));
    const rootTemplateLength = rootTemplateMinimized('').length;
    
    // Adjust split limit to account for template overhead
    const adjustedSplitLimit = options.splitLimit - rootTemplateLength;
    const minimumContentLength = 50;

    // Validate that split limit allows for minimum content after template overhead
    if (adjustedSplitLimit <= minimumContentLength) {
      throw new Error(
        `Split limit is too small to split the text. It must be greater than the length of the root template plus ${minimumContentLength}, which is ${rootTemplateLength + minimumContentLength}.`,
      );
    }

    const chunks: string[] = [];
    let currentPosition = 0;

    // Process text in chunks until all content is processed
    while (currentPosition < text.length) {
      // Skip leading whitespace at current position
      while (text[currentPosition] === ' ' && currentPosition < text.length) {
        currentPosition++;
      }

      // Calculate maximum position for this chunk
      const splitPosition = Math.min(
        currentPosition + adjustedSplitLimit,
        text.length,
      );

      // Find optimal split point using hierarchical delimiter prioritization
      let nearestDelimiter = text.lastIndexOf('.', splitPosition);

      // Handle multiple consecutive periods (e.g., ellipsis)
      while (text[nearestDelimiter + 1] === '.') {
        nearestDelimiter++;
      }

      // Fall back to semicolon if no period found
      if (nearestDelimiter === -1 || nearestDelimiter <= currentPosition) {
        nearestDelimiter = text.lastIndexOf(';', splitPosition);
      }
      
      // Fall back to comma if no semicolon found
      if (nearestDelimiter === -1 || nearestDelimiter <= currentPosition) {
        nearestDelimiter = text.lastIndexOf(',', splitPosition);
      }
      
      // Fall back to space if no comma found
      if (nearestDelimiter === -1 || nearestDelimiter <= currentPosition) {
        nearestDelimiter = text.lastIndexOf(' ', splitPosition);
      }
      
      // Fall back to character boundary if no space found (last resort)
      if (nearestDelimiter === -1 || nearestDelimiter <= currentPosition) {
        nearestDelimiter = splitPosition - 1;
      }

      // Include the delimiter character in the chunk
      const nearestDelimiterAdjusted = nearestDelimiter + 1;

      // Extract chunk from current position to delimiter
      const chunk = text.slice(currentPosition, nearestDelimiterAdjusted);

      // Apply template to chunk and minimize for final output
      const chunkWithRoot = rootTemplateMinimized(chunk);

      // Add non-empty chunks to result array
      if (chunk.trim().length > 0) {
        chunks.push(chunkWithRoot);
      }

      // Move to next position after current chunk
      currentPosition = nearestDelimiterAdjusted;
    }

    return chunks;
  }
}
