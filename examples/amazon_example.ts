import { TtsAmazon } from '../src/amazon/tts/tts.js';
import { TtsParamsAmazon } from '../src/amazon/tts/tts_params.js';
import { AudioOutputFormatAmazon } from '../src/amazon/audio/audio_output_format.js';

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

    const ttsParams = new TtsParamsAmazon({
      voice: voice,
      audioFormat: AudioOutputFormatAmazon.mp3,
      text: text,
      rate: 'slow', // optional
      pitch: 'default', // optional
    });

    const ttsResponse = await TtsAmazon.convertTts(ttsParams);

    // Get the audio bytes.
    const audioBytes = ttsResponse.audio; // Assuming audio is a Buffer or Uint8Array

    console.log(
      `Audio size: ${(audioBytes.byteLength / (1024 * 1024)).toFixed(2)} Mb`,
    );
  } catch (e) {
    console.error('Something went wrong:', e);
  }
}

main();
