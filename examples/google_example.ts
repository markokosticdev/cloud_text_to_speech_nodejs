import { TtsGoogle } from '../src/google/tts/tts.js';
import { ConvertParamsGoogle } from '../src/google/convert/convert_params.js';
import { AudioOutputFormatGoogle } from '../src/google/convert/audio/audio_output_format.js';
import { ConvertAudioOptionsGoogle } from '../src/google/convert/convert_audio_options.js';

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

    const ttsParams = new ConvertParamsGoogle({
      voice: voice,
      text: text,
      rate: 'slow',
      pitch: 'default',
      audioOptions: new ConvertAudioOptionsGoogle({
        audioFormat: AudioOutputFormatGoogle.mp3,
      }),
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
