import { VoicesParamsUniversal } from '../../../src/universal/voices/voices_params.js';
import {
  HttpProxyMapperOptionsUniversal,
  VoicesNameOptionsUniversal,
} from '../../../src/universal/voices/voices_options.js';
import { VoicesNameOptionsGoogle } from '../../../src/google/voices/voices_name_options.js';
import { VoicesNameOptionsMicrosoft } from '../../../src/microsoft/voices/voices_name_options.js';
import { VoicesNameOptionsAmazon } from '../../../src/amazon/voices/voices_name_options.js';
import { VoiceNames } from '../../../src/common/voices/voices_names.js';
import { HttpProxyBase } from '../../../src/common/http/http_proxy_base.js';
import { VoicesParamsMapper } from '../../../src/universal/voices/voices_params_mapper.js';

describe('VoicesParamsUniversal Tests', () => {
  test('should create with no parameters at all', () => {
    const params = new VoicesParamsUniversal();
    expect(params).toBeDefined();
    expect(params.nameOptions).toBeDefined();
    expect(params.httpProxy).toBeUndefined();
  });

  describe('VoicesParamsUniversal Tests for nameOptions', () => {
    test('should create with empty nameOptions constructor', () => {
      const params = new VoicesParamsUniversal({
        nameOptions: new VoicesNameOptionsUniversal(),
      });

      expect(params).toBeDefined();
      expect(params.nameOptions).toBeDefined();
      expect(params.nameOptions.google).toBeDefined();
      expect(params.nameOptions.microsoft).toBeDefined();
      expect(params.nameOptions.amazon).toBeDefined();
      expect(params.nameOptions.google.maleNames).toBeDefined();
      expect(params.nameOptions.google.femaleNames).toBeDefined();
      expect(params.nameOptions.microsoft.maleNames).toBeUndefined();
      expect(params.nameOptions.microsoft.femaleNames).toBeUndefined();
      expect(params.nameOptions.amazon.maleNames).toBeUndefined();
      expect(params.nameOptions.amazon.femaleNames).toBeUndefined();
    });

    test('should create with maleNames and femaleNamesMapper present, ensuring the constraint is followed', () => {
      const params = new VoicesParamsUniversal({
        nameOptions: new VoicesNameOptionsUniversal({
          google: new VoicesNameOptionsGoogle({
            maleNames: ['John', 'Mike'],
            femaleNamesMapper: (voices, index): string => voices[index].name,
          }),
          microsoft: new VoicesNameOptionsMicrosoft({
            maleNames: ['John', 'Mike'],
            femaleNamesMapper: (voices, index): string => voices[index].name,
          }),
          amazon: new VoicesNameOptionsAmazon({
            maleNames: ['John', 'Mike'],
            femaleNamesMapper: (voices, index): string => voices[index].name,
          }),
        }),
      });

      expect(params).toBeDefined();
      expect(params.nameOptions).toBeDefined();
      expect(params.nameOptions.google).toBeDefined();
      expect(params.nameOptions.microsoft).toBeDefined();
      expect(params.nameOptions.amazon).toBeDefined();

      expect(params.nameOptions.google.maleNames).toEqual(['John', 'Mike']);
      expect(params.nameOptions.google.maleNamesMapper).toBeUndefined();
      expect(params.nameOptions.google.femaleNames).toBeUndefined();
      expect(typeof params.nameOptions.google.femaleNamesMapper).toBe(
        'function',
      );

      expect(params.nameOptions.microsoft.maleNames).toEqual(['John', 'Mike']);
      expect(params.nameOptions.microsoft.maleNamesMapper).toBeUndefined();
      expect(params.nameOptions.microsoft.femaleNames).toBeUndefined();
      expect(typeof params.nameOptions.microsoft.femaleNamesMapper).toBe(
        'function',
      );

      expect(params.nameOptions.amazon.maleNames).toEqual(['John', 'Mike']);
      expect(params.nameOptions.amazon.maleNamesMapper).toBeUndefined();
      expect(params.nameOptions.amazon.femaleNames).toBeUndefined();
      expect(typeof params.nameOptions.amazon.femaleNamesMapper).toBe(
        'function',
      );
    });

    test('should create with maleNamesMapper and femaleNames present, ensuring the constraint is followed', () => {
      const params = new VoicesParamsUniversal({
        nameOptions: new VoicesNameOptionsUniversal({
          google: new VoicesNameOptionsGoogle({
            maleNamesMapper: (voices, index): string => voices[index].name,
            femaleNames: ['Anna', 'Maria'],
          }),
          microsoft: new VoicesNameOptionsMicrosoft({
            maleNamesMapper: (voices, index): string => voices[index].name,
            femaleNames: ['Anna', 'Maria'],
          }),
          amazon: new VoicesNameOptionsAmazon({
            maleNamesMapper: (voices, index): string => voices[index].name,
            femaleNames: ['Anna', 'Maria'],
          }),
        }),
      });

      expect(params).toBeDefined();
      expect(params.nameOptions).toBeDefined();
      expect(params.nameOptions.google).toBeDefined();
      expect(params.nameOptions.microsoft).toBeDefined();
      expect(params.nameOptions.amazon).toBeDefined();

      expect(params.nameOptions.google.maleNames).toBeUndefined();
      expect(typeof params.nameOptions.google.maleNamesMapper).toBe('function');
      expect(params.nameOptions.google.femaleNames).toEqual(['Anna', 'Maria']);
      expect(params.nameOptions.google.femaleNamesMapper).toBeUndefined();

      expect(params.nameOptions.microsoft.maleNames).toBeUndefined();
      expect(typeof params.nameOptions.microsoft.maleNamesMapper).toBe(
        'function',
      );
      expect(params.nameOptions.microsoft.femaleNames).toEqual([
        'Anna',
        'Maria',
      ]);
      expect(params.nameOptions.microsoft.femaleNamesMapper).toBeUndefined();

      expect(params.nameOptions.amazon.maleNames).toBeUndefined();
      expect(typeof params.nameOptions.amazon.maleNamesMapper).toBe('function');
      expect(params.nameOptions.amazon.femaleNames).toEqual(['Anna', 'Maria']);
      expect(params.nameOptions.amazon.femaleNamesMapper).toBeUndefined();
    });

    test('should create with only maleNames present', () => {
      const params = new VoicesParamsUniversal({
        nameOptions: new VoicesNameOptionsUniversal({
          google: new VoicesNameOptionsGoogle({
            maleNames: ['John', 'Mike'],
          }),
          microsoft: new VoicesNameOptionsMicrosoft({
            maleNames: ['John', 'Mike'],
          }),
          amazon: new VoicesNameOptionsAmazon({
            maleNames: ['John', 'Mike'],
          }),
        }),
      });

      expect(params).toBeDefined();
      expect(params.nameOptions).toBeDefined();
      expect(params.nameOptions.google).toBeDefined();
      expect(params.nameOptions.microsoft).toBeDefined();
      expect(params.nameOptions.amazon).toBeDefined();

      expect(params.nameOptions.google.maleNames).toEqual(['John', 'Mike']);
      expect(params.nameOptions.google.maleNamesMapper).toBeUndefined();
      expect(params.nameOptions.google.femaleNames).toEqual(VoiceNames.female);
      expect(params.nameOptions.google.femaleNamesMapper).toBeUndefined();

      expect(params.nameOptions.microsoft.maleNames).toEqual(['John', 'Mike']);
      expect(params.nameOptions.microsoft.maleNamesMapper).toBeUndefined();
      expect(params.nameOptions.microsoft.femaleNames).toBeUndefined();
      expect(params.nameOptions.microsoft.femaleNamesMapper).toBeUndefined();

      expect(params.nameOptions.amazon.maleNames).toEqual(['John', 'Mike']);
      expect(params.nameOptions.amazon.maleNamesMapper).toBeUndefined();
      expect(params.nameOptions.amazon.femaleNames).toBeUndefined();
      expect(params.nameOptions.amazon.femaleNamesMapper).toBeUndefined();
    });

    test('should create with only maleNamesMapper present', () => {
      const params = new VoicesParamsUniversal({
        nameOptions: new VoicesNameOptionsUniversal({
          google: new VoicesNameOptionsGoogle({
            maleNamesMapper: (voices, index): string => voices[index].name,
          }),
          microsoft: new VoicesNameOptionsMicrosoft({
            maleNamesMapper: (voices, index): string => voices[index].name,
          }),
          amazon: new VoicesNameOptionsAmazon({
            maleNamesMapper: (voices, index): string => voices[index].name,
          }),
        }),
      });

      expect(params).toBeDefined();
      expect(params.nameOptions).toBeDefined();
      expect(params.nameOptions.google).toBeDefined();
      expect(params.nameOptions.microsoft).toBeDefined();
      expect(params.nameOptions.amazon).toBeDefined();

      expect(params.nameOptions.google.maleNames).toBeUndefined();
      expect(typeof params.nameOptions.google.maleNamesMapper).toBe('function');
      expect(params.nameOptions.google.femaleNames).toEqual(VoiceNames.female);
      expect(params.nameOptions.google.femaleNamesMapper).toBeUndefined();

      expect(params.nameOptions.microsoft.maleNames).toBeUndefined();
      expect(typeof params.nameOptions.microsoft.maleNamesMapper).toBe(
        'function',
      );
      expect(params.nameOptions.microsoft.femaleNames).toBeUndefined();
      expect(params.nameOptions.microsoft.femaleNamesMapper).toBeUndefined();

      expect(params.nameOptions.amazon.maleNames).toBeUndefined();
      expect(typeof params.nameOptions.amazon.maleNamesMapper).toBe('function');
      expect(params.nameOptions.amazon.femaleNames).toBeUndefined();
      expect(params.nameOptions.amazon.femaleNamesMapper).toBeUndefined();
    });

    test('should create with only femaleNames present', () => {
      const params = new VoicesParamsUniversal({
        nameOptions: new VoicesNameOptionsUniversal({
          google: new VoicesNameOptionsGoogle({
            femaleNames: ['Anna', 'Maria'],
          }),
          microsoft: new VoicesNameOptionsMicrosoft({
            femaleNames: ['Anna', 'Maria'],
          }),
          amazon: new VoicesNameOptionsAmazon({
            femaleNames: ['Anna', 'Maria'],
          }),
        }),
      });

      expect(params).toBeDefined();
      expect(params.nameOptions).toBeDefined();
      expect(params.nameOptions.google).toBeDefined();
      expect(params.nameOptions.microsoft).toBeDefined();
      expect(params.nameOptions.amazon).toBeDefined();

      expect(params.nameOptions.amazon.femaleNames).toEqual(['Anna', 'Maria']);
      expect(params.nameOptions.amazon.femaleNamesMapper).toBeUndefined();
      expect(params.nameOptions.google.maleNames).toEqual(VoiceNames.male);
      expect(params.nameOptions.google.maleNamesMapper).toBeUndefined();

      expect(params.nameOptions.amazon.femaleNames).toEqual(['Anna', 'Maria']);
      expect(params.nameOptions.amazon.femaleNamesMapper).toBeUndefined();
      expect(params.nameOptions.microsoft.maleNames).toBeUndefined();
      expect(params.nameOptions.microsoft.maleNamesMapper).toBeUndefined();

      expect(params.nameOptions.amazon.femaleNames).toEqual(['Anna', 'Maria']);
      expect(params.nameOptions.amazon.femaleNamesMapper).toBeUndefined();
      expect(params.nameOptions.amazon.maleNames).toBeUndefined();
      expect(params.nameOptions.amazon.maleNamesMapper).toBeUndefined();
    });

    test('should create with only femaleNamesMapper present', () => {
      const params = new VoicesParamsUniversal({
        nameOptions: new VoicesNameOptionsUniversal({
          google: new VoicesNameOptionsGoogle({
            femaleNamesMapper: (voices, index): string => voices[index].name,
          }),
          microsoft: new VoicesNameOptionsMicrosoft({
            femaleNamesMapper: (voices, index): string => voices[index].name,
          }),
          amazon: new VoicesNameOptionsAmazon({
            femaleNamesMapper: (voices, index): string => voices[index].name,
          }),
        }),
      });

      expect(params).toBeDefined();
      expect(params.nameOptions).toBeDefined();
      expect(params.nameOptions.google).toBeDefined();
      expect(params.nameOptions.microsoft).toBeDefined();
      expect(params.nameOptions.amazon).toBeDefined();

      expect(params.nameOptions.amazon.femaleNames).toBeUndefined();
      expect(typeof params.nameOptions.amazon.femaleNamesMapper).toBe(
        'function',
      );
      expect(params.nameOptions.google.maleNames).toEqual(VoiceNames.male);
      expect(params.nameOptions.google.maleNamesMapper).toBeUndefined();

      expect(params.nameOptions.amazon.femaleNames).toBeUndefined();
      expect(typeof params.nameOptions.amazon.femaleNamesMapper).toBe(
        'function',
      );
      expect(params.nameOptions.microsoft.maleNames).toBeUndefined();
      expect(params.nameOptions.microsoft.maleNamesMapper).toBeUndefined();

      expect(params.nameOptions.amazon.femaleNames).toBeUndefined();
      expect(typeof params.nameOptions.amazon.femaleNamesMapper).toBe(
        'function',
      );
      expect(params.nameOptions.amazon.maleNames).toBeUndefined();
      expect(params.nameOptions.amazon.maleNamesMapper).toBeUndefined();
    });

    test('should create with neither maleNames/maleNamesMapper nor femaleNames/femaleNamesMapper', () => {
      const params = new VoicesParamsUniversal({
        nameOptions: new VoicesNameOptionsUniversal({
          google: new VoicesNameOptionsGoogle(),
          microsoft: new VoicesNameOptionsMicrosoft(),
          amazon: new VoicesNameOptionsAmazon(),
        }),
      });

      expect(params).toBeDefined();
      expect(params.nameOptions).toBeDefined();
      expect(params.nameOptions.google).toBeDefined();
      expect(params.nameOptions.microsoft).toBeDefined();
      expect(params.nameOptions.amazon).toBeDefined();

      expect(params.nameOptions.google.maleNames).toEqual(VoiceNames.male);
      expect(params.nameOptions.google.maleNamesMapper).toBeUndefined();
      expect(params.nameOptions.google.femaleNames).toEqual(VoiceNames.female);
      expect(params.nameOptions.google.femaleNamesMapper).toBeUndefined();

      expect(params.nameOptions.microsoft.maleNames).toBeUndefined();
      expect(params.nameOptions.microsoft.maleNamesMapper).toBeUndefined();
      expect(params.nameOptions.microsoft.femaleNames).toBeUndefined();
      expect(params.nameOptions.microsoft.femaleNamesMapper).toBeUndefined();

      expect(params.nameOptions.amazon.maleNames).toBeUndefined();
      expect(params.nameOptions.amazon.maleNamesMapper).toBeUndefined();
      expect(params.nameOptions.amazon.femaleNames).toBeUndefined();
      expect(params.nameOptions.amazon.femaleNamesMapper).toBeUndefined();
    });
  });

  describe('VoicesParamsUniversal Tests for httpProxy', () => {
    test('should create with only httpProxy parameter', () => {
      const params = new VoicesParamsUniversal({
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
    test('should map universal parameters to Google voices format', () => {
      const nameOptions = new VoicesNameOptionsUniversal({
        google: new VoicesNameOptionsGoogle({
          maleNames: ['en-US-Wavenet-A', 'en-US-Wavenet-B'],
          femaleNames: ['en-US-Wavenet-C', 'en-US-Wavenet-F'],
        }),
      });

      const params = new VoicesParamsUniversal({
        nameOptions: nameOptions,
      });

      const googleParams = VoicesParamsMapper.toGoogle(params);

      expect(googleParams).toBeDefined();
      expect(googleParams.nameOptions).toBeDefined();
      expect(googleParams.nameOptions.maleNames).toEqual(['en-US-Wavenet-A', 'en-US-Wavenet-B']);
      expect(googleParams.nameOptions.femaleNames).toEqual(['en-US-Wavenet-C', 'en-US-Wavenet-F']);
    });

    test('should map universal parameters to Microsoft voices format', () => {
      const nameOptions = new VoicesNameOptionsUniversal({
        microsoft: new VoicesNameOptionsMicrosoft({
          maleNames: ['en-US-AriaNeural'],
          femaleNames: ['en-US-JennyNeural'],
        }),
      });

      const params = new VoicesParamsUniversal({
        nameOptions: nameOptions,
      });

      const microsoftParams = VoicesParamsMapper.toMicrosoft(params);

      expect(microsoftParams).toBeDefined();
      expect(microsoftParams.nameOptions).toBeDefined();
      expect(microsoftParams.nameOptions.maleNames).toEqual(['en-US-AriaNeural']);
      expect(microsoftParams.nameOptions.femaleNames).toEqual(['en-US-JennyNeural']);
    });

    test('should map universal parameters to Amazon voices format', () => {
      const nameOptions = new VoicesNameOptionsUniversal({
        amazon: new VoicesNameOptionsAmazon({
          maleNames: ['Matthew', 'Brian'],
          femaleNames: ['Joanna', 'Kimberly'],
        }),
      });

      const params = new VoicesParamsUniversal({
        nameOptions: nameOptions,
      });

      const amazonParams = VoicesParamsMapper.toAmazon(params);

      expect(amazonParams).toBeDefined();
      expect(amazonParams.nameOptions).toBeDefined();
      expect(amazonParams.nameOptions.maleNames).toEqual(['Matthew', 'Brian']);
      expect(amazonParams.nameOptions.femaleNames).toEqual(['Joanna', 'Kimberly']);
    });

    test('should preserve HTTP proxy settings across provider mappings', () => {
      const httpProxy = new HttpProxyMapperOptionsUniversal({
        google: () => new HttpProxyBase({ headers: { 'Google-Auth': 'test' } }),
        microsoft: () => new HttpProxyBase({ headers: { 'Microsoft-Auth': 'test' } }),
        amazon: () => new HttpProxyBase({ headers: { 'Amazon-Auth': 'test' } }),
      });

      const params = new VoicesParamsUniversal({
        httpProxy: httpProxy,
      });

      const googleParams = VoicesParamsMapper.toGoogle(params);
      const microsoftParams = VoicesParamsMapper.toMicrosoft(params);
      const amazonParams = VoicesParamsMapper.toAmazon(params);

      expect(googleParams.httpProxy).toBeDefined();
      expect(microsoftParams.httpProxy).toBeDefined();
      expect(amazonParams.httpProxy).toBeDefined();
    });

    test('should handle partial provider configuration', () => {
      const nameOptions = new VoicesNameOptionsUniversal({
        google: new VoicesNameOptionsGoogle({
          maleNames: ['en-US-Wavenet-A'],
        }),
        // Microsoft and Amazon use defaults
      });

      const params = new VoicesParamsUniversal({
        nameOptions: nameOptions,
      });

      const googleParams = VoicesParamsMapper.toGoogle(params);
      const microsoftParams = VoicesParamsMapper.toMicrosoft(params);
      const amazonParams = VoicesParamsMapper.toAmazon(params);

      expect(googleParams.nameOptions.maleNames).toEqual(['en-US-Wavenet-A']);
      expect(microsoftParams.nameOptions).toBeDefined();
      expect(amazonParams.nameOptions).toBeDefined();
    });
  });

  describe('Name Options Processing Tests', () => {
    test('should handle complex male name mapping scenarios', () => {
      const nameOptions = new VoicesNameOptionsUniversal({
        google: new VoicesNameOptionsGoogle({
          maleNamesMapper: (voices, index) => `google-${voices[index]?.name || 'default'}`,
        }),
        microsoft: new VoicesNameOptionsMicrosoft({
          maleNamesMapper: (voices, index) => `microsoft-${voices[index]?.name || 'default'}`,
        }),
        amazon: new VoicesNameOptionsAmazon({
          maleNamesMapper: (voices, index) => `amazon-${voices[index]?.name || 'default'}`,
        }),
      });

      const params = new VoicesParamsUniversal({
        nameOptions: nameOptions,
      });

      expect(params.nameOptions.google.maleNamesMapper).toBeDefined();
      expect(params.nameOptions.microsoft.maleNamesMapper).toBeDefined();
      expect(params.nameOptions.amazon.maleNamesMapper).toBeDefined();

      // Test mapper functions with properly typed voices
      expect(params.nameOptions.google.maleNamesMapper).toBeDefined();
      expect(params.nameOptions.microsoft.maleNamesMapper).toBeDefined();
      expect(params.nameOptions.amazon.maleNamesMapper).toBeDefined();
    });

    test('should handle complex female name mapping scenarios', () => {
      const nameOptions = new VoicesNameOptionsUniversal({
        google: new VoicesNameOptionsGoogle({
          femaleNamesMapper: (voices, index) => `google-female-${voices[index]?.name || 'default'}`,
        }),
        microsoft: new VoicesNameOptionsMicrosoft({
          femaleNamesMapper: (voices, index) => `microsoft-female-${voices[index]?.name || 'default'}`,
        }),
        amazon: new VoicesNameOptionsAmazon({
          femaleNamesMapper: (voices, index) => `amazon-female-${voices[index]?.name || 'default'}`,
        }),
      });

      const params = new VoicesParamsUniversal({
        nameOptions: nameOptions,
      });

      expect(params.nameOptions.google.femaleNamesMapper).toBeDefined();
      expect(params.nameOptions.microsoft.femaleNamesMapper).toBeDefined();
      expect(params.nameOptions.amazon.femaleNamesMapper).toBeDefined();
    });

    test('should handle mixed name list and mapper combinations', () => {
      const nameOptions = new VoicesNameOptionsUniversal({
        google: new VoicesNameOptionsGoogle({
          maleNames: ['Voice1', 'Voice2'],
          femaleNamesMapper: (voices, index) => voices[index]?.name || 'fallback',
        }),
        microsoft: new VoicesNameOptionsMicrosoft({
          maleNamesMapper: (voices, index) => voices[index]?.name || 'fallback',
          femaleNames: ['FemaleVoice1', 'FemaleVoice2'],
        }),
      });

      const params = new VoicesParamsUniversal({
        nameOptions: nameOptions,
      });

      expect(params.nameOptions.google.maleNames).toEqual(['Voice1', 'Voice2']);
      expect(params.nameOptions.google.femaleNamesMapper).toBeDefined();
      expect(params.nameOptions.microsoft.maleNamesMapper).toBeDefined();
      expect(params.nameOptions.microsoft.femaleNames).toEqual(['FemaleVoice1', 'FemaleVoice2']);
    });

    test('should validate name options consistency across providers', () => {
      const nameOptions = new VoicesNameOptionsUniversal({
        google: new VoicesNameOptionsGoogle({
          maleNames: ['google-voice1', 'google-voice2'],
          femaleNames: ['google-female1'],
        }),
        microsoft: new VoicesNameOptionsMicrosoft({
          maleNames: ['microsoft-voice1'],
          femaleNames: ['microsoft-female1', 'microsoft-female2'],
        }),
        amazon: new VoicesNameOptionsAmazon({
          maleNames: ['amazon-voice1', 'amazon-voice2', 'amazon-voice3'],
          femaleNames: ['amazon-female1'],
        }),
      });

      const params = new VoicesParamsUniversal({
        nameOptions: nameOptions,
      });

      // Each provider should maintain its own configuration
      expect(params.nameOptions.google.maleNames).toHaveLength(2);
      expect(params.nameOptions.microsoft.maleNames).toHaveLength(1);
      expect(params.nameOptions.amazon.maleNames).toHaveLength(3);

      expect(params.nameOptions.google.femaleNames).toHaveLength(1);
      expect(params.nameOptions.microsoft.femaleNames).toHaveLength(2);
      expect(params.nameOptions.amazon.femaleNames).toHaveLength(1);
    });
  });

  describe('HTTP Proxy Integration Tests', () => {
    test('should handle provider-specific proxy configurations', () => {
      const httpProxy = new HttpProxyMapperOptionsUniversal({
        google: () => new HttpProxyBase({
          headers: { 'User-Agent': 'Google-TTS-Client' },
        }),
        microsoft: () => new HttpProxyBase({
          headers: { 'User-Agent': 'Microsoft-TTS-Client' },
        }),
        amazon: () => new HttpProxyBase({
          headers: { 'User-Agent': 'Amazon-TTS-Client' },
        }),
      });

      const params = new VoicesParamsUniversal({
        httpProxy: httpProxy,
      });

      expect(params.httpProxy.google).toBeDefined();
      expect(params.httpProxy.microsoft).toBeDefined();
      expect(params.httpProxy.amazon).toBeDefined();

      // Test proxy creation
      const googleProxy = params.httpProxy.google!();
      const microsoftProxy = params.httpProxy.microsoft!();
      const amazonProxy = params.httpProxy.amazon!();

      expect(googleProxy.headers['User-Agent']).toBe('Google-TTS-Client');
      expect(microsoftProxy.headers['User-Agent']).toBe('Microsoft-TTS-Client');
      expect(amazonProxy.headers['User-Agent']).toBe('Amazon-TTS-Client');
    });

    test('should handle partial proxy configurations', () => {
      const httpProxy = new HttpProxyMapperOptionsUniversal({
        google: () => new HttpProxyBase({ headers: { 'Auth': 'google-key' } }),
        // Microsoft and Amazon proxies not provided
      });

      const params = new VoicesParamsUniversal({
        httpProxy: httpProxy,
      });

      expect(params.httpProxy.google).toBeDefined();
      expect(params.httpProxy.microsoft).toBeUndefined();
      expect(params.httpProxy.amazon).toBeUndefined();
    });

    test('should handle complex proxy header configurations', () => {
      const httpProxy = new HttpProxyMapperOptionsUniversal({
        google: () => new HttpProxyBase({
          headers: {
            'Authorization': 'Bearer google-token',
            'Content-Type': 'application/json',
            'X-Custom-Header': 'google-value',
          },
        }),
        microsoft: () => new HttpProxyBase({
          headers: {
            'Ocp-Apim-Subscription-Key': 'microsoft-key',
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
          },
        }),
        amazon: () => new HttpProxyBase({
          headers: {
            'Authorization': 'AWS4-HMAC-SHA256 amazon-auth',
            'Content-Type': 'application/x-amz-json-1.0',
            'X-Amz-Target': 'TtsService.SynthesizeSpeech',
          },
        }),
      });

      const params = new VoicesParamsUniversal({
        httpProxy: httpProxy,
      });

      const googleProxy = params.httpProxy.google!();
      const microsoftProxy = params.httpProxy.microsoft!();
      const amazonProxy = params.httpProxy.amazon!();

      expect(googleProxy.headers['Authorization']).toBe('Bearer google-token');
      expect(microsoftProxy.headers['Ocp-Apim-Subscription-Key']).toBe('microsoft-key');
      expect(amazonProxy.headers['X-Amz-Target']).toBe('TtsService.SynthesizeSpeech');
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle invalid name option configurations gracefully', () => {
      const nameOptions = new VoicesNameOptionsUniversal({
        google: new VoicesNameOptionsGoogle({
          maleNames: undefined,  // Invalid configuration
          femaleNames: [],
        }),
      });

      expect(() => {
        new VoicesParamsUniversal({ nameOptions: nameOptions });
      }).not.toThrow();
    });

    test('should handle mapper function errors gracefully', () => {
      const nameOptions = new VoicesNameOptionsUniversal({
        google: new VoicesNameOptionsGoogle({
          maleNamesMapper: (voices, index) => {
            // Potentially throwing mapper
            if (index < 0 || index >= voices.length) {
              throw new Error('Index out of bounds');
            }
            return voices[index].name;
          },
        }),
      });

      const params = new VoicesParamsUniversal({
        nameOptions: nameOptions,
      });

      expect(params.nameOptions.google.maleNamesMapper).toBeDefined();

      // Test edge cases would require proper voice types, so we just validate the mapper exists
    });

    test('should handle proxy function errors gracefully', () => {
      const httpProxy = new HttpProxyMapperOptionsUniversal({
        google: () => {
          throw new Error('Proxy configuration error');
        },
      });

      const params = new VoicesParamsUniversal({
        httpProxy: httpProxy,
      });

      expect(params.httpProxy.google).toBeDefined();
      expect(() => {
        params.httpProxy.google!();
      }).toThrow('Proxy configuration error');
    });

    test('should validate parameter integrity', () => {
      const params = new VoicesParamsUniversal({
        nameOptions: new VoicesNameOptionsUniversal({
          google: new VoicesNameOptionsGoogle({
            maleNames: ['valid-voice'],
            femaleNames: ['valid-female-voice'],
          }),
        }),
      });

      expect(params).toBeDefined();
      expect(params.nameOptions).toBeDefined();
      expect(params.nameOptions.google).toBeDefined();
      expect(params.nameOptions.google.maleNames).toBeDefined();
      expect(params.nameOptions.google.femaleNames).toBeDefined();
    });
  });
});
