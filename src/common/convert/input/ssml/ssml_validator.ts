import { DOMParser } from '@xmldom/xmldom';

export interface SsmlValidationResult {
  isValid: boolean;
  errors: SsmlValidationError[];
  warnings: SsmlValidationWarning[];
}

export interface SsmlValidationError {
  code: string;
  message: string;
  line?: number;
  column?: number;
  element?: string;
}

export interface SsmlValidationWarning {
  code: string;
  message: string;
  line?: number;
  column?: number;
  element?: string;
}

export enum SsmlValidationErrorCodes {
  INVALID_XML = 'INVALID_XML',
  MISSING_SPEAK_TAG = 'MISSING_SPEAK_TAG',
  UNSUPPORTED_ELEMENT = 'UNSUPPORTED_ELEMENT',
  UNSUPPORTED_ATTRIBUTE = 'UNSUPPORTED_ATTRIBUTE',
  INVALID_ATTRIBUTE_VALUE = 'INVALID_ATTRIBUTE_VALUE',
  NESTED_ELEMENT_ERROR = 'NESTED_ELEMENT_ERROR',
  EMPTY_CONTENT = 'EMPTY_CONTENT',
}

export class SsmlValidator {
  private constructor() {}

  /**
   * Validates SSML content against the provided allowed elements schema
   * @param ssml - The SSML content to validate
   * @param allowedElements - Schema of allowed elements and their attributes
   * @returns Validation result with errors and warnings
   */
  static validate(
    ssml: string,
    allowedElements: { [key: string]: string[] },
  ): SsmlValidationResult {
    const result: SsmlValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    // Basic input validation
    if (!ssml || ssml.trim().length === 0) {
      result.errors.push({
        code: SsmlValidationErrorCodes.EMPTY_CONTENT,
        message: 'SSML content cannot be empty',
      });
      result.isValid = false;
      return result;
    }

    try {
      // Parse XML and validate structure
      const document = new DOMParser({
        errorHandler: {
          warning: (msg) => {
            result.warnings.push({
              code: 'XML_WARNING',
              message: msg,
            });
          },
          error: (msg) => {
            result.errors.push({
              code: SsmlValidationErrorCodes.INVALID_XML,
              message: `XML parsing error: ${msg}`,
            });
            result.isValid = false;
          },
          fatalError: (msg) => {
            result.errors.push({
              code: SsmlValidationErrorCodes.INVALID_XML,
              message: `XML fatal error: ${msg}`,
            });
            result.isValid = false;
          },
        },
      }).parseFromString(ssml, 'text/xml');

      if (!result.isValid) {
        return result;
      }

      // Validate SSML structure
      SsmlValidator._validateStructure(document, allowedElements, result);
      
    } catch (error) {
      result.errors.push({
        code: SsmlValidationErrorCodes.INVALID_XML,
        message: `Failed to parse SSML: ${error.message}`,
      });
      result.isValid = false;
    }

    return result;
  }

  /**
   * Quick validation that only checks if SSML is well-formed XML
   * @param ssml - The SSML content to validate
   * @returns true if valid XML, false otherwise
   */
  static isWellFormedXml(ssml: string): boolean {
    try {
      const document = new DOMParser({
        errorHandler: {
          error: () => {
            throw new Error('Invalid XML');
          },
          fatalError: () => {
            throw new Error('Fatal XML error');
          },
        },
      }).parseFromString(ssml, 'text/xml');
      
      // Check for parsererror element which indicates malformed XML
      const errors = document.getElementsByTagName('parsererror');
      return errors.length === 0;
    } catch {
      return false;
    }
  }

  private static _validateStructure(
    document: Document,
    allowedElements: { [key: string]: string[] },
    result: SsmlValidationResult,
  ): void {
    const rootElement = document.documentElement;

    // Check if root element is <speak> or if speak is allowed
    if (rootElement.nodeName !== 'speak' && !allowedElements['speak']) {
      result.warnings.push({
        code: SsmlValidationErrorCodes.MISSING_SPEAK_TAG,
        message: 'SSML should be wrapped in <speak> tag',
        element: rootElement.nodeName,
      });
    }

    // Recursively validate all elements
    SsmlValidator._validateElement(rootElement, allowedElements, result);
  }

  private static _validateElement(
    element: Element,
    allowedElements: { [key: string]: string[] },
    result: SsmlValidationResult,
  ): void {
    const elementName = element.nodeName;

    // Check if element is allowed
    if (!allowedElements[elementName]) {
      result.errors.push({
        code: SsmlValidationErrorCodes.UNSUPPORTED_ELEMENT,
        message: `Element '${elementName}' is not supported`,
        element: elementName,
      });
      result.isValid = false;
      return; // Don't validate children of unsupported elements
    }

    // Validate attributes
    const allowedAttributes = allowedElements[elementName] || [];
    Array.from(element.attributes).forEach((attribute) => {
      if (!allowedAttributes.includes(attribute.name)) {
        result.errors.push({
          code: SsmlValidationErrorCodes.UNSUPPORTED_ATTRIBUTE,
          message: `Attribute '${attribute.name}' is not supported for element '${elementName}'`,
          element: elementName,
        });
        result.isValid = false;
      } else {
        // Validate attribute values (can be extended)
        SsmlValidator._validateAttributeValue(
          elementName,
          attribute.name,
          attribute.value,
          result,
        );
      }
    });

    // Recursively validate child elements
    Array.from(element.childNodes).forEach((child) => {
      if (child.nodeType === child.ELEMENT_NODE) {
        SsmlValidator._validateElement(child as Element, allowedElements, result);
      }
    });
  }

  private static _validateAttributeValue(
    elementName: string,
    attributeName: string,
    attributeValue: string,
    result: SsmlValidationResult,
  ): void {
    // Basic attribute value validation
    // This can be extended with specific validation rules per element/attribute
    
    if (!attributeValue || attributeValue.trim().length === 0) {
      result.warnings.push({
        code: SsmlValidationErrorCodes.INVALID_ATTRIBUTE_VALUE,
        message: `Empty value for attribute '${attributeName}' in element '${elementName}'`,
        element: elementName,
      });
    }

    // Add specific validation rules here
    // For example, validate time values, rate values, etc.
    if (attributeName === 'time' && elementName === 'break') {
      if (!SsmlValidator._isValidTimeValue(attributeValue)) {
        result.errors.push({
          code: SsmlValidationErrorCodes.INVALID_ATTRIBUTE_VALUE,
          message: `Invalid time value '${attributeValue}' for break element`,
          element: elementName,
        });
        result.isValid = false;
      }
    }
  }

  private static _isValidTimeValue(value: string): boolean {
    // Validate time values like "2s", "500ms", etc.
    const timePattern = /^\d+(\.\d+)?(s|ms)$/;
    return timePattern.test(value);
  }
} 