import { ConvertParamsAmazon } from '../../../src/amazon/convert/convert_params.js';
import { ConvertAudioOptionsAmazon } from '../../../src/amazon/convert/convert_audio_options.js';
import { AudioOutputFormatAmazon } from '../../../src/amazon/convert/audio/audio_output_format.js';
import { ConvertProcessOptionsAmazon } from '../../../src/amazon/convert/convert_process_options.js';
import { VoiceLocale } from '../../../src/common/locale/locale_model.js';
import { VoiceAmazon } from '../../../src/amazon/voices/voices_model.js';
import { ConvertSsmlOptionsAmazon } from '../../../src/amazon/convert/convert_ssml_options.js';
import { ConvertTextOptionsAmazon } from '../../../src/amazon/convert/convert_text_options.js';
import { AudioOutputStreamFormatAmazon } from '../../../src/amazon/convert/audio/audio_output_stream_format.js';
import { HttpProxyBase } from "../../../src/common/http/http_proxy_base.js";

describe('ConvertParamsAmazon Tests', () => {
  describe('ConvertParamsAmazon Tests for voice, voiceId, ssml, ssmlChunks, text and textChunks', () => {
    test('should create with voice and ssml, ensuring the constraint is followed', () => {
      const ttsParams = new ConvertParamsAmazon({
        voice: new VoiceAmazon({
          engines: [],
          code: 'voiceIdCode',
          name: 'John',
          nativeName: 'John',
          gender: 'Male',
          locale: VoiceLocale.fromCode('en'),
        }),
        ssml: '<speak>Hello World</speak>',
      });

      expect(ttsParams).toBeDefined();
      expect(ttsParams.voice).toBeDefined();
      expect(ttsParams.voiceId).toBeUndefined();
      expect(ttsParams.ssml).toBe('<speak>Hello World</speak>');
      expect(ttsParams.ssmlChunks).toBeUndefined();
      expect(ttsParams.text).toBeUndefined();
      expect(ttsParams.textChunks).toBeUndefined();
    });

    test('should create with voiceId and ssml, ensuring the constraint is followed', () => {
      const ttsParams = new ConvertParamsAmazon({
        voiceId: 'voiceIdCode',
        ssml: '<speak>Hello World</speak>',
      });

      expect(ttsParams).toBeDefined();
      expect(ttsParams.voice).toBeUndefined();
      expect(ttsParams.voiceId).toBeDefined();
      expect(ttsParams.ssml).toBe('<speak>Hello World</speak>');
      expect(ttsParams.ssmlChunks).toBeUndefined();
      expect(ttsParams.text).toBeUndefined();
      expect(ttsParams.textChunks).toBeUndefined();
    });

    test('should create with voice and ssmlChunks, ensuring the constraint is followed', () => {
      const ttsParams = new ConvertParamsAmazon({
        voice: new VoiceAmazon({
          engines: [],
          code: 'voiceIdCode',
          name: 'John',
          nativeName: 'John',
          gender: 'Male',
          locale: VoiceLocale.fromCode('en'),
        }),
        ssmlChunks: ['<speak>Hello</speak>', '<speak>World</speak>'],
      });

      expect(ttsParams).toBeDefined();
      expect(ttsParams.voice).toBeDefined();
      expect(ttsParams.voiceId).toBeUndefined();
      expect(ttsParams.ssml).toBeUndefined();
      expect(ttsParams.ssmlChunks).toEqual([
        '<speak>Hello</speak>',
        '<speak>World</speak>',
      ]);
      expect(ttsParams.text).toBeUndefined();
      expect(ttsParams.textChunks).toBeUndefined();
    });

    test('should create with voiceId and ssmlChunks, ensuring the constraint is followed', () => {
      const ttsParams = new ConvertParamsAmazon({
        voiceId: 'voiceIdCode',
        ssmlChunks: ['<speak>Hello</speak>', '<speak>World</speak>'],
      });

      expect(ttsParams).toBeDefined();
      expect(ttsParams.voice).toBeUndefined();
      expect(ttsParams.voiceId).toBeDefined();
      expect(ttsParams.ssml).toBeUndefined();
      expect(ttsParams.ssmlChunks).toEqual([
        '<speak>Hello</speak>',
        '<speak>World</speak>',
      ]);
      expect(ttsParams.text).toBeUndefined();
      expect(ttsParams.textChunks).toBeUndefined();
    });

    test('should create with voice and text, ensuring the constraint is followed', () => {
      const ttsParams = new ConvertParamsAmazon({
        voice: new VoiceAmazon({
          engines: [],
          code: 'voiceIdCode',
          name: 'John',
          nativeName: 'John',
          gender: 'Male',
          locale: VoiceLocale.fromCode('en'),
        }),
        text: 'Hello World',
      });

      expect(ttsParams).toBeDefined();
      expect(ttsParams.voice).toBeDefined();
      expect(ttsParams.voiceId).toBeUndefined();
      expect(ttsParams.ssml).toBeUndefined();
      expect(ttsParams.ssmlChunks).toBeUndefined();
      expect(ttsParams.text).toBe('Hello World');
      expect(ttsParams.textChunks).toBeUndefined();
    });

    test('should create with voiceId and text, ensuring the constraint is followed', () => {
      const ttsParams = new ConvertParamsAmazon({
        voiceId: 'voiceIdCode',
        text: 'Hello World',
      });

      expect(ttsParams).toBeDefined();
      expect(ttsParams.voice).toBeUndefined();
      expect(ttsParams.voiceId).toBeDefined();
      expect(ttsParams.ssml).toBeUndefined();
      expect(ttsParams.ssmlChunks).toBeUndefined();
      expect(ttsParams.text).toBe('Hello World');
      expect(ttsParams.textChunks).toBeUndefined();
    });

    test('should create with voice and textChunks, ensuring the constraint is followed', () => {
      const ttsParams = new ConvertParamsAmazon({
        voice: new VoiceAmazon({
          engines: [],
          code: 'voiceIdCode',
          name: 'John',
          nativeName: 'John',
          gender: 'Male',
          locale: VoiceLocale.fromCode('en'),
        }),
        textChunks: ['Hello', 'World'],
      });

      expect(ttsParams).toBeDefined();
      expect(ttsParams.voice).toBeDefined();
      expect(ttsParams.voiceId).toBeUndefined();
      expect(ttsParams.ssml).toBeUndefined();
      expect(ttsParams.ssmlChunks).toBeUndefined();
      expect(ttsParams.text).toBeUndefined();
      expect(ttsParams.textChunks).toEqual(['Hello', 'World']);
    });

    test('should create with voiceId and textChunks, ensuring the constraint is followed', () => {
      const ttsParams = new ConvertParamsAmazon({
        voiceId: 'voiceIdCode',
        textChunks: ['Hello', 'World'],
      });

      expect(ttsParams).toBeDefined();
      expect(ttsParams.voice).toBeUndefined();
      expect(ttsParams.voiceId).toBeDefined();
      expect(ttsParams.ssml).toBeUndefined();
      expect(ttsParams.ssmlChunks).toBeUndefined();
      expect(ttsParams.text).toBeUndefined();
      expect(ttsParams.textChunks).toEqual(['Hello', 'World']);
    });
  });

  describe('ConvertParamsAmazon Tests for rate and pitch', () => {
    test('should create with voice and ssml, and ensure rate and pitch are set', () => {
      const ttsParams = new ConvertParamsAmazon({
        voice: new VoiceAmazon({
          engines: [],
          code: 'voiceIdCode',
          name: 'John',
          nativeName: 'John',
          gender: 'Male',
          locale: VoiceLocale.fromCode('en'),
        }),
        ssml: '<speak>Hello World</speak>',
        rate: 'slow',
        pitch: 'high',
      });

      expect(ttsParams).toBeDefined();
      expect(ttsParams.rate).toBe('slow');
      expect(ttsParams.pitch).toBe('high');
    });

    test('should create with default rate and pitch when not provided', () => {
      const ttsParams = new ConvertParamsAmazon({
        voice: new VoiceAmazon({
          engines: [],
          code: 'voiceIdCode',
          name: 'John',
          nativeName: 'John',
          gender: 'Male',
          locale: VoiceLocale.fromCode('en'),
        }),
        ssml: '<speak>Hello World</speak>',
      });

      expect(ttsParams).toBeDefined();
      expect(ttsParams.rate).toBe('default');
      expect(ttsParams.pitch).toBe('default');
    });

    test('should create with only custom rate, and default pitch', () => {
      const ttsParams = new ConvertParamsAmazon({
        voice: new VoiceAmazon({
          engines: [],
          code: 'voiceIdCode',
          name: 'John',
          nativeName: 'John',
          gender: 'Male',
          locale: VoiceLocale.fromCode('en'),
        }),
        ssml: '<speak>Hello World</speak>',
        rate: 'fast', // custom rate
      });

      expect(ttsParams).toBeDefined();
      expect(ttsParams.rate).toBe('fast');
      expect(ttsParams.pitch).toBe('default');
    });

    test('should create with only custom pitch, and default rate', () => {
      const ttsParams = new ConvertParamsAmazon({
        voice: new VoiceAmazon({
          engines: [],
          code: 'voiceIdCode',
          name: 'John',
          nativeName: 'John',
          gender: 'Male',
          locale: VoiceLocale.fromCode('en'),
        }),
        ssml: '<speak>Hello World</speak>',
        pitch: 'low',
      });

      expect(ttsParams).toBeDefined();
      expect(ttsParams.rate).toBe('default');
      expect(ttsParams.pitch).toBe('low');
    });
  });

  describe('ConvertParamsAmazon Tests for audioOptions', () => {
    test('should create with custom audioOptions', () => {
      const ttsParams = new ConvertParamsAmazon({
        voice: new VoiceAmazon({
          engines: [],
          code: 'voiceIdCode',
          name: 'John',
          nativeName: 'John',
          gender: 'Male',
          locale: VoiceLocale.fromCode('en'),
        }),
        ssml: '<speak>Hello World</speak>',
        audioOptions: new ConvertAudioOptionsAmazon({
          audioFormat: AudioOutputFormatAmazon.mp3,
          audioStreamFormat: AudioOutputStreamFormatAmazon.pcm,
        }),
      });

      expect(ttsParams).toBeDefined();
      expect(ttsParams.audioOptions).toBeDefined();
      expect(ttsParams.audioOptions.audioFormat).toBe(
        AudioOutputFormatAmazon.mp3,
      );
      expect(ttsParams.audioOptions.audioStreamFormat).toBe(
        AudioOutputFormatAmazon.pcm,
      );
    });

    test('should create with default audioOptions when not provided', () => {
      const ttsParams = new ConvertParamsAmazon({
        voice: new VoiceAmazon({
          engines: [],
          code: 'voiceIdCode',
          name: 'John',
          nativeName: 'John',
          gender: 'Male',
          locale: VoiceLocale.fromCode('en'),
        }),
        ssml: '<speak>Hello World</speak>',
      });

      expect(ttsParams).toBeDefined();
      expect(ttsParams.audioOptions).toBeDefined();
      expect(ttsParams.audioOptions.audioFormat).toBeDefined();
      expect(ttsParams.audioOptions.audioStreamFormat).toBeDefined();
    });
  });

  describe('ConvertParamsAmazon Tests for processOptions', () => {
    test('should create with custom processOptions', () => {
      const ttsParams = new ConvertParamsAmazon({
        voice: new VoiceAmazon({
          engines: [],
          code: 'voiceIdCode',
          name: 'John',
          nativeName: 'John',
          gender: 'Male',
          locale: VoiceLocale.fromCode('en'),
        }),
        ssml: '<speak>Hello World</speak>',
        processOptions: new ConvertProcessOptionsAmazon({
          processAsync: true,
          processLimit: 10,
        }),
      });

      expect(ttsParams).toBeDefined();
      expect(ttsParams.processOptions).toBeDefined();
      expect(ttsParams.processOptions.processAsync).toBe(true);
      expect(ttsParams.processOptions.processLimit).toBe(10);
    });

    test('should create with default processOptions when not provided', () => {
      const ttsParams = new ConvertParamsAmazon({
        voice: new VoiceAmazon({
          engines: [],
          code: 'voiceIdCode',
          name: 'John',
          nativeName: 'John',
          gender: 'Male',
          locale: VoiceLocale.fromCode('en'),
        }),
        ssml: '<speak>Hello World</speak>',
      });

      expect(ttsParams).toBeDefined();
      expect(ttsParams.processOptions).toBeDefined();
      expect(ttsParams.processOptions.processAsync).toBeDefined();
      expect(ttsParams.processOptions.processLimit).toBeDefined();
    });
  });

  describe('ConvertParamsAmazon Tests for ssmlOptions', () => {
    test('should create with custom ssmlOptions', () => {
      const ttsParams = new ConvertParamsAmazon({
        voice: new VoiceAmazon({
          engines: [],
          code: 'voiceIdCode',
          name: 'John',
          nativeName: 'John',
          gender: 'Male',
          locale: VoiceLocale.fromCode('en'),
        }),
        ssml: '<speak>Hello World</speak>',
        ssmlOptions: new ConvertSsmlOptionsAmazon({
          allowedElements: { break: ['time'] },
          splitLimit: 4000,
        }),
      });

      expect(ttsParams).toBeDefined();
      expect(ttsParams.ssmlOptions).toBeDefined();
      expect(ttsParams.ssmlOptions.allowedElements).toEqual({ break: ['time'] });
      expect(ttsParams.ssmlOptions.splitLimit).toBe(4000);
    });

    test('should create with default ssmlOptions when not provided', () => {
      const ttsParams = new ConvertParamsAmazon({
        voice: new VoiceAmazon({
          engines: [],
          code: 'voiceIdCode',
          name: 'John',
          nativeName: 'John',
          gender: 'Male',
          locale: VoiceLocale.fromCode('en'),
        }),
        ssml: '<speak>Hello World</speak>',
      });

      expect(ttsParams).toBeDefined();
      expect(ttsParams.ssmlOptions).toBeDefined();
      expect(ttsParams.ssmlOptions.allowedElements).toBeDefined();
      expect(ttsParams.ssmlOptions.splitLimit).toBeDefined();
    });
  });

  describe('ConvertParamsAmazon Tests for textOptions', () => {
    test('should create with custom textOptions', () => {
      const ttsParams = new ConvertParamsAmazon({
        voice: new VoiceAmazon({
          engines: [],
          code: 'voiceIdCode',
          name: 'John',
          nativeName: 'John',
          gender: 'Male',
          locale: VoiceLocale.fromCode('en'),
        }),
        text: 'Hello World',
        textOptions: new ConvertTextOptionsAmazon({
          splitLimit: 5000,
        }),
      });

      expect(ttsParams).toBeDefined();
      expect(ttsParams.textOptions).toBeDefined();
      expect(ttsParams.textOptions.splitLimit).toBe(5000);
    });

    test('should create with default textOptions when not provided', () => {
      const ttsParams = new ConvertParamsAmazon({
        voice: new VoiceAmazon({
          engines: [],
          code: 'voiceIdCode',
          name: 'John',
          nativeName: 'John',
          gender: 'Male',
          locale: VoiceLocale.fromCode('en'),
        }),
        text: 'Hello World',
      });

      expect(ttsParams).toBeDefined();
      expect(ttsParams.textOptions).toBeDefined();
      expect(ttsParams.textOptions.splitLimit).toBeDefined();
    });
  });

  describe('ConvertParamsAmazon Tests for httpProxy', () => {
    test('should create with only httpProxy parameter', () => {
      const params = new ConvertParamsAmazon({
        voice: new VoiceAmazon({
          engines: [],
          code: 'voiceIdCode',
          name: 'John',
          nativeName: 'John',
          gender: 'Male',
          locale: VoiceLocale.fromCode('en'),
        }),
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
