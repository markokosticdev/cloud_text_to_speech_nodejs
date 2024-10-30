import { TtsGoogle } from '../../src/google/tts/tts.js';
import { ConvertParamsGoogle } from '../../src/google/convert/convert_params.js';
import { AudioOutputFormatGoogle } from '../../src/google/convert/audio/audio_output_format.js';
import { ConvertAudioOptionsGoogle } from '../../src/google/convert/convert_audio_options.js';
import { VoicesParamsGoogle } from '../../src/google/voices/voices_params.js';
import { VoicesNameOptionsGoogle } from '../../src/google/voices/voices_name_options.js';
import { HttpProxyBase } from '../../src/common/http/http_proxy_base.js';
import { ConvertProcessOptionsGoogle } from "../../src/google/convert/convert_process_options.js";
import { ConvertSsmlOptionsGoogle } from "../../src/google/convert/convert_ssml_options.js";
import { ConvertTextOptionsGoogle } from "../../src/google/convert/convert_text_options.js";

async function main(): Promise<void> {
  try {
    TtsGoogle.init({
      params: { apiKey: 'API-KEY' },
      withLogs: true,
    });

    const voicesParams = new VoicesParamsGoogle({
      nameOptions: new VoicesNameOptionsGoogle({
        maleNames: [],
        femaleNames: [],
        maleNamesMapper: (voices, index): string => {
          return voices[index].name;
        },
        femaleNamesMapper: (voices, index): string => {
          return voices[index].name;
        },
      }), // At a time only maleNames or maleNamesMapper and femaleNames or femaleNamesMapper can be present, code should work also with empty constructor VoicesNameOptionsGoogle or nameOptions not specified at all, VoicesNameOptionsGoogle has default values
      httpProxy: (): HttpProxyBase => {
        return new HttpProxyBase({
          headers: {
            HeaderName: 'HeaderValue',
          },
        });
      },
    }); // nameOptions and httpProxy are optional

    // Get voices
    const voicesResponse = await TtsGoogle.getVoices(voicesParams); // voicesParams is optional parameter
    const voices = voicesResponse.voices;

    // Print all voices
    console.log(voices);

    // Pick an English Voice
    const voice = voices.find((voice) => voice.locale.code.startsWith('en-'));

    // Generate Audio for ssml or text
    const ssml =
      '<break time="2s" bre="34"/>Google <some time="3s"/> Text-to-Speech API is awesome';
    const text = 'Google Text-to-Speech API is awesome';

    const ttsParams = new ConvertParamsGoogle({
      voice: voice,
      voiceId: 'voiceIdCode',
      ssml: ssml,
      ssmlChunks: [ssml, ssml],
      text: text,
      textChunks: [text, text],
      rate: 'slow',
      pitch: 'default',
      audioOptions: new ConvertAudioOptionsGoogle({
        audioFormat: AudioOutputFormatGoogle.mp3,
      }),
      processOptions: new ConvertProcessOptionsGoogle({
        processAsync: false,
        processLimit: 6,
      }),
      ssmlOptions: new ConvertSsmlOptionsGoogle({
        allowedElements: {},
        splitLimit: 5000,
      }),
      textOptions: new ConvertTextOptionsGoogle({
        splitLimit: 5000,
      }),
      httpProxy: (): HttpProxyBase => {
        return new HttpProxyBase({
          headers: {
            HeaderName: 'HeaderValue',
          },
        });
      },
    }); // At a time only voice or voiceId and ssml or ssmlChunks or text or textChunks can be present, all other params are optional

    const ttsResponse = await TtsGoogle.convertTts(ttsParams);

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
