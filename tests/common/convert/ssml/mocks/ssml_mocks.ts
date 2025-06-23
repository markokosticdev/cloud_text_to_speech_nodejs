import { SsmlRootTemplateMapper } from '../../../../../src/common/convert/input/ssml/ssml_splitter.js';
import { SsmlMinimizer } from '../../../../../src/common/convert/input/ssml/ssml_minimizer.js';
import { ConvertSsmlOptionsGoogle } from '../../../../../src/google/convert/convert_ssml_options.js';
import { ConvertSsmlOptionsMicrosoft } from '../../../../../src/microsoft/convert/convert_ssml_options.js';
import { ConvertSsmlOptionsAmazon } from '../../../../../src/amazon/convert/convert_ssml_options.js';
import { GOOGLE_SSML_ALLOWED_ELEMENTS } from '../../../../../src/google/convert/input/ssml/ssml_schema.js';
import { MICROSOFT_SSML_ALLOWED_ELEMENTS } from '../../../../../src/microsoft/convert/input/ssml/ssml_schema.js';
import { AMAZON_SSML_ALLOWED_ELEMENTS } from '../../../../../src/amazon/convert/input/ssml/ssml_schema.js';

/**
 * Mock root template mapper for testing SSML processing
 * Creates a complete SSML structure with voice and prosody tags
 */
export const mockGoogleRootTemplate: SsmlRootTemplateMapper = (ssml: string): string => 
  `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice xml:lang="en-US" xml:gender="Male" name="en-US-Standard-B"><prosody rate="1.0" pitch="0">${ssml}</prosody></voice></speak>`;

/**
 * Mock root template for Microsoft TTS
 */
export const mockMicrosoftRootTemplate: SsmlRootTemplateMapper = (ssml: string): string => 
  `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="en-US-AriaNeural"><prosody rate="1.0" pitch="0">${ssml}</prosody></voice></speak>`;

/**
 * Mock root template for Amazon Polly
 */
export const mockAmazonRootTemplate: SsmlRootTemplateMapper = (ssml: string): string => 
  `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"><prosody rate="1.0" pitch="0">${ssml}</prosody></speak>`;

/**
 * Creates a minimized root template result for testing
 */
export const createRootTemplateMinimized = (rootTemplate: SsmlRootTemplateMapper): ((text: string) => string) => 
  (text: string): string => SsmlMinimizer.minimize(rootTemplate(text));

/**
 * Mock SSML options for Google TTS testing
 */
export const createMockGoogleSsmlOptions = (overrides?: {
  splitLimit?: number;
  allowedElements?: { [key: string]: string[] };
}): ConvertSsmlOptionsGoogle => {
  return new ConvertSsmlOptionsGoogle({
    splitLimit: overrides?.splitLimit ?? 300,
    allowedElements: overrides?.allowedElements ?? GOOGLE_SSML_ALLOWED_ELEMENTS,
  });
};

/**
 * Mock SSML options for Microsoft TTS testing
 */
export const createMockMicrosoftSsmlOptions = (overrides?: {
  splitLimit?: number;
  allowedElements?: { [key: string]: string[] };
}): ConvertSsmlOptionsMicrosoft => {
  return new ConvertSsmlOptionsMicrosoft({
    splitLimit: overrides?.splitLimit ?? 250,
    allowedElements: overrides?.allowedElements ?? MICROSOFT_SSML_ALLOWED_ELEMENTS,
  });
};

/**
 * Mock SSML options for Amazon TTS testing
 */
export const createMockAmazonSsmlOptions = (overrides?: {
  splitLimit?: number;
  allowedElements?: { [key: string]: string[] };
}): ConvertSsmlOptionsAmazon => {
  return new ConvertSsmlOptionsAmazon({
    splitLimit: overrides?.splitLimit ?? 200,
    allowedElements: overrides?.allowedElements ?? AMAZON_SSML_ALLOWED_ELEMENTS,
  });
};

/**
 * Sample SSML content for testing
 */
export const SampleSsmlContent = {
  SIMPLE_TEXT: 'Hello world',
  LONG_TEXT: 'This is a very long sentence that needs to be split into multiple chunks because it exceeds the specified character limit for processing.',
  WITH_BREAK: 'Hello <break time="500ms"/> world',
  WITH_EMPHASIS: 'This is <emphasis level="strong">important</emphasis> text',
  WITH_NESTED_TAGS: '<p>This is <emphasis level="strong">nested <break time="100ms"/> content</emphasis> in paragraph.</p>',
  COMPLEX_STRUCTURE: `
    <p>
      <s>First sentence with <emphasis level="moderate">emphasis</emphasis>.</s>
      <s>Second sentence with <break time="300ms"/> and <sub alias="TTS">text to speech</sub>.</s>
    </p>
    <p>Another paragraph with more content.</p>
  `,
  MALFORMED_XML: '<speak>Hello <unclosed world</speak>',
  WITH_UNSUPPORTED_ELEMENTS: '<speak><unsupported>Hello</unsupported><emphasis>world</emphasis></speak>',
};

/**
 * Expected results for SSML splitting tests
 */
export const ExpectedSsmlResults = {
  SIMPLE_SPLIT: ['Hello world'],
  TWO_SENTENCE_SPLIT: [
    'This is a very long sentence that needs to be split into multiple chunks',
    'because it exceeds the specified character limit for processing.',
  ],
  COMPLEX_SPLIT: [
    '<p><s>First sentence with <emphasis level="moderate">emphasis</emphasis>.</s></p>',
    '<p><s>Second sentence with <break time="300ms"/> and <sub alias="TTS">text to speech</sub>.</s></p>',
    '<p>Another paragraph with more content.</p>',
  ],
};

/**
 * Utility function to create test scenarios
 */
export const createSsmlTestScenario = (
  provider: 'google' | 'microsoft' | 'amazon',
  splitLimit?: number
): {
  rootTemplate: SsmlRootTemplateMapper;
  options: ConvertSsmlOptionsGoogle | ConvertSsmlOptionsMicrosoft | ConvertSsmlOptionsAmazon;
  minimized: (text: string) => string;
} => {
  const configs = {
    google: {
      rootTemplate: mockGoogleRootTemplate,
      options: createMockGoogleSsmlOptions({ splitLimit: splitLimit ?? 300 }),
      minimized: createRootTemplateMinimized(mockGoogleRootTemplate),
    },
    microsoft: {
      rootTemplate: mockMicrosoftRootTemplate,
      options: createMockMicrosoftSsmlOptions({ splitLimit: splitLimit ?? 250 }),
      minimized: createRootTemplateMinimized(mockMicrosoftRootTemplate),
    },
    amazon: {
      rootTemplate: mockAmazonRootTemplate,
      options: createMockAmazonSsmlOptions({ splitLimit: splitLimit ?? 200 }),
      minimized: createRootTemplateMinimized(mockAmazonRootTemplate),
    },
  };

  return configs[provider];
}; 