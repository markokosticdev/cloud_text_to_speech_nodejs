import { TtsUniversal } from '../../src/universal/tts/tts.js';
import { TtsProviders } from '../../src/common/tts/tts_providers.js';
import { VoicesParamsUniversal } from '../../src/universal/voices/voices_params.js';
import { VoicesNameOptionsUniversal } from '../../src/universal/voices/voices_options.js';
import { VoicesNameOptionsGoogle } from '../../src/google/voices/voices_name_options.js';
import { VoicesNameOptionsMicrosoft } from '../../src/microsoft/voices/voices_name_options.js';
import { VoicesNameOptionsAmazon } from '../../src/amazon/voices/voices_name_options.js';
import { HttpProxyMapperOptionsUniversal } from '../../src/universal/voices/voices_options.js';
import { HttpProxyBase } from '../../src/common/http/http_proxy_base.js';
import { ConvertParamsUniversal } from '../../src/universal/convert/convert_params.js';
import { VoiceUniversal } from '../../src/universal/voices/voices_model.js';
import { VoiceLocale } from '../../src/common/locale/locale_model.js';
import { ConvertAudioOptionsUniversal } from '../../src/universal/convert/convert_audio_options.js';
import { AudioOutputFormatUniversal } from '../../src/universal/convert/audio/audio_output_format.js';

describe('TtsUniversal System Integration Tests', () => {
  beforeEach(() => {
    // Reset any previous initialization - using initDone property
    TtsUniversal['_initDone'] = false;
  });

  afterEach(() => {
    // Clean up after each test
    TtsUniversal['_initDone'] = false;
  });

  describe('Multi-Provider Initialization Tests', () => {
    test('should initialize successfully with all required parameters', () => {
      expect(() => {
        TtsUniversal.init({
          provider: TtsProviders.combine,
          googleParams: { apiKey: 'test-google-key' },
          microsoftParams: {
            subscriptionKey: 'test-microsoft-key',
            region: 'eastus',
          },
          amazonParams: {
            keyId: 'test-amazon-key-id',
            accessKey: 'test-amazon-access-key',
            region: 'us-east-1',
          },
          withLogs: false,
        });
      }).not.toThrow();

      expect(TtsUniversal.initDone).toBe(true);
    });

    test('should maintain initialization state correctly', () => {
      TtsUniversal.init({
        provider: TtsProviders.google,
        googleParams: { apiKey: 'test-google-key' },
        microsoftParams: {
          subscriptionKey: 'test-microsoft-key',
          region: 'eastus',
        },
        amazonParams: {
          keyId: 'test-amazon-key-id',
          accessKey: 'test-amazon-access-key',
          region: 'us-east-1',
        },
        withLogs: false,
      });

      expect(TtsUniversal.initDone).toBe(true);
    });

    test('should handle provider switching correctly', () => {
      TtsUniversal.init({
        provider: TtsProviders.combine,
        googleParams: { apiKey: 'test-google-key' },
        microsoftParams: {
          subscriptionKey: 'test-microsoft-key',
          region: 'eastus',
        },
        amazonParams: {
          keyId: 'test-amazon-key-id',
          accessKey: 'test-amazon-access-key',
          region: 'us-east-1',
        },
        withLogs: false,
      });

      expect(() => {
        TtsUniversal.setProvider(TtsProviders.google);
      }).not.toThrow();

      expect(() => {
        TtsUniversal.setProvider(TtsProviders.microsoft);
      }).not.toThrow();

      expect(() => {
        TtsUniversal.setProvider(TtsProviders.amazon);
      }).not.toThrow();
    });
  });



  describe('Voice Retrieval Integration Tests', () => {
    test('should create voice parameters for single provider mode', () => {
      const voicesParams = new VoicesParamsUniversal({
        nameOptions: new VoicesNameOptionsUniversal({
          google: new VoicesNameOptionsGoogle({
            maleNames: ['en-US-Wavenet-A', 'en-US-Wavenet-B'],
            femaleNames: ['en-US-Wavenet-C', 'en-US-Wavenet-F'],
          }),
        }),
      });

      expect(voicesParams).toBeDefined();
      expect(voicesParams.nameOptions.google.maleNames).toHaveLength(2);
      expect(voicesParams.nameOptions.google.femaleNames).toHaveLength(2);
    });

    test('should create voice parameters for multi-provider mode', () => {
      const voicesParams = new VoicesParamsUniversal({
        nameOptions: new VoicesNameOptionsUniversal({
          google: new VoicesNameOptionsGoogle({
            maleNames: ['en-US-Wavenet-A'],
            femaleNames: ['en-US-Wavenet-C'],
          }),
          microsoft: new VoicesNameOptionsMicrosoft({
            maleNames: ['en-US-AriaNeural'],
            femaleNames: ['en-US-JennyNeural'],
          }),
          amazon: new VoicesNameOptionsAmazon({
            maleNames: ['Matthew'],
            femaleNames: ['Joanna'],
          }),
        }),
      });

      expect(voicesParams).toBeDefined();
      expect(voicesParams.nameOptions.google.maleNames).toEqual(['en-US-Wavenet-A']);
      expect(voicesParams.nameOptions.microsoft.maleNames).toEqual(['en-US-AriaNeural']);
      expect(voicesParams.nameOptions.amazon.maleNames).toEqual(['Matthew']);
    });

    test('should handle voice parameters with HTTP proxy configuration', () => {
      const voicesParams = new VoicesParamsUniversal({
        nameOptions: new VoicesNameOptionsUniversal({
          google: new VoicesNameOptionsGoogle({
            maleNames: ['en-US-Wavenet-A'],
          }),
        }),
        httpProxy: new HttpProxyMapperOptionsUniversal({
          google: () => new HttpProxyBase({
            headers: { 'Authorization': 'Bearer test-token' },
          }),
        }),
      });

      expect(voicesParams).toBeDefined();
      expect(voicesParams.httpProxy).toBeDefined();
      expect(voicesParams.httpProxy.google).toBeDefined();

      const googleProxy = voicesParams.httpProxy.google!();
      expect(googleProxy.headers['Authorization']).toBe('Bearer test-token');
    });
  });

  describe('Convert Parameters Integration Tests', () => {
    test('should create convert parameters for text-to-speech', () => {
      const voice = new VoiceUniversal({
        provider: TtsProviders.google,
        engines: ['neural'],
        code: 'en-US-Wavenet-A',
        name: 'Wavenet A',
        nativeName: 'Wavenet A',
        gender: 'Male',
        locale: VoiceLocale.fromCode('en-US'),
      });

      const convertParams = new ConvertParamsUniversal({
        voice: voice,
        text: 'Hello, this is a test message for text-to-speech conversion.',
        rate: 'medium',
        pitch: 'medium',
      });

      expect(convertParams).toBeDefined();
      expect(convertParams.voice).toBeDefined();
      expect(convertParams.text).toBe('Hello, this is a test message for text-to-speech conversion.');
      expect(convertParams.rate).toBe('medium');
      expect(convertParams.pitch).toBe('medium');
    });

    test('should create convert parameters for SSML-to-speech', () => {
      const voice = new VoiceUniversal({
        provider: TtsProviders.microsoft,
        engines: ['neural'],
        code: 'en-US-AriaNeural',
        name: 'Aria',
        nativeName: 'Aria',
        gender: 'Female',
        locale: VoiceLocale.fromCode('en-US'),
      });

      const ssmlContent = '<speak><p>Hello, this is a <emphasis level="strong">test message</emphasis> for SSML conversion.</p><break time="1s"/><p>This includes various SSML features.</p></speak>';

      const convertParams = new ConvertParamsUniversal({
        voice: voice,
        ssml: ssmlContent,
        rate: 'slow',
        pitch: 'high',
        audioOptions: new ConvertAudioOptionsUniversal({
          audioFormat: AudioOutputFormatUniversal.mp3_128k,
        }),
      });

      expect(convertParams).toBeDefined();
      expect(convertParams.voice).toBeDefined();
      expect(convertParams.ssml).toContain('emphasis level="strong"');
      expect(convertParams.ssml).toContain('break time="1s"');
      expect(convertParams.rate).toBe('slow');
      expect(convertParams.pitch).toBe('high');
      expect(convertParams.audioOptions).toBeDefined();
    });

    test('should create convert parameters with complex audio configuration', () => {
      const voice = new VoiceUniversal({
        provider: TtsProviders.amazon,
        engines: ['neural'],
        code: 'Matthew',
        name: 'Matthew',
        nativeName: 'Matthew',
        gender: 'Male',
        locale: VoiceLocale.fromCode('en-US'),
      });

      const convertParams = new ConvertParamsUniversal({
        voice: voice,
        text: 'Testing audio configuration parameters.',
        audioOptions: new ConvertAudioOptionsUniversal({
          audioFormat: AudioOutputFormatUniversal.pcm16Bit24KhzMono,
        }),
      });

      expect(convertParams).toBeDefined();
      expect(convertParams.audioOptions).toBeDefined();
      expect(convertParams.audioOptions.audioFormat).toBe(AudioOutputFormatUniversal.pcm16Bit24KhzMono);
    });
  });

  describe('Cross-Provider Configuration Tests', () => {
    test('should handle configuration consistency across providers', () => {
      const voicesParams = new VoicesParamsUniversal({
        nameOptions: new VoicesNameOptionsUniversal({
          google: new VoicesNameOptionsGoogle({
            maleNames: ['en-US-Wavenet-A', 'en-US-Wavenet-B'],
            femaleNames: ['en-US-Wavenet-C', 'en-US-Wavenet-F'],
          }),
          microsoft: new VoicesNameOptionsMicrosoft({
            maleNames: ['en-US-AriaNeural'],
            femaleNames: ['en-US-JennyNeural', 'en-US-SaraNeural'],
          }),
          amazon: new VoicesNameOptionsAmazon({
            maleNames: ['Matthew', 'Brian', 'Justin'],
            femaleNames: ['Joanna', 'Kimberly', 'Salli'],
          }),
        }),
        httpProxy: new HttpProxyMapperOptionsUniversal({
          google: () => new HttpProxyBase({
            headers: { 'User-Agent': 'TTS-Universal-Client/1.0' },
          }),
          microsoft: () => new HttpProxyBase({
            headers: { 'User-Agent': 'TTS-Universal-Client/1.0' },
          }),
          amazon: () => new HttpProxyBase({
            headers: { 'User-Agent': 'TTS-Universal-Client/1.0' },
          }),
        }),
      });

      // Validate each provider maintains independent configuration
      expect(voicesParams.nameOptions.google.maleNames).toHaveLength(2);
      expect(voicesParams.nameOptions.microsoft.maleNames).toHaveLength(1);
      expect(voicesParams.nameOptions.amazon.maleNames).toHaveLength(3);

      expect(voicesParams.nameOptions.google.femaleNames).toHaveLength(2);
      expect(voicesParams.nameOptions.microsoft.femaleNames).toHaveLength(2);
      expect(voicesParams.nameOptions.amazon.femaleNames).toHaveLength(3);

      // Validate HTTP proxy consistency
      const googleProxy = voicesParams.httpProxy.google!();
      const microsoftProxy = voicesParams.httpProxy.microsoft!();
      const amazonProxy = voicesParams.httpProxy.amazon!();

      expect(googleProxy.headers['User-Agent']).toBe('TTS-Universal-Client/1.0');
      expect(microsoftProxy.headers['User-Agent']).toBe('TTS-Universal-Client/1.0');
      expect(amazonProxy.headers['User-Agent']).toBe('TTS-Universal-Client/1.0');
    });

    test('should handle mixed configuration scenarios', () => {
      const voicesParams = new VoicesParamsUniversal({
        nameOptions: new VoicesNameOptionsUniversal({
          google: new VoicesNameOptionsGoogle({
            maleNamesMapper: (voices, index) => `google-${voices[index]?.name}`,
          }),
          microsoft: new VoicesNameOptionsMicrosoft({
            femaleNames: ['en-US-JennyNeural'],
          }),
          amazon: new VoicesNameOptionsAmazon({
            maleNames: ['Matthew'],
            femaleNamesMapper: (voices, index) => `amazon-${voices[index]?.name}`,
          }),
        }),
      });

      // Google uses mapper for males
      expect(voicesParams.nameOptions.google.maleNamesMapper).toBeDefined();
      expect(voicesParams.nameOptions.google.maleNames).toBeUndefined();

      // Microsoft uses array for females
      expect(voicesParams.nameOptions.microsoft.femaleNames).toEqual(['en-US-JennyNeural']);
      expect(voicesParams.nameOptions.microsoft.maleNames).toBeUndefined();

      // Amazon uses both array and mapper
      expect(voicesParams.nameOptions.amazon.maleNames).toEqual(['Matthew']);
      expect(voicesParams.nameOptions.amazon.femaleNamesMapper).toBeDefined();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle voice creation with minimal parameters', () => {
      const voice = new VoiceUniversal({
        provider: TtsProviders.google,
        engines: [],
        code: '',
        name: '',
        nativeName: '',
        gender: 'Unknown',
        locale: VoiceLocale.fromCode('en'),
      });

      expect(voice).toBeDefined();
      expect(voice.provider).toBe(TtsProviders.google);
      expect(voice.engines).toEqual([]);
      expect(voice.code).toBe('');
      expect(voice.gender).toBe('Unknown');
    });

    test('should handle convert parameters with missing optional fields', () => {
      const voice = new VoiceUniversal({
        provider: TtsProviders.google,
        engines: ['neural'],
        code: 'en-US-Wavenet-A',
        name: 'Wavenet A',
        nativeName: 'Wavenet A',
        gender: 'Male',
        locale: VoiceLocale.fromCode('en-US'),
      });

      const convertParams = new ConvertParamsUniversal({
        voice: voice,
        text: 'Simple test',
        // No rate, pitch, or audio options provided
      });

      expect(convertParams).toBeDefined();
      expect(convertParams.voice).toBeDefined();
      expect(convertParams.text).toBe('Simple test');
      expect(convertParams.rate).toBe('default');
      expect(convertParams.pitch).toBe('default');
    });

    test('should handle empty voice parameters gracefully', () => {
      const voicesParams = new VoicesParamsUniversal();

      expect(voicesParams).toBeDefined();
      expect(voicesParams.nameOptions).toBeDefined();
      expect(voicesParams.nameOptions.google).toBeDefined();
      expect(voicesParams.nameOptions.microsoft).toBeDefined();
      expect(voicesParams.nameOptions.amazon).toBeDefined();
      expect(voicesParams.httpProxy).toBeUndefined();
    });
  });

  describe('System Integration Validation', () => {
    test('should validate complete system workflow preparation', () => {
      // Step 1: Initialize system
      TtsUniversal.init({
        provider: TtsProviders.combine,
        googleParams: { apiKey: 'test-google-key' },
        microsoftParams: {
          subscriptionKey: 'test-microsoft-key',
          region: 'eastus',
        },
        amazonParams: {
          keyId: 'test-amazon-key-id',
          accessKey: 'test-amazon-access-key',
          region: 'us-east-1',
        },
        withLogs: false,
      });

      // Step 2: Create voice parameters
      const voicesParams = new VoicesParamsUniversal({
        nameOptions: new VoicesNameOptionsUniversal({
          google: new VoicesNameOptionsGoogle({
            maleNames: ['en-US-Wavenet-A'],
          }),
          microsoft: new VoicesNameOptionsMicrosoft({
            femaleNames: ['en-US-JennyNeural'],
          }),
          amazon: new VoicesNameOptionsAmazon({
            maleNames: ['Matthew'],
          }),
        }),
      });

      // Step 3: Create mock voice
      const voice = new VoiceUniversal({
        provider: TtsProviders.google,
        engines: ['neural'],
        code: 'en-US-Wavenet-A',
        name: 'Wavenet A',
        nativeName: 'Wavenet A',
        gender: 'Male',
        locale: VoiceLocale.fromCode('en-US'),
      });

      // Step 4: Create convert parameters
      const convertParams = new ConvertParamsUniversal({
        voice: voice,
        text: 'System integration test message',
        audioOptions: new ConvertAudioOptionsUniversal({
          audioFormat: AudioOutputFormatUniversal.mp3_128k,
        }),
      });

      // Validate all components are ready
      expect(TtsUniversal.initDone).toBe(true);
      expect(voicesParams).toBeDefined();
      expect(voice).toBeDefined();
      expect(convertParams).toBeDefined();
    });

    test('should validate parameter consistency for production use', () => {
      const voice = new VoiceUniversal({
        provider: TtsProviders.microsoft,
        engines: ['neural'],
        code: 'en-US-AriaNeural',
        name: 'Aria',
        nativeName: 'Aria',
        gender: 'Female',
        locale: VoiceLocale.fromCode('en-US'),
      });

      const convertParams = new ConvertParamsUniversal({
        voice: voice,
        ssml: '<speak><p>Production ready SSML content</p></speak>',
        rate: 'medium',
        pitch: 'medium',
        audioOptions: new ConvertAudioOptionsUniversal({
          audioFormat: AudioOutputFormatUniversal.mp3_128k,
        }),
      });

      // Validate production-ready parameters
      expect(convertParams.voice.provider).toBe(TtsProviders.microsoft);
      expect(convertParams.voice.engines).toContain('neural');
      expect(convertParams.ssml).toContain('<speak>');
      expect(convertParams.rate).toBe('medium');
      expect(convertParams.pitch).toBe('medium');
      expect(convertParams.audioOptions.audioFormat).toBe(AudioOutputFormatUniversal.mp3_128k);
    });
  });
}); 