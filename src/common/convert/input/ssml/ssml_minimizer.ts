/**
 * @fileoverview SSML Content Minimization and Optimization System
 * 
 * This module provides comprehensive SSML content minimization capabilities for
 * optimizing Speech Synthesis Markup Language (SSML) documents. It removes
 * unnecessary whitespace, normalizes formatting, and reduces content size while
 * preserving semantic meaning and proper SSML structure for efficient TTS processing.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link SsmlSanitizer} for content sanitization
 * @see {@link SsmlSplitter} for content chunking
 * @see {@link SsmlValidator} for content validation
 * 
 * @example Basic SSML minimization
 * ```typescript
 * import { SsmlMinimizer } from 'cloud-text-to-speech';
 * 
 * const ssml = `
 *   <speak>
 *     Hello     world
 *     <break time="1s"/>
 *     
 *     How are you?
 *   </speak>
 * `;
 * 
 * const minimized = SsmlMinimizer.minimize(ssml);
 * console.log(minimized); // "<speak>Hello world<break time="1s"/>How are you?</speak>"
 * ```
 * 
 * @example Advanced minimization with preservation
 * ```typescript
 * const complexSsml = `
 *   <speak>
 *     <p>
 *       This is a paragraph     with extra spaces.
 *       <s>This is a sentence.</s>
 *       
 *       <s>Another sentence with <emphasis level="strong">emphasis</emphasis>.</s>
 *     </p>
 *   </speak>
 * `;
 * 
 * const optimized = SsmlMinimizer.minimize(complexSsml);
 * // Removes extra whitespace while preserving structure and meaning
 * ```
 */

/**
 * SSML Content Minimization and Optimization Utility
 * 
 * Provides static methods for optimizing SSML content by removing unnecessary
 * whitespace, normalizing formatting, and reducing overall document size while
 * maintaining semantic correctness and proper SSML structure. Essential for
 * optimizing TTS requests and reducing network overhead.
 * 
 * @category SSML Processing
 * 
 * @example Basic minimization workflow
 * ```typescript
 * import { SsmlMinimizer } from 'cloud-text-to-speech';
 * 
 * const optimizeSsmlContent = (ssml: string) => {
 *   console.log('Original size:', ssml.length);
 *   
 *   const minimized = SsmlMinimizer.minimize(ssml);
 *   console.log('Minimized size:', minimized.length);
 *   console.log('Size reduction:', ssml.length - minimized.length, 'characters');
 *   
 *   const reductionPercent = ((ssml.length - minimized.length) / ssml.length * 100).toFixed(1);
 *   console.log('Reduction percentage:', reductionPercent + '%');
 *   
 *   return minimized;
 * };
 * ```
 * 
 * @example Batch processing optimization
 * ```typescript
 * const optimizeBatch = (ssmlDocuments: string[]) => {
 *   let totalOriginalSize = 0;
 *   let totalMinimizedSize = 0;
 *   
 *   const optimized = ssmlDocuments.map((ssml, index) => {
 *     const original = ssml.length;
 *     const minimized = SsmlMinimizer.minimize(ssml);
 *     const final = minimized.length;
 *     
 *     totalOriginalSize += original;
 *     totalMinimizedSize += final;
 *     
 *     console.log(`Document ${index + 1}: ${original} → ${final} (${original - final} saved)`);
 *     return minimized;
 *   });
 *   
 *   console.log(`Total optimization: ${totalOriginalSize} → ${totalMinimizedSize}`);
 *   console.log(`Total saved: ${totalOriginalSize - totalMinimizedSize} characters`);
 *   
 *   return optimized;
 * };
 * ```
 * 
 * @example Performance monitoring
 * ```typescript
 * const minimizeWithMetrics = (ssml: string) => {
 *   const startTime = performance.now();
 *   const originalSize = ssml.length;
 *   
 *   const minimized = SsmlMinimizer.minimize(ssml);
 *   
 *   const endTime = performance.now();
 *   const processingTime = endTime - startTime;
 *   const finalSize = minimized.length;
 *   const reduction = originalSize - finalSize;
 *   
 *   return {
 *     content: minimized,
 *     metrics: {
 *       originalSize,
 *       finalSize,
 *       reduction,
 *       reductionPercent: (reduction / originalSize * 100).toFixed(2),
 *       processingTime: processingTime.toFixed(2) + 'ms'
 *     }
 *   };
 * };
 * ```
 */
export class SsmlMinimizer {
  private constructor() {}

  /**
   * Minimizes SSML content by removing unnecessary whitespace and normalizing formatting.
   * Performs comprehensive content optimization including removal of extra spaces,
   * normalization of line breaks, and elimination of redundant whitespace while
   * preserving semantic meaning and proper SSML element structure.
   * 
   * @param ssml - SSML content to minimize and optimize
   * @returns Minimized SSML content with reduced size and normalized formatting
   * 
   * @example Basic minimization
   * ```typescript
   * import { SsmlMinimizer } from 'cloud-text-to-speech';
   * 
   * const verboseSsml = `
   *   <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis">
   *     <p>
   *       Hello there,     how are you doing today?
   *       
   *       <break time="2s"/>
   *       
   *       I hope you're having a wonderful day!
   *     </p>
   *   </speak>
   * `;
   * 
   * const minimized = SsmlMinimizer.minimize(verboseSsml);
   * console.log(minimized);
   * // Output: <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"><p>Hello there, how are you doing today?<break time="2s"/>I hope you're having a wonderful day!</p></speak>
   * ```
   * 
   * @example Complex SSML with preservation of structure
   * ```typescript
   * const complexSsml = `
   *   <speak>
   *     <voice name="en-US-Standard-A">
   *       <prosody rate="slow" pitch="low">
   *         <p>
   *           This is a    slow    and    low    paragraph.
   *           <s>
   *             With a sentence containing <emphasis level="strong">strong emphasis</emphasis>.
   *           </s>
   *         </p>
   *       </prosody>
   *     </voice>
   *   </speak>
   * `;
   * 
   * const optimized = SsmlMinimizer.minimize(complexSsml);
   * // Removes extra spaces while maintaining element hierarchy and attributes
   * ```
   * 
   * @example Minimization with audio elements
   * ```typescript
   * const audioSsml = `
   *   <speak>
   *     <audio src="https://example.com/intro.mp3">
   *       Fallback text if audio fails
   *     </audio>
   *     
   *     <p>
   *       Main content after audio.
   *       <break time="1s"/>
   *       More content here.
   *     </p>
   *   </speak>
   * `;
   * 
   * const minimized = SsmlMinimizer.minimize(audioSsml);
   * // Preserves audio elements while optimizing surrounding content
   * ```
   * 
   * @example Processing with size comparison
   * ```typescript
   * const compareMinimization = (ssml: string) => {
   *   const original = ssml;
   *   const minimized = SsmlMinimizer.minimize(ssml);
   *   
   *   console.log('Original SSML:');
   *   console.log(original);
   *   console.log(`Original size: ${original.length} characters`);
   *   
   *   console.log('\nMinimized SSML:');
   *   console.log(minimized);
   *   console.log(`Minimized size: ${minimized.length} characters`);
   *   
   *   const saved = original.length - minimized.length;
   *   const percentage = (saved / original.length * 100).toFixed(1);
   *   console.log(`\nOptimization: Saved ${saved} characters (${percentage}%)`);
   *   
   *   return minimized;
   * };
   * ```
   * 
   * @example Integration with TTS workflow
   * ```typescript
   * const processTtsContent = (ssml: string) => {
   *   // 1. Minimize for efficiency
   *   const minimized = SsmlMinimizer.minimize(ssml);
   *   
   *   // 2. Check size constraints
   *   const maxSize = 5000; // Example TTS service limit
   *   if (minimized.length > maxSize) {
   *     console.warn(`Minimized SSML still exceeds size limit: ${minimized.length} > ${maxSize}`);
   *     // Consider further splitting or content reduction
   *   }
   *   
   *   // 3. Use optimized content for TTS
   *   return minimized;
   * };
   * ```
   * 
   * @example Preserving important formatting
   * ```typescript
   * const ssmlWithImportantSpaces = `
   *   <speak>
   *     <p>Phone number: <say-as interpret-as="digits">555 123 4567</say-as></p>
   *     <p>Address: 123 Main St, City, State 12345</p>
   *   </speak>
   * `;
   * 
   * const minimized = SsmlMinimizer.minimize(ssmlWithImportantSpaces);
   * // Preserves spaces within content that are semantically important
   * ```
   */
  static minimize(ssml: string): string {
    if (!ssml) {
      return '';
    }

    return ssml
      // Remove leading and trailing whitespace from the entire document
      .trim()
      // First convert tabs and newlines to spaces
      .replace(/[\t\n\r]/g, ' ')
      // Normalize multiple spaces to single spaces (including the ones created above)
      .replace(/\s{2,}/g, ' ')
      // First, preserve spaces between text and tags by marking them
      .replace(/(\w)\s+</g, '$1 <')
      // Remove extra whitespace between elements  
      .replace(/>\s+</g, '><')
      // Remove whitespace around self-closing tags
      .replace(/\s*\/>/g, '/>')
      // Remove whitespace after opening tags and before closing tags  
      .replace(/>\s+/g, '>')
      .replace(/\s+</g, (match, offset, string) => {
        // Check the character before the spaces
        const charBefore = string.charAt(offset - 1);
        // If it's a word character (letter, digit, underscore), preserve one space
        // But not if the following character is a closing tag
        const isClosingTag = string.charAt(offset + match.length) === '/';
        return /\w/.test(charBefore) && !isClosingTag ? ' <' : '<';
      });
  }
}
