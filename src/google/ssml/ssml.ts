import { Helpers } from '../../common/utils/helpers.js';

export class SsmlGoogle {
  text: string;
  rate: string;
  pitch: string;

  constructor({
    text,
    rate,
    pitch,
  }: {
    text: string;
    rate: string;
    pitch: string;
  }) {
    this.text = text;
    this.rate = rate;
    this.pitch = pitch;
  }

  get rawSsml(): string {
    return this.ssmlRoot(this.text);
  }

  get sanitizedSsml(): string {
    return this.ssmlRoot(this.sanitizeSsml(this.text));
  }

  private ssmlRoot(ssml: string): string {
    const ssmlWithRoot = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis">
        <prosody rate="${this.rate}" pitch="${this.pitch}">
         ${ssml}
        </prosody>
      </speak>`;

    return ssmlWithRoot
      .replace(/\s*\n\s*/g, '')
      .replace(/\s*(<[^>]+>)\s*/g, '$1');
  }

  private sanitizeSsml(ssml: string): string {
    const allowedElements: { [key: string]: string[] } = {
      audio: [
        'src',
        'clipBegin',
        'clipEnd',
        'speed',
        'repeatCount',
        'repeatDur',
        'soundLevel',
      ],
      break: ['time', 'strength'],
      emphasis: ['level'],
      lang: ['xml:lang'],
      mark: ['name'],
      media: [
        'xml:id',
        'begin',
        'end',
        'repeatCount',
        'repeatDur',
        'soundLevel',
        'fadeInDur',
        'fadeOutDur',
      ],
      p: [],
      par: [],
      phoneme: ['alphabet', 'ph'],
      s: [],
      'say-as': [
        'interpret-as',
        'language',
        'google:style',
        'format',
        'detail',
      ],
      seq: [],
      sub: ['alias'],
      voice: ['name', 'gender', 'variant', 'language', 'ordering'],
    };

    return Helpers.sanitizeSsml(ssml, allowedElements);
  }
}
