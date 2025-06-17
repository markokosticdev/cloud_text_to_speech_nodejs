/**
 * Amazon Polly Text-to-Speech SSML Schema
 * 
 * This schema defines the SSML elements and attributes supported by Amazon Polly.
 * Reference: https://docs.aws.amazon.com/polly/latest/dg/supportedtags.html
 */

import { SsmlSchema } from './google_ssml_schema.js';

export const AMAZON_SSML_SCHEMA: SsmlSchema = {
  version: '1.0',
  provider: 'amazon',
  allowedElements: {
    speak: ['version', 'xmlns'],
    'amazon:domain': ['name'],
    'amazon:effect': ['name', 'phonation', 'vocal-tract-length'],
    break: ['time', 'strength'],
    emphasis: ['level'],
    lang: ['xml:lang'],
    mark: ['name'],
    p: [],
    phoneme: ['alphabet', 'ph'],
    s: [],
    'say-as': ['interpret-as'],
    sub: ['alias'],
    w: ['role'],
  },
  specialRules: {
    // Amazon domain validation
    'amazon:domain': {
      required: ['name'],
      validation: {
        name: ['news', 'music', 'conversational'],
      },
    },
    // Amazon effect validation
    'amazon:effect': {
      required: ['name'],
      validation: {
        name: ['whispered', 'drc'],
        phonation: ['soft'],
        'vocal-tract-length': ['+10%', '+20%', '-10%', '-20%'],
      },
    },
    // Break validation
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
    // Say-as interpret-as validation (Amazon specific)
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
          'address',
          'interjection',
          'expletive',
        ],
      },
    },
    // Phoneme validation
    phoneme: {
      validation: {
        alphabet: ['ipa', 'x-sampa'],
      },
    },
    // Word role validation
    w: {
      validation: {
        role: [
          'amazon:VB',
          'amazon:VBD',
          'amazon:NN',
          'amazon:SENSE_1',
        ],
      },
    },
    // Mark validation
    mark: {
      validation: {
        name: 'alphanumeric',
      },
    },
  },
};

/**
 * Get Amazon SSML allowed elements (backward compatibility)
 */
export const AMAZON_SSML_ALLOWED_ELEMENTS = AMAZON_SSML_SCHEMA.allowedElements;

/**
 * Validate if an element is allowed in Amazon SSML
 */
export function isAmazonSsmlElementAllowed(elementName: string): boolean {
  return elementName in AMAZON_SSML_SCHEMA.allowedElements;
}

/**
 * Get allowed attributes for a specific Amazon SSML element
 */
export function getAmazonSsmlElementAttributes(elementName: string): string[] {
  return AMAZON_SSML_SCHEMA.allowedElements[elementName] || [];
}

/**
 * Validate attribute value according to Amazon SSML rules
 */
export function validateAmazonSsmlAttributeValue(
  elementName: string,
  attributeName: string,
  value: string,
): boolean {
  const rules = AMAZON_SSML_SCHEMA.specialRules?.[elementName];
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
    case 'duration':
      // Amazon supports formats like "500ms", "2s", "2.5s"
      return /^\d+(\.\d+)?(s|ms)$/.test(value);
    case 'alphanumeric':
      return /^[a-zA-Z0-9_-]+$/.test(value);
    default:
      return true;
  }
}

/**
 * Check if Amazon SSML element requires specific attributes
 */
export function getAmazonSsmlRequiredAttributes(elementName: string): string[] {
  const rules = AMAZON_SSML_SCHEMA.specialRules?.[elementName] as { required?: string[] } | undefined;
  return rules?.required || [];
}

/**
 * Get Amazon-specific domain names
 */
export function getAmazonDomains(): string[] {
  return ['news', 'music', 'conversational'];
}

/**
 * Get Amazon-specific effect names
 */
export function getAmazonEffects(): string[] {
  return ['whispered', 'drc'];
} 