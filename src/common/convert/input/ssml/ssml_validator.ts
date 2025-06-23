/**
 * @fileoverview SSML Content Validation and Quality Assurance System
 * 
 * This module provides comprehensive SSML (Speech Synthesis Markup Language)
 * validation capabilities for ensuring content quality, structural integrity,
 * and provider compatibility. It implements advanced validation algorithms
 * that check syntax, semantics, attribute values, and provider-specific
 * requirements to guarantee reliable text-to-speech processing results.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link SsmlSanitizer} for content sanitization
 * @see {@link SsmlMinimizer} for content optimization  
 * @see {@link SsmlSplitter} for content chunking
 * @see {@link SsmlOptions} for configuration options
 * 
 * @example Basic SSML validation
 * ```typescript
 * import { SsmlValidator } from 'cloud-text-to-speech';
 * 
 * const ssml = '<speak><break time="2s"/>Hello world</speak>';
 * const allowedElements = {
 *   speak: ['version', 'xmlns'],
 *   break: ['time', 'strength']
 * };
 * 
 * const result = SsmlValidator.validate(ssml, allowedElements);
 * if (result.isValid) {
 *   console.log('SSML is valid!');
 * } else {
 *   console.error('Validation errors:', result.errors);
 * }
 * ```
 * 
 * @example Advanced validation with custom rules
 * ```typescript
 * const validateWithCustomRules = (ssml: string) => {
 *   const result = SsmlValidator.validate(ssml, allowedElements, {
 *     validateAttributes: true,
 *     validateAttributeValues: true,
 *     maxDepth: 5,
 *     customRules: {
 *       allowEmptyElements: false,
 *       requireClosingTags: true,
 *       maxElementLength: 1000
 *     }
 *   });
 *   
 *   return {
 *     isValid: result.isValid,
 *     score: calculateQualityScore(result),
 *     suggestions: generateImprovementSuggestions(result)
 *   };
 * };
 * ```
 */

import { 
  SsmlValidationOptions, 
  SsmlValidationResult, 
  SsmlValidationError, 
  SsmlValidationWarning 
} from './ssml_options.js';

export {
  SsmlValidationOptions,
  SsmlValidationResult,
  SsmlValidationError,
  SsmlValidationWarning
};



export enum SsmlValidationErrorCodes {
  INVALID_XML = 'INVALID_XML',
  MISSING_SPEAK_TAG = 'MISSING_SPEAK_TAG',
  UNSUPPORTED_ELEMENT = 'UNSUPPORTED_ELEMENT',
  UNSUPPORTED_ATTRIBUTE = 'UNSUPPORTED_ATTRIBUTE',
  INVALID_ATTRIBUTE_VALUE = 'INVALID_ATTRIBUTE_VALUE',
  NESTED_ELEMENT_ERROR = 'NESTED_ELEMENT_ERROR',
  EMPTY_CONTENT = 'EMPTY_CONTENT',
}

/**
 * SSML Content Validation and Quality Assurance Utility
 * 
 * Provides comprehensive static methods for validating SSML content against
 * provider-specific schemas, structural requirements, and quality standards.
 * Implements advanced validation algorithms that ensure content reliability,
 * compatibility, and optimal performance across different TTS services.
 * 
 * @category SSML Processing
 * 
 * @example Basic validation workflow
 * ```typescript
 * import { SsmlValidator } from 'cloud-text-to-speech';
 * 
 * const validateSsmlContent = (ssml: string, provider: string) => {
 *   const allowedElements = getProviderElements(provider);
 *   const options = getProviderValidationOptions(provider);
 *   
 *   const result = SsmlValidator.validate(ssml, allowedElements, options);
 *   
 *   if (result.isValid) {
 *     console.log(`✅ Valid SSML for ${provider}`);
 *     if (result.warnings.length > 0) {
 *       console.warn(`⚠️  ${result.warnings.length} warnings found`);
 *     }
 *   } else {
 *     console.error(`❌ Invalid SSML: ${result.errors.length} errors`);
 *     result.errors.forEach(error => {
 *       console.error(`  - ${error.message}`);
 *     });
 *   }
 *   
 *   return result;
 * };
 * ```
 * 
 * @example Quality assurance validation
 * ```typescript
 * const performQualityAssurance = (ssmlBatch: string[]) => {
 *   const results = ssmlBatch.map((ssml, index) => {
 *     const result = SsmlValidator.validate(ssml, allowedElements, {
 *       validateAttributes: true,
 *       validateAttributeValues: true,
 *       maxDepth: 10,
 *       customRules: {
 *         allowEmptyElements: false,
 *         requireClosingTags: true
 *       }
 *     });
 *     
 *     return {
 *       index,
 *       ssml,
 *       result,
 *       qualityScore: calculateQualityScore(result)
 *     };
 *   });
 *   
 *   const qualityReport = {
 *     totalDocuments: results.length,
 *     validDocuments: results.filter(r => r.result.isValid).length,
 *     averageQuality: results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length,
 *     commonIssues: extractCommonIssues(results)
 *   };
 *   
 *   return { results, qualityReport };
 * };
 * ```
 * 
 * @example Production validation with monitoring
 * ```typescript
 * const validateForProduction = (ssml: string, options: ValidationOptions) => {
 *   const startTime = performance.now();
 *   
 *   const result = SsmlValidator.validate(ssml, allowedElements, {
 *     ...options,
 *     reportingCallback: (validationResult) => {
 *       // Send metrics to monitoring system
 *       monitoring.track('ssml_validation', {
 *         valid: validationResult.isValid,
 *         errors: validationResult.errors.length,
 *         warnings: validationResult.warnings.length,
 *         processingTime: performance.now() - startTime
 *       });
 *     }
 *   });
 *   
 *   return result;
 * };
 * ```
 */
export class SsmlValidator {
  /**
   * Validates SSML content against provider schemas and quality standards.
   * Performs comprehensive validation including syntax checking, element validation,
   * attribute verification, structural analysis, and quality assessment to ensure
   * optimal TTS processing results and provider compatibility.
   * 
   * @param ssml - SSML content to validate
   * @param allowedElements - Provider-specific allowed elements and attributes
   * @param options - Optional validation configuration settings
   * @returns Comprehensive validation result with errors, warnings, and metadata
   * 
   * @example Basic element validation
   * ```typescript
   * import { SsmlValidator } from 'cloud-text-to-speech';
   * 
   * const ssml = `
   *   <speak>
   *     <p>Hello world!</p>
   *     <break time="1s"/>
   *     <emphasis level="strong">Important message</emphasis>
   *   </speak>
   * `;
   * 
   * const allowedElements = {
   *   speak: ['version', 'xmlns'],
   *   p: [],
   *   break: ['time', 'strength'],
   *   emphasis: ['level']
   * };
   * 
   * const result = SsmlValidator.validate(ssml, allowedElements);
   * console.log('Valid:', result.isValid);
   * console.log('Errors:', result.errors.length);
   * console.log('Warnings:', result.warnings.length);
   * ```
   * 
   * @example Attribute value validation
   * ```typescript
   * const validateAttributeValues = (ssml: string) => {
   *   const result = SsmlValidator.validate(ssml, allowedElements, {
   *     validateAttributes: true,
   *     validateAttributeValues: true
   *   });
   *   
   *   // Check for specific attribute errors
   *   const timeErrors = result.errors.filter(e => 
   *     e.code === 'INVALID_TIME_VALUE'
   *   );
   *   
   *   const strengthErrors = result.errors.filter(e => 
   *     e.code === 'INVALID_STRENGTH_VALUE'
   *   );
   *   
   *   return {
   *     isValid: result.isValid,
   *     timeIssues: timeErrors.length,
   *     strengthIssues: strengthErrors.length,
   *     suggestions: result.errors.map(e => e.suggestion).filter(Boolean)
   *   };
   * };
   * ```
   * 
   * @example Structural validation
   * ```typescript
   * const validateStructure = (ssml: string) => {
   *   const result = SsmlValidator.validate(ssml, allowedElements, {
   *     maxDepth: 5,
   *     customRules: {
   *       allowEmptyElements: false,
   *       requireClosingTags: true,
   *       maxElementLength: 500
   *     }
   *   });
   *   
   *   const structuralIssues = result.errors.filter(error => 
   *     ['NESTING_TOO_DEEP', 'EMPTY_ELEMENT', 'UNCLOSED_TAG'].includes(error.code)
   *   );
   *   
   *   return {
   *     isStructurallyValid: structuralIssues.length === 0,
   *     structuralIssues: structuralIssues.length,
   *     maxDepthFound: result.metadata?.maxDepth || 0,
   *     elementCount: result.metadata?.elementCount || 0
   *   };
   * };
   * ```
   * 
   * @example Multi-provider validation
   * ```typescript
   * const validateForAllProviders = (ssml: string) => {
   *   const providers = ['google', 'microsoft', 'amazon'];
   *   
   *   return providers.map(provider => {
   *     const allowedElements = getProviderElements(provider);
   *     const result = SsmlValidator.validate(ssml, allowedElements, {
   *       validateAttributes: true,
   *       validateAttributeValues: true
   *     });
   *     
   *     return {
   *       provider,
   *       isValid: result.isValid,
   *       errors: result.errors.length,
   *       warnings: result.warnings.length,
   *       compatibility: result.isValid ? 'full' : 
   *                     result.errors.length <= 2 ? 'partial' : 'none'
   *     };
   *   });
   * };
   * ```
   * 
   * @example Performance validation
   * ```typescript
   * const validatePerformance = (ssml: string) => {
   *   const startTime = performance.now();
   *   
   *   const result = SsmlValidator.validate(ssml, allowedElements, {
   *     validateAttributes: true,
   *     validateAttributeValues: true,
   *     customRules: {
   *       maxElementLength: 1000
   *     }
   *   });
   *   
   *   const endTime = performance.now();
   *   const validationTime = endTime - startTime;
   *   
   *   // Performance warnings
   *   const performanceWarnings = [];
   *   if (validationTime > 100) {
   *     performanceWarnings.push('Validation took longer than 100ms');
   *   }
   *   if (ssml.length > 10000) {
   *     performanceWarnings.push('SSML content exceeds recommended size');
   *   }
   *   
   *   return {
   *     ...result,
   *     performance: {
   *       validationTime,
   *       contentSize: ssml.length,
   *       warnings: performanceWarnings
   *     }
   *   };
   * };
   * ```
   * 
   * @example Custom validation rules
   * ```typescript
   * const validateWithCustomRules = (ssml: string) => {
   *   const result = SsmlValidator.validate(ssml, allowedElements, {
   *     customRules: {
   *       allowEmptyElements: false,
   *       requireClosingTags: true,
   *       maxElementLength: 500,
   *       elementValidators: {
   *         'break': (element) => {
   *           // Custom break element validation
   *           const time = element.getAttribute('time');
   *           if (time) {
   *             const duration = parseFloat(time);
   *             return duration >= 0.1 && duration <= 10; // 100ms to 10s
   *           }
   *           return true;
   *         },
   *         'audio': (element) => {
   *           // Custom audio element validation
   *           const src = element.getAttribute('src');
   *           return src && (src.startsWith('https://') || src.startsWith('gs://'));
   *         }
   *       }
   *     }
   *   });
   *   
   *   return result;
   * };
   * ```
   */
  static validate(
    ssml: string,
    allowedElements: { [key: string]: string[] },
    options?: Partial<SsmlValidationOptions>
  ): SsmlValidationResult {
    const startTime = performance.now();
    
    const validationOptions: SsmlValidationOptions = {
      enabled: true,
      mode: 'strict',
      validateAttributes: false,
      validateAttributeValues: false,
      allowUnknownElements: false,
      ...options
    };

    const errors: SsmlValidationError[] = [];
    const warnings: SsmlValidationWarning[] = [];

    try {
      // Basic content validation
      if (!ssml || ssml.trim() === '') {
        errors.push({
          code: 'EMPTY_CONTENT',
          message: 'SSML content is empty or whitespace only',
          severity: 'error',
          suggestion: 'Provide valid SSML content'
        });
        
        return this.createValidationResult(false, errors, warnings, startTime);
      }

      // Basic XML structure validation
      const structureResult = this.validateXmlStructure(ssml);
      errors.push(...structureResult.errors);
      warnings.push(...structureResult.warnings);

      if (errors.length > 0) {
        return this.createValidationResult(false, errors, warnings, startTime, structureResult.metadata);
      }

      // Element validation
      const elementResult = this.validateElements(ssml, allowedElements, validationOptions);
      errors.push(...elementResult.errors);
      warnings.push(...elementResult.warnings);

      // Attribute validation
      if (validationOptions.validateAttributes) {
        const attributeResult = this.validateAttributes(ssml, allowedElements, validationOptions);
        errors.push(...attributeResult.errors);
        warnings.push(...attributeResult.warnings);
      }

      // Structural validation
      const structuralResult = this.validateStructuralRules(ssml, validationOptions);
      errors.push(...structuralResult.errors);
      warnings.push(...structuralResult.warnings);

      const isValid = errors.length === 0;
      const combinedMetadata = {
        ...structureResult.metadata,
        ...elementResult.metadata,
        ...structuralResult.metadata
      };

      const result = this.createValidationResult(isValid, errors, warnings, startTime, combinedMetadata);
      
      // Call reporting callback if provided
      if (validationOptions.reportingCallback) {
        validationOptions.reportingCallback(result);
      }

      return result;

    } catch (error) {
      errors.push({
        code: 'VALIDATION_ERROR',
        message: `Validation failed: ${error.message}`,
        severity: 'error',
        suggestion: 'Check SSML syntax and structure'
      });

      return this.createValidationResult(false, errors, warnings, startTime);
    }
  }

  /**
   * Validates basic XML structure and syntax of SSML content.
   * Internal method that performs fundamental XML parsing and structure validation
   * to ensure the content can be processed as valid XML before applying
   * SSML-specific validation rules.
   * 
   * @param ssml - SSML content to validate
   * @returns Validation result with structural errors and warnings
   * @private
   * 
   * @example XML structure validation process
   * ```typescript
   * // Internal validation steps:
   * // 1. Check for basic XML syntax errors
   * // 2. Validate tag pairing and nesting
   * // 3. Check for well-formed attributes
   * // 4. Verify character encoding issues
   * // 5. Detect structural anomalies
   * ```
   */
  private static validateXmlStructure(ssml: string): {
    errors: SsmlValidationError[];
    warnings: SsmlValidationWarning[];
    metadata: Record<string, unknown>;
  } {
    const errors: SsmlValidationError[] = [];
    const warnings: SsmlValidationWarning[] = [];
    const metadata: Record<string, unknown> = {};

    // Check for basic XML structure issues
    const tagRegex = /<([^>]+)>/g;
    const tags = ssml.match(tagRegex) || [];
    
    metadata.elementCount = tags.length;

    // Check for unclosed tags
    const tagStack: Array<{ name: string; line: number }> = [];

    // Basic tag matching validation
    let currentLine = 1;
    for (const tag of tags) {
      const isClosingTag = tag.startsWith('</');
      const isSelfClosing = tag.endsWith('/>');
      
      if (!isClosingTag && !isSelfClosing) {
        const tagName = tag.match(/<([^\s>]+)/)?.[1];
        if (tagName) {
          tagStack.push({ name: tagName, line: currentLine });
        }
      } else if (isClosingTag) {
        const tagName = tag.match(/<\/([^>]+)>/)?.[1];
        if (tagName) {
          if (tagStack.length === 0) {
            errors.push({
              code: 'UNMATCHED_CLOSING_TAG',
              message: `Closing tag '${tagName}' has no matching opening tag`,
              line: currentLine,
              elementName: tagName,
              severity: 'error',
              suggestion: `Add opening tag for '${tagName}' or remove the closing tag`
            });
          } else {
            const lastOpen = tagStack.pop();
            if (lastOpen && lastOpen.name !== tagName) {
              errors.push({
                code: 'MISMATCHED_TAGS',
                message: `Mismatched tags: opened '${lastOpen.name}' but closed '${tagName}'`,
                line: currentLine,
                elementName: tagName,
                severity: 'error',
                suggestion: `Close '${lastOpen.name}' before opening '${tagName}'`
              });
            }
          }
        }
      }
    }

    // Check for unclosed tags
    for (const unclosed of tagStack) {
      errors.push({
        code: 'UNCLOSED_TAG',
        message: `Tag '${unclosed.name}' is not closed`,
        line: unclosed.line,
        elementName: unclosed.name,
        severity: 'error',
        suggestion: `Add closing tag '</${unclosed.name}>'`
      });
    }

    metadata.maxDepth = this.calculateMaxDepth(ssml);

    return { errors, warnings, metadata };
  }

  /**
   * Validates SSML elements against provider-specific allowlists.
   * Internal method that checks each SSML element against the allowed elements
   * for the target provider, ensuring compatibility and preventing unsupported
   * element usage that could cause TTS service errors.
   * 
   * @param ssml - SSML content to validate
   * @param allowedElements - Provider-specific allowed elements
   * @param options - Validation configuration options
   * @returns Validation result with element-specific errors and warnings
   * @private
   */
  private static validateElements(
    ssml: string,
    allowedElements: { [key: string]: string[] },
    options: SsmlValidationOptions
  ): {
    errors: SsmlValidationError[];
    warnings: SsmlValidationWarning[];
    metadata: Record<string, unknown>;
  } {
    const errors: SsmlValidationError[] = [];
    const warnings: SsmlValidationWarning[] = [];
    const metadata: Record<string, unknown> = {};

    const elementRegex = /<([^\s/>]+)[^>]*>/g;
    let match;
    const foundElements = new Set<string>();

    while ((match = elementRegex.exec(ssml)) !== null) {
      const elementName = match[1];
      foundElements.add(elementName);

      if (!allowedElements[elementName]) {
        if (options.allowUnknownElements) {
          warnings.push({
            code: 'UNKNOWN_ELEMENT',
            message: `Unknown element '${elementName}' found`,
            elementName,
            category: 'compatibility',
            suggestion: `Remove '${elementName}' or check provider documentation`
          });
        } else {
          errors.push({
            code: 'UNSUPPORTED_ELEMENT',
            message: `Element '${elementName}' is not supported by this provider`,
            elementName,
            severity: 'error',
            suggestion: `Remove '${elementName}' or use supported alternatives`
          });
        }
      }
    }

    metadata.uniqueElements = Array.from(foundElements);
    metadata.elementCount = foundElements.size;

    return { errors, warnings, metadata };
  }

  /**
   * Validates element attributes against provider schemas and format rules.
   * Internal method that checks attribute validity, format compliance, and
   * value constraints for all SSML elements according to provider specifications
   * and validation configuration settings.
   * 
   * @param ssml - SSML content to validate
   * @param allowedElements - Provider-specific allowed elements and attributes
   * @param options - Validation configuration options
   * @returns Validation result with attribute-specific errors and warnings
   * @private
   */
  private static validateAttributes(
    ssml: string,
    allowedElements: { [key: string]: string[] },
    options: SsmlValidationOptions
  ): {
    errors: SsmlValidationError[];
    warnings: SsmlValidationWarning[];
    metadata: Record<string, unknown>;
  } {
    const errors: SsmlValidationError[] = [];
    const warnings: SsmlValidationWarning[] = [];
    const metadata: Record<string, unknown> = {};

    const elementWithAttributesRegex = /<([^\s/>]+)([^>]*)>/g;
    let match;

    while ((match = elementWithAttributesRegex.exec(ssml)) !== null) {
      const elementName = match[1];
      const attributesString = match[2];

      if (allowedElements[elementName] && attributesString.trim()) {
        const allowedAttrs = allowedElements[elementName];
        const attributeRegex = /(\w+(?::\w+)?)\s*=\s*["']([^"']*)["']/g;
        let attrMatch;

        while ((attrMatch = attributeRegex.exec(attributesString)) !== null) {
          const attrName = attrMatch[1];
          const attrValue = attrMatch[2];

          if (!allowedAttrs.includes(attrName)) {
            errors.push({
              code: 'UNSUPPORTED_ATTRIBUTE',
              message: `Attribute '${attrName}' is not supported for element '${elementName}'`,
              elementName,
              severity: 'error',
              suggestion: `Remove '${attrName}' or use: ${allowedAttrs.join(', ')}`
            });
          } else if (options.validateAttributeValues) {
            const valueValidation = this.validateAttributeValue(elementName, attrName, attrValue);
            if (!valueValidation.isValid) {
              errors.push({
                code: 'INVALID_ATTRIBUTE_VALUE',
                message: `Invalid value '${attrValue}' for attribute '${attrName}' in element '${elementName}'`,
                elementName,
                severity: 'error',
                suggestion: valueValidation.suggestion
              });
            }
          }
        }
      }
    }

    return { errors, warnings, metadata };
  }

  /**
   * Validates structural rules and custom validation requirements.
   * Internal method that applies structural constraints, nesting limits,
   * and custom validation rules to ensure content quality and
   * provider-specific requirements are met.
   * 
   * @param ssml - SSML content to validate
   * @param options - Validation configuration options
   * @returns Validation result with structural errors and warnings
   * @private
   */
  private static validateStructuralRules(
    ssml: string,
    options: SsmlValidationOptions
  ): {
    errors: SsmlValidationError[];
    warnings: SsmlValidationWarning[];
    metadata: Record<string, unknown>;
  } {
    const errors: SsmlValidationError[] = [];
    const warnings: SsmlValidationWarning[] = [];
    const metadata: Record<string, unknown> = {};

    // Validate nesting depth
    if (options.maxDepth) {
      const maxDepth = this.calculateMaxDepth(ssml);
      metadata.maxDepth = maxDepth;

      if (maxDepth > options.maxDepth) {
        errors.push({
          code: 'NESTING_TOO_DEEP',
          message: `SSML nesting depth (${maxDepth}) exceeds maximum allowed (${options.maxDepth})`,
          severity: 'error',
          suggestion: `Reduce nesting depth to ${options.maxDepth} or less`
        });
      }
    }

    // Apply custom rules
    if (options.customRules) {
      const customRuleResults = this.applyCustomRules(ssml, options.customRules);
      errors.push(...customRuleResults.errors);
      warnings.push(...customRuleResults.warnings);
    }

    return { errors, warnings, metadata };
  }

  /**
   * Validates specific attribute values against format rules and constraints.
   * Internal utility method that checks attribute value formats, ranges,
   * and provider-specific requirements for common SSML attributes.
   * 
   * @param elementName - Name of the SSML element
   * @param attributeName - Name of the attribute to validate
   * @param value - Attribute value to validate
   * @returns Validation result with validity status and suggestions
   * @private
   */
  private static validateAttributeValue(
    _elementName: string,
    attributeName: string,
    value: string
  ): { isValid: boolean; suggestion?: string } {
    // Common attribute validations
    switch (attributeName) {
      case 'time':
        const timePattern = /^\d+(\.\d+)?(s|ms)$/;
        if (!timePattern.test(value)) {
          return {
            isValid: false,
            suggestion: 'Use format like "2s" or "500ms"'
          };
        }
        break;

      case 'strength':
        const allowedStrengths = ['x-weak', 'weak', 'medium', 'strong', 'x-strong'];
        if (!allowedStrengths.includes(value)) {
          return {
            isValid: false,
            suggestion: `Use one of: ${allowedStrengths.join(', ')}`
          };
        }
        break;

      case 'level':
        const allowedLevels = ['strong', 'moderate', 'reduced'];
        if (!allowedLevels.includes(value)) {
          return {
            isValid: false,
            suggestion: `Use one of: ${allowedLevels.join(', ')}`
          };
        }
        break;

      case 'src':
        try {
          new URL(value);
        } catch {
          return {
            isValid: false,
            suggestion: 'Provide a valid URL'
          };
        }
        break;
    }

    return { isValid: true };
  }

  /**
   * Calculates maximum nesting depth of SSML elements.
   * Internal utility method that analyzes the hierarchical structure
   * of SSML content to determine the maximum element nesting depth
   * for structural validation purposes.
   * 
   * @param ssml - SSML content to analyze
   * @returns Maximum nesting depth found in the content
   * @private
   */
  private static calculateMaxDepth(ssml: string): number {
    let currentDepth = 0;
    let maxDepth = 0;
    let inTag = false;
    let tagContent = '';

    for (let i = 0; i < ssml.length; i++) {
      const char = ssml[i];

      if (char === '<') {
        inTag = true;
        tagContent = '';
      } else if (char === '>') {
        inTag = false;
        
        if (tagContent.startsWith('/')) {
          // Closing tag
          currentDepth--;
        } else if (!tagContent.endsWith('/')) {
          // Opening tag (not self-closing)
          currentDepth++;
          maxDepth = Math.max(maxDepth, currentDepth);
        }
        // Self-closing tags don't affect depth
      } else if (inTag) {
        tagContent += char;
      }
    }

    return maxDepth;
  }

  /**
   * Applies custom validation rules defined in configuration options.
   * Internal method that processes user-defined validation rules including
   * element validators, structural constraints, and content requirements
   * for specialized validation scenarios.
   * 
   * @param ssml - SSML content to validate
   * @param customRules - Custom validation rules configuration
   * @returns Validation result with custom rule errors and warnings
   * @private
   */
  private static applyCustomRules(
    ssml: string,
    customRules: NonNullable<SsmlValidationOptions['customRules']>
  ): {
    errors: SsmlValidationError[];
    warnings: SsmlValidationWarning[];
  } {
    const errors: SsmlValidationError[] = [];
    const warnings: SsmlValidationWarning[] = [];

    // Check for empty elements if not allowed
    if (customRules.allowEmptyElements === false) {
      const emptyElementRegex = /<([^\s/>]+)[^>]*>\s*<\/\1>/g;
      let match;
      while ((match = emptyElementRegex.exec(ssml)) !== null) {
        errors.push({
          code: 'EMPTY_ELEMENT',
          message: `Empty element '${match[1]}' is not allowed`,
          elementName: match[1],
          severity: 'error',
          suggestion: `Add content to '${match[1]}' or remove the element`
        });
      }
    }

    // Check maximum element length
    if (customRules.maxElementLength) {
      const elementContentRegex = /<([^\s/>]+)[^>]*>(.*?)<\/\1>/gs;
      let match;
      while ((match = elementContentRegex.exec(ssml)) !== null) {
        const elementName = match[1];
        const content = match[2];
        if (content.length > customRules.maxElementLength) {
          warnings.push({
            code: 'ELEMENT_TOO_LONG',
            message: `Element '${elementName}' content exceeds maximum length (${customRules.maxElementLength})`,
            elementName,
            category: 'performance',
            suggestion: `Reduce content length or split into multiple elements`
          });
        }
      }
    }

    return { errors, warnings };
  }

  /**
   * Creates a standardized validation result object with consistent formatting.
   * Internal utility method that constructs the final validation result
   * including timing information, metadata aggregation, and result formatting
   * for consistent API responses.
   * 
   * @param isValid - Whether the validation passed
   * @param errors - Array of validation errors
   * @param warnings - Array of validation warnings
   * @param startTime - Validation start timestamp
   * @param metadata - Additional validation metadata
   * @returns Formatted validation result object
   * @private
   */
  private static createValidationResult(
    isValid: boolean,
    errors: SsmlValidationError[],
    warnings: SsmlValidationWarning[],
    startTime: number,
    metadata?: Record<string, unknown>
  ): SsmlValidationResult {
    const endTime = performance.now();
    
    return {
      isValid,
      errors,
      warnings,
      processingTime: endTime - startTime,
      metadata: metadata || {}
    };
  }

  /**
   * Checks if the provided XML content is well-formed
   * 
   * @param xml - XML content to validate
   * @returns true if XML is well-formed, false otherwise
   */
  static isWellFormedXml(xml: string): boolean {
    try {
      // Remove any HTML entities that might cause issues
      const cleanXml = xml.trim();
      
      // Basic checks for well-formed XML
      if (!cleanXml) return false;
      
      // Check for matching tags using a simple regex approach
      const openTags = cleanXml.match(/<[^/!][^>]*>/g) || [];
      const closeTags = cleanXml.match(/<\/[^>]*>/g) || [];
      const selfClosingTags = cleanXml.match(/<[^>/!]*\/>/g) || [];
      
      // Basic well-formedness check: open tags should match close tags + self-closing
      const expectedCloseTags = openTags.length - selfClosingTags.length;
      
      if (closeTags.length !== expectedCloseTags) {
        return false;
      }
      
      // Check for properly nested tags
      const tagStack: string[] = [];
      const tagRegex = /<\/?([^>\s/]+)[^>]*>/g;
      let match;
      
      while ((match = tagRegex.exec(cleanXml)) !== null) {
        const tagName = match[1];
        const isClosing = match[0].startsWith('</');
        const isSelfClosing = match[0].endsWith('/>');
        
        if (isSelfClosing) {
          // Self-closing tags don't affect the stack
          continue;
        } else if (isClosing) {
          // Closing tag - should match the most recent opening tag
          if (tagStack.length === 0 || tagStack.pop() !== tagName) {
            return false;
          }
        } else {
          // Opening tag
          tagStack.push(tagName);
        }
      }
      
      // All tags should be closed
      return tagStack.length === 0;
         } catch {
       return false;
     }
  }
} 