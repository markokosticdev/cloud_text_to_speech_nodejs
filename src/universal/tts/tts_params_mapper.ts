import { TtsParamsUniversal } from './tts_params.js';
import { TtsParamsGoogle } from '../../google/tts/tts_params.js';
import { VoiceGoogle } from '../../google/voices/voice_model.js';
import { TtsParamsMicrosoft } from '../../microsoft/tts/tts_params.js';
import { VoiceMicrosoft } from '../../microsoft/voices/voice_model.js';
import { TtsParamsAmazon } from '../../amazon/tts/tts_params.js';
import { VoiceAmazon } from '../../amazon/voices/voice_model.js';
import { TtsAudioOptionsMicrosoft } from '../../microsoft/tts/tts_audio_options.js';
import { TtsProcessOptionsMicrosoft } from '../../microsoft/tts/tts_process_options.js';
import { TtsAudioOptionsGoogle } from '../../google/tts/tts_audio_options.js';
import { TtsProcessOptionsGoogle } from '../../google/tts/tts_process_options.js';
import { TtsAudioOptionsAmazon } from '../../amazon/tts/tts_audio_options.js';
import { TtsProcessOptionsAmazon } from '../../amazon/tts/tts_process_options.js';

export class TtsParamsMapper {
  static toGoogle(universalParams: TtsParamsUniversal): TtsParamsGoogle {
    return new TtsParamsGoogle({
      voice: new VoiceGoogle({
        provider: universalParams.voice.provider,
        engines: universalParams.voice.engines,
        code: universalParams.voice.code,
        name: universalParams.voice.name,
        nativeName: universalParams.voice.nativeName,
        gender: universalParams.voice.gender,
        locale: universalParams.voice.locale,
      }),
      ssml: universalParams.ssml,
      ssmlBatches: universalParams.ssmlBatches,
      text: universalParams.text,
      textBatches: universalParams.textBatches,
      rate: universalParams.rate,
      pitch: universalParams.pitch,
      audioOptions: new TtsAudioOptionsGoogle({
        audioFormat: universalParams.audioOptions.audioFormatMapper.toGoogle(
          universalParams.audioOptions.audioFormat,
        ),
        audioStreamFormat:
          universalParams.audioOptions.audioStreamFormatMapper.toGoogle(
            universalParams.audioOptions.audioStreamFormat,
          ),
      }),
      processOptions: new TtsProcessOptionsGoogle({
        processAsync: universalParams.processOptions.processAsync,
        processLimit: universalParams.processOptions.processLimit,
      }),
      ssmlOptions: universalParams.ssmlOptions.google,
      textOptions: universalParams.textOptions.google,
    });
  }

  static toMicrosoft(universalParams: TtsParamsUniversal): TtsParamsMicrosoft {
    return new TtsParamsMicrosoft({
      voice: new VoiceMicrosoft({
        provider: universalParams.voice.provider,
        engines: universalParams.voice.engines,
        code: universalParams.voice.code,
        name: universalParams.voice.name,
        nativeName: universalParams.voice.nativeName,
        gender: universalParams.voice.gender,
        locale: universalParams.voice.locale,
      }),
      ssml: universalParams.ssml,
      ssmlBatches: universalParams.ssmlBatches,
      text: universalParams.text,
      textBatches: universalParams.textBatches,
      rate: universalParams.rate,
      pitch: universalParams.pitch,
      audioOptions: new TtsAudioOptionsMicrosoft({
        audioFormat: universalParams.audioOptions.audioFormatMapper.toMicrosoft(
          universalParams.audioOptions.audioFormat,
        ),
        audioStreamFormat:
          universalParams.audioOptions.audioStreamFormatMapper.toMicrosoft(
            universalParams.audioOptions.audioStreamFormat,
          ),
      }),
      processOptions: new TtsProcessOptionsMicrosoft({
        processAsync: universalParams.processOptions.processAsync,
        processLimit: universalParams.processOptions.processLimit,
      }),
      ssmlOptions: universalParams.ssmlOptions.microsoft,
      textOptions: universalParams.textOptions.microsoft,
    });
  }

  static toAmazon(universalParams: TtsParamsUniversal): TtsParamsAmazon {
    return new TtsParamsAmazon({
      voice: new VoiceAmazon({
        provider: universalParams.voice.provider,
        engines: universalParams.voice.engines,
        code: universalParams.voice.code,
        name: universalParams.voice.name,
        nativeName: universalParams.voice.nativeName,
        gender: universalParams.voice.gender,
        locale: universalParams.voice.locale,
      }),
      ssml: universalParams.ssml,
      ssmlBatches: universalParams.ssmlBatches,
      text: universalParams.text,
      textBatches: universalParams.textBatches,
      rate: universalParams.rate,
      pitch: universalParams.pitch,
      audioOptions: new TtsAudioOptionsAmazon({
        audioFormat: universalParams.audioOptions.audioFormatMapper.toAmazon(
          universalParams.audioOptions.audioFormat,
        ),
        audioStreamFormat:
          universalParams.audioOptions.audioStreamFormatMapper.toAmazon(
            universalParams.audioOptions.audioStreamFormat,
          ),
      }),
      processOptions: new TtsProcessOptionsAmazon({
        processAsync: universalParams.processOptions.processAsync,
        processLimit: universalParams.processOptions.processLimit,
      }),
      ssmlOptions: universalParams.ssmlOptions.amazon,
      textOptions: universalParams.textOptions.amazon,
    });
  }
}
