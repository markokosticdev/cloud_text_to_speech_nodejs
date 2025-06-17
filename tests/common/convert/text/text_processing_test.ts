import { TextBase } from '../../../../src/common/convert/input/text/text_base.js';
import { TextOptions } from '../../../../src/common/convert/input/text/text_options.js';

// Mock implementation for testing
class TestTextOptions extends TextOptions {
  constructor() {
    super(
      { splitLimit: 1000 },
      {}
    );
  }
}

class TestTextImplementation extends TextBase<string, TestTextOptions> {
  protected textRootTemplate(text: string): string {
    return `<speak>${text}</speak>`;
  }
}

describe('Text Processing Tests', () => {
  test('should process plain text correctly', () => {
    const textProcessor = new TestTextImplementation({
      text: 'Hello world! This is a test.',
      rate: '1.0',
      pitch: '0',
      voice: 'test-voice',
      options: new TestTextOptions(),
    });

    const result = textProcessor.processedTextChunks();
    
    expect(result).toHaveLength(1);
    expect(result[0]).toContain('Hello world! This is a test.');
    expect(result[0]).toContain('<speak>');
  });

  test('should process text chunks correctly', () => {
    const textProcessor = new TestTextImplementation({
      textChunks: ['Hello world!', 'This is another chunk.'],
      rate: '1.0',
      pitch: '0',
      voice: 'test-voice',
      options: new TestTextOptions(),
    });

    const result = textProcessor.processedTextChunks();
    
    expect(result).toHaveLength(2);
    expect(result[0]).toContain('Hello world!');
    expect(result[1]).toContain('This is another chunk.');
  });

  test('should handle long text with splitting', () => {
    const longText = 'This is a very long text that should be split into multiple chunks. '.repeat(20);
    
    const textProcessor = new TestTextImplementation({
      text: longText,
      rate: '1.0',
      pitch: '0',
      voice: 'test-voice',
      options: new TestTextOptions(),
    });

    const result = textProcessor.processedTextChunks();
    
    // Should split into multiple chunks due to length
    expect(result.length).toBeGreaterThan(1);
    
    // All chunks should be properly wrapped
    result.forEach(chunk => {
      expect(chunk).toContain('<speak>');
      expect(chunk).toContain('</speak>');
    });
  });

  test('should validate constructor parameters', () => {
    // Should throw if neither voice nor voiceId provided
    expect(() => {
      new TestTextImplementation({
        text: 'Hello',
        rate: '1.0',
        pitch: '0',
        options: new TestTextOptions(),
      });
    }).toThrow('Either voice or voiceId must be provided');

    // Should throw if both voice and voiceId provided
    expect(() => {
      new TestTextImplementation({
        text: 'Hello',
        rate: '1.0',
        pitch: '0',
        voice: 'test-voice',
        voiceId: 'test-id',
        options: new TestTextOptions(),
      });
    }).toThrow('Only voice or voiceId must be provided');

    // Should throw if neither text nor textChunks provided
    expect(() => {
      new TestTextImplementation({
        rate: '1.0',
        pitch: '0',
        voice: 'test-voice',
        options: new TestTextOptions(),
      });
    }).toThrow('Either input or textChunks must be provided');
  });
}); 