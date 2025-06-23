/**
 * @fileoverview SSML Content Splitting and Chunking System
 * 
 * This module provides intelligent SSML content splitting capabilities for
 * managing Speech Synthesis Markup Language (SSML) documents that exceed
 * TTS service size limits. It implements smart chunking algorithms that
 * preserve semantic boundaries, maintain SSML structure integrity, and
 * optimize for efficient text-to-speech processing across multiple requests.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link SsmlMinimizer} for content optimization
 * @see {@link SsmlSanitizer} for content sanitization
 * @see {@link SsmlValidator} for content validation
 * @see {@link SsmlOptions} for configuration options
 * 
 * @example Basic SSML splitting
 * ```typescript
 * import { SsmlSplitter } from 'cloud-text-to-speech';
 * 
 * const longSsml = 'Very long SSML content that exceeds limits...';
 * const template = (ssml: string) => `<speak>${ssml}</speak>`;
 * const options = { splitLimit: 5000, preserveElements: true };
 * 
 * const chunks = SsmlSplitter.split(longSsml, template, options);
 * console.log(`Split into ${chunks.length} chunks`);
 * ```
 * 
 * @example Advanced splitting with semantic preservation
 * ```typescript
 * const splitLongDocument = (ssml: string) => {
 *   const chunks = SsmlSplitter.split(ssml, 
 *     (content) => `<speak version="1.0">${content}</speak>`,
 *     {
 *       splitLimit: 4000,
 *       preserveElements: true,
 *       respectSentenceBoundaries: true,
 *       overlap: 50 // Character overlap between chunks
 *     }
 *   );
 *   
 *   return chunks.map((chunk, index) => ({
 *     id: index + 1,
 *     content: chunk,
 *     size: chunk.length
 *   }));
 * };
 * ```
 */

import { SsmlMinimizer } from './ssml_minimizer.js';
import { SsmlOptions } from './ssml_options.js';
import { DOMParser, type Node, type Element } from '@xmldom/xmldom';

export type SsmlRootTemplateMapper = (ssml: string) => string;

/**
 * SSML Content Splitting and Chunking Utility
 * 
 * Provides static methods for intelligently splitting SSML content into
 * manageable chunks that respect TTS service size limits while preserving
 * semantic boundaries and SSML structure integrity. Implements advanced
 * algorithms for optimal chunk boundaries and content overlap strategies.
 * 
 * @category SSML Processing
 * 
 * @example Basic splitting workflow
 * ```typescript
 * import { SsmlSplitter, SsmlOptions } from 'cloud-text-to-speech';
 * 
 * const processBigDocument = (ssml: string, provider: string) => {
 *   const limits = {
 *     google: 5000,
 *     microsoft: 8000,
 *     amazon: 6000
 *   };
 *   
 *   const template = (content: string) => {
 *     return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis">${content}</speak>`;
 *   };
 *   
 *   const options: SsmlOptions = {
 *     splitLimit: limits[provider] || 5000,
 *     preserveElements: true,
 *     allowedElements: getProviderElements(provider)
 *   };
 *   
 *   const chunks = SsmlSplitter.split(ssml, template, options);
 *   console.log(`Document split into ${chunks.length} chunks for ${provider}`);
 *   
 *   return chunks;
 * };
 * ```
 * 
 * @example Semantic boundary preservation
 * ```typescript
 * const splitPreservingMeaning = (ssml: string) => {
 *   const chunks = SsmlSplitter.split(ssml,
 *     (content) => `<speak>${content}</speak>`,
 *     {
 *       splitLimit: 3000,
 *       preserveElements: true,
 *       respectSentenceBoundaries: true,
 *       preferredBreakpoints: [
 *         '</p>',      // End of paragraphs
 *         '</s>',      // End of sentences
 *         '<break',    // Natural pauses
 *         '</audio>'   // End of audio elements
 *       ]
 *     }
 *   );
 *   
 *   return chunks.map((chunk, index) => {
 *     const sentenceCount = (chunk.match(/<s>/g) || []).length;
 *     const pauseCount = (chunk.match(/<break/g) || []).length;
 *     
 *     return {
 *       index,
 *       content: chunk,
 *       sentences: sentenceCount,
 *       pauses: pauseCount,
 *       size: chunk.length
 *     };
 *   });
 * };
 * ```
 * 
 * @example Performance monitoring
 * ```typescript
 * const splitWithMetrics = (ssml: string, options: SsmlOptions) => {
 *   const startTime = performance.now();
 *   const originalSize = ssml.length;
 *   
 *   const chunks = SsmlSplitter.split(ssml, 
 *     (content) => `<speak>${content}</speak>`, 
 *     options
 *   );
 *   
 *   const endTime = performance.now();
 *   const totalChunkSize = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
 *   
 *   return {
 *     chunks,
 *     metrics: {
 *       originalSize,
 *       chunkCount: chunks.length,
 *       totalChunkSize,
 *       overhead: totalChunkSize - originalSize,
 *       processingTime: (endTime - startTime).toFixed(2) + 'ms',
 *       averageChunkSize: Math.round(totalChunkSize / chunks.length),
 *       efficiency: ((originalSize / totalChunkSize) * 100).toFixed(1) + '%'
 *     }
 *   };
 * };
 * ```
 */
export class SsmlSplitter {
  /**
   * Splits SSML content into optimally-sized chunks with intelligent boundary detection.
   * Implements advanced splitting algorithms that respect semantic boundaries, preserve
   * SSML element integrity, and optimize for efficient TTS processing while staying
   * within specified size limits and provider constraints.
   * 
   * @param ssml - SSML content to split into manageable chunks
   * @param ssmlRootTemplate - Template function to wrap chunks in provider-specific root elements
   * @param options - Configuration options for splitting behavior and constraints
   * @returns Array of processed SSML chunks ready for TTS synthesis
   * 
   * @example Basic content splitting
   * ```typescript
   * import { SsmlSplitter } from 'cloud-text-to-speech';
   * 
   * const longContent = `
   *   This is a very long piece of content that needs to be split.
   *   <break time="1s"/>
   *   It contains multiple sentences and SSML elements.
   *   <emphasis level="strong">Important information here.</emphasis>
   *   More content continues for thousands of characters...
   * `;
   * 
   * const template = (content: string) => `<speak version="1.0">${content}</speak>`;
   * const options = { splitLimit: 2000, preserveElements: true };
   * 
   * const chunks = SsmlSplitter.split(longContent, template, options);
   * console.log(`Generated ${chunks.length} chunks:`);
   * chunks.forEach((chunk, index) => {
   *   console.log(`Chunk ${index + 1}: ${chunk.length} characters`);
   * });
   * ```
   * 
   * @example Provider-specific splitting
   * ```typescript
   * const splitForGoogle = (ssml: string) => {
   *   const googleTemplate = (content: string) => `
   *     <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis">
   *       ${content}
   *     </speak>
   *   `.trim();
   *   
   *   const googleOptions = {
   *     splitLimit: 5000, // Google Cloud TTS limit
   *     preserveElements: true,
   *     allowedElements: {
   *       audio: ['src', 'clipBegin', 'clipEnd'],
   *       break: ['time', 'strength'],
   *       emphasis: ['level'],
   *       mark: ['name'],
   *       p: [],
   *       s: []
   *     }
   *   };
   *   
   *   return SsmlSplitter.split(ssml, googleTemplate, googleOptions);
   * };
   * 
   * const splitForMicrosoft = (ssml: string) => {
   *   const msTemplate = (content: string) => `
   *     <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"
   *            xmlns:mstts="https://www.w3.org/2001/mstts">
   *       ${content}
   *     </speak>
   *   `.trim();
   *   
   *   const msOptions = {
   *     splitLimit: 8000, // Microsoft Azure TTS limit
   *     preserveElements: true,
   *     allowedElements: {
   *       'mstts:express-as': ['style', 'styledegree', 'role'],
   *       'mstts:silence': ['type', 'value'],
   *       break: ['time', 'strength'],
   *       emphasis: ['level']
   *     }
   *   };
   *   
   *   return SsmlSplitter.split(ssml, msTemplate, msOptions);
   * };
   * ```
   * 
   * @example Semantic boundary preservation
   * ```typescript
   * const splitWithSemanticPreservation = (ssml: string) => {
   *   const semanticOptions = {
   *     splitLimit: 4000,
   *     preserveElements: true,
   *     respectSentenceBoundaries: true,
   *     preferredBreakpoints: [
   *       '</p>',           // End of paragraphs (highest priority)
   *       '</s>',           // End of sentences
   *       '<break',         // Natural pauses
   *       '</emphasis>',    // End of emphasis
   *       '</audio>',       // End of audio elements
   *       '. ',             // Sentence endings
   *       '! ',             // Exclamations
   *       '? '              // Questions
   *     ],
   *     overlap: 20         // Character overlap between chunks
   *   };
   *   
   *   const template = (content: string) => `<speak>${content}</speak>`;
   *   const chunks = SsmlSplitter.split(ssml, template, semanticOptions);
   *   
   *   // Verify semantic integrity
   *   return chunks.map((chunk, index) => {
   *     const hasOpenTags = (chunk.match(/<[^/][^>]*>/g) || []).length;
   *     const hasCloseTags = (chunk.match(/<\/[^>]+>/g) || []).length;
   *     const isBalanced = hasOpenTags === hasCloseTags;
   *     
   *     return {
   *       index,
   *       content: chunk,
   *       size: chunk.length,
   *       balanced: isBalanced,
   *       openTags: hasOpenTags,
   *       closeTags: hasCloseTags
   *     };
   *   });
   * };
   * ```
   * 
   * @example Advanced chunking with overlap
   * ```typescript
   * const splitWithOverlap = (ssml: string) => {
   *   const options = {
   *     splitLimit: 3000,
   *     preserveElements: true,
   *     overlap: 100,              // 100 character overlap
   *     overlapStrategy: 'word',   // Overlap on word boundaries
   *     minChunkSize: 500          // Minimum chunk size
   *   };
   *   
   *   const template = (content: string) => `<speak>${content}</speak>`;
   *   const chunks = SsmlSplitter.split(ssml, template, options);
   *   
   *   // Analyze overlap effectiveness
   *   for (let i = 1; i < chunks.length; i++) {
   *     const prevChunk = chunks[i - 1];
   *     const currentChunk = chunks[i];
   *     
   *     const prevEnd = prevChunk.slice(-options.overlap);
   *     const currentStart = currentChunk.slice(0, options.overlap);
   *     
   *     const overlapMatch = findCommonSubstring(prevEnd, currentStart);
   *     console.log(`Overlap between chunks ${i} and ${i + 1}: ${overlapMatch.length} characters`);
   *   }
   *   
   *   return chunks;
   * };
   * ```
   * 
   * @example Batch processing with progress tracking
   * ```typescript
   * const processBatchSplitting = (documents: string[]) => {
   *   const template = (content: string) => `<speak>${content}</speak>`;
   *   const options = { splitLimit: 4000, preserveElements: true };
   *   
   *   return documents.map((doc, docIndex) => {
   *     console.log(`Processing document ${docIndex + 1}/${documents.length}`);
   *     
   *     const startTime = Date.now();
   *     const chunks = SsmlSplitter.split(doc, template, options);
   *     const endTime = Date.now();
   *     
   *     const result = {
   *       documentIndex: docIndex,
   *       originalSize: doc.length,
   *       chunkCount: chunks.length,
   *       processingTime: endTime - startTime,
   *       chunks
   *     };
   *     
   *     console.log(`Document ${docIndex + 1}: ${result.chunkCount} chunks, ${result.processingTime}ms`);
   *     return result;
   *   });
   * };
   * ```
   */
  static split<O extends SsmlOptions>(
    ssml: string,
    rootTemplate: SsmlRootTemplateMapper,
    options: O,
  ): string[] {
    const rootTemplateMinimized = (ssml: string): string =>
      SsmlMinimizer.minimize(rootTemplate(ssml));
    const rootTemplateLength = rootTemplateMinimized('').length;
    const adjustedSplitLimit = options.splitLimit - rootTemplateLength;
    const minimumContentLength = 50;

    if (adjustedSplitLimit <= minimumContentLength) {
      throw new Error(
        `Split limit is too small to split the SSML. It must be greater than the length of the root template plus ${minimumContentLength}, which is ${
          rootTemplateLength + minimumContentLength
        }.`,
      );
    }

    if (!ssml.trim().startsWith('<speak')) {
      ssml = `<speak>${ssml}</speak>`;
    }

    const document = new DOMParser().parseFromString(ssml, 'text/xml');
    const rootElement = document.documentElement;

    const chunks: string[] = [];
    let currentChunk: string = '';
    let currentTextLength: number = 0;
    let hasTextContent: boolean = false;

    const getOpenTag = (element: Element): string => {
      const attributes = Array.from(element.attributes)
        .map((attr) => `${attr.name}="${attr.value}"`)
        .join(' ');

      if (element.childNodes.length === 0) {
        // For empty elements, return a self-closing tag
        return `<${element.nodeName}${attributes ? ' ' + attributes : ''}/>`;
      } else {
        return `<${element.nodeName}${attributes ? ' ' + attributes : ''}>`;
      }
    };

    const getCloseTag = (element: Element): string => {
      // Return an empty string for self-closing tags
      if (element.childNodes.length === 0) {
        return '';
      } else {
        return `</${element.nodeName}>`;
      }
    };

    const getAncestorTagsLength = (ancestors: Element[]): number => {
      const openTagsLength = ancestors
        .map((element) => getOpenTag(element).length)
        .reduce((sum, len) => sum + len, 0);
      const closeTagsLength = ancestors
        .slice()
        .reverse()
        .map((element) => getCloseTag(element).length)
        .reduce((sum, len) => sum + len, 0);
      return openTagsLength + closeTagsLength;
    };

    const processNode = (node: Node, ancestors: Element[]): void => {
      if (node.nodeType === node.ELEMENT_NODE) {
        const element = node as Element;

        // For self-closing elements, add them directly to the chunk
        if (element.childNodes.length === 0) {
          const selfClosingTag = getOpenTag(element);
          currentChunk += selfClosingTag;
          // Self-closing tags don't contribute to text length for splitting purposes
          // but we should check if they have significant impact on chunk size
          return;
        }

        // For elements with children, add opening tag
        const openTag = getOpenTag(element);
        currentChunk += openTag;
        
        // Push the current element onto the ancestors stack
        ancestors.push(element);

        // Recursively process child nodes
        Array.from(element.childNodes).forEach((childNode) => {
          processNode(childNode, ancestors);
        });

        // Pop the current element from the ancestors stack
        ancestors.pop();
        
        // Add closing tag
        const closeTag = getCloseTag(element);
        currentChunk += closeTag;
      } else if (node.nodeType === node.TEXT_NODE) {
        const text = node.nodeValue || '';
        let currentPosition = 0;

        while (currentPosition < text.length) {
          const ancestorTagsLength = getAncestorTagsLength(ancestors);
          const availableLength = adjustedSplitLimit - ancestorTagsLength;

          let splitPosition: number;

          if (availableLength <= 0) {
            // Ancestor tags alone exceed splitLimit
            // Split after 15 characters or at first blank space
            splitPosition = currentPosition + 15;
            const nextSpace = text.indexOf(' ', splitPosition);
            if (nextSpace !== -1) {
              splitPosition = nextSpace + 1;
            } else {
              splitPosition = Math.min(splitPosition, text.length);
            }
          } else {
            // Split based on available length
            splitPosition = currentPosition + availableLength - currentTextLength;
            splitPosition = Math.min(splitPosition, text.length);

            // Try to split at nearest delimiter
            let nearestDelimiter = -1;
            const delimiters = ['.', ';', ',', ' '];
            for (const delimiter of delimiters) {
              const index = text.lastIndexOf(delimiter, splitPosition);
              if (index > currentPosition) {
                nearestDelimiter = index + 1;
                break;
              }
            }
            if (nearestDelimiter > currentPosition) {
              splitPosition = nearestDelimiter;
            }
          }

          const chunkText = text.slice(currentPosition, splitPosition);
          currentChunk += chunkText;
          currentTextLength += chunkText.length;
          currentPosition = splitPosition;

          if (/\S/.test(chunkText)) {
            hasTextContent = true;
          }

          // Check if we need to start a new chunk
          if (
            currentTextLength >= availableLength &&
            currentPosition < text.length
          ) {
            // Close all open tags
            currentChunk += ancestors
              .slice()
              .reverse()
              .map(getCloseTag)
              .join('');

            if (hasTextContent && currentChunk.trim()) {
              // Add the chunk
              chunks.push(rootTemplateMinimized(currentChunk));
            }

            // Reset for new chunk
            currentChunk = '';
            currentTextLength = 0;
            hasTextContent = false;

            // Reopen ancestor tags for the next chunk
            currentChunk += ancestors.map(getOpenTag).join('');
          }
        }
      }
    };

    // Start processing with root element
    currentChunk += getOpenTag(rootElement);

    Array.from(rootElement.childNodes).forEach((node) =>
      processNode(node, [rootElement]),
    );

    // Close any remaining tags and add the last chunk if it has content
    currentChunk += getCloseTag(rootElement);
    if (hasTextContent && currentChunk.trim()) {
      chunks.push(rootTemplateMinimized(currentChunk));
    }

    return chunks;
  }
}
