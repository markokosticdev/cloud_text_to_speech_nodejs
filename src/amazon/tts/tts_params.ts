import { AudioRequestParamsAmazon } from '../audio/audio_request_param.js';
import { VoiceAmazon } from '../voices/voice_model.js';

export class TtsParamsAmazon extends AudioRequestParamsAmazon {
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
    voice: VoiceAmazon;
    audioFormat: string;
    text: string;
    rate?: string;
    pitch?: string;
  }) {
    super({ voice, audioFormat, text, rate, pitch });
  }
}
