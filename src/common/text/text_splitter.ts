import { TextMinimizer } from './text_minimizer.js';
import { SsmlOptions } from '../ssml/ssml_options.js';

export type TextRootTemplateMapper = (text: string) => string;

export class TextSplitter {
  private constructor() {}

  static spit<O extends SsmlOptions>(
    text: string,
    rootTemplate: TextRootTemplateMapper,
    options: O,
  ): string[] {
    const rootTemplateLength = TextMinimizer.minimize(rootTemplate('')).length;
    console.log(rootTemplateLength, options.allowedElements);
    return [TextMinimizer.minimize(rootTemplate(text))];
  }
}
