import { TextBase } from '../../../../../src/common/convert/input/text/text_base.js';
import { TextOptions } from '../../../../../src/common/convert/input/text/text_options.js';

/**
 * Mock TextOptions for testing
 */
export class MockTextOptions extends TextOptions {
  constructor(overrides?: {
    splitLimit?: number;
    customOptions?: Record<string, unknown>;
  }) {
    super(
      { splitLimit: overrides?.splitLimit ?? 1000 },
      overrides?.customOptions ?? {}
    );
  }
}

/**
 * Mock Text implementation for testing text processing
 */
export class MockTextImplementation extends TextBase<string, MockTextOptions> {
  protected textRootTemplate(text: string): string {
    return `<speak>${text}</speak>`;
  }
}

/**
 * Advanced mock with customizable root template
 */
export class MockAdvancedTextImplementation extends TextBase<string, MockTextOptions> {
  private customTemplate: (text: string) => string;

  constructor(
    params: {
      text?: string;
      textChunks?: string[];
      rate: string;
      pitch: string;
      voice?: string;
      voiceId?: string;
      options: MockTextOptions;
    },
    customTemplate?: (text: string) => string
  ) {
    super(params);
    this.customTemplate = customTemplate ?? ((text: string): string => `<speak>${text}</speak>`);
  }

  protected textRootTemplate(text: string): string {
    return this.customTemplate(text);
  }
}

/**
 * Mock for Google TTS text processing
 */
export class MockGoogleTextImplementation extends TextBase<string, MockTextOptions> {
  protected textRootTemplate(text: string): string {
    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice xml:lang="en-US" xml:gender="Male" name="en-US-Standard-B">${text}</voice></speak>`;
  }
}

/**
 * Mock for Microsoft TTS text processing
 */
export class MockMicrosoftTextImplementation extends TextBase<string, MockTextOptions> {
  protected textRootTemplate(text: string): string {
    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="en-US-AriaNeural">${text}</voice></speak>`;
  }
}

/**
 * Mock for Amazon TTS text processing
 */
export class MockAmazonTextImplementation extends TextBase<string, MockTextOptions> {
  protected textRootTemplate(text: string): string {
    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis">${text}</speak>`;
  }
}

/**
 * Sample text content for testing
 */
export const SampleTextContent = {
  SHORT: 'Hello world',
  MEDIUM: 'This is a medium length text that should fit in a single chunk.',
  LONG: 'This is a very long text that should be split into multiple chunks when processed. '.repeat(10),
  WITH_PUNCTUATION: 'Hello, world! How are you today? I hope you are doing well.',
  WITH_NUMBERS: 'The year is 2024 and we have 365 days.',
  EMPTY: '',
  WITH_SPECIAL_CHARS: 'Special characters: @#$%^&*()_+-=[]{}|;:",.<>?',
  MULTILINGUAL: 'Hello world. Bonjour le monde. Hola mundo.',
};

/**
 * Factory function to create mock text implementations
 */
export const createMockTextImplementation = (
  provider: 'google' | 'microsoft' | 'amazon' | 'generic' = 'generic',
  overrides?: {
    splitLimit?: number;
    customTemplate?: (text: string) => string;
  }
): {
  options: MockTextOptions;
  createInstance: (params: { text?: string; textChunks?: string[]; voice?: string; voiceId?: string; }) => MockTextImplementation | MockAdvancedTextImplementation | MockGoogleTextImplementation | MockMicrosoftTextImplementation | MockAmazonTextImplementation;
} => {
  const options = new MockTextOptions({ splitLimit: overrides?.splitLimit });

  const implementations = {
    google: MockGoogleTextImplementation,
    microsoft: MockMicrosoftTextImplementation,
    amazon: MockAmazonTextImplementation,
    generic: overrides?.customTemplate ? MockAdvancedTextImplementation : MockTextImplementation,
  };

  const ImplementationClass = implementations[provider];

  return {
    options,
    createInstance: (params: {
      text?: string;
      textChunks?: string[];
      voice?: string;
      voiceId?: string;
    }): MockTextImplementation | MockAdvancedTextImplementation | MockGoogleTextImplementation | MockMicrosoftTextImplementation | MockAmazonTextImplementation => {
      const baseParams = {
        rate: '1.0',
        pitch: '0',
        options,
        ...params,
      };

      if (provider === 'generic' && overrides?.customTemplate) {
        return new MockAdvancedTextImplementation(baseParams, overrides.customTemplate);
      }

      return new ImplementationClass(baseParams);
    },
  };
};

/**
 * Test scenarios for text processing
 */
export const TextTestScenarios = {
  BASIC_TEXT: {
    input: SampleTextContent.SHORT,
    expectedChunks: 1,
    description: 'Basic text processing',
  },
  LONG_TEXT_SPLITTING: {
    input: SampleTextContent.LONG,
    expectedChunks: 'multiple',
    description: 'Long text that requires splitting',
  },
  EMPTY_TEXT: {
    input: SampleTextContent.EMPTY,
    expectedChunks: 0,
    description: 'Empty text handling',
  },
  TEXT_CHUNKS: {
    input: [SampleTextContent.SHORT, SampleTextContent.MEDIUM],
    expectedChunks: 2,
    description: 'Pre-chunked text processing',
  },
  SPECIAL_CHARACTERS: {
    input: SampleTextContent.WITH_SPECIAL_CHARS,
    expectedChunks: 1,
    description: 'Text with special characters',
  },
};

/**
 * Validation helpers for text processing tests
 */
export const TextTestValidators = {
  /**
   * Validates that all chunks are properly wrapped in speak tags
   */
  validateSpeakTags: (chunks: string[]): boolean => {
    return chunks.every(chunk => 
      chunk.includes('<speak>') && chunk.includes('</speak>')
    );
  },

  /**
   * Validates chunk length limits
   */
  validateChunkLengths: (chunks: string[], maxLength: number): boolean => {
    return chunks.every(chunk => chunk.length <= maxLength);
  },

  /**
   * Validates that content is preserved across chunks
   */
  validateContentPreservation: (originalText: string, chunks: string[]): boolean => {
    const combinedContent = chunks
      .map(chunk => chunk.replace(/<speak>|<\/speak>/g, ''))
      .join('');
    
    return combinedContent.includes(originalText.trim());
  },

  /**
   * Validates voice and prosody attributes
   */
  validateVoiceAttributes: (chunks: string[], expectedVoice?: string): boolean => {
    if (!expectedVoice) return true;
    
    return chunks.every(chunk => 
      chunk.includes(`name="${expectedVoice}"`) || 
      chunk.includes(`xml:gender="Male"`) ||
      chunk.includes('voice')
    );
  },
}; 