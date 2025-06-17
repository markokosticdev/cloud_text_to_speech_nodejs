/**
 * Google Cloud Text-to-Speech SSML Schema
 * 
 * This schema defines the SSML elements and attributes supported by Google TTS.
 * Reference: https://cloud.google.com/text-to-speech/docs/ssml
 */

export interface SsmlSchema {
  /** Schema version for compatibility tracking */
  version: string;
  /** Provider name */
  provider: string;
  /** Allowed SSML elements and their permitted attributes */
  allowedElements: { [key: string]: string[] };
  /** Elements that require specific content or nesting rules */
  specialRules?: { [key: string]: Record<string, unknown> };
}

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
 * Get Google SSML allowed elements (backward compatibility)
 */
export const GOOGLE_SSML_ALLOWED_ELEMENTS = GOOGLE_SSML_SCHEMA.allowedElements;

/**
 * Validate if an element is allowed in Google SSML
 */
export function isGoogleSsmlElementAllowed(elementName: string): boolean {
  return elementName in GOOGLE_SSML_SCHEMA.allowedElements;
}

/**
 * Get allowed attributes for a specific Google SSML element
 */
export function getGoogleSsmlElementAttributes(elementName: string): string[] {
  return GOOGLE_SSML_SCHEMA.allowedElements[elementName] || [];
}

/**
 * Validate attribute value according to Google SSML rules
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