import { TextSanitizer } from './text_sanitizer.js';
import { TextMinimizer } from './text_minimizer.js';
import { TextSplitter } from './text_splitter.js';
import { SsmlOptions } from '../ssml/ssml_options.js';

export abstract class TextBase<V, O extends SsmlOptions> {
  text: string | undefined;
  textBatches: string[] | undefined;
  rate: string;
  pitch: string;
  voice: V | undefined;
  voiceId: string | undefined;
  options: O;

  constructor({
    text,
    textBatches,
    rate,
    pitch,
    voice,
    voiceId,
    options,
  }: {
    text?: string;
    textBatches?: string[];
    rate: string;
    pitch: string;
    voice?: V;
    voiceId?: string;
    options: O;
  }) {
    if (!voice && !voiceId) {
      throw new Error('Either voice or voiceId must be provided.');
    }

    if (voice && voiceId) {
      throw new Error('Only voice or voiceId must be provided.');
    }

    if (!text && !textBatches) {
      throw new Error('Either input or textBatches must be provided.');
    }

    if (text && textBatches) {
      throw new Error('Only input or textBatches must be provided.');
    }

    this.text = text;
    this.textBatches = textBatches;
    this.rate = rate;
    this.pitch = pitch;
    this.voice = voice;
    this.voiceId = voiceId;
    this.options = options;
  }

  processedTextBatches(): string[] {
    if (this.textBatches) {
      return this.textBatches.map((text) => {
        const sanitizedText = TextSanitizer.sanitize(text);
        const minimizedText = TextMinimizer.minimize(sanitizedText);
        return this.textRootTemplate(minimizedText);
      });
    } else {
      const sanitizedText = TextSanitizer.sanitize(this.text);
      const minimizedText = TextMinimizer.minimize(sanitizedText);
      return TextSplitter.spit(
        minimizedText,
        (text) => this.textRootTemplate(text),
        this.options,
      );
    }
  }

  protected textRootTemplate(ssml: string): string {
    return ssml;
  }
}
