import { VoiceUniversal } from '../voices/voice_model.js';

export class TtsParamsUniversal {
  /// Rate is the speed at which the voice will speak.
  ///
  /// * `rate` default to default.

  voice: VoiceUniversal;
  text: string;
  audioFormat: string;
  rate: string;
  pitch: string;

  constructor({
    voice,
    text,
    audioFormat,
    rate,
    pitch,
  }: {
    voice: VoiceUniversal;
    text: string;
    audioFormat: string;
    rate: string;
    pitch: string;
    // onlyNeural: boolean; //TODO: implement this
  }) {
    this.voice = voice;
    this.text = text;
    this.audioFormat = audioFormat;
    this.rate = rate;
    this.pitch = pitch;
    // this.onlyNeural = onlyNeural; //TODO: implement this
  }
}
