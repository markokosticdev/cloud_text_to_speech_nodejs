import { TtsAmazon } from '../src/amazon/tts/tts.js';
import { ConvertParamsAmazon } from '../src/amazon/convert/convert_params.js';
import { AudioOutputFormatAmazon } from '../src/amazon/convert/audio/audio_output_format.js';
import { ConvertAudioOptionsAmazon } from '../src/amazon/convert/convert_audio_options.js';

async function main(): Promise<void> {
  try {
    TtsAmazon.init({
      params: { keyId: 'KEY-ID', accessKey: 'ACCESS-KEY', region: 'us-east-1' },
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
