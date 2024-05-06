import { AudioRequestParamsGoogle } from '../audio/audio_request_param.js';
import { VoiceGoogle } from '../voices/voice_model.js';

export class TtsParamsGoogle extends AudioRequestParamsGoogle {
  /// Rate is the speed at which the voice will speak.
  ///
  /// * `rate` default to default.

  constructor({
    voice,
    audioFormat,
    text,
    rate = 'default',
    pitch = 'default',
  }: {
    voice: VoiceGoogle;
    audioFormat: string;
    text: string;
    rate?: string;
    pitch?: string;
  }) {
    super({ voice, audioFormat, text, rate, pitch });
  }
}
