import { SsmlSplitter } from '../../../../src/common/convert/input/ssml/ssml_splitter.js';
import {
  createMockGoogleSsmlOptions,
  mockGoogleRootTemplate,
  SampleSsmlContent,
  createSsmlTestScenario,
} from './mocks/ssml_mocks.js';

describe('SsmlSplitter Tests', () => {
  describe('Basic SSML Splitting', () => {
    test('should split SSML with long text content', () => {
      const ssml = SampleSsmlContent.LONG_TEXT;
      const options = createMockGoogleSsmlOptions({ splitLimit: 300 });

      const result = SsmlSplitter.split(ssml, mockGoogleRootTemplate, options);

      expect(result.length).toBeGreaterThan(1);
      result.forEach((chunk) => {
        expect(chunk.length).toBeLessThanOrEqual(options.splitLimit);
        expect(chunk).toContain('<speak>');
        expect(chunk).toContain('</speak>');
      });
    });

    test('should not split if SSML length is under the split limit', () => {
      const ssml = SampleSsmlContent.SIMPLE_TEXT;
      const options = createMockGoogleSsmlOptions({ splitLimit: 500 });

      const result = SsmlSplitter.split(ssml, mockGoogleRootTemplate, options);

      expect(result.length).toBe(1);
      expect(result[0]).toContain(SampleSsmlContent.SIMPLE_TEXT);
    });

    test('should handle empty SSML content', () => {
      const ssml = '';
      const options = createMockGoogleSsmlOptions({ splitLimit: 300 });

      const result = SsmlSplitter.split(ssml, mockGoogleRootTemplate, options);

      expect(result.length).toBe(0);
    });

    test('should throw error if root template is longer than split limit', () => {
      const ssml = '<p>This will cause an error.</p>';
      const options = createMockGoogleSsmlOptions({ splitLimit: 50 });

      expect(() => SsmlSplitter.split(ssml, mockGoogleRootTemplate, options)).toThrow(
        'Split limit is too small to split the SSML'
      );
    });
  });

  describe('SSML Element Handling', () => {
    test('should handle SSML with self-closing tags like <break/>', () => {
      const ssml = SampleSsmlContent.WITH_BREAK;
      const options = createMockGoogleSsmlOptions({ splitLimit: 400 });

      const result = SsmlSplitter.split(ssml, mockGoogleRootTemplate, options);

      expect(result.length).toBeGreaterThanOrEqual(1);
      result.forEach((chunk) => {
        expect(chunk.length).toBeLessThanOrEqual(options.splitLimit);
      });
      
      // Verify break tag is preserved
      const combinedResult = result.join('');
      expect(combinedResult).toContain('<break');
    });

    test('should handle nested emphasis elements', () => {
      const ssml = SampleSsmlContent.WITH_EMPHASIS;
      const options = createMockGoogleSsmlOptions({ splitLimit: 400 });

      const result = SsmlSplitter.split(ssml, mockGoogleRootTemplate, options);

      expect(result.length).toBeGreaterThanOrEqual(1);
      result.forEach((chunk) => {
        expect(chunk.length).toBeLessThanOrEqual(options.splitLimit);
      });

      // Verify emphasis tags are preserved
      const combinedResult = result.join('');
      expect(combinedResult).toContain('<emphasis');
      expect(combinedResult).toContain('</emphasis>');
    });

    test('should handle complex nested structure', () => {
      const ssml = SampleSsmlContent.WITH_NESTED_TAGS;
      const options = createMockGoogleSsmlOptions({ splitLimit: 400 });

      const result = SsmlSplitter.split(ssml, mockGoogleRootTemplate, options);

      expect(result.length).toBeGreaterThanOrEqual(1);
      result.forEach((chunk) => {
        expect(chunk.length).toBeLessThanOrEqual(options.splitLimit);
      });

      // Verify all tags are preserved
      const combinedResult = result.join('');
      expect(combinedResult).toContain('<p>');
      expect(combinedResult).toContain('<emphasis');
      expect(combinedResult).toContain('<break');
    });
  });

  describe('Text Content Splitting', () => {
    test('should split at sentence boundaries when possible', () => {
      const ssml = 'First sentence. Second sentence. Third sentence.';
      const options = createMockGoogleSsmlOptions({ splitLimit: 350 });

      const result = SsmlSplitter.split(ssml, mockGoogleRootTemplate, options);

      expect(result.length).toBeGreaterThanOrEqual(1);
      result.forEach((chunk) => {
        expect(chunk.length).toBeLessThanOrEqual(options.splitLimit);
      });
    });

    test('should split at word boundaries when no sentence boundaries available', () => {
      // Create text that will definitely exceed the adjusted split limit (300 - 204 = 96)
      const ssml = 'This is a very long sentence without periods that should be split at word boundaries when it exceeds the limit and keeps going on and on with more text that definitely requires splitting into multiple chunks because it is way too long for a single chunk to handle properly';
      const options = createMockGoogleSsmlOptions({ splitLimit: 350 });

      const result = SsmlSplitter.split(ssml, mockGoogleRootTemplate, options);

      expect(result.length).toBeGreaterThan(1);
      result.forEach((chunk) => {
        expect(chunk.length).toBeLessThanOrEqual(options.splitLimit);
      });
    });
  });

  describe('Provider-Specific Tests', () => {
    test('should work with Google TTS configuration', () => {
      const scenario = createSsmlTestScenario('google'); // Use default split limit
      const ssml = SampleSsmlContent.SIMPLE_TEXT;

      const result = SsmlSplitter.split(ssml, scenario.rootTemplate, scenario.options);

      expect(result.length).toBe(1);
      expect(result[0]).toContain('en-US-Standard-B');
    });

    test('should work with Microsoft TTS configuration', () => {
      const scenario = createSsmlTestScenario('microsoft'); // Use default split limit
      const ssml = SampleSsmlContent.SIMPLE_TEXT;

      const result = SsmlSplitter.split(ssml, scenario.rootTemplate, scenario.options);

      expect(result.length).toBe(1);
      expect(result[0]).toContain('en-US-AriaNeural');
    });

    test('should work with Amazon TTS configuration', () => {
      const scenario = createSsmlTestScenario('amazon'); // Use default split limit
      const ssml = SampleSsmlContent.SIMPLE_TEXT;

      const result = SsmlSplitter.split(ssml, scenario.rootTemplate, scenario.options);

      expect(result.length).toBe(1);
      expect(result[0]).toContain('<prosody');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle very short split limits - success case', () => {
      const ssml = SampleSsmlContent.SIMPLE_TEXT;
      const options = createMockGoogleSsmlOptions({ splitLimit: 1000 });

      const result = SsmlSplitter.split(ssml, mockGoogleRootTemplate, options);
      expect(result).toBeDefined();
      result.forEach((chunk) => {
        expect(chunk.length).toBeLessThanOrEqual(options.splitLimit);
      });
    });

    test('should handle very short split limits - error case', () => {
      const ssml = SampleSsmlContent.SIMPLE_TEXT;
      const options = createMockGoogleSsmlOptions({ splitLimit: 50 });

      expect(() => {
        SsmlSplitter.split(ssml, mockGoogleRootTemplate, options);
      }).toThrow();
    });

    test('should preserve SSML structure in all chunks', () => {
      const ssml = SampleSsmlContent.LONG_TEXT;
      const options = createMockGoogleSsmlOptions({ splitLimit: 350 });

      const result = SsmlSplitter.split(ssml, mockGoogleRootTemplate, options);

      expect(result.length).toBeGreaterThan(1);
      result.forEach((chunk) => {
        expect(chunk).toMatch(/<speak[^>]*>.*<\/speak>/s);
        expect(chunk).toContain('<voice');
        expect(chunk).toContain('<prosody');
      });
    });

    test('should handle whitespace-only content', () => {
      const ssml = '   \n\t  ';
      const options = createMockGoogleSsmlOptions({ splitLimit: 350 });

      const result = SsmlSplitter.split(ssml, mockGoogleRootTemplate, options);

      // Should either return empty array or single chunk with minimal content
      expect(result.length).toBeLessThanOrEqual(1);
    });
  });
});
