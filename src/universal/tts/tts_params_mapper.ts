import { TtsParamsUniversal } from './tts_params.js';
import { TtsParamsGoogle } from '../../google/tts/tts_params.js';
import { VoiceGoogle } from '../../google/voices/voice_model.js';
import { AudioOutputFormatMapper } from '../audio/audio_output_format_mapper.js';
import { TtsParamsMicrosoft } from '../../microsoft/tts/tts_params.js';
import { VoiceMicrosoft } from '../../microsoft/voices/voice_model.js';
import { TtsParamsAmazon } from '../../amazon/tts/tts_params.js';
import { VoiceAmazon } from '../../amazon/voices/voice_model.js';

export class TtsParamsMapper {
  static toGoogle(universalParams: TtsParamsUniversal): TtsParamsGoogle {
    return new TtsParamsGoogle({
      voice: new VoiceGoogle({
        engines: universalParams.voice.engines,
        code: universalParams.voice.code,
        name: universalParams.voice.name,
        nativeName: universalParams.voice.nativeName,
        gender: universalParams.voice.gender,
        locale: universalParams.voice.locale,
      }),
      text: universalParams.text,
      audioFormat: AudioOutputFormatMapper.toGoogle(
        universalParams.audioFormat,
      ),
      rate: universalParams.rate,
      pitch: universalParams.pitch,
    });
  }

  static toMicrosoft(universalParams: TtsParamsUniversal): TtsParamsMicrosoft {
    return new TtsParamsMicrosoft({
      voice: new VoiceMicrosoft({
        engines: universalParams.voice.engines,
        code: universalParams.voice.code,
        name: universalParams.voice.name,
        nativeName: universalParams.voice.nativeName,
        gender: universalParams.voice.gender,
        locale: universalParams.voice.locale,
      }),
      text: universalParams.text,
      audioFormat: AudioOutputFormatMapper.toMicrosoft(
        universalParams.audioFormat,
      ),
      rate: universalParams.rate,
      pitch: universalParams.pitch,
    });
  }

  static toAmazon(universalParams: TtsParamsUniversal): TtsParamsAmazon {
    return new TtsParamsAmazon({
      voice: new VoiceAmazon({
        engines: universalParams.voice.engines,
        code: universalParams.voice.code,
        name: universalParams.voice.name,
        nativeName: universalParams.voice.nativeName,
        gender: universalParams.voice.gender,
        locale: universalParams.voice.locale,
      }),
      text: universalParams.text,
      audioFormat: AudioOutputFormatMapper.toAmazon(
        universalParams.audioFormat,
      ),
      rate: universalParams.rate,
      pitch: universalParams.pitch,
    });
  }
}
