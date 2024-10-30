import { SsmlMinimizer } from "../../../../src/common/convert/input/ssml/ssml_minimizer.js";

describe('SsmlMinimizer Tests', () => {
  test('should minimize extra spaces between words', () => {
    const ssml = '<speak>Hello     World</speak>';
    const minimized = SsmlMinimizer.minimize(ssml);
    expect(minimized).toBe('<speak>Hello World</speak>');
  });

  test('should replace tabs and newlines with a single space', () => {
    const ssml = `<speak>Hello\tWorld\nThis\tis\nmultiline</speak>`;
    const minimized = SsmlMinimizer.minimize(ssml);
    expect(minimized).toBe('<speak>Hello World This is multiline</speak>');
  });

  test('should collapse multiple spaces into a single space', () => {
    const ssml = '<speak>Hello     World     multiple      spaces</speak>';
    const minimized = SsmlMinimizer.minimize(ssml);
    expect(minimized).toBe('<speak>Hello World multiple spaces</speak>');
  });

  test('should trim leading and trailing spaces inside the SSML', () => {
    const ssml = '   <speak>   Hello World   </speak>   ';
    const minimized = SsmlMinimizer.minimize(ssml);
    expect(minimized).toBe('<speak>Hello World</speak>');
  });

  test('should remove spaces between opening tags and content', () => {
    const ssml = '<speak> <p>   Hello World   </p> </speak>';
    const minimized = SsmlMinimizer.minimize(ssml);
    expect(minimized).toBe('<speak><p>Hello World</p></speak>');
  });

  test('should remove spaces after closing tags', () => {
    const ssml = '<speak><p>Hello World</p>  </speak>';
    const minimized = SsmlMinimizer.minimize(ssml);
    expect(minimized).toBe('<speak><p>Hello World</p></speak>');
  });

  test('should handle self-closing tags with spaces around them', () => {
    const ssml = '<speak><break time="1s"/>   Hello World  </speak>';
    const minimized = SsmlMinimizer.minimize(ssml);
    expect(minimized).toBe('<speak><break time="1s"/>Hello World</speak>');
  });

  test('should preserve one space before opening tag if there is text before the tag', () => {
    const ssml = 'Hello     <p>World</p> <break time="1s"/>   More text <p>End</p>';
    const minimized = SsmlMinimizer.minimize(ssml);
    expect(minimized).toBe('Hello <p>World</p><break time="1s"/>More text <p>End</p>');
  });

  test('should handle SSML with multiple tags and spaces', () => {
    const ssml = `
      <speak>
        <p>   Hello    World  </p>
        <break time="1s" />
        <p>  Multiple     spaces  </p>
      </speak>`;
    const minimized = SsmlMinimizer.minimize(ssml);
    expect(minimized).toBe('<speak><p>Hello World</p><break time="1s"/><p>Multiple spaces</p></speak>');
  });

  test('should handle empty SSML tags and extra spaces', () => {
    const ssml = '<speak>   <p>   </p>   </speak>';
    const minimized = SsmlMinimizer.minimize(ssml);
    expect(minimized).toBe('<speak><p></p></speak>');
  });
});
