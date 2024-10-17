import { TtsMicrosoft } from '../src/microsoft/tts/tts.js';
import { ConvertParamsMicrosoft } from '../src/microsoft/convert/convert_params.js';
import { AudioOutputFormatMicrosoft } from '../src/microsoft/convert/audio/audio_output_format.js';
import { ConvertAudioOptionsMicrosoft } from '../src/microsoft/convert/convert_audio_options.js';

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
