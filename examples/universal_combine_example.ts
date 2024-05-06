import { TtsUniversal } from '../src/universal/tts/tts.js';
import { TtsProviders } from '../src/common/tts/tts_providers.js';
import { TtsParamsUniversal } from '../src/universal/tts/tts_params.js';
import { AudioOutputFormatUniversal } from '../src/universal/audio/audio_output_format.js';

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

    // Get voices
    const voicesResponse = await TtsUniversal.getVoices();
    const voices = voicesResponse.voices;

    // Print all voices
    console.log(voices);

    // Pick an English Voice
    const voice = voices.find((voice) => voice.locale.code.startsWith('en-'));

    // Generate Audio for a text
    const text =
      '<break time="2s" bre="34"/>Combine Universal <some time="3s"/> Text-to-Speech API is awesome';

    const ttsParams = new TtsParamsUniversal({
      voice: voice,
      audioFormat: AudioOutputFormatUniversal.mp3_64k,
      text: text,
      rate: 'slow', // optional
      pitch: 'default', // optional
    });

    const ttsResponse = await TtsUniversal.convertTts(ttsParams);

    // Get the audio bytes.
    const audioBytes = ttsResponse.audio; // you can save to a file for playback

    console.log(
      `Audio size: ${(audioBytes.byteLength / (1024 * 1024)).toFixed(2)} Mb`,
    );
  } catch (e) {
    console.error('Something went wrong:', e);
  }
}

main();
