import { TtsUniversal } from '../src/universal/tts/tts.js';
import { TtsProviders } from '../src/common/tts/tts_providers.js';
import { ConvertParamsUniversal } from '../src/universal/convert/convert_params.js';
import { AudioOutputFormatUniversal } from '../src/universal/convert/audio/audio_output_format.js';
import { ConvertAudioOptionsUniversal } from '../src/universal/convert/convert_audio_options.js';

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
