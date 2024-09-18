import { SsmlMinimizer } from './ssml_minimizer.js';
import { SsmlOptions } from './ssml_options.js';

export type SsmlRootTemplateMapper = (ssml: string) => string;

export class SsmlSplitter {
  private constructor() {}

  static spit<O extends SsmlOptions>(
    ssml: string,
    rootTemplate: SsmlRootTemplateMapper,
    options: O,
  ): string[] {
    const rootTemplateLength = SsmlMinimizer.minimize(rootTemplate('')).length;
    console.log(rootTemplateLength, options.allowedElements);
    return [SsmlMinimizer.minimize(rootTemplate(ssml))];
  }
}
