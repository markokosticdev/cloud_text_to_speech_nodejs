import { TextSanitizer } from "../../../../src/common/convert/input/text/text_sanitizer.js";

describe('TextSanitizer Tests', () => {
  test('should remove HTML tags and trim spaces', () => {
    const text = '<div>Hello <strong>World</strong></div>';
    const sanitized = TextSanitizer.sanitize(text);
    expect(sanitized).toBe('Hello World');
  });

  test('should remove self-closing tags', () => {
    const text = 'Hello <br/> World';
    const sanitized = TextSanitizer.sanitize(text);
    expect(sanitized).toBe('Hello  World');
  });

  test('should remove multiple HTML tags', () => {
    const text = '<p>This is <a href="#">a link</a> in a paragraph.</p>';
    const sanitized = TextSanitizer.sanitize(text);
    expect(sanitized).toBe('This is a link in a paragraph.');
  });

  test('should remove nested tags', () => {
    const text = '<div><p><span>Nested content</span></p></div>';
    const sanitized = TextSanitizer.sanitize(text);
    expect(sanitized).toBe('Nested content');
  });

  test('should handle text with no HTML tags', () => {
    const text = 'Just plain text';
    const sanitized = TextSanitizer.sanitize(text);
    expect(sanitized).toBe('Just plain text');
  });

  test('should trim leading and trailing spaces', () => {
    const text = '    <p>   Trim me   </p>    ';
    const sanitized = TextSanitizer.sanitize(text);
    expect(sanitized).toBe('Trim me');
  });

  test('should handle empty string input', () => {
    const text = '';
    const sanitized = TextSanitizer.sanitize(text);
    expect(sanitized).toBe('');
  });

  test('should handle string with only HTML tags', () => {
    const text = '<div></div><p></p>';
    const sanitized = TextSanitizer.sanitize(text);
    expect(sanitized).toBe('');
  });
});
