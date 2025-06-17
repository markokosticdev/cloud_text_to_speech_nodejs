import { TtsMicrosoft } from 'cloud-text-to-speech';
import { ConvertParamsMicrosoft } from 'cloud-text-to-speech';
import { AudioOutputFormatMicrosoft } from 'cloud-text-to-speech';
import { ConvertAudioOptionsMicrosoft } from 'cloud-text-to-speech';
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

    // Get voices
    const voicesResponse = await TtsMicrosoft.getVoices();
    const voices = voicesResponse.voices;

    // Print all voices
    console.log(voices);

    // Pick an English Voice
    const voice = voices.find((voice) => voice.locale.code.startsWith('en-'));

    // Generate Audio for a text
    const text =
      '<break time="2s" bre="34"/>Microsoft <some time="3s"/> Text-to-Speech API is awesome';

    const ttsParams = new ConvertParamsMicrosoft({
      voice: voice,
      text: text,
      rate: 'slow',
      pitch: 'default',
      audioOptions: new ConvertAudioOptionsMicrosoft({
        audioFormat: AudioOutputFormatMicrosoft.audio16Khz32kBitrateMonoMp3,
      }),
    });

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
