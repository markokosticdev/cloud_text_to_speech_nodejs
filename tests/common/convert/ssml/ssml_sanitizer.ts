import { SsmlSanitizer } from "../../../../src/common/convert/input/ssml/ssml_sanitizer.js";
import { SSML_ALLOWED_ELEMENTS } from "../../../../src/google/convert/convert_params_defaults.js";
import { SsmlMinimizer } from "../../../../src/common/convert/input/ssml/ssml_minimizer.js";

describe('SsmlSanitizer Tests', () => {
  test('should wrap SSML without <speak> in <speak> tags', () => {
    const ssml = 'Hello world';
    const sanitized = SsmlSanitizer.sanitize(ssml, SSML_ALLOWED_ELEMENTS);
    expect(sanitized).toBe('Hello world');
  });

  test('should retain allowed elements and attributes', () => {
    const ssml = '<speak><emphasis level="strong">Important</emphasis></speak>';
    const sanitized = SsmlSanitizer.sanitize(ssml, SSML_ALLOWED_ELEMENTS);
    expect(sanitized).toBe('<emphasis level="strong">Important</emphasis>');
  });

  test('should remove disallowed attributes from allowed elements', () => {
    const ssml = '<speak><emphasis level="strong" style="bold">Important</emphasis></speak>';
    const sanitized = SsmlSanitizer.sanitize(ssml, SSML_ALLOWED_ELEMENTS);
    expect(sanitized).toBe('<emphasis level="strong">Important</emphasis>');
  });

  test('should remove disallowed elements but keep their content', () => {
    const ssml = '<speak><foo>Disallowed</foo><p>Allowed</p></speak>';
    const sanitized = SsmlSanitizer.sanitize(ssml, SSML_ALLOWED_ELEMENTS);
    expect(sanitized).toBe('Disallowed<p>Allowed</p>');
  });

  test('should handle deeply nested disallowed elements', () => {
    const ssml = '<speak><foo><bar>Text</bar></foo><p>Allowed</p></speak>';
    const sanitized = SsmlSanitizer.sanitize(ssml, SSML_ALLOWED_ELEMENTS);
    expect(sanitized).toBe('Text<p>Allowed</p>');
  });

  test('should remove empty text nodes', () => {
    const ssml = '<speak>   <p>Text</p>   </speak>';
    const sanitized = SsmlSanitizer.sanitize(ssml, SSML_ALLOWED_ELEMENTS);
    expect(sanitized).toBe('<p>Text</p>');
  });

  test('should handle SSML with multiple allowed and disallowed elements', () => {
    const ssml = `
      <speak>
        <audio src="file.mp3" volume="loud" soundLevel="1.2">Fallback text</audio>
        <emphasis level="strong" customAttr="value">Important</emphasis>
        <invalid>Invalid content</invalid>
        <p>Valid content</p>
      </speak>`;
    const sanitized = SsmlSanitizer.sanitize(ssml, SSML_ALLOWED_ELEMENTS);
    expect(sanitized).toBe('<audio src="file.mp3" soundLevel="1.2">Fallback text</audio><emphasis level="strong">Important</emphasis>Invalid content<p>Valid content</p>');
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

    const sanitized = SsmlSanitizer.sanitize(ssml, SSML_ALLOWED_ELEMENTS);
    expect(SsmlMinimizer.minimize(sanitized)).toBe(
      '<audio src="file.mp3" soundLevel="1.2">Fallback text Invalid content <p>Nested valid content</p>Deeper invalid content</audio>' +
      '<emphasis level="strong">Important More invalid content <emphasis level="strong">Nested allowed element</emphasis></emphasis>' +
      'Another invalid element with <p>valid content inside</p>'
    );
  });
});
