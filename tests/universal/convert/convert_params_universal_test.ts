import { ConvertParamsUniversal } from '../../../src/universal/convert/convert_params.js';
import { ConvertAudioOptionsUniversal } from '../../../src/universal/convert/convert_audio_options.js';
import { AudioOutputFormatUniversal } from '../../../src/universal/convert/audio/audio_output_format.js';
import { ConvertProcessOptionsUniversal } from '../../../src/universal/convert/convert_process_options.js';
import { VoiceLocale } from '../../../src/common/locale/locale_model.js';
import { VoiceUniversal } from '../../../src/universal/voices/voices_model.js';
import {
  ConvertSsmlOptionsUniversal,
  ConvertTextOptionsUniversal,
} from '../../../src/universal/convert/convert_options.js';
import { AudioOutputStreamFormatUniversal } from '../../../src/universal/convert/audio/audio_output_stream_format.js';
import { TtsProviders } from '../../../src/common/tts/tts_providers.js';
import { ConvertSsmlOptionsGoogle } from '../../../src/google/convert/convert_ssml_options.js';
import { ConvertSsmlOptionsMicrosoft } from '../../../src/microsoft/convert/convert_ssml_options.js';
import { ConvertSsmlOptionsAmazon } from '../../../src/amazon/convert/convert_ssml_options.js';
import { ConvertTextOptionsGoogle } from '../../../src/google/convert/convert_text_options.js';
import { ConvertTextOptionsMicrosoft } from '../../../src/microsoft/convert/convert_text_options.js';
import { ConvertTextOptionsAmazon } from '../../../src/amazon/convert/convert_text_options.js';
import { HttpProxyMapperOptionsUniversal } from '../../../src/universal/voices/voices_options.js';
import { HttpProxyBase } from '../../../src/common/http/http_proxy_base.js';
import { AudioOutputFormatMapperUniversal } from '../../../src/universal/convert/audio/audio_output_format_mapper.js';
import { AudioOutputFormatGoogle } from '../../../src/google/convert/audio/audio_output_format.js';
import { AudioOutputFormatMicrosoft } from '../../../src/microsoft/convert/audio/audio_output_format.js';
import { AudioOutputFormatAmazon } from '../../../src/amazon/convert/audio/audio_output_format.js';
import { AudioOutputStreamFormatMapperUniversal } from '../../../src/universal/convert/audio/audio_output_stream_format_mapper.js';
import { AudioOutputStreamFormatGoogle } from '../../../src/google/convert/audio/audio_output_stream_format.js';
import { AudioOutputStreamFormatMicrosoft } from '../../../src/microsoft/convert/audio/audio_output_stream_format.js';
import { AudioOutputStreamFormatAmazon } from '../../../src/amazon/convert/audio/audio_output_stream_format.js';
import { ConvertParamsMapper } from '../../../src/universal/convert/convert_params_mapper.js';

describe('ConvertParamsUniversal Tests', () => {
  const mockVoice = (): VoiceUniversal =>
    new VoiceUniversal({
      provider: TtsProviders.google,
      engines: [],
      code: 'voiceIdCode',
      name: 'John',
      nativeName: 'John',
      gender: 'Male',
      locale: VoiceLocale.fromCode('en'),
    });

  describe('ConvertParamsUniversal Tests for voice, voiceId, ssml, ssmlChunks, text and textChunks', () => {
    test('should create with voice and ssml, ensuring the constraint is followed', () => {
      const params = new ConvertParamsUniversal({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
      });

      expect(params).toBeDefined();
      expect(params.voice).toBeDefined();
      expect(params.ssml).toBe('<speak>Hello World</speak>');
      expect(params.ssmlChunks).toBeUndefined();
      expect(params.text).toBeUndefined();
      expect(params.textChunks).toBeUndefined();
    });

    test('should create with voice and ssmlChunks, ensuring the constraint is followed', () => {
      const params = new ConvertParamsUniversal({
        voice: mockVoice(),
        ssmlChunks: ['<speak>Hello</speak>', '<speak>World</speak>'],
      });

      expect(params).toBeDefined();
      expect(params.voice).toBeDefined();
      expect(params.ssml).toBeUndefined();
      expect(params.ssmlChunks).toEqual([
        '<speak>Hello</speak>',
        '<speak>World</speak>',
      ]);
      expect(params.text).toBeUndefined();
      expect(params.textChunks).toBeUndefined();
    });

    test('should create with voice and text, ensuring the constraint is followed', () => {
      const params = new ConvertParamsUniversal({
        voice: mockVoice(),
        text: 'Hello World',
      });

      expect(params).toBeDefined();
      expect(params.voice).toBeDefined();
      expect(params.ssml).toBeUndefined();
      expect(params.ssmlChunks).toBeUndefined();
      expect(params.text).toBe('Hello World');
      expect(params.textChunks).toBeUndefined();
    });

    test('should create with voice and textChunks, ensuring the constraint is followed', () => {
      const params = new ConvertParamsUniversal({
        voice: mockVoice(),
        textChunks: ['Hello', 'World'],
      });

      expect(params).toBeDefined();
      expect(params.voice).toBeDefined();
      expect(params.ssml).toBeUndefined();
      expect(params.ssmlChunks).toBeUndefined();
      expect(params.text).toBeUndefined();
      expect(params.textChunks).toEqual(['Hello', 'World']);
    });
  });

  describe('ConvertParamsUniversal Tests for rate and pitch', () => {
    test('should create with voice and ssml, and ensure rate and pitch are set', () => {
      const params = new ConvertParamsUniversal({
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
      const params = new ConvertParamsUniversal({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
      });

      expect(params).toBeDefined();
      expect(params.rate).toBe('default');
      expect(params.pitch).toBe('default');
    });

    test('should create with only custom rate, and default pitch', () => {
      const params = new ConvertParamsUniversal({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
        rate: 'fast',
      });

      expect(params).toBeDefined();
      expect(params.rate).toBe('fast');
      expect(params.pitch).toBe('default');
    });

    test('should create with only custom pitch, and default rate', () => {
      const params = new ConvertParamsUniversal({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
        pitch: 'low',
      });

      expect(params).toBeDefined();
      expect(params.rate).toBe('default');
      expect(params.pitch).toBe('low');
    });
  });

  describe('ConvertParamsUniversal Tests for audioOptions', () => {
    test('should create with custom audioOptions that has audioFormat and audioStreamFormat', () => {
      const params = new ConvertParamsUniversal({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
        audioOptions: new ConvertAudioOptionsUniversal({
          audioFormat: AudioOutputFormatUniversal.mp3_32k,
          audioStreamFormat: AudioOutputStreamFormatUniversal.pcm16Bit16KhzMono,
        }),
      });

      expect(params).toBeDefined();
      expect(params.audioOptions).toBeDefined();
      expect(params.audioOptions.audioFormat).toBe(
        AudioOutputFormatUniversal.mp3_32k,
      );
      expect(params.audioOptions.audioStreamFormat).toBe(
        AudioOutputStreamFormatUniversal.pcm16Bit16KhzMono,
      );
      expect(params.audioOptions.audioFormatMapper).toBeDefined();
      expect(params.audioOptions.audioStreamFormatMapper).toBeDefined();

      expect(params.audioOptions.audioFormatMapper.google).toBeUndefined();
      expect(params.audioOptions.audioFormatMapper.microsoft).toBeUndefined();
      expect(params.audioOptions.audioFormatMapper.amazon).toBeUndefined();

      expect(
        params.audioOptions.audioStreamFormatMapper.google,
      ).toBeUndefined();
      expect(
        params.audioOptions.audioStreamFormatMapper.microsoft,
      ).toBeUndefined();
      expect(
        params.audioOptions.audioStreamFormatMapper.amazon,
      ).toBeUndefined();
    });

    test('should create with custom audioOptions', () => {
      const params = new ConvertParamsUniversal({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
        audioOptions: new ConvertAudioOptionsUniversal({
          audioFormatMapper: new AudioOutputFormatMapperUniversal({
            google: (): AudioOutputFormatGoogle => {
              return AudioOutputFormatGoogle.mp3;
            },
            microsoft: (): AudioOutputFormatMicrosoft => {
              return AudioOutputFormatMicrosoft.raw16Khz16BitMonoPcm;
            },
            amazon: (): AudioOutputFormatAmazon => {
              return AudioOutputFormatAmazon.mp3;
            },
          }),
          audioStreamFormatMapper: new AudioOutputStreamFormatMapperUniversal({
            google: (): AudioOutputStreamFormatGoogle => {
              return AudioOutputStreamFormatGoogle.linear16;
            },
            microsoft: (): AudioOutputStreamFormatMicrosoft => {
              return AudioOutputStreamFormatMicrosoft.raw16Khz16BitMonoPcm;
            },
            amazon: (): AudioOutputStreamFormatAmazon => {
              return AudioOutputStreamFormatAmazon.pcm;
            },
          }),
        }),
      });

      expect(params).toBeDefined();
      expect(params.audioOptions).toBeDefined();
      expect(params.audioOptions.audioFormat).toBeDefined();
      expect(params.audioOptions.audioStreamFormat).toBeDefined();
      expect(params.audioOptions.audioFormatMapper).toBeDefined();
      expect(params.audioOptions.audioStreamFormatMapper).toBeDefined();

      expect(params.audioOptions.audioFormatMapper.google).toBeDefined();
      expect(params.audioOptions.audioFormatMapper.microsoft).toBeDefined();
      expect(params.audioOptions.audioFormatMapper.amazon).toBeDefined();

      expect(params.audioOptions.audioStreamFormatMapper.google).toBeDefined();
      expect(
        params.audioOptions.audioStreamFormatMapper.microsoft,
      ).toBeDefined();
      expect(params.audioOptions.audioStreamFormatMapper.amazon).toBeDefined();
    });

    test('should create with default audioOptions when not provided', () => {
      const params = new ConvertParamsUniversal({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
      });

      expect(params).toBeDefined();
      expect(params.audioOptions).toBeDefined();
      expect(params.audioOptions.audioFormat).toBeDefined();
      expect(params.audioOptions.audioStreamFormat).toBeDefined();
      expect(params.audioOptions.audioFormatMapper).toBeDefined();
      expect(params.audioOptions.audioStreamFormatMapper).toBeDefined();

      expect(params.audioOptions.audioFormatMapper.google).toBeUndefined();
      expect(params.audioOptions.audioFormatMapper.microsoft).toBeUndefined();
      expect(params.audioOptions.audioFormatMapper.amazon).toBeUndefined();

      expect(
        params.audioOptions.audioStreamFormatMapper.google,
      ).toBeUndefined();
      expect(
        params.audioOptions.audioStreamFormatMapper.microsoft,
      ).toBeUndefined();
      expect(
        params.audioOptions.audioStreamFormatMapper.amazon,
      ).toBeUndefined();
    });

    test('should create with default audioOptions when provided empty', () => {
      const params = new ConvertParamsUniversal({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
        audioOptions: new ConvertAudioOptionsUniversal(),
      });

      expect(params).toBeDefined();
      expect(params.audioOptions).toBeDefined();
      expect(params.audioOptions.audioFormat).toBeDefined();
      expect(params.audioOptions.audioStreamFormat).toBeDefined();
      expect(params.audioOptions.audioFormatMapper).toBeDefined();
      expect(params.audioOptions.audioStreamFormatMapper).toBeDefined();

      expect(params.audioOptions.audioFormatMapper.google).toBeUndefined();
      expect(params.audioOptions.audioFormatMapper.microsoft).toBeUndefined();
      expect(params.audioOptions.audioFormatMapper.amazon).toBeUndefined();

      expect(
        params.audioOptions.audioStreamFormatMapper.google,
      ).toBeUndefined();
      expect(
        params.audioOptions.audioStreamFormatMapper.microsoft,
      ).toBeUndefined();
      expect(
        params.audioOptions.audioStreamFormatMapper.amazon,
      ).toBeUndefined();
    });
  });

  describe('ConvertParamsUniversal Tests for processOptions', () => {
    test('should create with custom processOptions', () => {
      const params = new ConvertParamsUniversal({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
        processOptions: new ConvertProcessOptionsUniversal({
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
      const params = new ConvertParamsUniversal({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
      });

      expect(params).toBeDefined();
      expect(params.processOptions).toBeDefined();
      expect(params.processOptions.processAsync).toBeDefined();
      expect(params.processOptions.processLimit).toBeDefined();
    });
  });

  describe('ConvertParamsUniversal Tests for ssmlOptions', () => {
    test('should create with custom ssmlOptions', () => {
      const params = new ConvertParamsUniversal({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
        ssmlOptions: new ConvertSsmlOptionsUniversal({
          google: new ConvertSsmlOptionsGoogle({
            allowedElements: { break: ['time'] },
            splitLimit: 4000,
          }),
          microsoft: new ConvertSsmlOptionsMicrosoft({
            allowedElements: { break: ['time'] },
            splitLimit: 4000,
          }),
          amazon: new ConvertSsmlOptionsAmazon({
            allowedElements: { break: ['time'] },
            splitLimit: 4000,
          }),
        }),
      });

      expect(params).toBeDefined();
      expect(params.ssmlOptions).toBeDefined();
      expect(params.ssmlOptions.google).toBeDefined();
      expect(params.ssmlOptions.microsoft).toBeDefined();
      expect(params.ssmlOptions.amazon).toBeDefined();

      expect(params.ssmlOptions.google.allowedElements).toEqual({
        break: ['time'],
      });
      expect(params.ssmlOptions.google.splitLimit).toBe(4000);

      expect(params.ssmlOptions.microsoft.allowedElements).toEqual({
        break: ['time'],
      });
      expect(params.ssmlOptions.microsoft.splitLimit).toBe(4000);

      expect(params.ssmlOptions.amazon.allowedElements).toEqual({
        break: ['time'],
      });
      expect(params.ssmlOptions.amazon.splitLimit).toBe(4000);
    });

    test('should create with default ssmlOptions when not provided', () => {
      const params = new ConvertParamsUniversal({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
      });

      expect(params).toBeDefined();
      expect(params.ssmlOptions).toBeDefined();
      expect(params.ssmlOptions.google).toBeDefined();
      expect(params.ssmlOptions.microsoft).toBeDefined();
      expect(params.ssmlOptions.amazon).toBeDefined();

      expect(params.ssmlOptions.google.allowedElements).toBeDefined();
      expect(params.ssmlOptions.google.splitLimit).toBeDefined();

      expect(params.ssmlOptions.microsoft.allowedElements).toBeDefined();
      expect(params.ssmlOptions.microsoft.splitLimit).toBeDefined();

      expect(params.ssmlOptions.amazon.allowedElements).toBeDefined();
      expect(params.ssmlOptions.amazon.splitLimit).toBeDefined();
    });
  });

  describe('ConvertParamsUniversal Tests for textOptions', () => {
    test('should create with custom textOptions', () => {
      const params = new ConvertParamsUniversal({
        voice: mockVoice(),
        text: 'Hello World',
        textOptions: new ConvertTextOptionsUniversal({
          google: new ConvertTextOptionsGoogle({
            splitLimit: 5000,
          }),
          microsoft: new ConvertTextOptionsMicrosoft({
            splitLimit: 5000,
          }),
          amazon: new ConvertTextOptionsAmazon({
            splitLimit: 5000,
          }),
        }),
      });

      expect(params).toBeDefined();
      expect(params.textOptions).toBeDefined();
      expect(params.textOptions.google).toBeDefined();
      expect(params.textOptions.microsoft).toBeDefined();
      expect(params.textOptions.amazon).toBeDefined();

      expect(params.textOptions.google.splitLimit).toBe(5000);

      expect(params.textOptions.microsoft.splitLimit).toBe(5000);

      expect(params.textOptions.amazon.splitLimit).toBe(5000);
    });

    test('should create with default textOptions when not provided', () => {
      const params = new ConvertParamsUniversal({
        voice: mockVoice(),
        text: 'Hello World',
      });

      expect(params).toBeDefined();
      expect(params.textOptions).toBeDefined();
      expect(params.textOptions.google).toBeDefined();
      expect(params.textOptions.microsoft).toBeDefined();
      expect(params.textOptions.amazon).toBeDefined();

      expect(params.textOptions.google.splitLimit).toBeDefined();

      expect(params.textOptions.microsoft.splitLimit).toBeDefined();

      expect(params.textOptions.amazon.splitLimit).toBeDefined();
    });
  });

  describe('ConvertParamsUniversal Tests for httpProxy', () => {
    test('should create with only httpProxy parameter', () => {
      const params = new ConvertParamsUniversal({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
        httpProxy: new HttpProxyMapperOptionsUniversal({
          google: (): HttpProxyBase => {
            return new HttpProxyBase({
              headers: {
                HeaderName: 'HeaderValue',
              },
            });
          },
          microsoft: (): HttpProxyBase => {
            return new HttpProxyBase({
              headers: {
                HeaderName: 'HeaderValue',
              },
            });
          },
          amazon: (): HttpProxyBase => {
            return new HttpProxyBase({
              headers: {
                HeaderName: 'HeaderValue',
              },
            });
          },
        }),
      });

      expect(params).toBeDefined();
      expect(params.httpProxy).toBeDefined();
      expect(typeof params.httpProxy.google).toBe('function');
      expect(typeof params.httpProxy.microsoft).toBe('function');
      expect(typeof params.httpProxy.amazon).toBe('function');
    });
  });

  describe('Provider Mapping Tests', () => {
    test('should map universal parameters to Google TTS format', () => {
      const universalParams = new ConvertParamsUniversal({
        voice: mockVoice(),
        ssml: '<speak>Hello World</speak>',
        rate: 'slow',
        pitch: 'high',
      });

      const googleParams = ConvertParamsMapper.toGoogle(universalParams);

      expect(googleParams).toBeDefined();
      expect(googleParams.voice).toBeDefined();
      expect(googleParams.voice.code).toBe('voiceIdCode');
      expect(googleParams.voice.name).toBe('John');
      expect(googleParams.ssml).toBe('<speak>Hello World</speak>');
      expect(googleParams.rate).toBe('slow');
      expect(googleParams.pitch).toBe('high');
      expect(googleParams.audioOptions).toBeDefined();
      expect(googleParams.processOptions).toBeDefined();
      expect(googleParams.ssmlOptions).toBeDefined();
      expect(googleParams.textOptions).toBeDefined();
    });

    test('should map universal parameters to Microsoft TTS format', () => {
      const universalParams = new ConvertParamsUniversal({
        voice: mockVoice(),
        text: 'Hello World',
        rate: 'fast',
        pitch: 'low',
      });

      const microsoftParams = ConvertParamsMapper.toMicrosoft(universalParams);

      expect(microsoftParams).toBeDefined();
      expect(microsoftParams.voice).toBeDefined();
      expect(microsoftParams.voice.code).toBe('voiceIdCode');
      expect(microsoftParams.voice.name).toBe('John');
      expect(microsoftParams.text).toBe('Hello World');
      expect(microsoftParams.rate).toBe('fast');
      expect(microsoftParams.pitch).toBe('low');
      expect(microsoftParams.audioOptions).toBeDefined();
      expect(microsoftParams.processOptions).toBeDefined();
      expect(microsoftParams.ssmlOptions).toBeDefined();
      expect(microsoftParams.textOptions).toBeDefined();
    });

    test('should map universal parameters to Amazon TTS format', () => {
      const universalParams = new ConvertParamsUniversal({
        voice: mockVoice(),
        textChunks: ['Hello', 'World'],
        rate: 'medium',
        pitch: 'default',
      });

      const amazonParams = ConvertParamsMapper.toAmazon(universalParams);

      expect(amazonParams).toBeDefined();
      expect(amazonParams.voice).toBeDefined();
      expect(amazonParams.voice.code).toBe('voiceIdCode');
      expect(amazonParams.voice.name).toBe('John');
      expect(amazonParams.textChunks).toEqual(['Hello', 'World']);
      expect(amazonParams.rate).toBe('medium');
      expect(amazonParams.pitch).toBe('default');
      expect(amazonParams.audioOptions).toBeDefined();
      expect(amazonParams.processOptions).toBeDefined();
      expect(amazonParams.ssmlOptions).toBeDefined();
      expect(amazonParams.textOptions).toBeDefined();
    });

    test('should preserve voice properties across provider mappings', () => {
      const voice = new VoiceUniversal({
        provider: TtsProviders.microsoft,
        engines: ['neural'],
        code: 'en-US-AriaNeural',
        name: 'Aria',
        nativeName: 'Aria',
        gender: 'Female',
        locale: VoiceLocale.fromCode('en-US'),
      });

      const universalParams = new ConvertParamsUniversal({
        voice: voice,
        ssml: '<speak>Test</speak>',
      });

      const googleParams = ConvertParamsMapper.toGoogle(universalParams);
      const microsoftParams = ConvertParamsMapper.toMicrosoft(universalParams);
      const amazonParams = ConvertParamsMapper.toAmazon(universalParams);

      // Check Google mapping
      expect(googleParams.voice.code).toBe('en-US-AriaNeural');
      expect(googleParams.voice.name).toBe('Aria');
      expect(googleParams.voice.gender).toBe('Female');
      expect(googleParams.voice.locale.code).toBe('en-US');

      // Check Microsoft mapping
      expect(microsoftParams.voice.code).toBe('en-US-AriaNeural');
      expect(microsoftParams.voice.name).toBe('Aria');
      expect(microsoftParams.voice.gender).toBe('Female');
      expect(microsoftParams.voice.locale.code).toBe('en-US');

      // Check Amazon mapping
      expect(amazonParams.voice.code).toBe('en-US-AriaNeural');
      expect(amazonParams.voice.name).toBe('Aria');
      expect(amazonParams.voice.gender).toBe('Female');
      expect(amazonParams.voice.locale.code).toBe('en-US');
    });
  });

  describe('Audio Format Handling Tests', () => {
    test('should convert universal audio formats to provider-specific', () => {
      const audioOptions = new ConvertAudioOptionsUniversal({
        audioFormat: AudioOutputFormatUniversal.mp3_32k,
        audioStreamFormat: AudioOutputStreamFormatUniversal.pcm16Bit16KhzMono,
      });

      const universalParams = new ConvertParamsUniversal({
        voice: mockVoice(),
        ssml: '<speak>Test</speak>',
        audioOptions: audioOptions,
      });

      const googleParams = ConvertParamsMapper.toGoogle(universalParams);
      const microsoftParams = ConvertParamsMapper.toMicrosoft(universalParams);
      const amazonParams = ConvertParamsMapper.toAmazon(universalParams);

      // Verify audio format mapping
      expect(googleParams.audioOptions.audioFormat).toBeDefined();
      expect(microsoftParams.audioOptions.audioFormat).toBeDefined();
      expect(amazonParams.audioOptions.audioFormat).toBeDefined();

      // Verify audio stream format mapping
      expect(googleParams.audioOptions.audioStreamFormat).toBeDefined();
      expect(microsoftParams.audioOptions.audioStreamFormat).toBeDefined();
      expect(amazonParams.audioOptions.audioStreamFormat).toBeDefined();
    });

    test('should handle unsupported audio format gracefully', () => {
      const audioFormatMapper = new AudioOutputFormatMapperUniversal({
        google: (): AudioOutputFormatGoogle => AudioOutputFormatGoogle.mp3,
        microsoft: (): AudioOutputFormatMicrosoft => AudioOutputFormatMicrosoft.raw16Khz16BitMonoPcm,
        amazon: (): AudioOutputFormatAmazon => AudioOutputFormatAmazon.mp3,
      });

      const audioOptions = new ConvertAudioOptionsUniversal({
        audioFormat: AudioOutputFormatUniversal.mp3_64k,
        audioFormatMapper: audioFormatMapper,
      });

      const universalParams = new ConvertParamsUniversal({
        voice: mockVoice(),
        ssml: '<speak>Test</speak>',
        audioOptions: audioOptions,
      });

      // Should not throw and should use custom mappers
      expect(() => ConvertParamsMapper.toGoogle(universalParams)).not.toThrow();
      expect(() => ConvertParamsMapper.toMicrosoft(universalParams)).not.toThrow();
      expect(() => ConvertParamsMapper.toAmazon(universalParams)).not.toThrow();

      const googleParams = ConvertParamsMapper.toGoogle(universalParams);
      expect(googleParams.audioOptions.audioFormat).toBe(AudioOutputFormatGoogle.mp3);
    });

    test('should validate audio stream format mapping', () => {
                   const streamFormatMapper = new AudioOutputStreamFormatMapperUniversal({
        google: (): AudioOutputStreamFormatGoogle => AudioOutputStreamFormatGoogle.linear16,
        microsoft: (): AudioOutputStreamFormatMicrosoft => AudioOutputStreamFormatMicrosoft.raw16Khz16BitMonoPcm,
        amazon: (): AudioOutputStreamFormatAmazon => AudioOutputStreamFormatAmazon.pcm,
      });

      const audioOptions = new ConvertAudioOptionsUniversal({
        audioStreamFormat: AudioOutputStreamFormatUniversal.pcm16Bit24KhzMono,
        audioStreamFormatMapper: streamFormatMapper,
      });

      const universalParams = new ConvertParamsUniversal({
        voice: mockVoice(),
        ssml: '<speak>Test</speak>',
        audioOptions: audioOptions,
      });

      const googleParams = ConvertParamsMapper.toGoogle(universalParams);
      const microsoftParams = ConvertParamsMapper.toMicrosoft(universalParams);
      const amazonParams = ConvertParamsMapper.toAmazon(universalParams);

             expect(googleParams.audioOptions.audioStreamFormat).toBe(AudioOutputStreamFormatGoogle.linear16);
       expect(microsoftParams.audioOptions.audioStreamFormat).toBe(AudioOutputStreamFormatMicrosoft.raw16Khz16BitMonoPcm);
       expect(amazonParams.audioOptions.audioStreamFormat).toBe(AudioOutputStreamFormatAmazon.pcm);
     });

     test('should use default audio format mappers when custom not provided', () => {
       const audioOptions = new ConvertAudioOptionsUniversal({
         audioFormat: AudioOutputFormatUniversal.mp3_64k,
      });

      const universalParams = new ConvertParamsUniversal({
        voice: mockVoice(),
        ssml: '<speak>Test</speak>',
        audioOptions: audioOptions,
      });

      // Should use default mapping behavior
      expect(() => ConvertParamsMapper.toGoogle(universalParams)).not.toThrow();
      expect(() => ConvertParamsMapper.toMicrosoft(universalParams)).not.toThrow();
      expect(() => ConvertParamsMapper.toAmazon(universalParams)).not.toThrow();

      const googleParams = ConvertParamsMapper.toGoogle(universalParams);
      expect(googleParams.audioOptions.audioFormat).toBeDefined();
    });
  });

  describe('SSML Processing Integration Tests', () => {
    test('should process SSML content with provider-specific schemas', () => {
      const ssmlOptions = new ConvertSsmlOptionsUniversal({
        google: new ConvertSsmlOptionsGoogle({
          allowedElements: { break: ['time'], emphasis: ['level'] },
          splitLimit: 300,
        }),
        microsoft: new ConvertSsmlOptionsMicrosoft({
          allowedElements: { break: ['time'], emphasis: ['level'] },
          splitLimit: 250,
        }),
        amazon: new ConvertSsmlOptionsAmazon({
          allowedElements: { break: ['time'], emphasis: ['level'] },
          splitLimit: 200,
        }),
      });

      const universalParams = new ConvertParamsUniversal({
        voice: mockVoice(),
        ssml: '<speak><emphasis level="strong">Hello</emphasis> <break time="500ms"/> World</speak>',
        ssmlOptions: ssmlOptions,
      });

      const googleParams = ConvertParamsMapper.toGoogle(universalParams);
      const microsoftParams = ConvertParamsMapper.toMicrosoft(universalParams);
      const amazonParams = ConvertParamsMapper.toAmazon(universalParams);

      expect(googleParams.ssmlOptions.splitLimit).toBe(300);
      expect(microsoftParams.ssmlOptions.splitLimit).toBe(250);
      expect(amazonParams.ssmlOptions.splitLimit).toBe(200);

      expect(googleParams.ssmlOptions.allowedElements.break).toEqual(['time']);
      expect(microsoftParams.ssmlOptions.allowedElements.emphasis).toEqual(['level']);
      expect(amazonParams.ssmlOptions.allowedElements.break).toEqual(['time']);
    });

    test('should preserve SSML tags through universal conversion', () => {
      const ssmlContent = '<speak><p>Hello <emphasis level="strong">world</emphasis>!</p><break time="1s"/><s>How are you?</s></speak>';
      
      const universalParams = new ConvertParamsUniversal({
        voice: mockVoice(),
        ssml: ssmlContent,
      });

      const googleParams = ConvertParamsMapper.toGoogle(universalParams);
      const microsoftParams = ConvertParamsMapper.toMicrosoft(universalParams);
      const amazonParams = ConvertParamsMapper.toAmazon(universalParams);

      // SSML content should be preserved in all mappings
      expect(googleParams.ssml).toBe(ssmlContent);
      expect(microsoftParams.ssml).toBe(ssmlContent);
      expect(amazonParams.ssml).toBe(ssmlContent);
    });

    test('should handle SSML chunks with provider-specific processing', () => {
      const ssmlChunks = [
        '<speak>First chunk</speak>',
        '<speak>Second chunk with <break time="500ms"/></speak>',
        '<speak><emphasis level="moderate">Third chunk</emphasis></speak>'
      ];

      const universalParams = new ConvertParamsUniversal({
        voice: mockVoice(),
        ssmlChunks: ssmlChunks,
      });

      const googleParams = ConvertParamsMapper.toGoogle(universalParams);
      const microsoftParams = ConvertParamsMapper.toMicrosoft(universalParams);
      const amazonParams = ConvertParamsMapper.toAmazon(universalParams);

      expect(googleParams.ssmlChunks).toEqual(ssmlChunks);
      expect(microsoftParams.ssmlChunks).toEqual(ssmlChunks);
      expect(amazonParams.ssmlChunks).toEqual(ssmlChunks);
    });

    test('should handle SSML validation settings appropriately', () => {
      const ssmlOptions = new ConvertSsmlOptionsUniversal({
        google: new ConvertSsmlOptionsGoogle({
          validation: {
            enabled: true,
            mode: 'strict',
            validateAttributes: true,
            validateAttributeValues: true,
            allowUnknownElements: false,
          },
        }),
        microsoft: new ConvertSsmlOptionsMicrosoft({
          validation: {
            enabled: true,
            mode: 'warn',
            validateAttributes: true,
            validateAttributeValues: false,
            allowUnknownElements: true,
          },
        }),
        amazon: new ConvertSsmlOptionsAmazon({
          validation: {
            enabled: false,
            mode: 'silent',
            validateAttributes: false,
            validateAttributeValues: false,
            allowUnknownElements: true,
          },
        }),
      });

      const universalParams = new ConvertParamsUniversal({
        voice: mockVoice(),
        ssml: '<speak>Test</speak>',
        ssmlOptions: ssmlOptions,
      });

      const googleParams = ConvertParamsMapper.toGoogle(universalParams);
      const microsoftParams = ConvertParamsMapper.toMicrosoft(universalParams);
      const amazonParams = ConvertParamsMapper.toAmazon(universalParams);

      expect(googleParams.ssmlOptions.validation.enabled).toBe(true);
      expect(googleParams.ssmlOptions.validation.mode).toBe('strict');
      
      expect(microsoftParams.ssmlOptions.validation.enabled).toBe(true);
      expect(microsoftParams.ssmlOptions.validation.mode).toBe('warn');
      
      expect(amazonParams.ssmlOptions.validation.enabled).toBe(false);
      expect(amazonParams.ssmlOptions.validation.mode).toBe('silent');
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle invalid provider configurations', () => {
             const voice = new VoiceUniversal({
         provider: 'invalid-provider' as string,
        engines: [],
        code: 'test',
        name: 'Test',
        nativeName: 'Test',
        gender: 'Male',
        locale: VoiceLocale.fromCode('en'),
      });

      const universalParams = new ConvertParamsUniversal({
        voice: voice,
        ssml: '<speak>Test</speak>',
      });

      // Should not throw during parameter creation, but might during conversion
      expect(universalParams).toBeDefined();
      expect(universalParams.voice.provider).toBe('invalid-provider');
    });

    test('should throw appropriate errors for missing parameters', () => {
      const voice = mockVoice();

      // Test missing input content
      expect(() => {
        new ConvertParamsUniversal({
          voice: voice,
          // No ssml, ssmlChunks, text, or textChunks
        });
      }).toThrow('Either input, ssmlChunks, text or textChunks must be provided.');

      // Test multiple input types provided
      expect(() => {
        new ConvertParamsUniversal({
          voice: voice,
          ssml: '<speak>Test</speak>',
          text: 'Test',
        });
      }).toThrow('Only input, ssmlChunks, text or textChunks must be provided.');

      // Test valid single input type
      expect(() => {
        new ConvertParamsUniversal({
          voice: voice,
          ssml: '<speak>Test</speak>',
        });
      }).not.toThrow();
    });

    test('should handle provider-specific error scenarios', () => {
      const universalParams = new ConvertParamsUniversal({
        voice: mockVoice(),
        ssml: '<speak>Test</speak>',
      });

      // Test mapping with valid providers
      expect(() => ConvertParamsMapper.toGoogle(universalParams)).not.toThrow();
      expect(() => ConvertParamsMapper.toMicrosoft(universalParams)).not.toThrow();
      expect(() => ConvertParamsMapper.toAmazon(universalParams)).not.toThrow();
    });

    test('should validate voice object integrity', () => {
      const voice = new VoiceUniversal({
        provider: TtsProviders.google,
        engines: [],
        code: '',  // Empty code
        name: 'Test',
        nativeName: 'Test',
        gender: 'Male',
        locale: VoiceLocale.fromCode('en'),
      });

      const universalParams = new ConvertParamsUniversal({
        voice: voice,
        ssml: '<speak>Test</speak>',
      });

      // Should create params even with empty voice code
      expect(universalParams).toBeDefined();
      expect(universalParams.voice.code).toBe('');

      // Mapped parameters should preserve empty code
      const googleParams = ConvertParamsMapper.toGoogle(universalParams);
      expect(googleParams.voice.code).toBe('');
    });

    test('should handle complex parameter combinations', () => {
      const voice = mockVoice();
      
      const complexParams = new ConvertParamsUniversal({
        voice: voice,
        ssmlChunks: [
          '<speak>First chunk</speak>',
          '<speak>Second chunk</speak>',
        ],
        rate: 'x-fast',
        pitch: 'x-high',
                 audioOptions: new ConvertAudioOptionsUniversal({
           audioFormat: AudioOutputFormatUniversal.mp3_128k,
           audioStreamFormat: AudioOutputStreamFormatUniversal.pcm16Bit24KhzMono,
         }),
        processOptions: new ConvertProcessOptionsUniversal({
          processAsync: true,
          processLimit: 5,
        }),
      });

      expect(() => ConvertParamsMapper.toGoogle(complexParams)).not.toThrow();
      expect(() => ConvertParamsMapper.toMicrosoft(complexParams)).not.toThrow();
      expect(() => ConvertParamsMapper.toAmazon(complexParams)).not.toThrow();

      const googleParams = ConvertParamsMapper.toGoogle(complexParams);
      expect(googleParams.ssmlChunks).toEqual(complexParams.ssmlChunks);
      expect(googleParams.rate).toBe('x-fast');
      expect(googleParams.pitch).toBe('x-high');
      expect(googleParams.processOptions.processAsync).toBe(true);
      expect(googleParams.processOptions.processLimit).toBe(5);
    });
  });
});
