/**
 * Microsoft Azure Cognitive Services Text-to-Speech SSML Schema
 * 
 * This schema defines the SSML elements and attributes supported by Microsoft TTS.
 * Reference: https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/speech-synthesis-markup
 */

import { SsmlSchema } from './google_ssml_schema.js';

export const MICROSOFT_SSML_SCHEMA: SsmlSchema = {
  version: '1.0',
  provider: 'microsoft',
  allowedElements: {
    speak: ['version', 'xmlns', 'xml:lang'],
    audio: ['src'],
    bookmark: ['mark'],
    break: ['time', 'strength'],
    emphasis: ['level'],
    lang: ['xml:lang'],
    lexicon: ['uri'],
    math: ['xmlns'],
    'mstts:audioduration': ['value'],
    'mstts:express-as': ['style', 'styledegree', 'role'],
    'mstts:silence': ['type', 'value'],
    'mstts:viseme': ['type'],
    p: [],
    phoneme: ['alphabet', 'ph'],
    s: [],
    'say-as': ['interpret-as', 'format', 'detail'],
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
    // Break validation
    break: {
      validation: {
        time: 'duration',
        strength: ['x-weak', 'weak', 'medium', 'strong', 'x-strong'],
      },
    },
    // Emphasis level validation
    emphasis: {
      validation: {
        level: ['strong', 'moderate', 'reduced'],
      },
    },
    // Microsoft-specific express-as styles
    'mstts:express-as': {
      validation: {
        style: [
          'general',
          'newscast',
          'customerservice',
          'chat',
          'cheerful',
          'empathetic',
          'angry',
          'calm',
          'fearful',
          'disgruntled',
          'serious',
          'affectionate',
          'gentle',
          'lyrical',
          'sad',
        ],
        styledegree: ['0.01', '0.1', '0.5', '1.0', '1.5', '2.0'],
        role: ['child', 'female', 'male', 'youngadultfemale', 'youngadultmale', 'olderfemale', 'oldermale'],
      },
    },
    // Microsoft silence types
    'mstts:silence': {
      validation: {
        type: ['Leading', 'Tailing'],
        value: 'duration',
      },
    },
    // Microsoft viseme types
    'mstts:viseme': {
      validation: {
        type: ['redlips_front', 'sil'],
      },
    },
    // Say-as interpret-as validation (Microsoft specific)
    'say-as': {
      validation: {
        'interpret-as': [
          'address',
          'cardinal',
          'characters',
          'date',
          'digits',
          'fraction',
          'ordinal',
          'spell-out',
          'telephone',
          'time',
        ],
      },
    },
    // Lexicon URI validation
    lexicon: {
      required: ['uri'],
      validation: {
        uri: 'url',
      },
    },
  },
};

/**
 * Get Microsoft SSML allowed elements (backward compatibility)
 */
export const MICROSOFT_SSML_ALLOWED_ELEMENTS = MICROSOFT_SSML_SCHEMA.allowedElements;

/**
 * Validate if an element is allowed in Microsoft SSML
 */
export function isMicrosoftSsmlElementAllowed(elementName: string): boolean {
  return elementName in MICROSOFT_SSML_SCHEMA.allowedElements;
}

/**
 * Get allowed attributes for a specific Microsoft SSML element
 */
export function getMicrosoftSsmlElementAttributes(elementName: string): string[] {
  return MICROSOFT_SSML_SCHEMA.allowedElements[elementName] || [];
}

/**
 * Validate attribute value according to Microsoft SSML rules
 */
export function validateMicrosoftSsmlAttributeValue(
  elementName: string,
  attributeName: string,
  value: string,
): boolean {
  const rules = MICROSOFT_SSML_SCHEMA.specialRules?.[elementName];
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
      // Microsoft supports formats like "500ms", "2s", "2.5s"
      return /^\d+(\.\d+)?(s|ms)$/.test(value);
    default:
      return true;
  }
}

/**
 * Check if Microsoft SSML element requires specific attributes
 */
export function getMicrosoftSsmlRequiredAttributes(elementName: string): string[] {
  const rules = MICROSOFT_SSML_SCHEMA.specialRules?.[elementName] as { required?: string[] } | undefined;
  return rules?.required || [];
} 