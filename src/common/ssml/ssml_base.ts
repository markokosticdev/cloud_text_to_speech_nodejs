import { SsmlSanitizer } from "./ssml_sanitizer.js";
import { SsmlMinimizer } from "./ssml_minimizer.js";
import { SsmlSplitter } from "./ssml_splitter.js";

export abstract class SsmlBase<V,O> {
  ssml: string;
  rate: string;
  pitch: string;
  voice: V;
  options: O;

  constructor({
                ssml,
                rate,
                pitch,
                voice,
                options,
              }: {
    ssml: string;
    rate: string;
    pitch: string;
    voice: V;
    options: O;
  }) {
    this.ssml = ssml;
    this.rate = rate;
    this.pitch = pitch;
    this.voice = voice;
    this.options = options;
  }

  get rawSsml(): string {
    return this.ssmlRootTemplate(this.ssml);
  }

  protected abstract get allowedElements(): { [key: string]: string[] };

  processedSsmlBatches(): string[] {
    const sanitizedSsml = SsmlSanitizer.sanitize(
      this.ssml,
      this.allowedElements,
    );

    const minimizedSsml = SsmlMinimizer.minimize(sanitizedSsml);

    const splittedSsml = SsmlSplitter.spit(
      minimizedSsml,
      (ssml)=> {
        return this.ssmlRootTemplate(ssml)
      },
    );

    return splittedSsml;
  }

  protected abstract ssmlRootTemplate(ssml: string): string;
}
