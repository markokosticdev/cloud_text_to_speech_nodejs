/**
 * @fileoverview Text Minimization Utilities for TTS Processing
 * 
 * This module provides text minimization functionality to optimize text input for
 * TTS synthesis by normalizing whitespace, removing unnecessary formatting, and
 * ensuring consistent text structure across all TTS providers.
 * 
 * The TextMinimizer applies systematic text cleanup that reduces payload size,
 * improves TTS processing efficiency, and ensures consistent speech synthesis
 * results by eliminating formatting variations that could affect pronunciation.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link TextSanitizer} for HTML and entity cleanup
 * @see {@link TextSplitter} for intelligent text chunking
 * @see {@link TextBase} for complete text processing pipeline
 * 
 * @example Basic Text Minimization
 * ```typescript
 * import { TextMinimizer } from './text_minimizer.js';
 * 
 * // Normalize whitespace in text with formatting issues
 * const messyText = `This  text   has
 * 	irregular    whitespace
 * 		and	tabs everywhere.`;
 * 
 * const minimized = TextMinimizer.minimize(messyText);
 * console.log(minimized);
 * // Output: "This text has irregular whitespace and tabs everywhere."
 * ```
 * 
 * @example Production Text Cleanup Pipeline
 * ```typescript
 * import { TextMinimizer } from './text_minimizer.js';
 * import { TextSanitizer } from './text_sanitizer.js';
 * 
 * // Complete text cleanup for TTS processing
 * function cleanTextForTTS(rawText: string): string {
 *   // First sanitize HTML and entities
 *   const sanitized = TextSanitizer.sanitize(rawText);
 *   
 *   // Then minimize whitespace
 *   const minimized = TextMinimizer.minimize(sanitized);
 *   
 *   return minimized;
 * }
 * 
 * // Process user input with various formatting issues
 * const userInput = `
 *   <p>Hello there!</p>
 *   
 *   This is some text with &nbsp; extra spaces
 *   and 	tabs	mixed in.
 *   
 *   Multiple
 *   
 *   
 *   line breaks too.
 * `;
 * 
 * const cleanText = cleanTextForTTS(userInput);
 * console.log(cleanText);
 * // Output: "Hello there! This is some text with extra spaces and tabs mixed in. Multiple line breaks too."
 * ```
 * 
 * @example Batch Processing Multiple Texts
 * ```typescript
 * import { TextMinimizer } from './text_minimizer.js';
 * 
 * // Process array of texts with inconsistent formatting
 * const textArray = [
 *   'First item\n\nwith breaks',
 *   'Second		item	with	tabs',
 *   'Third    item    with    spaces',
 *   '\n\n  Fourth item with leading/trailing whitespace  \n\n'
 * ];
 * 
 * const minimizedTexts = textArray.map(text => TextMinimizer.minimize(text));
 * minimizedTexts.forEach((text, index) => {
 *   console.log(`Item ${index + 1}: "${text}"`);
 * });
 * // Output:
 * // Item 1: "First item with breaks"
 * // Item 2: "Second item with tabs"
 * // Item 3: "Third item with spaces"
 * // Item 4: "Fourth item with leading/trailing whitespace"
 * ```
 * 
 * @example Integration with TTS Providers
 * ```typescript
 * import { TextMinimizer } from './text_minimizer.js';
 * 
 * // Prepare text for Google Cloud TTS
 * function prepareForGoogleTTS(text: string): string {
 *   const minimized = TextMinimizer.minimize(text);
 *   return `<speak>${minimized}</speak>`;
 * }
 * 
 * // Prepare text for Amazon Polly
 * function prepareForAmazonPolly(text: string): string {
 *   const minimized = TextMinimizer.minimize(text);
 *   return `<speak><amazon:effect name="drc">${minimized}</amazon:effect></speak>`;
 * }
 * 
 * const originalText = `Welcome to our service!
 * 
 * We're glad    you're here.
 * 	Please enjoy your experience.`;
 * 
 * console.log('Google format:', prepareForGoogleTTS(originalText));
 * console.log('Amazon format:', prepareForAmazonPolly(originalText));
 * ```
 */

/**
 * Static utility class for text minimization and whitespace normalization
 * 
 * Provides efficient text minimization by normalizing whitespace characters,
 * removing excessive spacing, and ensuring consistent text formatting for
 * optimal TTS processing. The minimization process preserves text meaning
 * while optimizing for speech synthesis clarity and efficiency.
 * 
 * This class implements a two-stage minimization process:
 * 1. Normalize line breaks and tabs to single spaces
 * 2. Collapse multiple consecutive spaces to single spaces
 * 3. Trim leading and trailing whitespace
 * 
 * @example Whitespace Normalization Process
 * ```typescript
 * import { TextMinimizer } from './text_minimizer.js';
 * 
 * // Demonstrate the minimization process
 * const testText = "Hello\n\nWorld\t\tThis   has    spaces";
 * 
 * console.log('Original:', JSON.stringify(testText));
 * // Original: "Hello\n\nWorld\t\tThis   has    spaces"
 * 
 * const minimized = TextMinimizer.minimize(testText);
 * console.log('Minimized:', JSON.stringify(minimized));
 * // Minimized: "Hello World This has spaces"
 * ```
 * 
 * @example Performance Optimization for Large Texts
 * ```typescript
 * import { TextMinimizer } from './text_minimizer.js';
 * 
 * // Process large document efficiently
 * const largeDocument = generateLargeTextWithFormatting(); // Assume this exists
 * 
 * console.time('Text Minimization');
 * const minimizedDocument = TextMinimizer.minimize(largeDocument);
 * console.timeEnd('Text Minimization');
 * 
 * console.log(`Reduced from ${largeDocument.length} to ${minimizedDocument.length} characters`);
 * // Typical reduction: 10-30% depending on original formatting
 * ```
 * 
 * @category Common Utilities
 * @since 3.0.0
 */
export class TextMinimizer {
  /**
   * Private constructor prevents instantiation of utility class
   * @internal
   */
  private constructor() {}

  /**
   * Minimizes text by normalizing whitespace and removing excessive spacing
   * 
   * Applies systematic whitespace normalization to prepare text for TTS synthesis.
   * The method processes text in two stages: first normalizing line breaks and tabs
   * to spaces, then collapsing multiple consecutive spaces. Finally trims the result.
   * 
   * The minimization process:
   * 1. Converts tabs and newlines to single spaces
   * 2. Collapses multiple consecutive spaces to single spaces
   * 3. Trims leading and trailing whitespace
   * 
   * @param text - Input text with potentially irregular whitespace
   * @returns Minimized text with normalized whitespace
   * 
   * @example Basic Minimization
   * ```typescript
   * const formatted = `
   *   Line one with tabs	and spaces
   *   
   *   Line two    with    extra    spaces
   *   	Line three with leading tab
   * `;
   * 
   * const minimized = TextMinimizer.minimize(formatted);
   * console.log(minimized);
   * // Output: "Line one with tabs and spaces Line two with extra spaces Line three with leading tab"
   * ```
   * 
   * @example Handling Edge Cases
   * ```typescript
   * // Empty and whitespace-only strings
   * console.log(TextMinimizer.minimize(''));           // ""
   * console.log(TextMinimizer.minimize('   '));        // ""
   * console.log(TextMinimizer.minimize('\n\t\n'));     // ""
   * 
   * // Single words
   * console.log(TextMinimizer.minimize('  hello  '));  // "hello"
   * 
   * // Mixed whitespace types
   * console.log(TextMinimizer.minimize('a\n\tb\t\nc')); // "a b c"
   * ```
   * 
   * @example Integration with Text Processing Pipeline
   * ```typescript
   * import { TextSanitizer } from './text_sanitizer.js';
   * import { TextMinimizer } from './text_minimizer.js';
   * 
   * function processTextForTTS(rawInput: string): string {
   *   // Step 1: Remove HTML and decode entities
   *   const sanitized = TextSanitizer.sanitize(rawInput);
   *   
   *   // Step 2: Minimize whitespace
   *   const minimized = TextMinimizer.minimize(sanitized);
   *   
   *   return minimized;
   * }
   * 
   * const htmlText = `<p>Hello    world!</p>
   * <br>
   * 	<span>How are	you?</span>`;
   * 
   * const processed = processTextForTTS(htmlText);
   * console.log(processed); // "Hello world! How are you?"
   * ```
   * 
   * @since 3.0.0
   */
  static minimize(text: string): string {
    // Stage 1: Convert tabs and newlines to single spaces
    // This handles \t (tab) and \n (newline) characters
    let minimizedText = text.replace(/[\t\n]+/g, ' ');

    // Stage 2: Collapse multiple consecutive spaces into single spaces
    // This handles sequences of 2 or more space characters
    minimizedText = minimizedText.replace(/\s{2,}/g, ' ');

    // Stage 3: Remove leading and trailing whitespace
    return minimizedText.trim();
  }
}
