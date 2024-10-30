import { TextMinimizer } from "../../../../src/common/convert/input/text/text_minimizer.js";

describe('TextMinimizer Tests', () => {
  test('should remove multiple spaces and trim the text', () => {
    const text = 'Hello    World   ';
    const minimized = TextMinimizer.minimize(text);
    expect(minimized).toBe('Hello World');
  });

  test('should replace tabs and newlines with a single space', () => {
    const text = 'Hello\tWorld\nThis\tis\nmultiline';
    const minimized = TextMinimizer.minimize(text);
    expect(minimized).toBe('Hello World This is multiline');
  });

  test('should collapse multiple spaces into a single space', () => {
    const text = 'Hello     World     multiple      spaces';
    const minimized = TextMinimizer.minimize(text);
    expect(minimized).toBe('Hello World multiple spaces');
  });

  test('should trim leading and trailing whitespace', () => {
    const text = '   Hello World   ';
    const minimized = TextMinimizer.minimize(text);
    expect(minimized).toBe('Hello World');
  });

  test('should handle text with no extra spaces or newlines', () => {
    const text = 'Hello World';
    const minimized = TextMinimizer.minimize(text);
    expect(minimized).toBe('Hello World');
  });

  test('should handle empty strings', () => {
    const text = '';
    const minimized = TextMinimizer.minimize(text);
    expect(minimized).toBe('');
  });

  test('should handle text with only spaces, tabs, and newlines', () => {
    const text = '   \t\n   \t\n';
    const minimized = TextMinimizer.minimize(text);
    expect(minimized).toBe('');
  });

  test('should handle text with only tabs and newlines', () => {
    const text = '\t\t\n\n';
    const minimized = TextMinimizer.minimize(text);
    expect(minimized).toBe('');
  });
});
