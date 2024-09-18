import { ConvertParamsUniversal } from './convert_params.js';
import { ConvertParamsGoogle } from '../../google/convert/convert_params.js';
import { VoiceGoogle } from '../../google/voices/voices_model.js';
import { ConvertParamsMicrosoft } from '../../microsoft/convert/convert_params.js';
import { VoiceMicrosoft } from '../../microsoft/voices/voice_model.js';
import { ConvertParamsAmazon } from '../../amazon/convert/convert_params.js';
import { VoiceAmazon } from '../../amazon/voices/voices_model.js';
import { ConvertAudioOptionsMicrosoft } from '../../microsoft/convert/convert_audio_options.js';
import { ConvertProcessOptionsMicrosoft } from '../../microsoft/convert/convert_process_options.js';
import { ConvertAudioOptionsGoogle } from '../../google/convert/convert_audio_options.js';
import { ConvertProcessOptionsGoogle } from '../../google/convert/convert_process_options.js';
import { ConvertAudioOptionsAmazon } from '../../amazon/convert/convert_audio_options.js';
import { ConvertProcessOptionsAmazon } from '../../amazon/convert/convert_process_options.js';

export class ConvertParamsMapper {
  static toGoogle(
    universalParams: ConvertParamsUniversal,
  ): ConvertParamsGoogle {
    return new ConvertParamsGoogle({
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
      audioOptions: new ConvertAudioOptionsGoogle({
        audioFormat: universalParams.audioOptions.audioFormatMapper.toGoogle(
          universalParams.audioOptions.audioFormat,
        ),
        audioStreamFormat:
          universalParams.audioOptions.audioStreamFormatMapper.toGoogle(
            universalParams.audioOptions.audioStreamFormat,
          ),
      }),
      processOptions: new ConvertProcessOptionsGoogle({
        processAsync: universalParams.processOptions.processAsync,
        processLimit: universalParams.processOptions.processLimit,
      }),
      ssmlOptions: universalParams.ssmlOptions.google,
      textOptions: universalParams.textOptions.google,
    });
  }

  static toMicrosoft(
    universalParams: ConvertParamsUniversal,
  ): ConvertParamsMicrosoft {
    return new ConvertParamsMicrosoft({
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
      audioOptions: new ConvertAudioOptionsMicrosoft({
        audioFormat: universalParams.audioOptions.audioFormatMapper.toMicrosoft(
          universalParams.audioOptions.audioFormat,
        ),
        audioStreamFormat:
          universalParams.audioOptions.audioStreamFormatMapper.toMicrosoft(
            universalParams.audioOptions.audioStreamFormat,
          ),
      }),
      processOptions: new ConvertProcessOptionsMicrosoft({
        processAsync: universalParams.processOptions.processAsync,
        processLimit: universalParams.processOptions.processLimit,
      }),
      ssmlOptions: universalParams.ssmlOptions.microsoft,
      textOptions: universalParams.textOptions.microsoft,
    });
  }

  static toAmazon(
    universalParams: ConvertParamsUniversal,
  ): ConvertParamsAmazon {
    return new ConvertParamsAmazon({
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
      audioOptions: new ConvertAudioOptionsAmazon({
        audioFormat: universalParams.audioOptions.audioFormatMapper.toAmazon(
          universalParams.audioOptions.audioFormat,
        ),
        audioStreamFormat:
          universalParams.audioOptions.audioStreamFormatMapper.toAmazon(
            universalParams.audioOptions.audioStreamFormat,
          ),
      }),
      processOptions: new ConvertProcessOptionsAmazon({
        processAsync: universalParams.processOptions.processAsync,
        processLimit: universalParams.processOptions.processLimit,
      }),
      ssmlOptions: universalParams.ssmlOptions.amazon,
      textOptions: universalParams.textOptions.amazon,
    });
  }
}
