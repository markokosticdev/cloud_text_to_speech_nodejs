import { Helpers } from '../../common/utils/helpers.js';
import { VoiceMicrosoft } from '../voices/voice_model.js';

export class SsmlMicrosoft {
  text: string;
  rate: string;
  pitch: string;
  voice: VoiceMicrosoft;

  constructor({
    text,
    rate,
    pitch,
    voice,
  }: {
    text: string;
    rate: string;
    pitch: string;
    voice: VoiceMicrosoft;
  }) {
    this.text = text;
    this.rate = rate;
    this.pitch = pitch;
    this.voice = voice;
  }

  get rawSsml(): string {
    return this.ssmlRoot(this.text);
  }

  get sanitizedSsml(): string {
    return this.ssmlRoot(this.sanitizeSsml(this.text));
  }

  private ssmlRoot(ssml: string): string {
    const ssmlWithRoot = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${this.voice.locale.code}">
          <voice xml:lang="${this.voice.locale.code}" xml:gender="${this.voice.gender}" name="${this.voice.code}">
            <prosody rate="${this.rate}" pitch="${this.pitch}">
              ${ssml}
            </prosody>
          </voice>
        </speak>`;

    return ssmlWithRoot
      .replace(/\s*\n\s*/g, '')
      .replace(/\s*(<[^>]+>)\s*/g, '$1');
  }

  private sanitizeSsml(ssml: string): string {
    const allowedElements: { [key: string]: string[] } = {
      audio: ['src'],
      bookmark: ['mark'],
      break: ['time', 'strength'],
      emphasis: ['level'],
      lang: ['xml:lang'],
      lexicon: ['uri'],
      math: ['xmlns'],
      'mstts:audioduration': ['value'],
      'mstts:express-as': ['style', 'styledegree', 'role'],
      'mstts:silence': ['type', 'value'],
      'mstts:viseme': ['type'],
      p: [],
      phoneme: ['alphabet', 'ph'],
      s: [],
      'say-as': ['interpret-as', 'format', 'detail'],
      sub: ['alias'],
      voice: ['name', 'effect'],
    };

    return Helpers.sanitizeSsml(ssml, allowedElements);
  }
}
