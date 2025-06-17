import { TtsUniversal } from 'cloud-text-to-speech';
import { TtsProviders } from 'cloud-text-to-speech';
import { ConvertParamsUniversal } from 'cloud-text-to-speech';
import { AudioOutputFormatUniversal } from 'cloud-text-to-speech';
import { ConvertAudioOptionsUniversal } from 'cloud-text-to-speech';
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

      //Get voices
      const voicesResponse = await TtsUniversal.getVoices();
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
