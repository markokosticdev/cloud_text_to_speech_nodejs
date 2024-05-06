import { VoiceGoogle } from '../voices/voice_model.js';

export class AudioRequestParamsGoogle {
  voice: VoiceGoogle;
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
    voice: VoiceGoogle;
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
