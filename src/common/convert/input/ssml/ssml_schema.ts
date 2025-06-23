/**
 * @fileoverview SSML Schema Definition and Validation Framework
 * 
 * This module provides the core schema interface for SSML (Speech Synthesis Markup Language)
 * validation across multiple TTS providers. It defines the structure for provider-specific
 * SSML validation rules, supported elements, attributes, and special validation requirements.
 * 
 * The schema system enables runtime validation of SSML content against provider capabilities,
 * ensuring that generated SSML is compatible with the target TTS service. Each provider
 * (Google, Amazon, Microsoft) has unique SSML support levels and element implementations.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link SsmlValidator} for schema-based validation implementation
 * @see {@link https://www.w3.org/TR/speech-synthesis/ | W3C SSML Specification}
 * 
 * @example Basic schema usage
 * ```typescript
 * import { SsmlSchema } from './ssml_schema.js';
 * import { GOOGLE_SSML_SCHEMA } from '../schemas/google_ssml_schema.js';
 * 
 * // Check if an element is supported
 * const schema: SsmlSchema = GOOGLE_SSML_SCHEMA;
 * const isBreakSupported = 'break' in schema.allowedElements;
 * console.log(`Break element supported: ${isBreakSupported}`);
 * 
 * // Get allowed attributes for an element
 * const breakAttributes = schema.allowedElements['break'] || [];
 * console.log(`Break attributes: ${breakAttributes.join(', ')}`);
 * ```
 * 
 * @example Multi-provider schema comparison
 * ```typescript
 * import { SsmlSchema } from './ssml_schema.js';
 * import { GOOGLE_SSML_SCHEMA } from '../schemas/google_ssml_schema.js';
 * import { AMAZON_SSML_SCHEMA } from '../schemas/amazon_ssml_schema.js';
 * import { MICROSOFT_SSML_SCHEMA } from '../schemas/microsoft_ssml_schema.js';
 * 
 * const schemas = [GOOGLE_SSML_SCHEMA, AMAZON_SSML_SCHEMA, MICROSOFT_SSML_SCHEMA];
 * 
 * // Find common SSML elements across all providers
 * const commonElements = schemas.reduce((common, schema) => {
 *   const elements = Object.keys(schema.allowedElements);
 *   return common.filter(el => elements.includes(el));
 * }, Object.keys(schemas[0].allowedElements));
 * 
 * console.log('Universal SSML elements:', commonElements);
 * 
 * // Find provider-specific elements
 * schemas.forEach(schema => {
 *   const uniqueElements = Object.keys(schema.allowedElements)
 *     .filter(el => !commonElements.includes(el));
 *   console.log(`${schema.provider} unique elements:`, uniqueElements);
 * });
 * ```
 * 
 * @example Runtime schema validation
 * ```typescript
 * import { SsmlSchema } from './ssml_schema.js';
 * 
 * function validateElementSupport(schema: SsmlSchema, element: string, attributes: string[]): boolean {
 *   // Check if element is supported
 *   if (!(element in schema.allowedElements)) {
 *     console.error(`Element '${element}' not supported by ${schema.provider}`);
 *     return false;
 *   }
 * 
 *   // Check if all attributes are supported
 *   const allowedAttrs = schema.allowedElements[element];
 *   const unsupportedAttrs = attributes.filter(attr => !allowedAttrs.includes(attr));
 *   
 *   if (unsupportedAttrs.length > 0) {
 *     console.error(`Unsupported attributes for ${element}: ${unsupportedAttrs.join(', ')}`);
 *     return false;
 *   }
 * 
 *   return true;
 * }
 * 
 * // Usage
 * const isValid = validateElementSupport(schema, 'prosody', ['rate', 'pitch', 'volume']);
 * ```
 * 
 * @example Schema-based SSML generation
 * ```typescript
 * import { SsmlSchema } from './ssml_schema.js';
 * 
 * class SsmlBuilder {
 *   constructor(private schema: SsmlSchema) {}
 * 
 *   createElement(element: string, attributes: Record<string, string>, content: string): string {
 *     // Validate element and attributes against schema
 *     if (!(element in this.schema.allowedElements)) {
 *       throw new Error(`Element '${element}' not supported by ${this.schema.provider}`);
 *     }
 * 
 *     const allowedAttrs = this.schema.allowedElements[element];
 *     const attrString = Object.entries(attributes)
 *       .filter(([attr]) => allowedAttrs.includes(attr))
 *       .map(([key, value]) => `${key}="${value}"`)
 *       .join(' ');
 * 
 *     return `<${element}${attrString ? ' ' + attrString : ''}>${content}</${element}>`;
 *   }
 * }
 * 
 * const builder = new SsmlBuilder(GOOGLE_SSML_SCHEMA);
 * const ssml = builder.createElement('prosody', { rate: 'slow' }, 'Hello world');
 * ```
 */

/**
 * Complete SSML schema definition interface for TTS providers
 * 
 * Defines the structure for provider-specific SSML validation rules,
 * supported elements, attributes, and special validation requirements.
 * This interface enables runtime validation of SSML content against
 * provider capabilities and ensures compatibility across different TTS services.
 * 
 * @example Schema implementation
 * ```typescript
 * const myProviderSchema: SsmlSchema = {
 *   version: '1.0.0',
 *   provider: 'custom-provider',
 *   allowedElements: {
 *     'speak': ['version', 'xmlns'],
 *     'break': ['time', 'strength'],
 *     'prosody': ['rate', 'pitch', 'volume'],
 *     'emphasis': ['level'],
 *     'say-as': ['interpret-as', 'format']
 *   },
 *   specialRules: {
 *     'break': {
 *       maxTime: '10s',
 *       allowedStrengths: ['none', 'x-weak', 'weak', 'medium', 'strong', 'x-strong']
 *     }
 *   }
 * };
 * ```
 * 
 * @example Validation with special rules
 * ```typescript
 * function validateSpecialRules(schema: SsmlSchema, element: string, attributes: Record<string, string>): boolean {
 *   const rules = schema.specialRules?.[element];
 *   if (!rules) return true;
 * 
 *   // Example: validate break strength values
 *   if (element === 'break' && attributes.strength) {
 *     const allowedStrengths = rules.allowedStrengths as string[];
 *     return allowedStrengths.includes(attributes.strength);
 *   }
 * 
 *   return true;
 * }
 * ```
 * 
 * @category Common Utilities
 * @since 3.0.0
 */
export interface SsmlSchema {
    /** 
     * Schema version for compatibility tracking and validation
     * @example "1.0.0" or "2024.1"
     */
    version: string;
    
    /** 
     * TTS provider name for identification
     * @example "google", "amazon", "microsoft"
     */
    provider: string;
    
    /** 
     * Mapping of SSML elements to their permitted attributes
     * @example { "break": ["time", "strength"], "prosody": ["rate", "pitch"] }
     */
    allowedElements: { [key: string]: string[] };
    
    /** 
     * Provider-specific validation rules for elements requiring special handling
     * @example { "break": { "maxTime": "10s", "allowedStrengths": ["weak", "strong"] } }
     */
    specialRules?: { [key: string]: Record<string, unknown> };
}