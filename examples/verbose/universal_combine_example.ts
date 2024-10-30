import { TtsUniversal } from '../../src/universal/tts/tts.js';
import { TtsProviders } from '../../src/common/tts/tts_providers.js';
import { ConvertParamsUniversal } from '../../src/universal/convert/convert_params.js';
import { AudioOutputFormatUniversal } from '../../src/universal/convert/audio/audio_output_format.js';
import { ConvertAudioOptionsUniversal } from '../../src/universal/convert/convert_audio_options.js';
import { VoicesParamsUniversal } from "../../src/universal/voices/voices_params.js";
import {
  HttpProxyMapperOptionsUniversal,
  VoicesNameOptionsUniversal
} from "../../src/universal/voices/voices_options.js";
import { VoicesNameOptionsGoogle } from "../../src/google/voices/voices_name_options.js";
import { VoicesNameOptionsMicrosoft } from "../../src/microsoft/voices/voices_name_options.js";
import { VoicesNameOptionsAmazon } from "../../src/amazon/voices/voices_name_options.js";
import { HttpProxyBase } from "../../src/common/http/http_proxy_base.js";
import { ConvertProcessOptionsUniversal } from "../../src/universal/convert/convert_process_options.js";
import {
  ConvertSsmlOptionsUniversal,
  ConvertTextOptionsUniversal
} from "../../src/universal/convert/convert_options.js";
import { ConvertSsmlOptionsGoogle } from "../../src/google/convert/convert_ssml_options.js";
import { ConvertSsmlOptionsMicrosoft } from "../../src/microsoft/convert/convert_ssml_options.js";
import { ConvertSsmlOptionsAmazon } from "../../src/amazon/convert/convert_ssml_options.js";
import { ConvertTextOptionsGoogle } from "../../src/google/convert/convert_text_options.js";
import { ConvertTextOptionsMicrosoft } from "../../src/microsoft/convert/convert_text_options.js";
import { ConvertTextOptionsAmazon } from "../../src/amazon/convert/convert_text_options.js";

async function main(): Promise<void> {
  try {
    TtsUniversal.init({
      provider: TtsProviders.combine,
      googleParams: { apiKey: 'API-KEY' },
      microsoftParams: {
        subscriptionKey: 'SUBSCRIPTION-KEY',
        region: 'eastus',
      },
      amazonParams: {
        keyId: 'KEY-ID',
        accessKey: 'ACCESS-KEY',
        region: 'us-east-1',
      },
      withLogs: true,
    });

    const voicesParams = new VoicesParamsUniversal({
      nameOptions: new  VoicesNameOptionsUniversal({
        google: new VoicesNameOptionsGoogle({
          maleNames: [],
          femaleNames: [],
          maleNamesMapper: (voices, index): string => {
            return voices[index].name;
          },
          femaleNamesMapper: (voices, index): string => {
            return voices[index].name;
          },
        }),
        microsoft: new VoicesNameOptionsMicrosoft({
          maleNames: [],
          femaleNames: [],
          maleNamesMapper: (voices, index): string => {
            return voices[index].name;
          },
          femaleNamesMapper: (voices, index): string => {
            return voices[index].name;
          },
        }),
        amazon: new VoicesNameOptionsAmazon({
          maleNames: [],
          femaleNames: [],
          maleNamesMapper: (voices, index): string => {
            return voices[index].name;
          },
          femaleNamesMapper: (voices, index): string => {
            return voices[index].name;
          },
        }),
      }),
      httpProxy: new HttpProxyMapperOptionsUniversal({
        google:(): HttpProxyBase => {
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

    // Get voices
    const voicesResponse = await TtsUniversal.getVoices(voicesParams);
    const voices = voicesResponse.voices;

    // Print all voices
    console.log(voices);

    // Pick an English Voice
    const voice = voices.find((voice) => voice.locale.code.startsWith('en-'));

    // Generate Audio for a text
    const text =
      '<break time="2s" bre="34"/>Combine Universal <some time="3s"/> Text-to-Speech API is awesome';

    const ttsParams = new ConvertParamsUniversal({
      voice: voice,
      text: text,
      rate: 'slow',
      pitch: 'default',
      audioOptions: new ConvertAudioOptionsUniversal({
        audioFormat: AudioOutputFormatUniversal.mp3_32k,
      }),
      processOptions: new ConvertProcessOptionsUniversal({
        processAsync: false,
        processLimit: 6,
      }),
      ssmlOptions: new ConvertSsmlOptionsUniversal({
        google: new ConvertSsmlOptionsGoogle({
          allowedElements: {},
          splitLimit: 5000,
        }),
        microsoft: new ConvertSsmlOptionsMicrosoft({
          allowedElements: {},
          splitLimit: 5000,
        }),
        amazon: new ConvertSsmlOptionsAmazon({
          allowedElements: {},
          splitLimit: 5000,
        }),
      }),
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
      httpProxy: new HttpProxyMapperOptionsUniversal({
        google:(): HttpProxyBase => {
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

    const ttsResponse = await TtsUniversal.convertTts(ttsParams);

    // Get the audio bytes.
    const audioBytes = ttsResponse.audio;

    console.log(
      `Audio size: ${(audioBytes.byteLength / (1024 * 1024)).toFixed(2)} Mb`,
    );
  } catch (e) {
    console.error('Something went wrong:', e);
  }
}

main();
