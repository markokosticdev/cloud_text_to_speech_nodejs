import { SsmlValidator } from '../../../../src/common/convert/input/ssml/ssml_validator.js';
import { GOOGLE_SSML_ALLOWED_ELEMENTS } from '../../../../src/common/convert/input/ssml/schemas/google_ssml_schema.js';

describe('SSML Validation Tests', () => {
  test('should validate basic SSML content', () => {
    const ssml = '<speak>Hello world</speak>';
    const result = SsmlValidator.validate(ssml, GOOGLE_SSML_ALLOWED_ELEMENTS);
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should detect invalid XML', () => {
    const ssml = '<speak>Hello <unclosed>world</speak>';
    const result = SsmlValidator.validate(ssml, GOOGLE_SSML_ALLOWED_ELEMENTS);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('should detect unsupported elements', () => {
    const ssml = '<speak><unsupported>Hello</unsupported></speak>';
    const result = SsmlValidator.validate(ssml, GOOGLE_SSML_ALLOWED_ELEMENTS);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'UNSUPPORTED_ELEMENT')).toBe(true);
  });

  test('should detect unsupported attributes', () => {
    const ssml = '<speak><emphasis level="strong" unsupported="value">Hello</emphasis></speak>';
    const result = SsmlValidator.validate(ssml, GOOGLE_SSML_ALLOWED_ELEMENTS);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'UNSUPPORTED_ATTRIBUTE')).toBe(true);
  });

  test('should validate supported SSML elements and attributes', () => {
    const ssml = `
      <speak>
        <p>
          <s>Hello <emphasis level="strong">world</emphasis>!</s>
        </p>
        <break time="500ms"/>
        <sub alias="TTS">Text to Speech</sub>
      </speak>
    `;
    
    const result = SsmlValidator.validate(ssml, GOOGLE_SSML_ALLOWED_ELEMENTS);
    expect(result.isValid).toBe(true);
  });

  test('should handle empty content', () => {
    const ssml = '';
    const result = SsmlValidator.validate(ssml, GOOGLE_SSML_ALLOWED_ELEMENTS);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'EMPTY_CONTENT')).toBe(true);
  });

  test('should validate XML structure without speak wrapper', () => {
    const ssml = '<p>Hello world</p>';
    const result = SsmlValidator.validate(ssml, GOOGLE_SSML_ALLOWED_ELEMENTS);
    
    // Should be valid XML structure even without speak tag
    expect(result.isValid).toBe(true);
    // But might generate warnings in future versions
    expect(result.warnings.length).toBeGreaterThanOrEqual(0);
  });

  test('should check if XML is well-formed', () => {
    const wellFormed = '<speak>Hello world</speak>';
    const malformed = '<speak>Hello <unclosed world</speak>'; // missing closing bracket
    
    expect(SsmlValidator.isWellFormedXml(wellFormed)).toBe(true);
    expect(SsmlValidator.isWellFormedXml(malformed)).toBe(false);
  });
}); 