import { SsmlMinimizer } from './ssml_minimizer.js';

export type SsmlRootTemplate = (ssml: string) => string;

export class SsmlSplitter {
  private constructor() {}

  static spit(ssml: string, rootTemplate: (ssml: string) => string): string[] {
    const rootTemplateLength = SsmlMinimizer.minimize(rootTemplate('')).length;
    console.log(rootTemplateLength);
    return [SsmlMinimizer.minimize(rootTemplate(ssml))];
  }
}
