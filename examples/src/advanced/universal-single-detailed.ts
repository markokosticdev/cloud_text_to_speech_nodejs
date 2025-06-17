import { 
  TtsUniversal, 
  TtsProviders, 
  ConvertParamsUniversal, 
  AudioOutputFormatUniversal, 
  ConvertAudioOptionsUniversal,
  VoicesParamsUniversal,
  HttpProxyMapperOptionsUniversal,
  VoicesNameOptionsUniversal,
  HttpProxyBase,
  VoicesNameOptionsGoogle,
  VoicesNameOptionsMicrosoft,
  VoicesNameOptionsAmazon,
  ConvertProcessOptionsUniversal,
  ConvertSsmlOptionsUniversal,
  ConvertTextOptionsUniversal,
  ConvertSsmlOptionsGoogle,
  ConvertSsmlOptionsMicrosoft,
  ConvertSsmlOptionsAmazon,
  ConvertTextOptionsGoogle,
  ConvertTextOptionsMicrosoft,
  ConvertTextOptionsAmazon
} from 'cloud-text-to-speech';
import { config } from 'dotenv';

// Load environment variables
config();

async function main(): Promise<void> {
  try {
    TtsUniversal.init({
      provider: TtsProviders.amazon,
      googleParams: { apiKey: process.env.GOOGLE_API_KEY || 'your-google-cloud-api-key' },
      microsoftParams: {
        subscriptionKey: process.env.MICROSOFT_TTS_SUBSCRIPTION_KEY || 'your-azure-subscription-key',
        region: process.env.MICROSOFT_TTS_REGION || 'eastus',
      },
      amazonParams: {
        keyId: process.env.AMAZON_TTS_KEY_ID || 'your-aws-access-key-id',
        accessKey: process.env.AMAZON_TTS_ACCESS_KEY || 'your-aws-secret-access-key',
        region: process.env.AMAZON_TTS_REGION || 'us-east-1',
      },
      withLogs: true,
    });

    //Generate Audio for a text
    const text =
      '<break time="2s" bre="34"/>Single Universal <some time="3s"/> Text-to-Speech API is awesome';

    for (const provider of [
      TtsProviders.amazon,
      TtsProviders.microsoft,
      TtsProviders.google,
    ]) {
      TtsUniversal.setProvider(provider);

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

      //Get voices
      const voicesResponse = await TtsUniversal.getVoices(voicesParams);
      const voices = voicesResponse.voices;

      //Print all voices
      console.log(voices);

      //Pick an English Voice
      const voice = voices.find((voice) => voice.locale.code.startsWith('en-'));

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

      //Get the audio bytes.
      const audioBytes = ttsResponse.audio;

      console.log(
        `Audio size: ${(audioBytes.byteLength / (1024 * 1024)).toFixed(2)} Mb`,
      );
    }
  } catch (e) {
    console.error('Something went wrong:', e);
  }
}

main();
