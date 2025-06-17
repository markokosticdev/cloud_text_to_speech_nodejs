import { ConvertParamsMicrosoft } from '../../../src/microsoft/convert/convert_params.js';
import { ConvertAudioOptionsMicrosoft } from '../../../src/microsoft/convert/convert_audio_options.js';
import { AudioOutputFormatMicrosoft } from '../../../src/microsoft/convert/audio/audio_output_format.js';
import { ConvertProcessOptionsMicrosoft } from '../../../src/microsoft/convert/convert_process_options.js';
import { VoiceLocale } from '../../../src/common/locale/locale_model.js';
import { VoiceMicrosoft } from '../../../src/microsoft/voices/voices_model.js';
import { ConvertSsmlOptionsMicrosoft } from '../../../src/microsoft/convert/convert_ssml_options.js';
import { ConvertTextOptionsMicrosoft } from '../../../src/microsoft/convert/convert_text_options.js';
import { AudioOutputStreamFormatMicrosoft } from '../../../src/microsoft/convert/audio/audio_output_stream_format.js';
import { HttpProxyBase } from '../../../src/common/http/http_proxy_base.js';

describe('ConvertParamsMicrosoft Tests', () => {
  const mockVoice = (): VoiceMicrosoft =>
    new VoiceMicrosoft({
      engines: [],
      code: 'voiceIdCode',
      name: 'John',
      nativeName: 'John',
      gender: 'Male',
      locale: VoiceLocale.fromCode('en'),
    });

  describe('ConvertParamsMicrosoft Tests for voice, voiceId, ssml, ssmlChunks, text and textChunks', () => {
    test('should create with voice and ssml, ensuring the constraint is followed', () => {
      const params = new ConvertParamsMicrosoft({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
      });

      expect(params).toBeDefined();
      expect(params.voice).toBeDefined();
      expect(params.voiceId).toBeUndefined();
      expect(params.ssml).toBe('<speak>Hello World</speak>');
      expect(params.ssmlChunks).toBeUndefined();
      expect(params.text).toBeUndefined();
      expect(params.textChunks).toBeUndefined();
    });

    test('should create with voiceId and ssml, ensuring the constraint is followed', () => {
      const params = new ConvertParamsMicrosoft({
        voiceId: 'voiceIdCode',
        ssml: '<speak>Hello World</speak>',
      });

      expect(params).toBeDefined();
      expect(params.voice).toBeUndefined();
      expect(params.voiceId).toBeDefined();
      expect(params.ssml).toBe('<speak>Hello World</speak>');
      expect(params.ssmlChunks).toBeUndefined();
      expect(params.text).toBeUndefined();
      expect(params.textChunks).toBeUndefined();
    });

    test('should create with voice and ssmlChunks, ensuring the constraint is followed', () => {
      const params = new ConvertParamsMicrosoft({
        voice: mockVoice(),
        ssmlChunks: ['<speak>Hello</speak>', '<speak>World</speak>'],
      });

      expect(params).toBeDefined();
      expect(params.voice).toBeDefined();
      expect(params.voiceId).toBeUndefined();
      expect(params.ssml).toBeUndefined();
      expect(params.ssmlChunks).toEqual([
        '<speak>Hello</speak>',
        '<speak>World</speak>',
      ]);
      expect(params.text).toBeUndefined();
      expect(params.textChunks).toBeUndefined();
    });

    test('should create with voiceId and ssmlChunks, ensuring the constraint is followed', () => {
      const params = new ConvertParamsMicrosoft({
        voiceId: 'voiceIdCode',
        ssmlChunks: ['<speak>Hello</speak>', '<speak>World</speak>'],
      });

      expect(params).toBeDefined();
      expect(params.voice).toBeUndefined();
      expect(params.voiceId).toBeDefined();
      expect(params.ssml).toBeUndefined();
      expect(params.ssmlChunks).toEqual([
        '<speak>Hello</speak>',
        '<speak>World</speak>',
      ]);
      expect(params.text).toBeUndefined();
      expect(params.textChunks).toBeUndefined();
    });

    test('should create with voice and text, ensuring the constraint is followed', () => {
      const params = new ConvertParamsMicrosoft({
        voice: mockVoice(),
        text: 'Hello World',
      });

      expect(params).toBeDefined();
      expect(params.voice).toBeDefined();
      expect(params.voiceId).toBeUndefined();
      expect(params.ssml).toBeUndefined();
      expect(params.ssmlChunks).toBeUndefined();
      expect(params.text).toBe('Hello World');
      expect(params.textChunks).toBeUndefined();
    });

    test('should create with voiceId and text, ensuring the constraint is followed', () => {
      const params = new ConvertParamsMicrosoft({
        voiceId: 'voiceIdCode',
        text: 'Hello World',
      });

      expect(params).toBeDefined();
      expect(params.voice).toBeUndefined();
      expect(params.voiceId).toBeDefined();
      expect(params.ssml).toBeUndefined();
      expect(params.ssmlChunks).toBeUndefined();
      expect(params.text).toBe('Hello World');
      expect(params.textChunks).toBeUndefined();
    });

    test('should create with voice and textChunks, ensuring the constraint is followed', () => {
      const params = new ConvertParamsMicrosoft({
        voice: mockVoice(),
        textChunks: ['Hello', 'World'],
      });

      expect(params).toBeDefined();
      expect(params.voice).toBeDefined();
      expect(params.voiceId).toBeUndefined();
      expect(params.ssml).toBeUndefined();
      expect(params.ssmlChunks).toBeUndefined();
      expect(params.text).toBeUndefined();
      expect(params.textChunks).toEqual(['Hello', 'World']);
    });

    test('should create with voiceId and textChunks, ensuring the constraint is followed', () => {
      const params = new ConvertParamsMicrosoft({
        voiceId: 'voiceIdCode',
        textChunks: ['Hello', 'World'],
      });

      expect(params).toBeDefined();
      expect(params.voice).toBeUndefined();
      expect(params.voiceId).toBeDefined();
      expect(params.ssml).toBeUndefined();
      expect(params.ssmlChunks).toBeUndefined();
      expect(params.text).toBeUndefined();
      expect(params.textChunks).toEqual(['Hello', 'World']);
    });
  });

  describe('ConvertParamsMicrosoft Tests for rate and pitch', () => {
    test('should create with voice and ssml, and ensure rate and pitch are set', () => {
      const params = new ConvertParamsMicrosoft({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
        rate: 'slow',
        pitch: 'high',
      });

      expect(params).toBeDefined();
      expect(params.rate).toBe('slow');
      expect(params.pitch).toBe('high');
    });

    test('should create with default rate and pitch when not provided', () => {
      const params = new ConvertParamsMicrosoft({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
      });

      expect(params).toBeDefined();
      expect(params.rate).toBe('default');
      expect(params.pitch).toBe('default');
    });

    test('should create with only custom rate, and default pitch', () => {
      const params = new ConvertParamsMicrosoft({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
        rate: 'fast',
      });

      expect(params).toBeDefined();
      expect(params.rate).toBe('fast');
      expect(params.pitch).toBe('default');
    });

    test('should create with only custom pitch, and default rate', () => {
      const params = new ConvertParamsMicrosoft({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
        pitch: 'low',
      });

      expect(params).toBeDefined();
      expect(params.rate).toBe('default');
      expect(params.pitch).toBe('low');
    });
  });

  describe('ConvertParamsMicrosoft Tests for audioOptions', () => {
    test('should create with custom audioOptions', () => {
      const params = new ConvertParamsMicrosoft({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
        audioOptions: new ConvertAudioOptionsMicrosoft({
          audioFormat: AudioOutputFormatMicrosoft.audio48Khz192kBitrateMonoMp3,
          audioStreamFormat:
            AudioOutputStreamFormatMicrosoft.audio16Khz32kBitrateMonoMp3,
        }),
      });

      expect(params).toBeDefined();
      expect(params.audioOptions).toBeDefined();
      expect(params.audioOptions.audioFormat).toBe(
        AudioOutputFormatMicrosoft.audio48Khz192kBitrateMonoMp3,
      );
      expect(params.audioOptions.audioStreamFormat).toBe(
        AudioOutputFormatMicrosoft.audio16Khz32kBitrateMonoMp3,
      );
    });

    test('should create with default audioOptions when not provided', () => {
      const params = new ConvertParamsMicrosoft({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
      });

      expect(params).toBeDefined();
      expect(params.audioOptions).toBeDefined();
      expect(params.audioOptions.audioFormat).toBeDefined();
      expect(params.audioOptions.audioStreamFormat).toBeDefined();
    });
  });

  describe('ConvertParamsMicrosoft Tests for processOptions', () => {
    test('should create with custom processOptions', () => {
      const params = new ConvertParamsMicrosoft({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
        processOptions: new ConvertProcessOptionsMicrosoft({
          processAsync: true,
          processLimit: 10,
        }),
      });

      expect(params).toBeDefined();
      expect(params.processOptions).toBeDefined();
      expect(params.processOptions.processAsync).toBe(true);
      expect(params.processOptions.processLimit).toBe(10);
    });

    test('should create with default processOptions when not provided', () => {
      const params = new ConvertParamsMicrosoft({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
      });

      expect(params).toBeDefined();
      expect(params.processOptions).toBeDefined();
      expect(params.processOptions.processAsync).toBeDefined();
      expect(params.processOptions.processLimit).toBeDefined();
    });
  });

  describe('ConvertParamsMicrosoft Tests for ssmlOptions', () => {
    test('should create with custom ssmlOptions', () => {
      const params = new ConvertParamsMicrosoft({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
        ssmlOptions: new ConvertSsmlOptionsMicrosoft({
          allowedElements: { break: ['time'] },
          splitLimit: 4000,
        }),
      });

      expect(params).toBeDefined();
      expect(params.ssmlOptions).toBeDefined();
      expect(params.ssmlOptions.allowedElements).toEqual({ break: ['time'] });
      expect(params.ssmlOptions.splitLimit).toBe(4000);
    });

    test('should create with default ssmlOptions when not provided', () => {
      const params = new ConvertParamsMicrosoft({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
      });

      expect(params).toBeDefined();
      expect(params.ssmlOptions).toBeDefined();
      expect(params.ssmlOptions.allowedElements).toBeDefined();
      expect(params.ssmlOptions.splitLimit).toBeDefined();
    });
  });

  describe('ConvertParamsMicrosoft Tests for textOptions', () => {
    test('should create with custom textOptions', () => {
      const params = new ConvertParamsMicrosoft({
        voice: mockVoice(),
        text: 'Hello World',
        textOptions: new ConvertTextOptionsMicrosoft({
          splitLimit: 5000,
        }),
      });

      expect(params).toBeDefined();
      expect(params.textOptions).toBeDefined();
      expect(params.textOptions.splitLimit).toBe(5000);
    });

    test('should create with default textOptions when not provided', () => {
      const params = new ConvertParamsMicrosoft({
        voice: mockVoice(),
        text: 'Hello World',
      });

      expect(params).toBeDefined();
      expect(params.textOptions).toBeDefined();
      expect(params.textOptions.splitLimit).toBeDefined();
    });
  });

  describe('ConvertParamsMicrosoft Tests for httpProxy', () => {
    test('should create with only httpProxy parameter', () => {
      const params = new ConvertParamsMicrosoft({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
        httpProxy: (): HttpProxyBase => {
          return new HttpProxyBase({
            headers: {
              HeaderName: 'HeaderValue',
            },
          });
        },
      });

      expect(params).toBeDefined();
      expect(typeof params.httpProxy).toBe('function');
    });
  });
});
