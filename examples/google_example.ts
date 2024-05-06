import { TtsGoogle } from '../src/google/tts/tts.js';
import { TtsParamsGoogle } from '../src/google/tts/tts_params.js';
import { AudioOutputFormatGoogle } from '../src/google/audio/audio_output_format.js';

async function main(): Promise<void> {
  try {
    TtsGoogle.init({
      params: { apiKey: 'API-KEY' },
      withLogs: true,
    });

    // Get voices
    const voicesResponse = await TtsGoogle.getVoices();
    const voices = voicesResponse.voices;

    // Print all voices
    console.log(voices);

    // Pick an English Voice
    const voice = voices.find((voice) => voice.locale.code.startsWith('en-'));

    // Generate Audio for a text
    const text =
      '<break time="2s" bre="34"/>Google <some time="3s"/> Text-to-Speech API is awesome';

    const ttsParams = new TtsParamsGoogle({
      voice: voice,
      audioFormat: AudioOutputFormatGoogle.mp3,
      text: text,
      rate: 'slow', // optional
      pitch: 'default', // optional
    });

    const ttsResponse = await TtsGoogle.convertTts(ttsParams);

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
