import { TextSanitizer } from '../../../../src/common/convert/input/text/text_sanitizer.js';
import { 
  SampleTextContent,
  TextTestScenarios
} from './mocks/text_mocks.js';

describe('TextSanitizer Tests', () => {
  describe('Basic Text Sanitization', () => {
    test('should remove HTML tags from text', () => {
      const text = 'Hello <b>world</b>!';
      const sanitized = TextSanitizer.sanitize(text);
      expect(sanitized).toBe('Hello world!');
    });

    test('should handle empty text', () => {
      const text = SampleTextContent.EMPTY;
      const sanitized = TextSanitizer.sanitize(text);
      expect(sanitized).toBe('');
    });

    test('should preserve plain text without HTML', () => {
      const text = SampleTextContent.SHORT;
      const sanitized = TextSanitizer.sanitize(text);
      expect(sanitized).toBe(SampleTextContent.SHORT);
    });

    test('should handle text with special characters', () => {
      const text = SampleTextContent.WITH_SPECIAL_CHARS;
      const sanitized = TextSanitizer.sanitize(text);
      expect(sanitized).toBe(SampleTextContent.WITH_SPECIAL_CHARS);
    });
  });

  describe('HTML Tag Removal', () => {
    test('should remove multiple HTML tags', () => {
      const text = 'This is <strong>bold</strong> and <em>italic</em> text.';
      const sanitized = TextSanitizer.sanitize(text);
      expect(sanitized).toBe('This is bold and italic text.');
    });

    test('should remove nested HTML tags', () => {
      const text = '<div><p>Hello <span>nested</span> content</p></div>';
      const sanitized = TextSanitizer.sanitize(text);
      expect(sanitized).toBe('Hello nested content');
    });

    test('should remove self-closing HTML tags', () => {
      const text = 'Line 1<br/>Line 2<hr/>Line 3';
      const sanitized = TextSanitizer.sanitize(text);
      expect(sanitized).toBe('Line 1Line 2Line 3');
    });

    test('should handle malformed HTML tags', () => {
      const text = 'Hello <unclosed world';
      const sanitized = TextSanitizer.sanitize(text);
      expect(sanitized).toContain('Hello');
      expect(sanitized).not.toContain('<');
    });
  });

  describe('Content Preservation', () => {
    test('should preserve punctuation', () => {
      const text = SampleTextContent.WITH_PUNCTUATION;
      const sanitized = TextSanitizer.sanitize(text);
      expect(sanitized).toContain('!');
      expect(sanitized).toContain('?');
      expect(sanitized).toContain(',');
    });

    test('should preserve numbers', () => {
      const text = SampleTextContent.WITH_NUMBERS;
      const sanitized = TextSanitizer.sanitize(text);
      expect(sanitized).toContain('2024');
      expect(sanitized).toContain('365');
    });

    test('should preserve multilingual content', () => {
      const text = SampleTextContent.MULTILINGUAL;
      const sanitized = TextSanitizer.sanitize(text);
      expect(sanitized).toContain('Hello');
      expect(sanitized).toContain('Bonjour');
      expect(sanitized).toContain('Hola');
    });
  });

  describe('Whitespace Handling', () => {
    test('should normalize whitespace', () => {
      const text = 'Hello    world   with   extra   spaces';
      const sanitized = TextSanitizer.sanitize(text);
      expect(sanitized).toBe('Hello world with extra spaces');
    });

    test('should trim leading and trailing whitespace', () => {
      const text = '   Hello world   ';
      const sanitized = TextSanitizer.sanitize(text);
      expect(sanitized).toBe('Hello world');
    });

    test('should handle mixed whitespace characters', () => {
      const text = 'Hello\t\nworld\r\n';
      const sanitized = TextSanitizer.sanitize(text);
      expect(sanitized).toBe('Hello world');
    });
  });

  describe('Special Characters and Entities', () => {
    test('should handle HTML entities', () => {
      const text = 'Hello &amp; goodbye &lt;world&gt;';
      const sanitized = TextSanitizer.sanitize(text);
      expect(sanitized).toBe('Hello & goodbye <world>');
    });

    test('should preserve Unicode characters', () => {
      const text = 'Unicode: 🌍 emoji and ñoño characters';
      const sanitized = TextSanitizer.sanitize(text);
      expect(sanitized).toContain('🌍');
      expect(sanitized).toContain('ñoño');
    });

    test('should handle mixed HTML and entities', () => {
      const text = '<p>Hello &amp; <strong>world</strong> &lt;test&gt;</p>';
      const sanitized = TextSanitizer.sanitize(text);
      expect(sanitized).toBe('Hello & world <test>');
    });
  });

  describe('Edge Cases', () => {
    test('should handle only HTML tags with no content', () => {
      const text = '<div></div><span></span>';
      const sanitized = TextSanitizer.sanitize(text);
      expect(sanitized).toBe('');
    });

    test('should handle text with only whitespace and HTML', () => {
      const text = '   <p>   </p>   ';
      const sanitized = TextSanitizer.sanitize(text);
      expect(sanitized).toBe('');
    });

    test('should handle complex nested structure with mixed content', () => {
      const text = `
        <html>
          <head><title>Title</title></head>
          <body>
            <h1>Header</h1>
            <p>Paragraph with <a href="link">link</a> and <em>emphasis</em>.</p>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </body>
        </html>
      `;
      const sanitized = TextSanitizer.sanitize(text);
      expect(sanitized).toContain('Title');
      expect(sanitized).toContain('Header');
      expect(sanitized).toContain('Paragraph');
      expect(sanitized).toContain('link');
      expect(sanitized).toContain('Item 1');
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
    });
  });

  describe('Test Scenarios Validation', () => {
    test('should handle basic text scenario', () => {
      const scenario = TextTestScenarios.BASIC_TEXT;
      const sanitized = TextSanitizer.sanitize(scenario.input);
      expect(sanitized).toBe(scenario.input); // No HTML to remove
    });

    test('should handle special characters scenario', () => {
      const scenario = TextTestScenarios.SPECIAL_CHARACTERS;
      const sanitized = TextSanitizer.sanitize(scenario.input);
      expect(sanitized).toBe(scenario.input); // No HTML to remove
    });

    test('should handle empty text scenario', () => {
      const scenario = TextTestScenarios.EMPTY_TEXT;
      const sanitized = TextSanitizer.sanitize(scenario.input);
      expect(sanitized).toBe('');
    });
  });
});
