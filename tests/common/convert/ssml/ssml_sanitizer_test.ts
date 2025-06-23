import { SsmlSanitizer } from '../../../../src/common/convert/input/ssml/ssml_sanitizer.js';
import { SsmlMinimizer } from '../../../../src/common/convert/input/ssml/ssml_minimizer.js';
import { 
  SampleSsmlContent
} from './mocks/ssml_mocks.js';
import { GOOGLE_SSML_ALLOWED_ELEMENTS } from '../../../../src/google/convert/input/ssml/ssml_schema.js';
import { MICROSOFT_SSML_ALLOWED_ELEMENTS } from '../../../../src/microsoft/convert/input/ssml/ssml_schema.js';
import { AMAZON_SSML_ALLOWED_ELEMENTS } from '../../../../src/amazon/convert/input/ssml/ssml_schema.js';

describe('SsmlSanitizer Tests', () => {
  describe('Basic Tag Sanitization', () => {
    test('should remove unsupported SSML tags', () => {
      const ssml = '<speak>Hello <unsupported>world</unsupported>!</speak>';
      const sanitized = SsmlSanitizer.sanitize(ssml, GOOGLE_SSML_ALLOWED_ELEMENTS);
      expect(sanitized).toBe('Hello world!');
    });

    test('should remove unsupported attributes', () => {
      const ssml = '<speak><emphasis level="strong" unsupported="value">Hello</emphasis></speak>';
      const sanitized = SsmlSanitizer.sanitize(ssml, GOOGLE_SSML_ALLOWED_ELEMENTS);
      expect(sanitized).toBe('<emphasis level="strong">Hello</emphasis>');
    });

    test('should preserve supported SSML tags and attributes', () => {
      const ssml = '<speak><emphasis level="strong">Hello</emphasis></speak>';
      const sanitized = SsmlSanitizer.sanitize(ssml, GOOGLE_SSML_ALLOWED_ELEMENTS);
      expect(sanitized).toBe('<emphasis level="strong">Hello</emphasis>');
    });

    test('should handle self-closing tags', () => {
      const ssml = SampleSsmlContent.WITH_BREAK;
      const sanitized = SsmlSanitizer.sanitize(ssml, GOOGLE_SSML_ALLOWED_ELEMENTS);
      expect(sanitized).toContain('<break time="500ms"/>');
      expect(sanitized).not.toContain('<speak>');
    });

    test('should handle empty SSML input', () => {
      const ssml = '';
      const sanitized = SsmlSanitizer.sanitize(ssml, GOOGLE_SSML_ALLOWED_ELEMENTS);
      expect(sanitized).toBe('');
    });
  });

  describe('Nested Structure Handling', () => {
    test('should handle nested SSML tags', () => {
      const ssml = '<speak><p><s>Hello <emphasis level="strong">world</emphasis>!</s></p></speak>';
      const sanitized = SsmlSanitizer.sanitize(ssml, GOOGLE_SSML_ALLOWED_ELEMENTS);
      expect(sanitized).toBe('<p><s>Hello <emphasis level="strong">world</emphasis>!</s></p>');
    });

    test('should remove unsupported nested tags', () => {
      const ssml = '<speak><p><unsupported>Hello</unsupported> <s>world</s></p></speak>';
      const sanitized = SsmlSanitizer.sanitize(ssml, GOOGLE_SSML_ALLOWED_ELEMENTS);
      expect(sanitized).toBe('<p>Hello <s>world</s></p>');
    });

    test('should handle complex nested structure from samples', () => {
      const ssml = SampleSsmlContent.WITH_NESTED_TAGS;
      const sanitized = SsmlSanitizer.sanitize(ssml, GOOGLE_SSML_ALLOWED_ELEMENTS);
      expect(sanitized).toContain('<p>');
      expect(sanitized).toContain('<emphasis');
      expect(sanitized).toContain('<break');
      expect(sanitized).not.toContain('unsupported');
    });

    test('should handle deeply nested disallowed elements', () => {
      const ssml = '<speak><foo><bar>Text</bar></foo><p>Allowed</p></speak>';
      const sanitized = SsmlSanitizer.sanitize(ssml, GOOGLE_SSML_ALLOWED_ELEMENTS);
      expect(sanitized).toBe('Text<p>Allowed</p>');
    });
  });

  describe('Attribute Handling', () => {
    test('should retain allowed elements and attributes', () => {
      const ssml = '<speak><emphasis level="strong">Important</emphasis></speak>';
      const sanitized = SsmlSanitizer.sanitize(ssml, GOOGLE_SSML_ALLOWED_ELEMENTS);
      expect(sanitized).toBe('<emphasis level="strong">Important</emphasis>');
    });

    test('should remove disallowed attributes from allowed elements', () => {
      const ssml = '<speak><emphasis level="strong" style="bold">Important</emphasis></speak>';
      const sanitized = SsmlSanitizer.sanitize(ssml, GOOGLE_SSML_ALLOWED_ELEMENTS);
      expect(sanitized).toBe('<emphasis level="strong">Important</emphasis>');
    });

    test('should handle mixed supported and unsupported attributes', () => {
      const ssml = `
        <speak>
          <audio src="audio.mp3" unsupported="value" clipBegin="2s">
            <emphasis level="strong" invalid="attr">Hello</emphasis>
          </audio>
        </speak>
      `;
      const sanitized = SsmlSanitizer.sanitize(ssml, GOOGLE_SSML_ALLOWED_ELEMENTS);
      expect(sanitized).toContain('src="audio.mp3"');
      expect(sanitized).toContain('clipBegin="2s"');
      expect(sanitized).toContain('level="strong"');
      expect(sanitized).not.toContain('unsupported=');
      expect(sanitized).not.toContain('invalid=');
    });
  });

  describe('Content Preservation', () => {
    test('should remove disallowed elements but keep their content', () => {
      const ssml = '<speak><foo>Disallowed</foo><p>Allowed</p></speak>';
      const sanitized = SsmlSanitizer.sanitize(ssml, GOOGLE_SSML_ALLOWED_ELEMENTS);
      expect(sanitized).toBe('Disallowed<p>Allowed</p>');
    });

    test('should handle SSML with only unsupported elements', () => {
      const ssml = '<unsupported>Hello world</unsupported>';
      const sanitized = SsmlSanitizer.sanitize(ssml, GOOGLE_SSML_ALLOWED_ELEMENTS);
      expect(sanitized).toBe('Hello world');
    });

    test('should remove empty text nodes', () => {
      const ssml = '<speak>   <p>Text</p>   </speak>';
      const sanitized = SsmlSanitizer.sanitize(ssml, GOOGLE_SSML_ALLOWED_ELEMENTS);
      expect(sanitized).toBe('<p>Text</p>');
    });
  });

  describe('Complex SSML Processing', () => {
    test('should handle complex SSML with multiple elements', () => {
      const ssml = `
        <speak>
          <p>
            <s>This is a <emphasis level="strong">strong</emphasis> sentence with a <break time="1s"/> pause.</s>
          </p>
          <p>
            <s>Another sentence with <sub alias="SSML">Speech Synthesis Markup Language</sub>.</s>
          </p>
        </speak>
      `;
      const sanitized = SsmlSanitizer.sanitize(ssml, GOOGLE_SSML_ALLOWED_ELEMENTS);
      expect(sanitized).toContain('<emphasis level="strong">');
      expect(sanitized).toContain('<break time="1s"/>');
      expect(sanitized).toContain('<sub alias="SSML">');
      expect(sanitized).not.toContain('unsupported');
    });

    test('should handle SSML with multiple allowed and disallowed elements', () => {
      const ssml = `
        <speak>
          <audio src="file.mp3" volume="loud" soundLevel="1.2">Fallback text</audio>
          <emphasis level="strong" customAttr="value">Important</emphasis>
          <invalid>Invalid content</invalid>
          <p>Valid content</p>
        </speak>`;
      const sanitized = SsmlSanitizer.sanitize(ssml, GOOGLE_SSML_ALLOWED_ELEMENTS);
      expect(sanitized).toBe(
        '<audio src="file.mp3" soundLevel="1.2">Fallback text</audio><emphasis level="strong">Important</emphasis>Invalid content<p>Valid content</p>',
      );
    });

    test('should handle SSML with deeply nested allowed and disallowed elements', () => {
      const ssml = `
        <speak>
          <audio src="file.mp3" volume="loud" soundLevel="1.2">
            Fallback text
            <invalid>
              Invalid content
              <p>Nested valid content</p>
              <invalid>Deeper invalid content</invalid>
            </invalid>
          </audio>
          <emphasis level="strong" customAttr="value">
            Important
            <invalid>
              More invalid content
              <emphasis level="strong">Nested allowed element</emphasis>
            </invalid>
          </emphasis>
          <invalid>Another invalid element with <p>valid content inside</p></invalid>
        </speak>`;

      const sanitized = SsmlSanitizer.sanitize(ssml, GOOGLE_SSML_ALLOWED_ELEMENTS);
      expect(SsmlMinimizer.minimize(sanitized)).toBe(
        '<audio src="file.mp3" soundLevel="1.2">Fallback text Invalid content <p>Nested valid content</p>Deeper invalid content</audio>' +
          '<emphasis level="strong">Important More invalid content <emphasis level="strong">Nested allowed element</emphasis></emphasis>' +
          'Another invalid element with <p>valid content inside</p>',
      );
    });
  });

  describe('Provider-Specific Schema Testing', () => {
    test('should sanitize using Google SSML schema', () => {
      const ssml = SampleSsmlContent.WITH_UNSUPPORTED_ELEMENTS;
      const sanitized = SsmlSanitizer.sanitize(ssml, GOOGLE_SSML_ALLOWED_ELEMENTS);
      expect(sanitized).toContain('<emphasis>world</emphasis>');
      expect(sanitized).not.toContain('<unsupported>');
    });

    test('should sanitize using Microsoft SSML schema', () => {
      const ssml = '<speak><mstts:express-as style="cheerful">Hello</mstts:express-as><unsupported>world</unsupported></speak>';
      const sanitized = SsmlSanitizer.sanitize(ssml, MICROSOFT_SSML_ALLOWED_ELEMENTS);
      expect(sanitized).toContain('mstts:express-as');
      expect(sanitized).not.toContain('<unsupported>');
    });

    test('should sanitize using Amazon SSML schema', () => {
      const ssml = '<speak><amazon:domain name="news">Hello</amazon:domain><unsupported>world</unsupported></speak>';
      const sanitized = SsmlSanitizer.sanitize(ssml, AMAZON_SSML_ALLOWED_ELEMENTS);
      expect(sanitized).toContain('amazon:domain');
      expect(sanitized).not.toContain('<unsupported>');
    });
  });

  describe('Edge Cases', () => {
    test('should handle malformed XML gracefully', () => {
      const ssml = '<speak>Hello <unclosed world</speak>';
      expect(() => {
        const sanitized = SsmlSanitizer.sanitize(ssml, GOOGLE_SSML_ALLOWED_ELEMENTS);
        // Should either work or throw a descriptive error
        expect(typeof sanitized).toBe('string');
      }).not.toThrow(/unexpected/i);
    });

    test('should handle XML with CDATA sections', () => {
      const ssml = '<speak><![CDATA[Hello world]]></speak>';
      const sanitized = SsmlSanitizer.sanitize(ssml, GOOGLE_SSML_ALLOWED_ELEMENTS);
      expect(sanitized).toContain('Hello world');
    });

    test('should handle XML namespaces', () => {
      const ssml = '<speak xmlns:custom="http://example.com"><custom:tag>Hello</custom:tag></speak>';
      const sanitized = SsmlSanitizer.sanitize(ssml, GOOGLE_SSML_ALLOWED_ELEMENTS);
      expect(sanitized).toContain('Hello');
      expect(sanitized).not.toContain('custom:tag');
    });
  });
});
