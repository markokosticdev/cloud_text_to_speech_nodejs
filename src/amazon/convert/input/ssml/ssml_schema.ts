/**
 * @fileoverview Amazon Polly Text-to-Speech SSML Schema and Validation System
 * 
 * This module defines the complete SSML schema for Amazon Polly Text-to-Speech,
 * including supported elements, attributes, validation rules, and helper functions.
 * It provides comprehensive validation for Amazon-specific SSML features including
 * domain selection, neural effects, and advanced voice modulation capabilities.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://docs.aws.amazon.com/polly/latest/dg/supportedtags.html | Amazon Polly SSML Documentation}
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link SsmlValidator} for validation implementation
 * @see {@link SsmlSanitizer} for content sanitization
 * 
 * @example Basic Amazon SSML validation
 * ```typescript
 * import { AMAZON_SSML_SCHEMA, isAmazonSsmlElementAllowed } from 'cloud-text-to-speech';
 * 
 * const isValid = isAmazonSsmlElementAllowed('amazon:domain');
 * console.log(`'amazon:domain' element allowed: ${isValid}`); // true
 * 
 * const attributes = getAmazonSsmlElementAttributes('amazon:effect');
 * console.log('Effect attributes:', attributes); // ['name', 'phonation', 'vocal-tract-length']
 * ```
 * 
 * @example Amazon-specific features validation
 * ```typescript
 * const validateAmazonFeatures = () => {
 *   // Domain validation
 *   const domains = getAmazonDomains();
 *   console.log('Available domains:', domains); // ['news', 'music', 'conversational']
 *   
 *   // Effect validation
 *   const effects = getAmazonEffects();
 *   console.log('Available effects:', effects); // ['whispered', 'drc']
 *   
 *   // Attribute value validation
 *   const isValidDomain = validateAmazonSsmlAttributeValue('amazon:domain', 'name', 'news');
 *   console.log('Valid domain:', isValidDomain); // true
 * };
 * ```
 */

/**
 * Amazon Polly Text-to-Speech SSML Schema
 * 
 * This schema defines the SSML elements and attributes supported by Amazon Polly.
 * Reference: https://docs.aws.amazon.com/polly/latest/dg/supportedtags.html
 */

import { SsmlSchema } from '../../../../common/convert/input/ssml/ssml_schema.js';

/**
 * Amazon Polly SSML Schema definition with comprehensive Amazon-specific features.
 * Supports standard SSML elements plus Amazon's proprietary domain and effect
 * elements for advanced neural voice capabilities and specialized speaking styles.
 * 
 * @category SSML Schema
 * 
 * @example Schema inspection
 * ```typescript
 * import { AMAZON_SSML_SCHEMA } from 'cloud-text-to-speech';
 * 
 * console.log(`Provider: ${AMAZON_SSML_SCHEMA.provider}`);
 * console.log(`Version: ${AMAZON_SSML_SCHEMA.version}`);
 * console.log(`Supported elements: ${Object.keys(AMAZON_SSML_SCHEMA.allowedElements).length}`);
 * 
 * // List Amazon-specific elements
 * const amazonElements = Object.keys(AMAZON_SSML_SCHEMA.allowedElements)
 *   .filter(el => el.startsWith('amazon:'));
 * console.log('Amazon-specific elements:', amazonElements);
 * ```
 * 
 * @example Domain and effect usage
 * ```typescript
 * const buildAmazonSsml = (text: string, domain: string, effect: string) => {
 *   // Validate domain
 *   const domainValid = validateAmazonSsmlAttributeValue('amazon:domain', 'name', domain);
 *   if (!domainValid) {
 *     throw new Error(`Invalid Amazon domain: ${domain}`);
 *   }
 *   
 *   // Validate effect
 *   const effectValid = validateAmazonSsmlAttributeValue('amazon:effect', 'name', effect);
 *   if (!effectValid) {
 *     throw new Error(`Invalid Amazon effect: ${effect}`);
 *   }
 *   
 *   return `
 *     <speak>
 *       <amazon:domain name="${domain}">
 *         <amazon:effect name="${effect}">
 *           ${text}
 *         </amazon:effect>
 *       </amazon:domain>
 *     </speak>
 *   `;
 * };
 * ```
 * 
 * @example Advanced word role usage
 * ```typescript
 * const enhanceTextWithWordRoles = (text: string) => {
 *   // Amazon supports word role disambiguation
 *   return `
 *     <speak>
 *       I <w role="amazon:VB">read</w> a <w role="amazon:NN">book</w>.
 *       Yesterday I <w role="amazon:VBD">read</w> the same <w role="amazon:NN">book</w>.
 *     </speak>
 *   `;
 * };
 * ```
 */
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
 * Get Amazon SSML allowed elements (backward compatibility).
 * Legacy accessor for the complete set of allowed SSML elements
 * supported by Amazon Polly Text-to-Speech service.
 * 
 * @deprecated Use AMAZON_SSML_SCHEMA.allowedElements directly
 * @returns Object mapping element names to their allowed attributes
 * 
 * @example Legacy compatibility
 * ```typescript
 * import { AMAZON_SSML_ALLOWED_ELEMENTS } from 'cloud-text-to-speech';
 * 
 * // Legacy usage (deprecated)
 * const elements = AMAZON_SSML_ALLOWED_ELEMENTS;
 * 
 * // Preferred usage
 * const elementsNew = AMAZON_SSML_SCHEMA.allowedElements;
 * ```
 */
export const AMAZON_SSML_ALLOWED_ELEMENTS = AMAZON_SSML_SCHEMA.allowedElements;

/**
 * Validates if an element is allowed in Amazon Polly SSML.
 * Performs fast lookup to determine element support without
 * requiring full schema validation overhead.
 * 
 * @param elementName - Name of the SSML element to validate
 * @returns True if the element is supported by Amazon Polly
 * 
 * @example Element validation
 * ```typescript
 * import { isAmazonSsmlElementAllowed } from 'cloud-text-to-speech';
 * 
 * console.log(isAmazonSsmlElementAllowed('break'));           // true
 * console.log(isAmazonSsmlElementAllowed('amazon:domain'));   // true
 * console.log(isAmazonSsmlElementAllowed('amazon:effect'));   // true
 * console.log(isAmazonSsmlElementAllowed('prosody'));         // false (not in Amazon schema)
 * console.log(isAmazonSsmlElementAllowed('custom'));          // false
 * ```
 * 
 * @example Batch validation
 * ```typescript
 * const elementsToCheck = ['speak', 'break', 'amazon:domain', 'unknown'];
 * const validElements = elementsToCheck.filter(isAmazonSsmlElementAllowed);
 * const invalidElements = elementsToCheck.filter(el => !isAmazonSsmlElementAllowed(el));
 * 
 * console.log('Valid:', validElements);    // ['speak', 'break', 'amazon:domain']
 * console.log('Invalid:', invalidElements); // ['unknown']
 * ```
 * 
 * @example Amazon-specific element filtering
 * ```typescript
 * const filterAmazonElements = (elements: string[]) => {
 *   const amazonSpecific = elements.filter(el => 
 *     el.startsWith('amazon:') && isAmazonSsmlElementAllowed(el)
 *   );
 *   
 *   const standard = elements.filter(el => 
 *     !el.startsWith('amazon:') && isAmazonSsmlElementAllowed(el)
 *   );
 *   
 *   return { amazonSpecific, standard };
 * };
 * ```
 */
export function isAmazonSsmlElementAllowed(elementName: string): boolean {
  return elementName in AMAZON_SSML_SCHEMA.allowedElements;
}

/**
 * Gets the allowed attributes for a specific Amazon SSML element.
 * Returns the complete list of attributes that can be used with
 * the specified element in Amazon Polly SSML documents.
 * 
 * @param elementName - Name of the SSML element
 * @returns Array of allowed attribute names, empty array if element not found
 * 
 * @example Attribute inspection
 * ```typescript
 * import { getAmazonSsmlElementAttributes } from 'cloud-text-to-speech';
 * 
 * const domainAttrs = getAmazonSsmlElementAttributes('amazon:domain');
 * console.log('Domain attributes:', domainAttrs); // ['name']
 * 
 * const effectAttrs = getAmazonSsmlElementAttributes('amazon:effect');
 * console.log('Effect attributes:', effectAttrs); 
 * // ['name', 'phonation', 'vocal-tract-length']
 * 
 * const breakAttrs = getAmazonSsmlElementAttributes('break');
 * console.log('Break attributes:', breakAttrs); // ['time', 'strength']
 * ```
 * 
 * @example Attribute validation helper
 * ```typescript
 * const validateElementAttribute = (elementName: string, attributeName: string) => {
 *   const allowedAttrs = getAmazonSsmlElementAttributes(elementName);
 *   
 *   if (allowedAttrs.length === 0) {
 *     throw new Error(`Element '${elementName}' is not supported by Amazon Polly`);
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
 * @example Dynamic Amazon SSML building
 * ```typescript
 * const buildAmazonElement = (elementName: string, values: Record<string, string>) => {
 *   const allowedAttrs = getAmazonSsmlElementAttributes(elementName);
 *   
 *   const validAttributes = allowedAttrs
 *     .filter(attr => values[attr] !== undefined)
 *     .map(attr => `${attr}="${values[attr]}"`)
 *     .join(' ');
 *   
 *   return validAttributes ? `<${elementName} ${validAttributes}>` : `<${elementName}>`;
 * };
 * 
 * const domainElement = buildAmazonElement('amazon:domain', { 
 *   name: 'news',
 *   invalid: 'ignored' // This will be filtered out
 * });
 * console.log(domainElement); // <amazon:domain name="news">
 * ```
 */
export function getAmazonSsmlElementAttributes(elementName: string): string[] {
  return AMAZON_SSML_SCHEMA.allowedElements[elementName] || [];
}

/**
 * Validates attribute values according to Amazon Polly SSML rules and constraints.
 * Performs comprehensive validation of attribute values including format checking,
 * enumerated value validation, and Amazon-specific requirements for domains,
 * effects, and vocal tract modifications.
 * 
 * @param elementName - Name of the SSML element
 * @param attributeName - Name of the attribute to validate
 * @param value - Value to validate against the schema rules
 * @returns True if the attribute value is valid, false otherwise
 * 
 * @example Basic attribute validation
 * ```typescript
 * import { validateAmazonSsmlAttributeValue } from 'cloud-text-to-speech';
 * 
 * // Valid cases
 * console.log(validateAmazonSsmlAttributeValue('amazon:domain', 'name', 'news'));      // true
 * console.log(validateAmazonSsmlAttributeValue('amazon:effect', 'name', 'whispered')); // true
 * console.log(validateAmazonSsmlAttributeValue('break', 'time', '2s'));                // true
 * console.log(validateAmazonSsmlAttributeValue('w', 'role', 'amazon:VB'));             // true
 * 
 * // Invalid cases
 * console.log(validateAmazonSsmlAttributeValue('amazon:domain', 'name', 'invalid'));   // false
 * console.log(validateAmazonSsmlAttributeValue('amazon:effect', 'name', 'custom'));    // false
 * console.log(validateAmazonSsmlAttributeValue('break', 'time', 'invalid'));           // false
 * ```
 * 
 * @example Amazon domain validation
 * ```typescript
 * const validateDomain = (domain: string) => {
 *   const isValid = validateAmazonSsmlAttributeValue('amazon:domain', 'name', domain);
 *   
 *   if (!isValid) {
 *     const availableDomains = getAmazonDomains();
 *     throw new Error(`Invalid domain '${domain}'. Available: ${availableDomains.join(', ')}`);
 *   }
 *   
 *   return true;
 * };
 * 
 * // Usage
 * validateDomain('news');           // OK
 * validateDomain('music');          // OK
 * validateDomain('conversational'); // OK
 * validateDomain('custom');         // Throws error
 * ```
 * 
 * @example Amazon effect validation
 * ```typescript
 * const validateEffect = (effectName: string, options?: Record<string, string>) => {
 *   // Validate effect name
 *   const nameValid = validateAmazonSsmlAttributeValue('amazon:effect', 'name', effectName);
 *   if (!nameValid) {
 *     throw new Error(`Invalid effect name: ${effectName}`);
 *   }
 *   
 *   // Validate optional attributes
 *   if (options) {
 *     for (const [attr, value] of Object.entries(options)) {
 *       const isValid = validateAmazonSsmlAttributeValue('amazon:effect', attr, value);
 *       if (!isValid) {
 *         throw new Error(`Invalid value '${value}' for effect attribute '${attr}'`);
 *       }
 *     }
 *   }
 *   
 *   return true;
 * };
 * 
 * // Usage
 * validateEffect('whispered');                                    // OK
 * validateEffect('drc');                                          // OK
 * validateEffect('whispered', { phonation: 'soft' });            // OK
 * validateEffect('whispered', { 'vocal-tract-length': '+10%' }); // OK
 * ```
 * 
 * @example Word role validation
 * ```typescript
 * const validateWordRole = (role: string) => {
 *   const isValid = validateAmazonSsmlAttributeValue('w', 'role', role);
 *   
 *   if (!isValid) {
 *     const validRoles = ['amazon:VB', 'amazon:VBD', 'amazon:NN', 'amazon:SENSE_1'];
 *     throw new Error(`Invalid word role '${role}'. Valid roles: ${validRoles.join(', ')}`);
 *   }
 *   
 *   return true;
 * };
 * 
 * const disambiguateWord = (word: string, role: string) => {
 *   validateWordRole(role);
 *   return `<w role="${role}">${word}</w>`;
 * };
 * 
 * // Usage
 * console.log(disambiguateWord('read', 'amazon:VB'));   // <w role="amazon:VB">read</w>
 * console.log(disambiguateWord('read', 'amazon:VBD'));  // <w role="amazon:VBD">read</w>
 * ```
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
 * Checks if Amazon SSML element requires specific attributes.
 * Returns the list of required attributes that must be present
 * for the element to be valid according to Amazon Polly requirements.
 * 
 * @param elementName - Name of the SSML element
 * @returns Array of required attribute names
 * 
 * @example Required attribute checking
 * ```typescript
 * import { getAmazonSsmlRequiredAttributes } from 'cloud-text-to-speech';
 * 
 * const domainRequired = getAmazonSsmlRequiredAttributes('amazon:domain');
 * console.log('Domain required attrs:', domainRequired); // ['name']
 * 
 * const effectRequired = getAmazonSsmlRequiredAttributes('amazon:effect');
 * console.log('Effect required attrs:', effectRequired); // ['name']
 * 
 * const breakRequired = getAmazonSsmlRequiredAttributes('break');
 * console.log('Break required attrs:', breakRequired); // []
 * ```
 * 
 * @example Element validation with required attributes
 * ```typescript
 * const validateRequiredAttributes = (elementName: string, attributes: Record<string, string>) => {
 *   const required = getAmazonSsmlRequiredAttributes(elementName);
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
 * validateRequiredAttributes('amazon:domain', { name: 'news' }); // OK
 * validateRequiredAttributes('amazon:domain', {}); // Throws error
 * ```
 */
export function getAmazonSsmlRequiredAttributes(elementName: string): string[] {
  const rules = AMAZON_SSML_SCHEMA.specialRules?.[elementName] as { required?: string[] } | undefined;
  return rules?.required || [];
}

/**
 * Gets the complete list of Amazon-specific domain names supported by Polly.
 * These domains provide specialized speaking styles optimized for different
 * content types and use cases.
 * 
 * @returns Array of supported Amazon domain names
 * 
 * @example Domain usage
 * ```typescript
 * import { getAmazonDomains } from 'cloud-text-to-speech';
 * 
 * const domains = getAmazonDomains();
 * console.log('Available domains:', domains); // ['news', 'music', 'conversational']
 * 
 * // Build domain selector
 * const buildDomainSelect = () => {
 *   return domains.map(domain => ({
 *     value: domain,
 *     label: domain.charAt(0).toUpperCase() + domain.slice(1),
 *     description: getDomainDescription(domain)
 *   }));
 * };
 * 
 * const getDomainDescription = (domain: string) => {
 *   switch (domain) {
 *     case 'news': return 'Optimized for news reading with appropriate pacing';
 *     case 'music': return 'Enhanced for musical content and lyrics';
 *     case 'conversational': return 'Natural conversational speaking style';
 *     default: return 'Standard domain';
 *   }
 * };
 * ```
 * 
 * @example Domain validation and selection
 * ```typescript
 * const selectDomain = (content: string, preferredDomain?: string) => {
 *   const availableDomains = getAmazonDomains();
 *   
 *   // Use preferred domain if valid
 *   if (preferredDomain && availableDomains.includes(preferredDomain)) {
 *     return preferredDomain;
 *   }
 *   
 *   // Auto-select based on content
 *   if (content.includes('breaking news') || content.includes('report')) {
 *     return 'news';
 *   } else if (content.includes('song') || content.includes('music')) {
 *     return 'music';
 *   } else {
 *     return 'conversational';
 *   }
 * };
 * ```
 */
export function getAmazonDomains(): string[] {
  return ['news', 'music', 'conversational'];
}

/**
 * Gets the complete list of Amazon-specific effect names supported by Polly.
 * These effects provide advanced voice modulation capabilities for enhanced
 * speech synthesis with specialized acoustic characteristics.
 * 
 * @returns Array of supported Amazon effect names
 * 
 * @example Effect usage
 * ```typescript
 * import { getAmazonEffects } from 'cloud-text-to-speech';
 * 
 * const effects = getAmazonEffects();
 * console.log('Available effects:', effects); // ['whispered', 'drc']
 * 
 * // Build effect configuration
 * const buildEffectConfig = (effectName: string) => {
 *   const config = { name: effectName };
 *   
 *   if (effectName === 'whispered') {
 *     // Whispered effect can have phonation attribute
 *     return { ...config, phonation: 'soft' };
 *   }
 *   
 *   return config;
 * };
 * ```
 * 
 * @example Effect application
 * ```typescript
 * const applyEffect = (text: string, effectName: string, options?: Record<string, string>) => {
 *   const availableEffects = getAmazonEffects();
 *   
 *   if (!availableEffects.includes(effectName)) {
 *     throw new Error(`Effect '${effectName}' not supported. Available: ${availableEffects.join(', ')}`);
 *   }
 *   
 *   let attributes = `name="${effectName}"`;
 *   
 *   if (options) {
 *     for (const [key, value] of Object.entries(options)) {
 *       if (validateAmazonSsmlAttributeValue('amazon:effect', key, value)) {
 *         attributes += ` ${key}="${value}"`;
 *       }
 *     }
 *   }
 *   
 *   return `<amazon:effect ${attributes}>${text}</amazon:effect>`;
 * };
 * 
 * // Usage
 * const whispered = applyEffect('This is secret', 'whispered', { phonation: 'soft' });
 * const drcEffect = applyEffect('Enhanced audio', 'drc');
 * ```
 */
export function getAmazonEffects(): string[] {
  return ['whispered', 'drc'];
} 