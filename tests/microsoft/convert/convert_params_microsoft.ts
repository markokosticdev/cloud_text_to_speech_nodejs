import { ConvertParamsMicrosoft } from '../../../src/microsoft/convert/convert_params.js';
import { ConvertAudioOptionsMicrosoft } from '../../../src/microsoft/convert/convert_audio_options.js';
import { AudioOutputFormatMicrosoft } from '../../../src/microsoft/convert/audio/audio_output_format.js';
import { ConvertProcessOptionsMicrosoft } from '../../../src/microsoft/convert/convert_process_options.js';
import { VoiceLocale } from '../../../src/common/locale/locale_model.js';
import { VoiceMicrosoft } from '../../../src/microsoft/voices/voices_model.js';
import { ConvertSsmlOptionsMicrosoft } from '../../../src/microsoft/convert/convert_ssml_options.js';
import { ConvertTextOptionsMicrosoft } from '../../../src/microsoft/convert/convert_text_options.js';
import { AudioOutputStreamFormatMicrosoft } from '../../../src/microsoft/convert/audio/audio_output_stream_format.js';
import { HttpProxyBase } from "../../../src/common/http/http_proxy_base.js";

describe('ConvertParamsMicrosoft Tests', () => {
  describe('ConvertParamsMicrosoft Tests for voice, voiceId, ssml, ssmlChunks, text and textChunks', () => {
    test('should create with voice and ssml, ensuring the constraint is followed', () => {
      const ttsParams = new ConvertParamsMicrosoft({
        voice: new VoiceMicrosoft({
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
      const ttsParams = new ConvertParamsMicrosoft({
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
      const ttsParams = new ConvertParamsMicrosoft({
        voice: new VoiceMicrosoft({
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
      const ttsParams = new ConvertParamsMicrosoft({
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
      const ttsParams = new ConvertParamsMicrosoft({
        voice: new VoiceMicrosoft({
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
      const ttsParams = new ConvertParamsMicrosoft({
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
      const ttsParams = new ConvertParamsMicrosoft({
        voice: new VoiceMicrosoft({
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
      const ttsParams = new ConvertParamsMicrosoft({
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

  describe('ConvertParamsMicrosoft Tests for rate and pitch', () => {
    test('should create with voice and ssml, and ensure rate and pitch are set', () => {
      const ttsParams = new ConvertParamsMicrosoft({
        voice: new VoiceMicrosoft({
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
      const ttsParams = new ConvertParamsMicrosoft({
        voice: new VoiceMicrosoft({
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
      const ttsParams = new ConvertParamsMicrosoft({
        voice: new VoiceMicrosoft({
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
      const ttsParams = new ConvertParamsMicrosoft({
        voice: new VoiceMicrosoft({
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

  describe('ConvertParamsMicrosoft Tests for audioOptions', () => {
    test('should create with custom audioOptions', () => {
      const ttsParams = new ConvertParamsMicrosoft({
        voice: new VoiceMicrosoft({
          engines: [],
          code: 'voiceIdCode',
          name: 'John',
          nativeName: 'John',
          gender: 'Male',
          locale: VoiceLocale.fromCode('en'),
        }),
        ssml: '<speak>Hello World</speak>',
        audioOptions: new ConvertAudioOptionsMicrosoft({
          audioFormat: AudioOutputFormatMicrosoft.audio48Khz192kBitrateMonoMp3,
          audioStreamFormat: AudioOutputStreamFormatMicrosoft.audio16Khz32kBitrateMonoMp3,
        }),
      });

      expect(ttsParams).toBeDefined();
      expect(ttsParams.audioOptions).toBeDefined();
      expect(ttsParams.audioOptions.audioFormat).toBe(
        AudioOutputFormatMicrosoft.audio48Khz192kBitrateMonoMp3,
      );
      expect(ttsParams.audioOptions.audioStreamFormat).toBe(
        AudioOutputFormatMicrosoft.audio16Khz32kBitrateMonoMp3,
      );
    });

    test('should create with default audioOptions when not provided', () => {
      const ttsParams = new ConvertParamsMicrosoft({
        voice: new VoiceMicrosoft({
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

  describe('ConvertParamsMicrosoft Tests for processOptions', () => {
    test('should create with custom processOptions', () => {
      const ttsParams = new ConvertParamsMicrosoft({
        voice: new VoiceMicrosoft({
          engines: [],
          code: 'voiceIdCode',
          name: 'John',
          nativeName: 'John',
          gender: 'Male',
          locale: VoiceLocale.fromCode('en'),
        }),
        ssml: '<speak>Hello World</speak>',
        processOptions: new ConvertProcessOptionsMicrosoft({
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
      const ttsParams = new ConvertParamsMicrosoft({
        voice: new VoiceMicrosoft({
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

  describe('ConvertParamsMicrosoft Tests for ssmlOptions', () => {
    test('should create with custom ssmlOptions', () => {
      const ttsParams = new ConvertParamsMicrosoft({
        voice: new VoiceMicrosoft({
          engines: [],
          code: 'voiceIdCode',
          name: 'John',
          nativeName: 'John',
          gender: 'Male',
          locale: VoiceLocale.fromCode('en'),
        }),
        ssml: '<speak>Hello World</speak>',
        ssmlOptions: new ConvertSsmlOptionsMicrosoft({
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
      const ttsParams = new ConvertParamsMicrosoft({
        voice: new VoiceMicrosoft({
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

  describe('ConvertParamsMicrosoft Tests for textOptions', () => {
    test('should create with custom textOptions', () => {
      const ttsParams = new ConvertParamsMicrosoft({
        voice: new VoiceMicrosoft({
          engines: [],
          code: 'voiceIdCode',
          name: 'John',
          nativeName: 'John',
          gender: 'Male',
          locale: VoiceLocale.fromCode('en'),
        }),
        text: 'Hello World',
        textOptions: new ConvertTextOptionsMicrosoft({
          splitLimit: 5000,
        }),
      });

      expect(ttsParams).toBeDefined();
      expect(ttsParams.textOptions).toBeDefined();
      expect(ttsParams.textOptions.splitLimit).toBe(5000);
    });

    test('should create with default textOptions when not provided', () => {
      const ttsParams = new ConvertParamsMicrosoft({
        voice: new VoiceMicrosoft({
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

  describe('ConvertParamsMicrosoft Tests for httpProxy', () => {
    test('should create with only httpProxy parameter', () => {
      const params = new ConvertParamsMicrosoft({
        voice: new VoiceMicrosoft({
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
