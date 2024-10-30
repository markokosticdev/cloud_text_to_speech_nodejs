import { TextSanitizer } from './text_sanitizer.js';
import { TextMinimizer } from './text_minimizer.js';
import { TextSplitter } from './text_splitter.js';
import { TextOptions } from '../text/text_options.js';

export abstract class TextBase<V, O extends TextOptions> {
  text: string | undefined;
  textChunks: string[] | undefined;
  rate: string;
  pitch: string;
  voice: V | undefined;
  voiceId: string | undefined;
  options: O;

  constructor({
    text,
    textChunks,
    rate,
    pitch,
    voice,
    voiceId,
    options,
  }: {
    text?: string;
    textChunks?: string[];
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

    if (!text && !textChunks) {
      throw new Error('Either input or textChunks must be provided.');
    }

    if (text && textChunks) {
      throw new Error('Only input or textChunks must be provided.');
    }

    this.text = text;
    this.textChunks = textChunks;
    this.rate = rate;
    this.pitch = pitch;
    this.voice = voice;
    this.voiceId = voiceId;
    this.options = options;
  }

  processedTextChunks(): string[] {
    if (this.textChunks) {
      return this.textChunks.map((text) => {
        const sanitizedText = TextSanitizer.sanitize(text);
        const minimizedText = TextMinimizer.minimize(sanitizedText);
        return this.textRootTemplate(minimizedText);
      });
    } else {
      const sanitizedText = TextSanitizer.sanitize(this.text);
      const minimizedText = TextMinimizer.minimize(sanitizedText);
      return TextSplitter.split(
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
