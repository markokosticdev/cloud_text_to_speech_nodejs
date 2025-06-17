import { ConvertParamsGoogle } from '../../../src/google/convert/convert_params.js';
import { ConvertAudioOptionsGoogle } from '../../../src/google/convert/convert_audio_options.js';
import { AudioOutputFormatGoogle } from '../../../src/google/convert/audio/audio_output_format.js';
import { ConvertProcessOptionsGoogle } from '../../../src/google/convert/convert_process_options.js';
import { VoiceLocale } from '../../../src/common/locale/locale_model.js';
import { VoiceGoogle } from '../../../src/google/voices/voices_model.js';
import { ConvertSsmlOptionsGoogle } from '../../../src/google/convert/convert_ssml_options.js';
import { ConvertTextOptionsGoogle } from '../../../src/google/convert/convert_text_options.js';
import { AudioOutputStreamFormatGoogle } from '../../../src/google/convert/audio/audio_output_stream_format.js';
import { HttpProxyBase } from '../../../src/common/http/http_proxy_base.js';

describe('ConvertParamsGoogle Tests', () => {
  const mockVoice = (): VoiceGoogle =>
    new VoiceGoogle({
      engines: [],
      code: 'voiceIdCode',
      name: 'John',
      nativeName: 'John',
      gender: 'Male',
      locale: VoiceLocale.fromCode('en'),
    });

  describe('ConvertParamsGoogle Tests for voice, voiceId, ssml, ssmlChunks, text and textChunks', () => {
    test('should create with voice and ssml, ensuring the constraint is followed', () => {
      const params = new ConvertParamsGoogle({
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
      const params = new ConvertParamsGoogle({
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
      const params = new ConvertParamsGoogle({
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
      const params = new ConvertParamsGoogle({
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
      const params = new ConvertParamsGoogle({
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
      const params = new ConvertParamsGoogle({
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
      const params = new ConvertParamsGoogle({
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
      const params = new ConvertParamsGoogle({
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

  describe('ConvertParamsGoogle Tests for rate and pitch', () => {
    test('should create with voice and ssml, and ensure rate and pitch are set', () => {
      const params = new ConvertParamsGoogle({
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
      const params = new ConvertParamsGoogle({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
      });

      expect(params).toBeDefined();
      expect(params.rate).toBe('default');
      expect(params.pitch).toBe('default');
    });

    test('should create with only custom rate, and default pitch', () => {
      const params = new ConvertParamsGoogle({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
        rate: 'fast',
      });

      expect(params).toBeDefined();
      expect(params.rate).toBe('fast');
      expect(params.pitch).toBe('default');
    });

    test('should create with only custom pitch, and default rate', () => {
      const params = new ConvertParamsGoogle({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
        pitch: 'low',
      });

      expect(params).toBeDefined();
      expect(params.rate).toBe('default');
      expect(params.pitch).toBe('low');
    });
  });

  describe('ConvertParamsGoogle Tests for audioOptions', () => {
    test('should create with custom audioOptions', () => {
      const params = new ConvertParamsGoogle({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
        audioOptions: new ConvertAudioOptionsGoogle({
          audioFormat: AudioOutputFormatGoogle.mp3,
          audioStreamFormat: AudioOutputStreamFormatGoogle.linear16,
        }),
      });

      expect(params).toBeDefined();
      expect(params.audioOptions).toBeDefined();
      expect(params.audioOptions.audioFormat).toBe(AudioOutputFormatGoogle.mp3);
      expect(params.audioOptions.audioStreamFormat).toBe(
        AudioOutputFormatGoogle.linear16,
      );
    });

    test('should create with default audioOptions when not provided', () => {
      const params = new ConvertParamsGoogle({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
      });

      expect(params).toBeDefined();
      expect(params.audioOptions).toBeDefined();
      expect(params.audioOptions.audioFormat).toBeDefined();
      expect(params.audioOptions.audioStreamFormat).toBeDefined();
    });
  });

  describe('ConvertParamsGoogle Tests for processOptions', () => {
    test('should create with custom processOptions', () => {
      const params = new ConvertParamsGoogle({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
        processOptions: new ConvertProcessOptionsGoogle({
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
      const params = new ConvertParamsGoogle({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
      });

      expect(params).toBeDefined();
      expect(params.processOptions).toBeDefined();
      expect(params.processOptions.processAsync).toBeDefined();
      expect(params.processOptions.processLimit).toBeDefined();
    });
  });

  describe('ConvertParamsGoogle Tests for ssmlOptions', () => {
    test('should create with custom ssmlOptions', () => {
      const params = new ConvertParamsGoogle({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
        ssmlOptions: new ConvertSsmlOptionsGoogle({
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
      const params = new ConvertParamsGoogle({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
      });

      expect(params).toBeDefined();
      expect(params.ssmlOptions).toBeDefined();
      expect(params.ssmlOptions.allowedElements).toBeDefined();
      expect(params.ssmlOptions.splitLimit).toBeDefined();
    });
  });

  describe('ConvertParamsGoogle Tests for textOptions', () => {
    test('should create with custom textOptions', () => {
      const params = new ConvertParamsGoogle({
        voice: mockVoice(),
        text: 'Hello World',
        textOptions: new ConvertTextOptionsGoogle({
          splitLimit: 5000,
        }),
      });

      expect(params).toBeDefined();
      expect(params.textOptions).toBeDefined();
      expect(params.textOptions.splitLimit).toBe(5000);
    });

    test('should create with default textOptions when not provided', () => {
      const params = new ConvertParamsGoogle({
        voice: mockVoice(),
        text: 'Hello World',
      });

      expect(params).toBeDefined();
      expect(params.textOptions).toBeDefined();
      expect(params.textOptions.splitLimit).toBeDefined();
    });
  });

  describe('ConvertParamsGoogle Tests for httpProxy', () => {
    test('should create with only httpProxy parameter', () => {
      const params = new ConvertParamsGoogle({
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
