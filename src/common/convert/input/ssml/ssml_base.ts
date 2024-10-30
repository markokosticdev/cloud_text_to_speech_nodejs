import { SsmlSanitizer } from './ssml_sanitizer.js';
import { SsmlMinimizer } from './ssml_minimizer.js';
import { SsmlSplitter } from './ssml_splitter.js';
import { SsmlOptions } from './ssml_options.js';

export abstract class SsmlBase<V, O extends SsmlOptions> {
  ssml: string | undefined;
  ssmlChunks: string[] | undefined;
  rate: string;
  pitch: string;
  voice: V | undefined;
  voiceId: string | undefined;
  options: O;

  constructor({
    ssml,
    ssmlChunks,
    rate,
    pitch,
    voice,
    voiceId,
    options,
  }: {
    ssml?: string;
    ssmlChunks?: string[];
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

    if (!ssml && !ssmlChunks) {
      throw new Error('Either input or ssmlChunks must be provided.');
    }

    if (ssml && ssmlChunks) {
      throw new Error('Only input or ssmlChunks must be provided.');
    }

    this.ssml = ssml;
    this.ssmlChunks = ssmlChunks;
    this.rate = rate;
    this.pitch = pitch;
    this.voice = voice;
    this.voiceId = voiceId;
    this.options = options;
  }

  get rawSsml(): string {
    return this.ssmlRootTemplate(this.ssml);
  }

  protected abstract get allowedElements(): { [key: string]: string[] };

  processedSsmlChunks(): string[] {
    if (this.ssmlChunks) {
      return this.ssmlChunks.map((ssml) => {
        const sanitizedSsml = SsmlSanitizer.sanitize(
          ssml,
          this.allowedElements,
        );
        const minimizedSsml = SsmlMinimizer.minimize(sanitizedSsml);
        return this.ssmlRootTemplate(minimizedSsml);
      });
    } else {
      const sanitizedSsml = SsmlSanitizer.sanitize(
        this.ssml,
        this.allowedElements,
      );
      const minimizedSsml = SsmlMinimizer.minimize(sanitizedSsml);
      return SsmlSplitter.spit(
        minimizedSsml,
        (ssml) => this.ssmlRootTemplate(ssml),
        this.options,
      );
    }
  }

  protected abstract ssmlRootTemplate(ssml: string): string;
}
