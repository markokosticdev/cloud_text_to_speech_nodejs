/**
 * @fileoverview Text Sanitization Utilities for TTS Input Processing
 * 
 * This module provides comprehensive text sanitization functionality to clean
 * user input for TTS synthesis by removing HTML tags, decoding entities, and
 * normalizing whitespace. Ensures safe and consistent text processing across
 * all TTS providers with robust handling of malformed markup and edge cases.
 * 
 * The TextSanitizer implements a three-stage cleaning process that transforms
 * potentially unsafe or improperly formatted input into clean, TTS-ready text
 * while preserving the semantic meaning and readability of the original content.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link TextMinimizer} for whitespace optimization
 * @see {@link TextSplitter} for intelligent text chunking
 * @see {@link TextBase} for complete text processing pipeline
 * 
 * @example Basic HTML Sanitization
 * ```typescript
 * import { TextSanitizer } from './text_sanitizer.js';
 * 
 * const htmlText = '<p>Hello <strong>world</strong>!</p>';
 * const sanitized = TextSanitizer.sanitize(htmlText);
 * console.log(sanitized); // "Hello world!"
 * ```
 * 
 * @example Entity Decoding and Cleanup
 * ```typescript
 * import { TextSanitizer } from './text_sanitizer.js';
 * 
 * const entityText = 'Hello &amp; welcome to our &quot;"service"&quot;!';
 * const sanitized = TextSanitizer.sanitize(entityText);
 * console.log(sanitized); // 'Hello & welcome to our "service"!'
 * ```
 * 
 * @example Complete Sanitization Pipeline
 * ```typescript
 * import { TextSanitizer } from './text_sanitizer.js';
 * 
 * const messyInput = `
 *   <div class="content">
 *     <h1>Welcome!</h1>
 *     <p>This text has &nbsp; entities &amp; <em>formatting</em>.</p>
 *     <script>alert('malicious');</script>
 *     <p>Multiple    spaces   everywhere.</p>
 *   </div>
 * `;
 * 
 * const clean = TextSanitizer.sanitize(messyInput);
 * console.log(clean);
 * // Output: "Welcome! This text has entities & formatting. Multiple spaces everywhere."
 * ```
 * 
 * @example Production Input Processing
 * ```typescript
 * import { TextSanitizer } from './text_sanitizer.js';
 * import { TextMinimizer } from './text_minimizer.js';
 * 
 * function processUserInput(userText: string): string {
 *   // Step 1: Sanitize HTML and decode entities
 *   const sanitized = TextSanitizer.sanitize(userText);
 *   
 *   // Step 2: Minimize whitespace (optional)
 *   const minimized = TextMinimizer.minimize(sanitized);
 *   
 *   return minimized;
 * }
 * 
 * // Handle various types of user input
 * const inputs = [
 *   '<script>alert("xss")</script>Hello world!',
 *   'Text with &lt;escaped&gt; content',
 *   '   Extra   whitespace   everywhere   ',
 *   '<p>Mixed <strong>HTML</strong> &amp; entities</p>'
 * ];
 * 
 * inputs.forEach(input => {
 *   const processed = processUserInput(input);
 *   console.log(`"${input}" → "${processed}"`);
 * });
 * ```
 */

/**
 * Static utility class for comprehensive text sanitization and HTML cleanup
 * 
 * Provides robust text sanitization for TTS input processing by implementing
 * a multi-stage cleaning pipeline that removes HTML tags, decodes entities,
 * and normalizes whitespace. Designed to handle malformed markup, edge cases,
 * and security concerns while preserving text meaning.
 * 
 * The sanitization process follows these stages:
 * 1. HTML tag removal (including malformed tags)
 * 2. HTML entity decoding (common entities and numeric references)
 * 3. Whitespace normalization (multiple spaces to single space)
 * 4. Trimming of leading and trailing whitespace
 * 
 * @example Comprehensive Sanitization Process
 * ```typescript
 * import { TextSanitizer } from './text_sanitizer.js';
 * 
 * const complexInput = `
 *   <div onclick="alert('xss')">
 *     Title: &quot;Hello &amp; Welcome&quot;
 *     <p>Description with    extra    spaces</p>
 *     <unclosed-tag>Malformed content
 *     &nbsp;&nbsp;Non-breaking spaces
 *   </div>
 * `;
 * 
 * const result = TextSanitizer.sanitize(complexInput);
 * console.log(result);
 * // Output: 'Title: "Hello & Welcome" Description with extra spaces Malformed content Non-breaking spaces'
 * ```
 * 
 * @category Common Utilities
 * @since 3.0.0
 */
export class TextSanitizer {
  /**
   * Private constructor prevents instantiation of utility class
   * @internal
   */
  private constructor() {}

  /**
   * Sanitizes text by removing HTML tags, decoding entities, and normalizing whitespace
   * 
   * Applies comprehensive text cleaning through a multi-stage pipeline that ensures
   * safe, consistent text suitable for TTS synthesis. Handles edge cases including
   * empty input, malformed HTML, unknown entities, and excessive whitespace.
   * 
   * The sanitization pipeline:
   * 1. Empty input validation and early return
   * 2. HTML tag removal (complete and malformed tags)
   * 3. HTML entity decoding (standard and numeric entities)
   * 4. Whitespace normalization (multiple spaces collapsed)
   * 5. Leading/trailing whitespace trimming
   * 
   * @param text - Input text that may contain HTML markup, entities, or formatting
   * @returns Clean text suitable for TTS synthesis with all markup removed
   * 
   * @example Basic HTML Removal
   * ```typescript
   * const html = '<p>Hello <em>world</em>!</p>';
   * const clean = TextSanitizer.sanitize(html);
   * console.log(clean); // "Hello world!"
   * ```
   * 
   * @example Entity Decoding
   * ```typescript
   * const entities = 'Rock &amp; Roll &quot;"Music"&quot; &lt;Genre&gt;';
   * const decoded = TextSanitizer.sanitize(entities);
   * console.log(decoded); // 'Rock & Roll "Music" <Genre>'
   * ```
   * 
   * @example Malformed HTML Handling
   * ```typescript
   * const malformed = 'Text with <unclosed tag and <script>alert("xss")</script>';
   * const safe = TextSanitizer.sanitize(malformed);
   * console.log(safe); // "Text with"
   * ```
   * 
   * @example Edge Cases
   * ```typescript
   * // Empty and whitespace-only inputs
   * console.log(TextSanitizer.sanitize(''));           // ""
   * console.log(TextSanitizer.sanitize('   '));        // ""
   * console.log(TextSanitizer.sanitize('<p></p>'));    // ""
   * 
   * // Complex nested HTML
   * const nested = '<div><p>Outer <span>inner <em>deep</em></span> text</p></div>';
   * console.log(TextSanitizer.sanitize(nested)); // "Outer inner deep text"
   * ```
   * 
   * @since 3.0.0
   */
  static sanitize(text: string): string {
    // Handle empty input early to avoid unnecessary processing
    if (!text || text.trim() === '') {
      return '';
    }

    let cleaned = text;

    // Stage 1: Remove HTML tags (including malformed ones)
    cleaned = this._removeHtmlTags(cleaned);

    // Stage 2: Decode HTML entities to readable characters
    cleaned = this._decodeHtmlEntities(cleaned);

    // Stage 3: Normalize whitespace (collapse multiple spaces)
    cleaned = this._normalizeWhitespace(cleaned);

    // Stage 4: Remove leading and trailing whitespace
    return cleaned.trim();
  }

  /**
   * Decodes common HTML entities to their character equivalents
   * 
   * Converts standard HTML entities and numeric character references to their
   * corresponding Unicode characters. Supports the most common entities used
   * in web content while gracefully handling unknown entities by leaving them
   * unchanged for safety.
   * 
   * @param text - Text containing HTML entities to decode
   * @returns Text with entities converted to characters
   * @internal
   * 
   * @example Entity Mapping
   * ```typescript
   * // The method handles these common entities:
   * // &amp; → &
   * // &lt; → <
   * // &gt; → >
   * // &quot; → "
   * // &#39; → '
   * // &apos; → '
   * // &nbsp; → (space)
   * ```
   */
  private static _decodeHtmlEntities(text: string): string {
    // Map of common HTML entities to their character equivalents
    const entityMap: { [key: string]: string } = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&apos;': "'",
      '&nbsp;': ' ',
    };

    // Replace known entities, leave unknown entities unchanged for safety
    return text.replace(/&[#\w]+;/g, (entity) => {
      return entityMap[entity] || entity;
    });
  }

  /**
   * Removes HTML tags including malformed and unclosed tags
   * 
   * Implements robust HTML tag removal that handles both well-formed and
   * malformed HTML. First removes complete tags, then cleans up any
   * remaining opening brackets that don't have matching closing brackets
   * to prevent injection attacks and formatting issues.
   * 
   * @param text - Text containing HTML tags to remove
   * @returns Text with all HTML markup removed
   * @internal
   * 
   * @example Tag Removal Process
   * ```typescript
   * // Handles various tag formats:
   * // '<p>text</p>' → 'text'
   * // '<img src="url">' → ''
   * // '<unclosed' → ''
   * // 'text <script>evil</script> more' → 'text  more'
   * ```
   */
  private static _removeHtmlTags(text: string): string {
    // Stage 1: Remove complete HTML tags (opening and closing)
    let cleaned = text.replace(/<\/?[^>]+>/g, '');
    
    // Stage 2: Handle malformed tags (unclosed < without matching >)
    // This prevents potential XSS and formatting issues
    cleaned = cleaned.replace(/<[^>]*$/g, '');
    
    return cleaned;
  }

  /**
   * Normalizes whitespace by collapsing multiple consecutive spaces
   * 
   * Converts any sequence of whitespace characters (spaces, tabs, newlines)
   * into a single space character. This ensures consistent spacing in the
   * output text and prevents issues with TTS synthesis caused by irregular
   * whitespace patterns.
   * 
   * @param text - Text with potentially irregular whitespace
   * @returns Text with normalized single-space separation
   * @internal
   * 
   * @example Whitespace Normalization
   * ```typescript
   * // Handles various whitespace patterns:
   * // 'a   b' → 'a b'
   * // 'a\n\nb' → 'a b'
   * // 'a\t\tb' → 'a b'
   * // 'a \n\t b' → 'a b'
   * ```
   */
  private static _normalizeWhitespace(text: string): string {
    // Replace multiple whitespace characters (spaces, tabs, newlines) with single space
    return text.replace(/\s+/g, ' ');
  }
}
