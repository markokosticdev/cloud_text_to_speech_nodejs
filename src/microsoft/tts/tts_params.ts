import { AudioRequestParamsMicrosoft } from '../audio/audio_request_param.js';
import { VoiceMicrosoft } from '../voices/voice_model.js';

export class TtsParamsMicrosoft extends AudioRequestParamsMicrosoft {
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
    voice: VoiceMicrosoft;
    audioFormat: string;
    text: string;
    rate?: string;
    pitch?: string;
  }) {
    super({ voice, audioFormat, text, rate, pitch });
  }
}
