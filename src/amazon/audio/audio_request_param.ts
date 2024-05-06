import { VoiceAmazon } from '../voices/voice_model.js';

export class AudioRequestParamsAmazon {
  voice: VoiceAmazon;
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
    voice: VoiceAmazon;
    text: string;
    audioFormat: string;
    rate: string;
    pitch: string;
  }) {
    this.voice = voice;
    this.text = text;
    this.audioFormat = audioFormat;
    this.rate = rate;
    this.pitch = pitch;
  }
}
