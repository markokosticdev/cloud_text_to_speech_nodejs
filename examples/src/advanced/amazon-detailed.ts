import { 
  TtsAmazon, 
  ConvertParamsAmazon, 
  AudioOutputFormatAmazon, 
  ConvertAudioOptionsAmazon,
  VoicesParamsAmazon,
  VoicesNameOptionsAmazon,
  HttpProxyBase,
  ConvertProcessOptionsAmazon,
  ConvertSsmlOptionsAmazon,
  ConvertTextOptionsAmazon
} from 'cloud-text-to-speech';
import { config } from 'dotenv';

// Load environment variables
config();

async function main(): Promise<void> {
  try {
    TtsAmazon.init({
      params: { 
        keyId: process.env.AMAZON_TTS_KEY_ID || 'your-aws-access-key-id', 
        accessKey: process.env.AMAZON_TTS_ACCESS_KEY || 'your-aws-secret-access-key', 
        region: process.env.AMAZON_TTS_REGION || 'us-east-1' 
      },
      withLogs: true,
    });

    const voicesParams = new VoicesParamsAmazon({
      nameOptions: new VoicesNameOptionsAmazon({
        maleNames: [],
        femaleNames: [],
        maleNamesMapper: (voices, index): string => {
          return voices[index].name;
        },
        femaleNamesMapper: (voices, index): string => {
          return voices[index].name;
        },
      }), // At a time only maleNames or maleNamesMapper and femaleNames or femaleNamesMapper can be present, code should work also with empty constructor VoicesNameOptionsAmazon or nameOptions not specified at all, VoicesNameOptionsAmazon has default values
      httpProxy: (): HttpProxyBase => {
        return new HttpProxyBase({
          headers: {
            HeaderName: 'HeaderValue',
          },
        });
      },
    }); // nameOptions and httpProxy are optional

    // Get voices
    const voicesResponse = await TtsAmazon.getVoices(voicesParams); // voicesParams is optional parameter
    const voices = voicesResponse.voices;

    // Print all voices
    console.log(voices);

    // Pick an English Voice
    const voice = voices.find((voice) => voice.locale.code.startsWith('en-'));

    // Generate Audio for ssml or text
    const ssml =
      '<break time="2s" bre="34"/>Amazon <some time="3s"/> Text-to-Speech API is awesome';
    const text = 'Amazon Text-to-Speech API is awesome';

    const ttsParams = new ConvertParamsAmazon({
      voice: voice,
      voiceId: 'voiceIdCode',
      ssml: ssml,
      ssmlChunks: [ssml, ssml],
      text: text,
      textChunks: [text, text],
      rate: 'slow',
      pitch: 'default',
      audioOptions: new ConvertAudioOptionsAmazon({
        audioFormat: AudioOutputFormatAmazon.mp3,
      }),
      processOptions: new ConvertProcessOptionsAmazon({
        processAsync: false,
        processLimit: 6,
      }),
      ssmlOptions: new ConvertSsmlOptionsAmazon({
        allowedElements: {},
        splitLimit: 5000,
      }),
      textOptions: new ConvertTextOptionsAmazon({
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

    const ttsResponse = await TtsAmazon.convertTts(ttsParams);

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
