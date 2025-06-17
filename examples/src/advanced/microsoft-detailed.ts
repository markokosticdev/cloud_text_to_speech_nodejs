import { 
  TtsMicrosoft, 
  ConvertParamsMicrosoft, 
  AudioOutputFormatMicrosoft, 
  ConvertAudioOptionsMicrosoft,
  VoicesParamsMicrosoft,
  VoicesNameOptionsMicrosoft,
  HttpProxyBase,
  ConvertProcessOptionsMicrosoft,
  ConvertSsmlOptionsMicrosoft,
  ConvertTextOptionsMicrosoft
} from 'cloud-text-to-speech';
import { config } from 'dotenv';

// Load environment variables
config();

async function main(): Promise<void> {
  try {
    TtsMicrosoft.init({
      params: { 
        subscriptionKey: process.env.MICROSOFT_TTS_SUBSCRIPTION_KEY || 'your-azure-subscription-key', 
        region: process.env.MICROSOFT_TTS_REGION || 'eastus' 
      },
      withLogs: true,
    });

    const voicesParams = new VoicesParamsMicrosoft({
      nameOptions: new VoicesNameOptionsMicrosoft({
        maleNames: [],
        femaleNames: [],
        maleNamesMapper: (voices, index): string => {
          return voices[index].name;
        },
        femaleNamesMapper: (voices, index): string => {
          return voices[index].name;
        },
      }), // At a time only maleNames or maleNamesMapper and femaleNames or femaleNamesMapper can be present, code should work also with empty constructor VoicesNameOptionsMicrosoft or nameOptions not specified at all, VoicesNameOptionsMicrosoft has default values
      httpProxy: (): HttpProxyBase => {
        return new HttpProxyBase({
          headers: {
            HeaderName: 'HeaderValue',
          },
        });
      },
    }); // nameOptions and httpProxy are optional

    // Get voices
    const voicesResponse = await TtsMicrosoft.getVoices(voicesParams); // voicesParams is optional parameter
    const voices = voicesResponse.voices;

    // Print all voices
    console.log(voices);

    // Pick an English Voice
    const voice = voices.find((voice) => voice.locale.code.startsWith('en-'));

    // Generate Audio for ssml or text
    const ssml =
      '<break time="2s" bre="34"/>Microsoft <some time="3s"/> Text-to-Speech API is awesome';
    const text = 'Microsoft Text-to-Speech API is awesome';

    const ttsParams = new ConvertParamsMicrosoft({
      voice: voice,
      voiceId: 'voiceIdCode',
      ssml: ssml,
      ssmlChunks: [ssml, ssml],
      text: text,
      textChunks: [text, text],
      rate: 'slow',
      pitch: 'default',
      audioOptions: new ConvertAudioOptionsMicrosoft({
        audioFormat: AudioOutputFormatMicrosoft.audio48Khz192kBitrateMonoMp3,
      }),
      processOptions: new ConvertProcessOptionsMicrosoft({
        processAsync: false,
        processLimit: 6,
      }),
      ssmlOptions: new ConvertSsmlOptionsMicrosoft({
        allowedElements: {},
        splitLimit: 5000,
      }),
      textOptions: new ConvertTextOptionsMicrosoft({
        splitLimit: 5000,
      }),
      httpProxy: (): HttpProxyBase => {
        return new HttpProxyBase({
          headers: {
            HeaderName: 'HeaderValue',
          },
        });
      },
    }); // At a time only voice or voiceId and ssml or ssmlChunks or text or textChunks can be present, all other params are optional

    const ttsResponse = await TtsMicrosoft.convertTts(ttsParams);

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
