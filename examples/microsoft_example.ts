import { TtsMicrosoft } from '../src/microsoft/tts/tts.js';
import { TtsParamsMicrosoft } from '../src/microsoft/tts/tts_params.js';
import { AudioOutputFormatMicrosoft } from '../src/microsoft/audio/audio_output_format.js';

async function main(): Promise<void> {
  try {
    TtsMicrosoft.init({
      params: { subscriptionKey: 'SUBSCRIPTION-KEY', region: 'eastus' },
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

    const ttsParams = new TtsParamsMicrosoft({
      voice: voice,
      audioFormat: AudioOutputFormatMicrosoft.audio48Khz192kBitrateMonoMp3,
      text: text,
      rate: 'slow', // optional
      pitch: 'default', // optional
    });

    const ttsResponse = await TtsMicrosoft.convertTts(ttsParams);

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
