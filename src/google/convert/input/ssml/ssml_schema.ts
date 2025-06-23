/**
 * @fileoverview Google Cloud Text-to-Speech SSML Schema and Validation System
 * 
 * This module defines the complete SSML schema for Google Cloud Text-to-Speech,
 * including supported elements, attributes, validation rules, and helper functions.
 * It provides type-safe SSML validation and ensures compliance with Google's
 * TTS API requirements and SSML specification standards.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://cloud.google.com/text-to-speech/docs/ssml | Google Cloud TTS SSML Documentation}
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link SsmlValidator} for validation implementation
 * @see {@link SsmlSanitizer} for content sanitization
 * 
 * @example Basic SSML validation
 * ```typescript
 * import { GOOGLE_SSML_SCHEMA, isGoogleSsmlElementAllowed } from 'cloud-text-to-speech';
 * 
 * const isValid = isGoogleSsmlElementAllowed('break');
 * console.log(`'break' element allowed: ${isValid}`); // true
 * 
 * const attributes = getGoogleSsmlElementAttributes('break');
 * console.log('Break attributes:', attributes); // ['time', 'strength']
 * ```
 * 
 * @example Advanced validation with custom rules
 * ```typescript
 * const validateCustomSsml = (elementName: string, attrName: string, value: string) => {
 *   const isElementValid = isGoogleSsmlElementAllowed(elementName);
 *   if (!isElementValid) {
 *     throw new Error(`Element '${elementName}' not supported by Google TTS`);
 *   }
 *   
 *   const isAttrValid = validateGoogleSsmlAttributeValue(elementName, attrName, value);
 *   if (!isAttrValid) {
 *     throw new Error(`Invalid value '${value}' for ${elementName}.${attrName}`);
 *   }
 *   
 *   return true;
 * };
 * ```
 */

/**
 * Google Cloud Text-to-Speech SSML Schema
 * 
 * This schema defines the SSML elements and attributes supported by Google TTS.
 * Reference: https://cloud.google.com/text-to-speech/docs/ssml
 */

import { SsmlSchema } from '../../../../common/convert/input/ssml/ssml_schema.js';

/**
 * Google Cloud Text-to-Speech SSML Schema definition.
 * Comprehensive schema covering all SSML elements and attributes supported
 * by Google's TTS service, including audio insertion, prosody control,
 * language switching, and advanced media sequencing features.
 * 
 * @category SSML Schema
 * 
 * @example Schema inspection
 * ```typescript
 * import { GOOGLE_SSML_SCHEMA } from 'cloud-text-to-speech';
 * 
 * console.log(`Provider: ${GOOGLE_SSML_SCHEMA.provider}`);
 * console.log(`Version: ${GOOGLE_SSML_SCHEMA.version}`);
 * console.log(`Supported elements: ${Object.keys(GOOGLE_SSML_SCHEMA.allowedElements).length}`);
 * 
 * // List all supported elements
 * Object.entries(GOOGLE_SSML_SCHEMA.allowedElements).forEach(([element, attributes]) => {
 *   console.log(`<${element}> attributes: ${attributes.join(', ') || 'none'}`);
 * });
 * ```
 * 
 * @example Audio element validation
 * ```typescript
 * const validateAudioElement = (src: string) => {
 *   const audioRules = GOOGLE_SSML_SCHEMA.specialRules?.audio;
 *   if (audioRules?.validation?.src === 'url') {
 *     try {
 *       new URL(src);
 *       console.log('Valid audio URL');
 *       return true;
 *     } catch {
 *       console.error('Invalid audio URL');
 *       return false;
 *     }
 *   }
 *   return true;
 * };
 * ```
 * 
 * @example Say-as element validation
 * ```typescript
 * const validateSayAs = (interpretAs: string) => {
 *   const sayAsRules = GOOGLE_SSML_SCHEMA.specialRules?.['say-as'];
 *   const validValues = sayAsRules?.validation?.['interpret-as'] as string[];
 *   
 *   if (validValues && !validValues.includes(interpretAs)) {
 *     throw new Error(`Invalid interpret-as value: ${interpretAs}. Valid values: ${validValues.join(', ')}`);
 *   }
 *   
 *   return true;
 * };
 * ```
 */
export const GOOGLE_SSML_SCHEMA: SsmlSchema = {
  version: '1.0',
  provider: 'google',
  allowedElements: {
    speak: ['version', 'xmlns'],
    audio: [
      'src',
      'clipBegin',
      'clipEnd',
      'speed',
      'repeatCount',
      'repeatDur',
      'soundLevel',
    ],
    break: ['time', 'strength'],
    emphasis: ['level'],
    lang: ['xml:lang'],
    mark: ['name'],
    media: [
      'xml:id',
      'begin',
      'end',
      'repeatCount',
      'repeatDur',
      'soundLevel',
      'fadeInDur',
      'fadeOutDur',
    ],
    p: [],
    par: [],
    phoneme: ['alphabet', 'ph'],
    s: [],
    'say-as': ['interpret-as', 'language', 'google:style', 'format', 'detail'],
    seq: [],
    sub: ['alias'],
  },
  specialRules: {
    // Audio element must have valid src URL
    audio: {
      required: ['src'],
      validation: {
        src: 'url',
      },
    },
    // Break time must be valid duration
    break: {
      validation: {
        time: 'duration',
        strength: ['none', 'x-weak', 'weak', 'medium', 'strong', 'x-strong'],
      },
    },
    // Emphasis level validation
    emphasis: {
      validation: {
        level: ['strong', 'moderate', 'reduced'],
      },
    },
    // Say-as interpret-as validation
    'say-as': {
      validation: {
        'interpret-as': [
          'characters',
          'spell-out',
          'cardinal',
          'number',
          'ordinal',
          'digits',
          'fraction',
          'unit',
          'date',
          'time',
          'telephone',
          'address',
        ],
      },
    },
  },
};

/**
 * Get Google SSML allowed elements (backward compatibility).
 * Legacy accessor for the complete set of allowed SSML elements
 * supported by Google Cloud Text-to-Speech service.
 * 
 * @deprecated Use GOOGLE_SSML_SCHEMA.allowedElements directly
 * @returns Object mapping element names to their allowed attributes
 * 
 * @example Legacy compatibility
 * ```typescript
 * import { GOOGLE_SSML_ALLOWED_ELEMENTS } from 'cloud-text-to-speech';
 * 
 * // Legacy usage (deprecated)
 * const elements = GOOGLE_SSML_ALLOWED_ELEMENTS;
 * 
 * // Preferred usage
 * const elementsNew = GOOGLE_SSML_SCHEMA.allowedElements;
 * ```
 */
export const GOOGLE_SSML_ALLOWED_ELEMENTS = GOOGLE_SSML_SCHEMA.allowedElements;

/**
 * Validates if an element is allowed in Google Cloud TTS SSML.
 * Performs fast lookup to determine element support without
 * requiring full schema validation overhead.
 * 
 * @param elementName - Name of the SSML element to validate
 * @returns True if the element is supported by Google TTS
 * 
 * @example Element validation
 * ```typescript
 * import { isGoogleSsmlElementAllowed } from 'cloud-text-to-speech';
 * 
 * console.log(isGoogleSsmlElementAllowed('break'));    // true
 * console.log(isGoogleSsmlElementAllowed('prosody'));  // false (not in Google schema)
 * console.log(isGoogleSsmlElementAllowed('audio'));    // true
 * console.log(isGoogleSsmlElementAllowed('custom'));   // false
 * ```
 * 
 * @example Batch validation
 * ```typescript
 * const elementsToCheck = ['speak', 'break', 'emphasis', 'unknown'];
 * const validElements = elementsToCheck.filter(isGoogleSsmlElementAllowed);
 * const invalidElements = elementsToCheck.filter(el => !isGoogleSsmlElementAllowed(el));
 * 
 * console.log('Valid:', validElements);    // ['speak', 'break', 'emphasis']
 * console.log('Invalid:', invalidElements); // ['unknown']
 * ```
 * 
 * @example Dynamic SSML building
 * ```typescript
 * const buildSsml = (elements: Array<{tag: string, content: string}>) => {
 *   const validElements = elements.filter(el => isGoogleSsmlElementAllowed(el.tag));
 *   
 *   return '<speak>' + 
 *     validElements.map(el => `<${el.tag}>${el.content}</${el.tag}>`).join('') +
 *     '</speak>';
 * };
 * ```
 */
export function isGoogleSsmlElementAllowed(elementName: string): boolean {
  return elementName in GOOGLE_SSML_SCHEMA.allowedElements;
}

/**
 * Gets the allowed attributes for a specific Google SSML element.
 * Returns the complete list of attributes that can be used with
 * the specified element in Google Cloud TTS SSML documents.
 * 
 * @param elementName - Name of the SSML element
 * @returns Array of allowed attribute names, empty array if element not found
 * 
 * @example Attribute inspection
 * ```typescript
 * import { getGoogleSsmlElementAttributes } from 'cloud-text-to-speech';
 * 
 * const breakAttrs = getGoogleSsmlElementAttributes('break');
 * console.log('Break attributes:', breakAttrs); // ['time', 'strength']
 * 
 * const audioAttrs = getGoogleSsmlElementAttributes('audio');
 * console.log('Audio attributes:', audioAttrs); 
 * // ['src', 'clipBegin', 'clipEnd', 'speed', 'repeatCount', 'repeatDur', 'soundLevel']
 * ```
 * 
 * @example Attribute validation helper
 * ```typescript
 * const validateElementAttribute = (elementName: string, attributeName: string) => {
 *   const allowedAttrs = getGoogleSsmlElementAttributes(elementName);
 *   
 *   if (allowedAttrs.length === 0) {
 *     throw new Error(`Element '${elementName}' is not supported`);
 *   }
 *   
 *   if (!allowedAttrs.includes(attributeName)) {
 *     throw new Error(
 *       `Attribute '${attributeName}' not allowed for '${elementName}'. ` +
 *       `Allowed: ${allowedAttrs.join(', ')}`
 *     );
 *   }
 *   
 *   return true;
 * };
 * ```
 * 
 * @example Dynamic attribute building
 * ```typescript
 * const buildElementWithAllAttributes = (elementName: string, values: Record<string, string>) => {
 *   const allowedAttrs = getGoogleSsmlElementAttributes(elementName);
 *   
 *   const validAttributes = allowedAttrs
 *     .filter(attr => values[attr] !== undefined)
 *     .map(attr => `${attr}="${values[attr]}"`)
 *     .join(' ');
 *   
 *   return validAttributes ? `<${elementName} ${validAttributes}>` : `<${elementName}>`;
 * };
 * 
 * const breakElement = buildElementWithAllAttributes('break', { 
 *   time: '2s', 
 *   strength: 'strong',
 *   invalid: 'ignored' // This will be filtered out
 * });
 * console.log(breakElement); // <break time="2s" strength="strong">
 * ```
 */
export function getGoogleSsmlElementAttributes(elementName: string): string[] {
  return GOOGLE_SSML_SCHEMA.allowedElements[elementName] || [];
}

/**
 * Validates attribute values according to Google SSML rules and constraints.
 * Performs comprehensive validation of attribute values including format
 * checking, enumerated value validation, and Google-specific requirements.
 * 
 * @param elementName - Name of the SSML element
 * @param attributeName - Name of the attribute to validate
 * @param value - Value to validate against the schema rules
 * @returns True if the attribute value is valid, false otherwise
 * 
 * @example Basic attribute validation
 * ```typescript
 * import { validateGoogleSsmlAttributeValue } from 'cloud-text-to-speech';
 * 
 * // Valid cases
 * console.log(validateGoogleSsmlAttributeValue('break', 'time', '2s'));        // true
 * console.log(validateGoogleSsmlAttributeValue('break', 'strength', 'strong')); // true
 * console.log(validateGoogleSsmlAttributeValue('audio', 'src', 'https://example.com/audio.mp3')); // true
 * 
 * // Invalid cases
 * console.log(validateGoogleSsmlAttributeValue('break', 'time', 'invalid'));   // false
 * console.log(validateGoogleSsmlAttributeValue('break', 'strength', 'super')); // false
 * console.log(validateGoogleSsmlAttributeValue('audio', 'src', 'not-a-url')); // false
 * ```
 * 
 * @example Comprehensive SSML validation
 * ```typescript
 * const validateSsmlElement = (elementName: string, attributes: Record<string, string>) => {
 *   // Check if element is allowed
 *   if (!isGoogleSsmlElementAllowed(elementName)) {
 *     throw new Error(`Element '${elementName}' not supported by Google TTS`);
 *   }
 *   
 *   // Check each attribute
 *   const allowedAttributes = getGoogleSsmlElementAttributes(elementName);
 *   
 *   for (const [attrName, attrValue] of Object.entries(attributes)) {
 *     if (!allowedAttributes.includes(attrName)) {
 *       throw new Error(`Attribute '${attrName}' not allowed for element '${elementName}'`);
 *     }
 *     
 *     if (!validateGoogleSsmlAttributeValue(elementName, attrName, attrValue)) {
 *       throw new Error(`Invalid value '${attrValue}' for ${elementName}.${attrName}`);
 *     }
 *   }
 *   
 *   return true;
 * };
 * 
 * // Usage
 * validateSsmlElement('break', { time: '1.5s', strength: 'medium' }); // OK
 * validateSsmlElement('audio', { src: 'https://example.com/sound.wav' }); // OK
 * ```
 * 
 * @example URL validation for audio elements
 * ```typescript
 * const validateAudioUrl = (url: string) => {
 *   const isValidUrl = validateGoogleSsmlAttributeValue('audio', 'src', url);
 *   
 *   if (!isValidUrl) {
 *     console.error(`Invalid audio URL: ${url}`);
 *     return false;
 *   }
 *   
 *   // Additional checks for audio file formats
 *   const supportedFormats = ['.mp3', '.wav', '.ogg', '.flac'];
 *   const hasValidFormat = supportedFormats.some(format => url.toLowerCase().includes(format));
 *   
 *   if (!hasValidFormat) {
 *     console.warn(`Audio URL may not be in a supported format: ${url}`);
 *   }
 *   
 *   return true;
 * };
 * ```
 * 
 * @example Duration validation helper
 * ```typescript
 * const isValidDuration = (duration: string) => {
 *   return validateGoogleSsmlAttributeValue('break', 'time', duration);
 * };
 * 
 * const durations = ['1s', '500ms', '2.5s', '0.1s', 'invalid', '10minutes'];
 * durations.forEach(duration => {
 *   console.log(`${duration}: ${isValidDuration(duration) ? 'valid' : 'invalid'}`);
 * });
 * ```
 */
export function validateGoogleSsmlAttributeValue(
  elementName: string,
  attributeName: string,
  value: string,
): boolean {
  const rules = GOOGLE_SSML_SCHEMA.specialRules?.[elementName];
  if (!rules || !rules.validation) {
    return true; // No specific validation rules
  }

  const validation = rules.validation[attributeName];
  if (!validation) {
    return true; // No validation for this attribute
  }

  if (Array.isArray(validation)) {
    return validation.includes(value);
  }

  switch (validation) {
    case 'url':
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    case 'duration':
      return /^\d+(\.\d+)?(s|ms)$/.test(value);
    default:
      return true;
  }
} 