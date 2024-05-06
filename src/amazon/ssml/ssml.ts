import { Helpers } from '../../common/utils/helpers.js';

export class SsmlAmazon {
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
      'amazon:domain': ['name'],
      'amazon:effect': ['name', 'phonation', 'vocal-tract-length'],
      break: ['time', 'strength'],
      emphasis: ['level'],
      lang: [],
      mark: [],
      p: [],
      phoneme: [],
      s: [],
      'say-as': [],
      sub: [],
      w: [],
    };

    return Helpers.sanitizeSsml(ssml, allowedElements);
  }
}
