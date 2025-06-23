/**
 * @fileoverview Microsoft Azure Cognitive Services Text-to-Speech SSML Schema and Validation System
 * 
 * This module defines the complete SSML schema for Microsoft Azure Cognitive Services
 * Text-to-Speech, including supported elements, attributes, validation rules, and helper
 * functions. It provides comprehensive validation for Microsoft-specific SSML features
 * including neural voice expressions, speaking styles, and advanced audio controls.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/speech-synthesis-markup | Microsoft Azure TTS SSML Documentation}
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link SsmlValidator} for validation implementation
 * @see {@link SsmlSanitizer} for content sanitization
 * 
 * @example Basic Microsoft SSML validation
 * ```typescript
 * import { MICROSOFT_SSML_SCHEMA, isMicrosoftSsmlElementAllowed } from 'cloud-text-to-speech';
 * 
 * const isValid = isMicrosoftSsmlElementAllowed('mstts:express-as');
 * console.log(`'mstts:express-as' element allowed: ${isValid}`); // true
 * 
 * const attributes = getMicrosoftSsmlElementAttributes('mstts:express-as');
 * console.log('Express-as attributes:', attributes); // ['style', 'styledegree', 'role']
 * ```
 * 
 * @example Microsoft-specific features validation
 * ```typescript
 * const validateMicrosoftFeatures = () => {
 *   // Expression validation
 *   const styles = getMicrosoftExpressionStyles();
 *   console.log('Available styles:', styles); // ['cheerful', 'empathetic', 'angry', ...]
 *   
 *   // Role validation
 *   const roles = getMicrosoftRoles();
 *   console.log('Available roles:', roles); // ['child', 'female', 'male', ...]
 *   
 *   // Attribute value validation
 *   const isValidStyle = validateMicrosoftSsmlAttributeValue('mstts:express-as', 'style', 'cheerful');
 *   console.log('Valid style:', isValidStyle); // true
 * };
 * ```
 */

/**
 * Microsoft Azure Cognitive Services Text-to-Speech SSML Schema
 * 
 * This schema defines the SSML elements and attributes supported by Microsoft TTS.
 * Reference: https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/speech-synthesis-markup
 */

import { SsmlSchema } from '../../../../common/convert/input/ssml/ssml_schema.js';

/**
 * Microsoft Azure Cognitive Services SSML Schema definition with comprehensive features.
 * Supports standard SSML elements plus Microsoft's proprietary neural voice expression
 * elements for advanced emotional and role-based speech synthesis capabilities.
 * 
 * @category SSML Schema
 * 
 * @example Schema inspection
 * ```typescript
 * import { MICROSOFT_SSML_SCHEMA } from 'cloud-text-to-speech';
 * 
 * console.log(`Provider: ${MICROSOFT_SSML_SCHEMA.provider}`);
 * console.log(`Version: ${MICROSOFT_SSML_SCHEMA.version}`);
 * console.log(`Supported elements: ${Object.keys(MICROSOFT_SSML_SCHEMA.allowedElements).length}`);
 * 
 * // List Microsoft-specific elements
 * const microsoftElements = Object.keys(MICROSOFT_SSML_SCHEMA.allowedElements)
 *   .filter(el => el.startsWith('mstts:'));
 * console.log('Microsoft-specific elements:', microsoftElements);
 * ```
 * 
 * @example Expression and style usage
 * ```typescript
 * const buildMicrosoftSsml = (text: string, style: string, role?: string) => {
 *   // Validate style
 *   const styleValid = validateMicrosoftSsmlAttributeValue('mstts:express-as', 'style', style);
 *   if (!styleValid) {
 *     throw new Error(`Invalid Microsoft style: ${style}`);
 *   }
 *   
 *   // Build SSML with optional role
 *   let attributes = `style="${style}"`;
 *   if (role) {
 *     const roleValid = validateMicrosoftSsmlAttributeValue('mstts:express-as', 'role', role);
 *     if (!roleValid) {
 *       throw new Error(`Invalid Microsoft role: ${role}`);
 *     }
 *     attributes += ` role="${role}"`;
 *   }
 *   
 *   return `
 *     <speak>
 *       <mstts:express-as ${attributes}>
 *         ${text}
 *       </mstts:express-as>
 *     </speak>
 *   `;
 * };
 * ```
 * 
 * @example Audio duration and silence control
 * ```typescript
 * const enhanceWithAudioControl = (text: string) => {
 *   return `
 *     <speak>
 *       <mstts:silence type="Leading" value="500ms"/>
 *       <mstts:audioduration value="10s">
 *         ${text}
 *       </mstts:audioduration>
 *       <mstts:silence type="Tailing" value="200ms"/>
 *     </speak>
 *   `;
 * };
 * ```
 */
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
    // Audio duration validation
    'mstts:audioduration': {
      required: ['value'],
      validation: {
        value: 'duration',
      },
    },
  },
};

/**
 * Get Microsoft SSML allowed elements (backward compatibility).
 * Legacy accessor for the complete set of allowed SSML elements
 * supported by Microsoft Azure Cognitive Services Text-to-Speech.
 * 
 * @deprecated Use MICROSOFT_SSML_SCHEMA.allowedElements directly
 * @returns Object mapping element names to their allowed attributes
 * 
 * @example Legacy compatibility
 * ```typescript
 * import { MICROSOFT_SSML_ALLOWED_ELEMENTS } from 'cloud-text-to-speech';
 * 
 * // Legacy usage (deprecated)
 * const elements = MICROSOFT_SSML_ALLOWED_ELEMENTS;
 * 
 * // Preferred usage
 * const elementsNew = MICROSOFT_SSML_SCHEMA.allowedElements;
 * ```
 */
export const MICROSOFT_SSML_ALLOWED_ELEMENTS = MICROSOFT_SSML_SCHEMA.allowedElements;

/**
 * Validates if an element is allowed in Microsoft Azure TTS SSML.
 * Performs fast lookup to determine element support without
 * requiring full schema validation overhead.
 * 
 * @param elementName - Name of the SSML element to validate
 * @returns True if the element is supported by Microsoft Azure TTS
 * 
 * @example Element validation
 * ```typescript
 * import { isMicrosoftSsmlElementAllowed } from 'cloud-text-to-speech';
 * 
 * console.log(isMicrosoftSsmlElementAllowed('break'));             // true
 * console.log(isMicrosoftSsmlElementAllowed('mstts:express-as'));  // true
 * console.log(isMicrosoftSsmlElementAllowed('mstts:silence'));     // true
 * console.log(isMicrosoftSsmlElementAllowed('prosody'));           // false (not in Microsoft schema)
 * console.log(isMicrosoftSsmlElementAllowed('custom'));            // false
 * ```
 * 
 * @example Batch validation
 * ```typescript
 * const elementsToCheck = ['speak', 'break', 'mstts:express-as', 'unknown'];
 * const validElements = elementsToCheck.filter(isMicrosoftSsmlElementAllowed);
 * const invalidElements = elementsToCheck.filter(el => !isMicrosoftSsmlElementAllowed(el));
 * 
 * console.log('Valid:', validElements);    // ['speak', 'break', 'mstts:express-as']
 * console.log('Invalid:', invalidElements); // ['unknown']
 * ```
 * 
 * @example Microsoft-specific element filtering
 * ```typescript
 * const filterMicrosoftElements = (elements: string[]) => {
 *   const microsoftSpecific = elements.filter(el => 
 *     el.startsWith('mstts:') && isMicrosoftSsmlElementAllowed(el)
 *   );
 *   
 *   const standard = elements.filter(el => 
 *     !el.startsWith('mstts:') && isMicrosoftSsmlElementAllowed(el)
 *   );
 *   
 *   return { microsoftSpecific, standard };
 * };
 * ```
 */
export function isMicrosoftSsmlElementAllowed(elementName: string): boolean {
  return elementName in MICROSOFT_SSML_SCHEMA.allowedElements;
}

/**
 * Gets the allowed attributes for a specific Microsoft SSML element.
 * Returns the complete list of attributes that can be used with
 * the specified element in Microsoft Azure TTS SSML documents.
 * 
 * @param elementName - Name of the SSML element
 * @returns Array of allowed attribute names, empty array if element not found
 * 
 * @example Attribute inspection
 * ```typescript
 * import { getMicrosoftSsmlElementAttributes } from 'cloud-text-to-speech';
 * 
 * const expressAttrs = getMicrosoftSsmlElementAttributes('mstts:express-as');
 * console.log('Express-as attributes:', expressAttrs); // ['style', 'styledegree', 'role']
 * 
 * const silenceAttrs = getMicrosoftSsmlElementAttributes('mstts:silence');
 * console.log('Silence attributes:', silenceAttrs); // ['type', 'value']
 * 
 * const breakAttrs = getMicrosoftSsmlElementAttributes('break');
 * console.log('Break attributes:', breakAttrs); // ['time', 'strength']
 * ```
 * 
 * @example Attribute validation helper
 * ```typescript
 * const validateElementAttribute = (elementName: string, attributeName: string) => {
 *   const allowedAttrs = getMicrosoftSsmlElementAttributes(elementName);
 *   
 *   if (allowedAttrs.length === 0) {
 *     throw new Error(`Element '${elementName}' is not supported by Microsoft Azure TTS`);
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
 * @example Dynamic Microsoft SSML building
 * ```typescript
 * const buildMicrosoftElement = (elementName: string, values: Record<string, string>) => {
 *   const allowedAttrs = getMicrosoftSsmlElementAttributes(elementName);
 *   
 *   const validAttributes = allowedAttrs
 *     .filter(attr => values[attr] !== undefined)
 *     .map(attr => `${attr}="${values[attr]}"`)
 *     .join(' ');
 *   
 *   return validAttributes ? `<${elementName} ${validAttributes}>` : `<${elementName}>`;
 * };
 * 
 * const expressElement = buildMicrosoftElement('mstts:express-as', { 
 *   style: 'cheerful',
 *   styledegree: '1.0',
 *   invalid: 'ignored' // This will be filtered out
 * });
 * console.log(expressElement); // <mstts:express-as style="cheerful" styledegree="1.0">
 * ```
 */
export function getMicrosoftSsmlElementAttributes(elementName: string): string[] {
  return MICROSOFT_SSML_SCHEMA.allowedElements[elementName] || [];
}

/**
 * Validates attribute values according to Microsoft Azure TTS SSML rules and constraints.
 * Performs comprehensive validation of attribute values including format checking,
 * enumerated value validation, and Microsoft-specific requirements for expressions,
 * styles, roles, and audio controls.
 * 
 * @param elementName - Name of the SSML element
 * @param attributeName - Name of the attribute to validate
 * @param value - Value to validate against the schema rules
 * @returns True if the attribute value is valid, false otherwise
 * 
 * @example Basic attribute validation
 * ```typescript
 * import { validateMicrosoftSsmlAttributeValue } from 'cloud-text-to-speech';
 * 
 * // Valid cases
 * console.log(validateMicrosoftSsmlAttributeValue('mstts:express-as', 'style', 'cheerful'));     // true
 * console.log(validateMicrosoftSsmlAttributeValue('mstts:express-as', 'role', 'child'));         // true
 * console.log(validateMicrosoftSsmlAttributeValue('mstts:silence', 'type', 'Leading'));          // true
 * console.log(validateMicrosoftSsmlAttributeValue('break', 'time', '2s'));                       // true
 * 
 * // Invalid cases
 * console.log(validateMicrosoftSsmlAttributeValue('mstts:express-as', 'style', 'invalid'));      // false
 * console.log(validateMicrosoftSsmlAttributeValue('mstts:express-as', 'role', 'custom'));        // false
 * console.log(validateMicrosoftSsmlAttributeValue('break', 'time', 'invalid'));                  // false
 * ```
 * 
 * @example Expression style validation
 * ```typescript
 * const validateExpressionStyle = (style: string, degree?: string, role?: string) => {
 *   // Validate style
 *   const styleValid = validateMicrosoftSsmlAttributeValue('mstts:express-as', 'style', style);
 *   if (!styleValid) {
 *     const availableStyles = getMicrosoftExpressionStyles();
 *     throw new Error(`Invalid style '${style}'. Available: ${availableStyles.join(', ')}`);
 *   }
 *   
 *   // Validate optional degree
 *   if (degree) {
 *     const degreeValid = validateMicrosoftSsmlAttributeValue('mstts:express-as', 'styledegree', degree);
 *     if (!degreeValid) {
 *       throw new Error(`Invalid style degree: ${degree}`);
 *     }
 *   }
 *   
 *   // Validate optional role
 *   if (role) {
 *     const roleValid = validateMicrosoftSsmlAttributeValue('mstts:express-as', 'role', role);
 *     if (!roleValid) {
 *       throw new Error(`Invalid role: ${role}`);
 *     }
 *   }
 *   
 *   return true;
 * };
 * 
 * // Usage
 * validateExpressionStyle('cheerful');                           // OK
 * validateExpressionStyle('empathetic', '1.5');                  // OK
 * validateExpressionStyle('angry', '2.0', 'female');             // OK
 * validateExpressionStyle('invalid');                            // Throws error
 * ```
 * 
 * @example Silence control validation
 * ```typescript
 * const validateSilenceControl = (type: string, value: string) => {
 *   // Validate silence type
 *   const typeValid = validateMicrosoftSsmlAttributeValue('mstts:silence', 'type', type);
 *   if (!typeValid) {
 *     throw new Error(`Invalid silence type '${type}'. Valid types: Leading, Tailing`);
 *   }
 *   
 *   // Validate duration value
 *   const valueValid = validateMicrosoftSsmlAttributeValue('mstts:silence', 'value', value);
 *   if (!valueValid) {
 *     throw new Error(`Invalid duration value '${value}'. Use format like '500ms' or '2s'`);
 *   }
 *   
 *   return true;
 * };
 * 
 * const createSilence = (type: string, value: string) => {
 *   validateSilenceControl(type, value);
 *   return `<mstts:silence type="${type}" value="${value}"/>`;
 * };
 * 
 * // Usage
 * console.log(createSilence('Leading', '500ms'));  // <mstts:silence type="Leading" value="500ms"/>
 * console.log(createSilence('Tailing', '1s'));     // <mstts:silence type="Tailing" value="1s"/>
 * ```
 * 
 * @example Audio duration validation
 * ```typescript
 * const validateAudioDuration = (duration: string) => {
 *   const isValid = validateMicrosoftSsmlAttributeValue('mstts:audioduration', 'value', duration);
 *   
 *   if (!isValid) {
 *     throw new Error(`Invalid audio duration '${duration}'. Use format like '10s' or '5000ms'`);
 *   }
 *   
 *   return true;
 * };
 * 
 * const createAudioDuration = (text: string, duration: string) => {
 *   validateAudioDuration(duration);
 *   return `<mstts:audioduration value="${duration}">${text}</mstts:audioduration>`;
 * };
 * 
 * // Usage
 * const timedAudio = createAudioDuration('This will take exactly 5 seconds', '5s');
 * ```
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
 * Checks if Microsoft SSML element requires specific attributes.
 * Returns the list of required attributes that must be present
 * for the element to be valid according to Microsoft Azure TTS requirements.
 * 
 * @param elementName - Name of the SSML element
 * @returns Array of required attribute names
 * 
 * @example Required attribute checking
 * ```typescript
 * import { getMicrosoftSsmlRequiredAttributes } from 'cloud-text-to-speech';
 * 
 * const audioRequired = getMicrosoftSsmlRequiredAttributes('audio');
 * console.log('Audio required attrs:', audioRequired); // ['src']
 * 
 * const lexiconRequired = getMicrosoftSsmlRequiredAttributes('lexicon');
 * console.log('Lexicon required attrs:', lexiconRequired); // ['uri']
 * 
 * const breakRequired = getMicrosoftSsmlRequiredAttributes('break');
 * console.log('Break required attrs:', breakRequired); // []
 * ```
 * 
 * @example Element validation with required attributes
 * ```typescript
 * const validateRequiredAttributes = (elementName: string, attributes: Record<string, string>) => {
 *   const required = getMicrosoftSsmlRequiredAttributes(elementName);
 *   
 *   for (const requiredAttr of required) {
 *     if (!attributes[requiredAttr]) {
 *       throw new Error(`Missing required attribute '${requiredAttr}' for element '${elementName}'`);
 *     }
 *   }
 *   
 *   return true;
 * };
 * 
 * // Usage
 * validateRequiredAttributes('audio', { src: 'https://example.com/sound.mp3' }); // OK
 * validateRequiredAttributes('audio', {}); // Throws error
 * ```
 */
export function getMicrosoftSsmlRequiredAttributes(elementName: string): string[] {
  const rules = MICROSOFT_SSML_SCHEMA.specialRules?.[elementName] as { required?: string[] } | undefined;
  return rules?.required || [];
}

/**
 * Gets the complete list of Microsoft-specific expression styles supported by Azure TTS.
 * These styles provide emotional and contextual variations for neural voice synthesis
 * to enhance the naturalness and appropriateness of generated speech.
 * 
 * @returns Array of supported Microsoft expression style names
 * 
 * @example Expression style usage
 * ```typescript
 * import { getMicrosoftExpressionStyles } from 'cloud-text-to-speech';
 * 
 * const styles = getMicrosoftExpressionStyles();
 * console.log('Available styles:', styles); 
 * // ['general', 'newscast', 'customerservice', 'chat', 'cheerful', 'empathetic', ...]
 * 
 * // Build style selector
 * const buildStyleSelect = () => {
 *   return styles.map(style => ({
 *     value: style,
 *     label: style.charAt(0).toUpperCase() + style.slice(1),
 *     description: getStyleDescription(style)
 *   }));
 * };
 * 
 * const getStyleDescription = (style: string) => {
 *   const descriptions = {
 *     general: 'Neutral speaking style',
 *     newscast: 'Professional news reading style',
 *     customerservice: 'Friendly and helpful tone',
 *     chat: 'Casual conversational style',
 *     cheerful: 'Positive and upbeat tone',
 *     empathetic: 'Caring and understanding tone',
 *     angry: 'Stern and assertive tone',
 *     calm: 'Relaxed and peaceful tone'
 *   };
 *   return descriptions[style] || 'Specialized speaking style';
 * };
 * ```
 * 
 * @example Style selection and application
 * ```typescript
 * const selectStyleForContent = (content: string, preferredStyle?: string) => {
 *   const availableStyles = getMicrosoftExpressionStyles();
 *   
 *   // Use preferred style if valid
 *   if (preferredStyle && availableStyles.includes(preferredStyle)) {
 *     return preferredStyle;
 *   }
 *   
 *   // Auto-select based on content
 *   if (content.includes('thank you') || content.includes('welcome')) {
 *     return 'cheerful';
 *   } else if (content.includes('sorry') || content.includes('understand')) {
 *     return 'empathetic';
 *   } else if (content.includes('breaking news') || content.includes('report')) {
 *     return 'newscast';
 *   } else if (content.includes('help') || content.includes('support')) {
 *     return 'customerservice';
 *   } else {
 *     return 'general';
 *   }
 * };
 * ```
 */
export function getMicrosoftExpressionStyles(): string[] {
  return [
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
  ];
}

/**
 * Gets the complete list of Microsoft-specific role options supported by Azure TTS.
 * These roles provide age and gender-specific voice characteristics to enhance
 * the appropriateness and realism of synthesized speech for different scenarios.
 * 
 * @returns Array of supported Microsoft role names
 * 
 * @example Role usage
 * ```typescript
 * import { getMicrosoftRoles } from 'cloud-text-to-speech';
 * 
 * const roles = getMicrosoftRoles();
 * console.log('Available roles:', roles); 
 * // ['child', 'female', 'male', 'youngadultfemale', 'youngadultmale', 'olderfemale', 'oldermale']
 * 
 * // Build role configuration
 * const buildRoleConfig = (roleName: string) => {
 *   const config = { role: roleName };
 *   
 *   // Add recommended styles for specific roles
 *   const roleStyleMap = {
 *     child: 'cheerful',
 *     youngadultfemale: 'chat',
 *     youngadultmale: 'chat',
 *     olderfemale: 'gentle',
 *     oldermale: 'calm'
 *   };
 *   
 *   const recommendedStyle = roleStyleMap[roleName];
 *   if (recommendedStyle) {
 *     return { ...config, style: recommendedStyle };
 *   }
 *   
 *   return config;
 * };
 * ```
 * 
 * @example Role application
 * ```typescript
 * const applyRole = (text: string, roleName: string, style?: string) => {
 *   const availableRoles = getMicrosoftRoles();
 *   
 *   if (!availableRoles.includes(roleName)) {
 *     throw new Error(`Role '${roleName}' not supported. Available: ${availableRoles.join(', ')}`);
 *   }
 *   
 *   let attributes = `role="${roleName}"`;
 *   
 *   if (style) {
 *     if (validateMicrosoftSsmlAttributeValue('mstts:express-as', 'style', style)) {
 *       attributes += ` style="${style}"`;
 *     }
 *   }
 *   
 *   return `<mstts:express-as ${attributes}>${text}</mstts:express-as>`;
 * };
 * 
 * // Usage
 * const childSpeech = applyRole('Hello everyone!', 'child', 'cheerful');
 * const adultSpeech = applyRole('Good morning', 'youngadultfemale', 'customerservice');
 * ```
 */
export function getMicrosoftRoles(): string[] {
  return ['child', 'female', 'male', 'youngadultfemale', 'youngadultmale', 'olderfemale', 'oldermale'];
} 