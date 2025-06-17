import { TtsAmazon } from 'cloud-text-to-speech';
import { ConvertParamsAmazon } from 'cloud-text-to-speech';
import { AudioOutputFormatAmazon } from 'cloud-text-to-speech';
import { ConvertAudioOptionsAmazon } from 'cloud-text-to-speech';
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

    // Get voices
    const voicesResponse = await TtsAmazon.getVoices();
    const voices = voicesResponse.voices;

    // Print all voices
    console.log(voices);

    // Pick an English Voice
    const voice = voices.find((voice) => voice.locale.code.startsWith('en-'));

    // Generate Audio for a text
    const text =
      '<break time="2s" bre="34"/>Amazon <some time="3s"/> Text-to-Speech API is awesome';

    const ttsParams = new ConvertParamsAmazon({
      voice: voice,
      text: text,
      rate: 'slow',
      pitch: 'default',
      audioOptions: new ConvertAudioOptionsAmazon({
        audioFormat: AudioOutputFormatAmazon.mp3,
      }),
    });

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
