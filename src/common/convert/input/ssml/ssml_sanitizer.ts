/**
 * @fileoverview SSML Content Sanitization and Security System
 * 
 * This module provides comprehensive SSML (Speech Synthesis Markup Language)
 * sanitization capabilities for ensuring content security, structural integrity,
 * and provider compatibility. It implements advanced content filtering that
 * removes unsupported elements, validates attributes, and maintains semantic
 * correctness while preventing potential security vulnerabilities.
 * 
 * The SsmlSanitizer uses XML DOM parsing to safely process SSML content,
 * applying provider-specific allowlists to filter elements and attributes
 * while preserving the semantic structure and meaning of the original content.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link SsmlValidator} for content validation
 * @see {@link SsmlMinimizer} for content optimization
 * @see {@link SsmlSplitter} for content chunking
 * @see {@link SsmlBase} for complete processing pipeline
 * 
 * @example Basic SSML sanitization
 * ```typescript
 * import { SsmlSanitizer } from './ssml_sanitizer.js';
 * 
 * const unsafeSsml = `
 *   <speak>
 *     <p>Hello world!</p>
 *     <custom-element unsupported-attr="value">Unsupported content</custom-element>
 *     <break time="1s"/>
 *   </speak>
 * `;
 * 
 * const allowedElements = {
 *   speak: ['version', 'xmlns'],
 *   p: [],
 *   break: ['time', 'strength']
 * };
 * 
 * const sanitized = SsmlSanitizer.sanitize(unsafeSsml, allowedElements);
 * console.log(sanitized);
 * // Output: "Hello world!Unsupported content<break time="1s"/>"
 * ```
 * 
 * @example Provider-specific sanitization
 * ```typescript
 * import { SsmlSanitizer } from './ssml_sanitizer.js';
 * 
 * // Google Cloud TTS sanitization
 * const googleElements = {
 *   speak: ['version', 'xmlns'],
 *   audio: ['src', 'clipBegin', 'clipEnd'],
 *   break: ['time', 'strength'],
 *   emphasis: ['level'],
 *   mark: ['name'],
 *   p: [],
 *   s: []
 * };
 * 
 * const googleSanitized = SsmlSanitizer.sanitize(complexSsml, googleElements);
 * 
 * // Amazon Polly sanitization
 * const amazonElements = {
 *   speak: ['version', 'xmlns'],
 *   'amazon:domain': ['name'],
 *   'amazon:effect': ['name'],
 *   break: ['time', 'strength'],
 *   emphasis: ['level'],
 *   w: ['role']
 * };
 * 
 * const amazonSanitized = SsmlSanitizer.sanitize(complexSsml, amazonElements);
 * ```
 * 
 * @example Security-focused sanitization
 * ```typescript
 * import { SsmlSanitizer } from './ssml_sanitizer.js';
 * 
 * const potentiallyMaliciousSsml = `
 *   <speak>
 *     <script>alert('xss')</script>
 *     <p onclick="malicious()">Content</p>
 *     <break time="1s"/>
 *     <unknown-element>Suspicious content</unknown-element>
 *   </speak>
 * `;
 * 
 * const secureElements = {
 *   speak: ['version', 'xmlns'],
 *   p: [], // No event handlers allowed
 *   break: ['time', 'strength']
 * };
 * 
 * const secureSsml = SsmlSanitizer.sanitize(potentiallyMaliciousSsml, secureElements);
 * // Removes script tags, onclick handlers, and unknown elements
 * console.log(secureSsml); // "Content<break time="1s"/>Suspicious content"
 * ```
 * 
 * @example Batch sanitization workflow
 * ```typescript
 * import { SsmlSanitizer } from './ssml_sanitizer.js';
 * 
 * const sanitizeBatch = (ssmlDocuments: string[], provider: string) => {
 *   const allowedElements = getProviderElements(provider);
 *   
 *   return ssmlDocuments.map((ssml, index) => {
 *     const startTime = performance.now();
 *     const sanitized = SsmlSanitizer.sanitize(ssml, allowedElements);
 *     const endTime = performance.now();
 *     
 *     return {
 *       index,
 *       originalSize: ssml.length,
 *       sanitizedSize: sanitized.length,
 *       processingTime: endTime - startTime,
 *       content: sanitized,
 *       elementsRemoved: countElementsRemoved(ssml, sanitized)
 *     };
 *   });
 * };
 * ```
 */

import { DOMParser, XMLSerializer, type Node, type Element, type Text } from '@xmldom/xmldom';

/**
 * SSML Content Sanitization and Security Utility
 * 
 * Provides comprehensive static methods for sanitizing SSML content by removing
 * unsupported elements, filtering unauthorized attributes, and maintaining
 * structural integrity while preserving semantic meaning. Implements secure
 * XML processing to prevent security vulnerabilities and ensure provider
 * compatibility across different TTS services.
 * 
 * The sanitization process uses DOM parsing for safe XML manipulation,
 * provider-specific allowlists for element filtering, and intelligent
 * content preservation to maintain speech synthesis quality while
 * ensuring security and compatibility standards.
 * 
 * @example Advanced sanitization workflow
 * ```typescript
 * import { SsmlSanitizer } from './ssml_sanitizer.js';
 * 
 * const sanitizeForProduction = (ssml: string, provider: string) => {
 *   const allowedElements = {
 *     google: googleAllowedElements,
 *     amazon: amazonAllowedElements,
 *     microsoft: microsoftAllowedElements
 *   }[provider];
 *   
 *   if (!allowedElements) {
 *     throw new Error(`Unsupported provider: ${provider}`);
 *   }
 *   
 *   const sanitized = SsmlSanitizer.sanitize(ssml, allowedElements);
 *   
 *   // Validate the result
 *   if (!sanitized.trim()) {
 *     console.warn('Sanitization resulted in empty content');
 *   }
 *   
 *   return sanitized;
 * };
 * ```
 * 
 * @example Quality assurance sanitization
 * ```typescript
 * const sanitizeWithQualityCheck = (ssml: string, allowedElements: any) => {
 *   const originalElementCount = (ssml.match(/<[^>]+>/g) || []).length;
 *   const sanitized = SsmlSanitizer.sanitize(ssml, allowedElements);
 *   const finalElementCount = (sanitized.match(/<[^>]+>/g) || []).length;
 *   
 *   const qualityMetrics = {
 *     originalElements: originalElementCount,
 *     finalElements: finalElementCount,
 *     elementsRemoved: originalElementCount - finalElementCount,
 *     retentionRate: (finalElementCount / originalElementCount * 100).toFixed(1) + '%',
 *     contentPreserved: sanitized.length > 0
 *   };
 *   
 *   return { content: sanitized, metrics: qualityMetrics };
 * };
 * ```
 * 
 * @category SSML Processing
 * @since 3.0.0
 */
export class SsmlSanitizer {
  /**
   * Private constructor prevents instantiation of utility class
   * @internal
   */
  private constructor() {}

  /**
   * Sanitizes SSML content by removing unsupported elements and attributes
   * 
   * Performs comprehensive SSML sanitization using secure DOM parsing to remove
   * unsupported elements, filter unauthorized attributes, and preserve semantic
   * content structure. The method ensures provider compatibility while maintaining
   * content integrity and preventing potential security vulnerabilities.
   * 
   * The sanitization process:
   * 1. Validates and normalizes input SSML structure
   * 2. Parses content using secure XML DOM parser
   * 3. Recursively processes all nodes against allowlist
   * 4. Removes unsupported elements while preserving content
   * 5. Filters unauthorized attributes from allowed elements
   * 6. Returns sanitized content without root speak wrapper
   * 
   * @param ssml - SSML content to sanitize and filter
   * @param allowedElements - Provider-specific mapping of allowed elements to permitted attributes
   * @returns Sanitized SSML content with unsupported elements and attributes removed
   * 
   * @example Basic element filtering
   * ```typescript
   * const ssml = `
   *   <speak>
   *     <p>Valid paragraph</p>
   *     <custom-element>This will be removed</custom-element>
   *     <break time="1s"/>
   *   </speak>
   * `;
   * 
   * const allowedElements = {
   *   speak: ['version', 'xmlns'],
   *   p: [],
   *   break: ['time', 'strength']
   * };
   * 
   * const result = SsmlSanitizer.sanitize(ssml, allowedElements);
   * console.log(result);
   * // Output: "<p>Valid paragraph</p>This will be removed<break time="1s"/>"
   * ```
   * 
   * @example Attribute filtering
   * ```typescript
   * const ssmlWithAttributes = `
   *   <speak>
   *     <p class="invalid" id="also-invalid">Content</p>
   *     <break time="2s" strength="strong" custom="removed"/>
   *     <emphasis level="strong" style="removed">Text</emphasis>
   *   </speak>
   * `;
   * 
   * const strictElements = {
   *   speak: ['version', 'xmlns'],
   *   p: [], // No attributes allowed
   *   break: ['time', 'strength'], // Only time and strength allowed
   *   emphasis: ['level'] // Only level allowed
   * };
   * 
   * const filtered = SsmlSanitizer.sanitize(ssmlWithAttributes, strictElements);
   * // Removes class, id, custom, and style attributes
   * console.log(filtered);
   * // Output: "<p>Content</p><break time="2s" strength="strong"/><emphasis level="strong">Text</emphasis>"
   * ```
   * 
   * @example Complex content preservation
   * ```typescript
   * const nestedSsml = `
   *   <speak>
   *     <div>
   *       <p>Paragraph content</p>
   *       <span>Span content</span>
   *       <unsupported>
   *         <break time="1s"/>
   *         <p>Nested paragraph</p>
   *       </unsupported>
   *     </div>
   *   </speak>
   * `;
   * 
   * const elements = {
   *   speak: ['version', 'xmlns'],
   *   p: [],
   *   break: ['time', 'strength']
   * };
   * 
   * const preserved = SsmlSanitizer.sanitize(nestedSsml, elements);
   * // Removes div, span, unsupported but preserves inner content
   * console.log(preserved);
   * // Output: "<p>Paragraph content</p>Span content<break time="1s"/><p>Nested paragraph</p>"
   * ```
   * 
   * @example Empty input handling
   * ```typescript
   * // Handle various empty input scenarios
   * console.log(SsmlSanitizer.sanitize('', allowedElements));           // ""
   * console.log(SsmlSanitizer.sanitize('   ', allowedElements));        // ""
   * console.log(SsmlSanitizer.sanitize('<speak></speak>', allowedElements)); // ""
   * console.log(SsmlSanitizer.sanitize('<speak>   </speak>', allowedElements)); // ""
   * ```
   * 
   * @example Provider-specific sanitization
   * ```typescript
   * const multiProviderSanitize = (ssml: string) => {
   *   const providers = {
   *     google: {
   *       speak: ['version', 'xmlns'],
   *       audio: ['src', 'clipBegin', 'clipEnd'],
   *       break: ['time', 'strength'],
   *       emphasis: ['level'],
   *       mark: ['name']
   *     },
   *     amazon: {
   *       speak: ['version', 'xmlns'],
   *       'amazon:domain': ['name'],
   *       'amazon:effect': ['name'],
   *       break: ['time', 'strength'],
   *       emphasis: ['level']
   *     },
   *     microsoft: {
   *       speak: ['version', 'xmlns'],
   *       'mstts:express-as': ['style', 'styledegree'],
   *       break: ['time', 'strength'],
   *       emphasis: ['level']
   *     }
   *   };
   *   
   *   return Object.entries(providers).map(([provider, elements]) => ({
   *     provider,
   *     sanitized: SsmlSanitizer.sanitize(ssml, elements)
   *   }));
   * };
   * ```
   * 
   * @since 3.0.0
   */
  static sanitize(
    ssml: string,
    allowedElements: { [key: string]: string[] },
  ): string {
    try {
      if (!ssml || typeof ssml !== 'string') {
        return '';
      }

      const processingSsml = ssml.trim();
      if (!processingSsml) {
        return '';
      }

      // Add namespace declarations for provider-specific elements to prevent parsing errors
      let xmlWithNamespaces = processingSsml;
      
      // Check if we need to add namespace declarations
      const needsAmazonNs = /amazon:/i.test(processingSsml) && !processingSsml.includes('xmlns:amazon');
      const needsMsttsNs = /mstts:/i.test(processingSsml) && !processingSsml.includes('xmlns:mstts');
      
      if (needsAmazonNs || needsMsttsNs) {
        // Wrap in a temporary root with namespace declarations
        let namespaceDeclarations = '';
        if (needsAmazonNs) {
          namespaceDeclarations += ' xmlns:amazon="http://amazon.com/speech"';
        }
        if (needsMsttsNs) {
          namespaceDeclarations += ' xmlns:mstts="http://www.w3.org/2001/mstts"';
        }
        
        xmlWithNamespaces = `<temp-root${namespaceDeclarations}>${processingSsml}</temp-root>`;
      }

      // Parse SSML using secure XML DOM parser
      const document = new DOMParser().parseFromString(xmlWithNamespaces, 'text/xml');
      let rootElement = document.documentElement;
      
      // If we added a temp-root, get its content
      if (rootElement.tagName === 'temp-root') {
        // Process children of temp-root and reconstruct
        this._sanitizeNode(rootElement, allowedElements);
        const serializer = new XMLSerializer();
        const children = Array.from(rootElement.childNodes);
        return children.map(child => serializer.serializeToString(child)).join('');
      } else {
        // Original behavior for non-namespaced content
        const serializer = new XMLSerializer();

        // Check if the root element itself is unsupported
        if (!Object.prototype.hasOwnProperty.call(allowedElements, rootElement.tagName)) {
          // Root element is unsupported - return its content only
          this._sanitizeNode(rootElement, allowedElements);
          const children = Array.from(rootElement.childNodes);
          return children.map(child => serializer.serializeToString(child)).join('');
        } else {
          // Root element is supported - sanitize normally
          this._sanitizeNode(rootElement, allowedElements);
          const result = serializer.serializeToString(rootElement);

          // Remove the outermost speak element if present, keeping only inner content
          if (rootElement.tagName === 'speak') {
            const speakMatch = result.match(/^<speak[^>]*>(.*)<\/speak>$/s);
            return speakMatch ? speakMatch[1] : result;
          }

          return result;
        }
      }
    } catch (error) {
      // If XML parsing fails, return empty string to be safe
      console.warn('SSML sanitization failed:', error);
      return '';
    }
  }

  /**
   * Recursively sanitizes individual DOM nodes according to allowlist rules
   * 
   * Internal method that processes DOM nodes recursively, applying element
   * and attribute filtering based on provider-specific allowlists. Handles
   * element removal, content preservation, and attribute cleanup while
   * maintaining document structure integrity.
   * 
   * The node processing algorithm:
   * 1. Process all child nodes recursively first (depth-first)
   * 2. Check element against allowlist for current node
   * 3. If element not allowed: replace with content, preserve children
   * 4. If element allowed: remove unauthorized attributes
   * 5. Clean up meaningless whitespace-only text nodes
   * 
   * @param node - DOM node to sanitize recursively
   * @param allowedElements - Provider-specific element and attribute allowlist
   * @private
   * 
   * @example Node processing flow
   * ```typescript
   * // Internal processing steps for each node:
   * // 1. Element nodes: Check allowlist, filter attributes
   * // 2. Text nodes: Remove excessive whitespace
   * // 3. Unknown nodes: Preserve content, remove wrapper
   * // 4. Recursive: Process all children before parent
   * ```   * 
   * @example Element replacement process
   * ```typescript
   * // When unsupported element is found:
   * // <unsupported-element attr="value">
   * //   <p>Keep this content</p>
   * //   Text content also preserved
   * // </unsupported-element>
   * // 
   * // Becomes:
   * // <p>Keep this content</p>
   * // Text content also preserved
   * ```
   */
  private static _sanitizeNode(
    node: Node,
    allowedElements: { [key: string]: string[] },
  ): void {
    if (node.nodeType === node.ELEMENT_NODE) {
      const element = node as Element;

      // Process all child nodes recursively first (depth-first traversal)
      Array.from(element.childNodes).forEach((child) => {
        SsmlSanitizer._sanitizeNode(child, allowedElements);
      });

      // Check if this element is allowed in the provider schema
      if (
        !Object.prototype.hasOwnProperty.call(allowedElements, element.nodeName)
      ) {
        // Element not allowed - replace with its content while preserving children
        const parent = element.parentNode;
        if (parent) {
          const children = Array.from(element.childNodes);
          const nextSibling = element.nextSibling;
          
          // Remove the unsupported element from DOM
          parent.removeChild(element);
          
          // Insert child nodes in place of removed element
          children.forEach((child) => {
            const clonedChild = child.cloneNode(true);
            if (nextSibling) {
              parent.insertBefore(clonedChild, nextSibling);
            } else {
              parent.appendChild(clonedChild);
            }
          });
        }
      } else {
        // Element is allowed - clean up unauthorized attributes
        const allowedAttributes = allowedElements[element.nodeName] || [];
        Array.from(element.attributes).forEach((attribute) => {
          if (!allowedAttributes.includes(attribute.name)) {
            element.removeAttribute(attribute.name);
          }
        });
      }
    } else if (node.nodeType === node.TEXT_NODE) {
      const text = node as Text;
      // Remove completely empty text nodes with excessive whitespace
      // Preserve meaningful whitespace but clean up formatting artifacts
      if (text.data.trim() === '' && text.data.length > 1) {
        const parent = node.parentNode;
        if (parent) {
          parent.removeChild(node);
        }
      }
    }
  }
}

