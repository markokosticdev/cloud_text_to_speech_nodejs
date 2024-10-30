import { SsmlRootTemplateMapper, SsmlSplitter } from "../../../../src/common/convert/input/ssml/ssml_splitter.js";
import { ConvertSsmlOptionsGoogle } from "../../../../src/google/convert/convert_ssml_options.js";
import { SSML_ALLOWED_ELEMENTS } from "../../../../src/google/convert/convert_params_defaults.js";
import { SsmlMinimizer } from "../../../../src/common/convert/input/ssml/ssml_minimizer.js";

describe('SsmlSplitter Tests', () => {
  const rootTemplate: SsmlRootTemplateMapper = (ssml: string): string => `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
      <voice xml:lang="en-US" xml:gender="Male" name="dummy-voice">
        <prosody rate="1.0" pitch="0">
          ${ssml}
        </prosody>
      </voice>
    </speak>`;

  const rootTemplateMinimized = (text: string): string =>
    SsmlMinimizer.minimize(rootTemplate(text));

  test('should split SSML with long text content', () => {
    const ssml = 'This is a long sentence that needs to be split into multiple chunks. It contains various words, sentences, and other elements that will trigger the split logic to run.';
    const options = new ConvertSsmlOptionsGoogle({ splitLimit: 300, allowedElements: SSML_ALLOWED_ELEMENTS });

    const result = SsmlSplitter.split(ssml, rootTemplate, options);

    const resultContent = [
      'This is a long sentence that needs to be split into multiple chunks.',
      'It contains various words, sentences, and other elements that will trigger the split logic to run.',
    ];

    result.forEach((chunk, index) => {
      expect(chunk.length).toBeLessThanOrEqual(options.splitLimit);
      expect(chunk).toEqual(rootTemplateMinimized(resultContent[index]));
    });
  });

  test('should handle SSML with multiple elements and nested tags', () => {
    const ssml = `
      <p>This is a paragraph with a sentence.</p>
      <p>Here's another paragraph with more content, including a <break time="500ms"/> pause.</p>
      <s>Sentence within sentence tags.</s>
    `;
    const options = new ConvertSsmlOptionsGoogle({ splitLimit: 250, allowedElements: SSML_ALLOWED_ELEMENTS });

    const result = SsmlSplitter.split(ssml, rootTemplate, options);

    const resultContent = [
      '<p>This is a paragraph with a sentence.</p>',
      '<p>Here\'s another paragraph with more content,</p>',
      '<p>including a <break time="500ms"/> pause.</p>',
      '<s>Sentence within sentence tags.</s>',
    ];

    result.forEach((chunk, index) => {
      expect(chunk.length).toBeLessThanOrEqual(options.splitLimit);
      expect(chunk).toEqual(rootTemplateMinimized(resultContent[index]));
    });
  });

  test('should split when SSML contains long sentences with commas and periods', () => {
    const ssml = 'This is a long sentence, which continues, and is very lengthy. It needs to be split into several chunks.';
    const options = new ConvertSsmlOptionsGoogle({ splitLimit: 250, allowedElements: SSML_ALLOWED_ELEMENTS });

    const result = SsmlSplitter.split(ssml, rootTemplate, options);

    const resultContent = [
      'This is a long sentence, which continues,',
      'and is very lengthy.',
      'It needs to be split into several chunks.',
    ];

    result.forEach((chunk, index) => {
      expect(chunk.length).toBeLessThanOrEqual(options.splitLimit);
      expect(chunk).toEqual(rootTemplateMinimized(resultContent[index]));
    });
  });

  test('should throw error if root template is longer than split limit', () => {
    const ssml = '<p>This will cause an error.</p>';
    const options = new ConvertSsmlOptionsGoogle({ splitLimit: 50, allowedElements: SSML_ALLOWED_ELEMENTS });

    expect(() => SsmlSplitter.split(ssml, rootTemplate, options)).toThrow(
      'Split limit is too small to split the SSML'
    );
  });

  test('should not split if SSML length is under the split limit', () => {
    const ssml = '<p>This is a short SSML string.</p>';
    const options = new ConvertSsmlOptionsGoogle({ splitLimit: 250, allowedElements: SSML_ALLOWED_ELEMENTS });

    const result = SsmlSplitter.split(ssml, rootTemplate, options);

    const resultContent = [
      '<p>This is a short SSML string.</p>',
    ];

    result.forEach((chunk, index) => {
      expect(chunk.length).toBeLessThanOrEqual(options.splitLimit);
      expect(chunk).toEqual(rootTemplateMinimized(resultContent[index]));
    });
  });

  test('should handle SSML with self-closing tags like <break/>', () => {
    const ssml = '<p>Text before break.</p><break time="500ms"/><p>Text after break.</p>';
    const options = new ConvertSsmlOptionsGoogle({ splitLimit: 270, allowedElements: SSML_ALLOWED_ELEMENTS });

    const result = SsmlSplitter.split(ssml, rootTemplate, options);

    const resultContent = [
      '<p>Text before break.</p><break time="500ms"/><p>Text after break.</p>',
    ];

    result.forEach((chunk, index) => {
      expect(chunk.length).toBeLessThanOrEqual(options.splitLimit);
      expect(chunk).toEqual(rootTemplateMinimized(resultContent[index]));
      expect(chunk).toContain('<break');
    });

  });

  test('should handle nested elements in SSML', () => {
    const ssml = '<p>This <emphasis level="strong">sentence</emphasis> contains <sub alias="SSML">SSML</sub> elements.</p>';
    const options = new ConvertSsmlOptionsGoogle({ splitLimit: 270, allowedElements: SSML_ALLOWED_ELEMENTS });

    const result = SsmlSplitter.split(ssml, rootTemplate, options);

    const resultContent = [
      '<p>This <emphasis level="strong">sentence</emphasis>contains</p>',
      '<p><sub alias="SSML">SSML</sub>elements.</p>',
    ];

    result.forEach((chunk, index) => {
      expect(chunk.length).toBeLessThanOrEqual(options.splitLimit);
      expect(chunk).toEqual(rootTemplateMinimized(resultContent[index]));
    });
  });

  test('should handle SSML with no content', () => {
    const ssml = '';
    const options = new ConvertSsmlOptionsGoogle({ splitLimit: 250, allowedElements: SSML_ALLOWED_ELEMENTS });

    const result = SsmlSplitter.split(ssml, rootTemplate, options);

    expect(result.length).toBe(0);
  });

  test('should handle SSML with mixed content types (text, pauses, emphasis)', () => {
    const ssml = `
      This is a sentence with an <emphasis level="moderate">emphasized part</emphasis> and a <break time="1s"/> pause.
      Another sentence follows with more content.
    `;
    const options = new ConvertSsmlOptionsGoogle({ splitLimit: 250, allowedElements: SSML_ALLOWED_ELEMENTS });

    const result = SsmlSplitter.split(ssml, rootTemplate, options);

    const resultContent = [
      'This is a sentence with an',
      '<emphasis level="moderate">emphasized</emphasis>',
      '<emphasis level="moderate">part</emphasis>and a',
      '<break time="1s"/>pause.',
      'Another sentence follows with more content.',
    ];

    result.forEach((chunk, index) => {
      expect(chunk.length).toBeLessThanOrEqual(options.splitLimit);
      expect(chunk).toEqual(rootTemplateMinimized(resultContent[index]));
    });
  });

  test('should handle deep nesting with multiple paragraph and sentence tags', () => {
    const ssml = `
      <p>This is a paragraph.</p>
      <p>
        <s>
          This sentence contains nested tags, and
          <emphasis level="strong">emphasized text</emphasis> within a sentence.
        </s>
        <s>
          The next sentence contains a break
          <break time="500ms"/>
          and more nested tags.
        </s>
      </p>
    `;
    const options = new ConvertSsmlOptionsGoogle({ splitLimit: 300, allowedElements: SSML_ALLOWED_ELEMENTS });

    const result = SsmlSplitter.split(ssml, rootTemplate, options);

    const resultContent = [
      '<p>This is a paragraph.</p><p><s>This sentence contains nested tags,</s></p>',
      '<p><s>and <emphasis level="strong">emphasized</emphasis></s></p>',
      '<p><s><emphasis level="strong">text</emphasis>within a sentence.</s></p>',
      '<p><s></s><s>The next sentence contains a break</s></p>',
      '<p><s><break time="500ms"/>and more nested tags.</s></p>',
    ];

    result.forEach((chunk, index) => {
      expect(chunk.length).toBeLessThanOrEqual(options.splitLimit);
      expect(chunk).toEqual(rootTemplateMinimized(resultContent[index]));
    });
  });

  test('should handle deeply nested prosody and emphasis tags', () => {
    const ssml = `
      <prosody rate="medium">
        This is the first level of prosody.
        <prosody pitch="+2st">
          Inside another prosody tag with pitch adjustment.
          <emphasis level="moderate">
            Emphasized text inside deeply nested prosody tags.
          </emphasis>
        </prosody>
      </prosody>
    `;
    const options = new ConvertSsmlOptionsGoogle({ splitLimit: 360, allowedElements: SSML_ALLOWED_ELEMENTS });

    const result = SsmlSplitter.split(ssml, rootTemplate, options);

    const resultContent = [
      '<prosody rate="medium">This is the first level of prosody.</prosody>',
      '<prosody rate="medium"><prosody pitch="+2st">Inside another prosody tag with pitch adjustment.</prosody></prosody>',
      '<prosody rate="medium"><prosody pitch="+2st"><emphasis level="moderate">Emphasized text inside deeply nested prosody tags.</emphasis></prosody></prosody>',
    ];

    result.forEach((chunk, index) => {
      expect(chunk.length).toBeLessThanOrEqual(options.splitLimit);
      expect(chunk).toEqual(rootTemplateMinimized(resultContent[index]));
    });
  });

  test('should handle multiple levels of nesting with breaks and emphasis', () => {
    const ssml = `
      <p>
        <s>
          Sentence 1, with a nested
          <emphasis level="strong">strong emphasis</emphasis>
          tag.
        </s>
        <s>
          Sentence 2 follows, with a
          <break time="1s"/> pause and deeper
          <prosody pitch="-2st">prosody control</prosody>.
        </s>
      </p>
      <p>
        <s>
          Sentence 3, another deeply nested
          <emphasis level="reduced">reduced emphasis</emphasis>
          sentence.
        </s>
      </p>
    `;
    const options = new ConvertSsmlOptionsGoogle({ splitLimit: 300, allowedElements: SSML_ALLOWED_ELEMENTS });

    const result = SsmlSplitter.split(ssml, rootTemplate, options);

    const resultContent = [
      '<p><s>Sentence 1,</s></p>',
      '<p><s>with a nested <emphasis level="strong">strong</emphasis></s></p>',
      '<p><s><emphasis level="strong">emphasis</emphasis>tag.</s></p>',
      '<p><s></s><s>Sentence 2 follows,</s></p>',
      '<p><s>with a <break time="1s"/>pause and deeper <prosody pitch="-2st">prosody</prosody></s></p>',
      '<p><s><prosody pitch="-2st">control</prosody>.</s></p><p><s></s></p>',
      '<p><s>Sentence 3,</s></p>',
      '<p><s>another deeply nested <emphasis level="reduced">reduced</emphasis></s></p>',
      '<p><s><emphasis level="reduced">emphasis</emphasis>sentence.</s></p>',
    ];

    result.forEach((chunk, index) => {
      expect(chunk.length).toBeLessThanOrEqual(options.splitLimit);
      expect(chunk).toEqual(rootTemplateMinimized(resultContent[index]));
    });
  });

  test('should handle complex SSML with nested sub, emphasis, and break elements', () => {
    const ssml = `
      <p>This is a test of deep nesting.</p>
      <p>
        <s>
          The first sentence contains a sub tag:
          <sub alias="alternative text">original text</sub>.
        </s>
        <s>
          Followed by a sentence with an emphasis:
          <emphasis level="moderate">moderate emphasis</emphasis>
          and a <break time="1s"/> pause.
        </s>
      </p>
    `;
    const options = new ConvertSsmlOptionsGoogle({ splitLimit: 200, allowedElements: SSML_ALLOWED_ELEMENTS });

    const result = SsmlSplitter.split(ssml, rootTemplate, options);

    expect(result.length).toBeGreaterThan(1); // Expect deep nested SSML to be split
    result.forEach(chunk => {
      expect(chunk).toContain('<speak');
      expect(chunk).toContain('</speak>');
    });
  });

  test('should handle multiple nested levels of speech', () => {
    const ssml = `
      <p>
        <s>
          This <emphasis level="strong">deeply nested</emphasis> SSML example contains multiple levels.
          <break time="500ms"/> It will be split.
        </s>
        <s>
          Here is a second sentence within a paragraph that includes
          <prosody rate="slow">
            <emphasis level="reduced">prosody</emphasis> and emphasis within nested levels.
          </prosody>
        </s>
      </p>
    `;
    const options = new ConvertSsmlOptionsGoogle({ splitLimit: 200, allowedElements: SSML_ALLOWED_ELEMENTS });

    const result = SsmlSplitter.split(ssml, rootTemplate, options);

    // Check if deep nesting with multiple speech elements works correctly
    expect(result.length).toBeGreaterThan(1);
    result.forEach(chunk => {
      expect(chunk).toContain('<speak');
      expect(chunk).toContain('</speak>');
    });
  });

  test('should handle SSML with nested phoneme, prosody, and emphasis', () => {
    const ssml = `
      <p>
        <s>
          The phoneme example includes nested content:
          <phoneme alphabet="ipa" ph="tɛst">test</phoneme>
          and an <emphasis level="moderate">emphasized word</emphasis>.
        </s>
        <s>
          The next sentence includes a <prosody pitch="-2st">pitch shift</prosody>
          and a <break time="700ms"/> pause.
        </s>
      </p>
    `;
    const options = new ConvertSsmlOptionsGoogle({ splitLimit: 320, allowedElements: SSML_ALLOWED_ELEMENTS });

    const result = SsmlSplitter.split(ssml, rootTemplate, options);

    const resultContent = [
      '<p><s>The phoneme example includes nested content:</s></p>',
      '<p><s><phoneme alphabet="ipa" ph="tɛst">test</phoneme>and an <emphasis level="moderate">emphasized</emphasis></s></p>',
      '<p><s><emphasis level="moderate">word</emphasis>.</s><s>The next sentence includes a</s></p>',
      '<p><s><prosody pitch="-2st">pitch</prosody></s></p>',
      '<break time="1s"/>pause.',
      'Another sentence follows with more content.',
    ];

    result.forEach((chunk, index) => {
      expect(chunk.length).toBeLessThanOrEqual(options.splitLimit);
      expect(chunk).toEqual(rootTemplateMinimized(resultContent[index]));
    });
  });
});
