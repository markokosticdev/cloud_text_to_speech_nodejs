import {
  TextRootTemplateMapper,
  TextSplitter,
} from '../../../../src/common/convert/input/text/text_splitter.js';
import { SsmlMinimizer } from '../../../../src/common/convert/input/ssml/ssml_minimizer.js';
import { ConvertTextOptionsGoogle } from '../../../../src/google/convert/convert_text_options.js';

describe('TextSplitter Tests', () => {
  const mockRootTemplate: TextRootTemplateMapper = (text: string): string => `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
      <voice xml:lang="en-US" xml:gender="Male" name="dummy-voice">
        <prosody rate="1.0" pitch="0">
          ${text}
        </prosody>
      </voice>
    </speak>`;

  const rootTemplateMinimized = (text: string): string =>
    SsmlMinimizer.minimize(mockRootTemplate(text));

  test('should split text at period before split limit', () => {
    const text =
      'This is a test. Here is another sentence. This is yet another sentence.';
    const options = new ConvertTextOptionsGoogle({ splitLimit: 250 });

    const result = TextSplitter.split(text, mockRootTemplate, options);

    const resultContent = [
      'This is a test. Here is another sentence.',
      'This is yet another sentence.',
    ];

    result.forEach((chunk, index) => {
      expect(chunk.length).toBeLessThanOrEqual(options.splitLimit);
      expect(chunk).toEqual(rootTemplateMinimized(resultContent[index]));
    });
  });

  test('should split text at comma if no period found', () => {
    const text =
      'This is a test, and it has a comma, no period, yet another clause.';
    const options = new ConvertTextOptionsGoogle({ splitLimit: 250 });

    const result = TextSplitter.split(text, mockRootTemplate, options);

    const resultContent = [
      'This is a test, and it has a comma, no period,',
      'yet another clause.',
    ];

    result.forEach((chunk, index) => {
      expect(chunk.length).toBeLessThanOrEqual(options.splitLimit);
      expect(chunk).toEqual(rootTemplateMinimized(resultContent[index]));
    });
  });

  test('should split text at the split limit if no period or comma is found', () => {
    const text =
      'This is a long sentence with no commas or periods that needs to be split.';
    const options = new ConvertTextOptionsGoogle({ splitLimit: 250 });

    const result = TextSplitter.split(text, mockRootTemplate, options);

    const resultContent = [
      'This is a long sentence with no commas or periods',
      'that needs to be split.',
    ];

    result.forEach((chunk, index) => {
      expect(chunk.length).toBeLessThanOrEqual(options.splitLimit);
      expect(chunk).toEqual(rootTemplateMinimized(resultContent[index]));
    });
  });

  test('should not split text if it fits within the split limit', () => {
    const text = 'This is a short sentence that fits the limit.';
    const options = new ConvertTextOptionsGoogle({ splitLimit: 300 });

    const result = TextSplitter.split(text, mockRootTemplate, options);

    const resultContent = ['This is a short sentence that fits the limit.'];

    result.forEach((chunk, index) => {
      expect(chunk.length).toBeLessThanOrEqual(options.splitLimit);
      expect(chunk).toEqual(rootTemplateMinimized(resultContent[index]));
    });
  });

  test('should handle text with multiple periods and commas', () => {
    const text =
      'This is a test. Another test, with more commas. Finally, the last sentence.';
    const options = new ConvertTextOptionsGoogle({ splitLimit: 250 });

    const result = TextSplitter.split(text, mockRootTemplate, options);

    const resultContent = [
      'This is a test. Another test, with more commas.',
      'Finally, the last sentence.',
    ];

    result.forEach((chunk, index) => {
      expect(chunk.length).toBeLessThanOrEqual(options.splitLimit);
      expect(chunk).toEqual(rootTemplateMinimized(resultContent[index]));
    });
  });

  test('should handle long continuous text with no periods or commas', () => {
    const text =
      'ThisIsALongContinuousTextWithoutAnyPeriodsOrCommasSoItShouldSplitAtTheLimit';
    const options = new ConvertTextOptionsGoogle({ splitLimit: 250 });

    const result = TextSplitter.split(text, mockRootTemplate, options);

    const resultContent = [
      'ThisIsALongContinuousTextWithoutAnyPeriodsOrCommasS',
      'oItShouldSplitAtTheLimit',
    ];

    result.forEach((chunk, index) => {
      expect(chunk.length).toBeLessThanOrEqual(options.splitLimit);
      expect(chunk).toEqual(rootTemplateMinimized(resultContent[index]));
    });
  });

  test('should handle text that ends with a period or comma', () => {
    const text =
      'This sentence ends with a period. Another sentence ends with a comma,';
    const options = new ConvertTextOptionsGoogle({ splitLimit: 250 });

    const result = TextSplitter.split(text, mockRootTemplate, options);

    const resultContent = [
      'This sentence ends with a period.',
      'Another sentence ends with a comma,',
    ];

    result.forEach((chunk, index) => {
      expect(chunk.length).toBeLessThanOrEqual(options.splitLimit);
      expect(chunk).toEqual(rootTemplateMinimized(resultContent[index]));
    });
  });

  test('should split very long text into appropriate chunks', () => {
    const text = `
      This is a very long piece of text that needs to be split into chunks.
      Each chunk should be split at a natural break point, either a period or a comma,
      and if no such punctuation is found before the limit, it should split exactly at the limit.
      The goal is to handle large blocks of text and ensure they are split cleanly.
    `;
    const options = new ConvertTextOptionsGoogle({ splitLimit: 290 });

    const result = TextSplitter.split(text, mockRootTemplate, options);

    const resultContent = [
      'This is a very long piece of text that needs to be split into chunks.',
      'Each chunk should be split at a natural break point, either a period or a comma,',
      'and if no such punctuation is found before the limit,',
      'it should split exactly at the limit.',
      'The goal is to handle large blocks of text and ensure they are split cleanly.',
    ];

    result.forEach((chunk, index) => {
      expect(chunk.length).toBeLessThanOrEqual(options.splitLimit);
      expect(chunk).toEqual(rootTemplateMinimized(resultContent[index]));
    });
  });

  test('should handle text with a mix of short and long sentences', () => {
    const text =
      'Short. This is a much longer sentence that might need splitting. Another short one.';
    const options = new ConvertTextOptionsGoogle({ splitLimit: 250 });

    const result = TextSplitter.split(text, mockRootTemplate, options);

    const resultContent = [
      'Short.',
      'This is a much longer sentence that might need',
      'splitting. Another short one.',
    ];

    result.forEach((chunk, index) => {
      expect(chunk.length).toBeLessThanOrEqual(options.splitLimit);
      expect(chunk).toEqual(rootTemplateMinimized(resultContent[index]));
    });
  });

  test('should split long text with complex punctuation', () => {
    const text = `
      This is a complex example, where there are lots of commas, semicolons;
      and other punctuation marks. The goal is to split this properly,
      so that it remains readable and doesn't cut off in the middle of a thought,
      sentence, or phrase.
    `;
    const options = new ConvertTextOptionsGoogle({ splitLimit: 270 });

    const result = TextSplitter.split(text, mockRootTemplate, options);

    const resultContent = [
      'This is a complex example, where there are lots of commas,',
      'semicolons; and other punctuation marks.',
      'The goal is to split this properly,',
      "so that it remains readable and doesn't cut off in the middle of",
      'a thought, sentence, or phrase.',
    ];

    result.forEach((chunk, index) => {
      expect(chunk.length).toBeLessThanOrEqual(options.splitLimit);
      expect(chunk).toEqual(rootTemplateMinimized(resultContent[index]));
    });
  });

  test('should handle a large block of text with no punctuation at all', () => {
    const text = `
      ThisIsOneLargeBlockOfTextThatHasNoPunctuationMarksAndNeedsToBeSplitCleanlyAtTheLimitToEnsureItDoesNotExceedTheAllowedLengthForAnyChunk
    `;
    const options = new ConvertTextOptionsGoogle({ splitLimit: 250 });

    const result = TextSplitter.split(text, mockRootTemplate, options);

    const resultContent = [
      'ThisIsOneLargeBlockOfTextThatHasNoPunctuationMarksA',
      'ndNeedsToBeSplitCleanlyAtTheLimitToEnsureItDoesNotE',
      'xceedTheAllowedLengthForAnyChunk',
    ];

    result.forEach((chunk, index) => {
      expect(chunk.length).toBeLessThanOrEqual(options.splitLimit);
      expect(chunk).toEqual(rootTemplateMinimized(resultContent[index]));
    });
  });
});
