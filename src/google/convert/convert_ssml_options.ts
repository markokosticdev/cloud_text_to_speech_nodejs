/**
 * @fileoverview Google Cloud Text-to-Speech SSML Processing Options
 * 
 * This module defines SSML-specific processing configuration for Google Cloud
 * Text-to-Speech operations. It provides Google-optimized defaults for SSML
 * validation, allowed elements, content splitting, and processing behavior
 * to ensure compatibility with Google TTS SSML requirements.
 * 
 * The SSML options extend the base SSML configuration with Google-specific
 * allowed elements schema and validation rules optimized for Google's
 * SSML implementation and feature set.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link https://cloud.google.com/text-to-speech/docs/ssml | Google TTS SSML Guide}
 * @see {@link GOOGLE_SSML_ALLOWED_ELEMENTS} for Google SSML schema
 * 
 * @example Basic SSML Options
 * ```typescript
 * import { ConvertSsmlOptionsGoogle } from './convert_ssml_options.js';
 * 
 * const ssmlOptions = new ConvertSsmlOptionsGoogle();
 * 
 * const params = new ConvertParamsGoogle({
 *   ssml: '<speak><prosody rate="slow">Hello world</prosody></speak>',
 *   voice: { name: 'en-US-Neural2-A' },
 *   ssmlOptions
 * });
 * ```
 * 
 * @example Custom SSML Validation
 * ```typescript
 * import { ConvertSsmlOptionsGoogle } from './convert_ssml_options.js';
 * 
 * const strictOptions = new ConvertSsmlOptionsGoogle({
 *   validation: {
 *     enabled: true,
 *     mode: 'strict',
 *     validateAttributes: true,
 *     validateAttributeValues: true,
 *     allowUnknownElements: false
 *   }
 * });
 * 
 * // Will throw error on invalid SSML
 * const params = new ConvertParamsGoogle({
 *   ssml: '<speak><invalid-tag>content</invalid-tag></speak>',
 *   voice: { name: 'en-US-Neural2-F' },
 *   ssmlOptions: strictOptions
 * });
 * ```
 * 
 * @example Custom Split Limit
 * ```typescript
 * import { ConvertSsmlOptionsGoogle } from './convert_ssml_options.js';
 * 
 * const customOptions = new ConvertSsmlOptionsGoogle({
 *   splitLimit: 3000, // Smaller chunks for faster processing
 *   validation: {
 *     enabled: true,
 *     mode: 'warn' // Log warnings but don't throw
 *   }
 * });
 * 
 * const longSsml = generateLongSsmlContent(); // > 3000 characters
 * const params = new ConvertParamsGoogle({
 *   ssml: longSsml,
 *   voice: { name: 'en-US-Neural2-C' },
 *   ssmlOptions: customOptions
 * });
 * ```
 * 
 * @example Production SSML Configuration
 * ```typescript
 * import { ConvertSsmlOptionsGoogle } from './convert_ssml_options.js';
 * 
 * const productionOptions = new ConvertSsmlOptionsGoogle({
 *   splitLimit: 4000,
 *   validation: {
 *     enabled: true,
 *     mode: 'warn',
 *     validateAttributes: true,
 *     validateAttributeValues: false, // Allow flexible attribute values
 *     allowUnknownElements: false,
 *     customValidators: {
 *       'prosody': (element, attributes) => {
 *         // Custom validation for prosody elements
 *         if (attributes.rate && !['slow', 'medium', 'fast'].includes(attributes.rate)) {
 *           return { valid: false, message: 'Invalid rate value' };
 *         }
 *         return { valid: true };
 *       }
 *     }
 *   }
 * });
 * ```
 */

import {
  SSML_SPLIT_LIMIT,
} from './convert_params_defaults.js';
import { SsmlOptions, SsmlValidationOptions } from '../../common/convert/input/ssml/ssml_options.js';
import { GOOGLE_SSML_ALLOWED_ELEMENTS } from './input/ssml/ssml_schema.js';

/**
 * SSML processing configuration for Google Cloud Text-to-Speech
 * 
 * This class extends the base SSML options with Google-specific defaults
 * and validation rules. It provides optimized configuration for Google TTS
 * SSML processing including allowed elements, validation behavior, and
 * content splitting strategies.
 * 
 * The configuration ensures SSML content is compatible with Google's TTS
 * implementation while providing flexibility for different validation
 * and processing requirements.
 * 
 * @example Default Configuration
 * ```typescript
 * const options = new ConvertSsmlOptionsGoogle();
 * // Uses Google SSML schema with warning-level validation
 * ```
 * 
 * @example Strict Validation
 * ```typescript
 * const options = new ConvertSsmlOptionsGoogle({
 *   validation: {
 *     enabled: true,
 *     mode: 'strict',
 *     allowUnknownElements: false
 *   }
 * });
 * ```
 * 
 * @example Custom Split Configuration
 * ```typescript
 * const options = new ConvertSsmlOptionsGoogle({
 *   splitLimit: 2500,
 *   validation: { mode: 'warn' }
 * });
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class ConvertSsmlOptionsGoogle extends SsmlOptions {
  /**
   * Creates new Google SSML processing options
   * 
   * @param allowedElements - Custom allowed SSML elements (defaults to Google schema)
   * @param splitLimit - Maximum SSML content size before splitting (defaults to 5000)
   * @param validation - SSML validation configuration options
   */
  constructor({
    allowedElements,
    splitLimit,
    validation,
  }: {
    allowedElements?: { [key: string]: string[] };
    splitLimit?: number;
    validation?: Partial<SsmlValidationOptions>;
  } = {}) {
    // Default validation options for Google TTS
    const defaultValidation: SsmlValidationOptions = {
      enabled: true,
      mode: 'warn',
      validateAttributes: true,
      validateAttributeValues: true,
      allowUnknownElements: false,
    };

    const mergedValidation: SsmlValidationOptions = { ...defaultValidation, ...validation };

    super(
      {
        allowedElements: GOOGLE_SSML_ALLOWED_ELEMENTS,
        splitLimit: SSML_SPLIT_LIMIT,
        validation: defaultValidation,
        preserveElements: true,
      },
      { 
        allowedElements, 
        splitLimit,
        validation: mergedValidation,
      }
    );
  }
}
