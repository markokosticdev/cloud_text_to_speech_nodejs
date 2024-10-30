import { TextOptions } from './text_options.js';
import { SsmlMinimizer } from '../ssml/ssml_minimizer.js';

export type TextRootTemplateMapper = (text: string) => string;

export class TextSplitter {
  private constructor() {}

  static split<O extends TextOptions>(
    text: string,
    rootTemplate: TextRootTemplateMapper,
    options: O,
  ): string[] {
    const rootTemplateMinimized = (text: string): string =>
      SsmlMinimizer.minimize(rootTemplate(text));
    const rootTemplateLength = rootTemplateMinimized('').length;
    const adjustedSplitLimit = options.splitLimit - rootTemplateLength;
    const minimumContentLength = 50;

    if (adjustedSplitLimit <= minimumContentLength) {
      throw new Error(
        `Split limit is too small to split the text. It must be greater than the length of the root template plus ${minimumContentLength}, which is ${rootTemplateLength + minimumContentLength}.`,
      );
    }

    const chunks: string[] = [];
    let currentPosition = 0;

    while (currentPosition < text.length) {
      while (text[currentPosition] === ' ' && currentPosition < text.length) {
        currentPosition++;
      }

      const splitPosition = Math.min(
        currentPosition + adjustedSplitLimit,
        text.length,
      );

      let nearestDelimiter = text.lastIndexOf('.', splitPosition);

      while (text[nearestDelimiter + 1] === '.') {
        nearestDelimiter++;
      }

      if (nearestDelimiter === -1 || nearestDelimiter <= currentPosition) {
        nearestDelimiter = text.lastIndexOf(';', splitPosition);
      }
      if (nearestDelimiter === -1 || nearestDelimiter <= currentPosition) {
        nearestDelimiter = text.lastIndexOf(',', splitPosition);
      }
      if (nearestDelimiter === -1 || nearestDelimiter <= currentPosition) {
        nearestDelimiter = text.lastIndexOf(' ', splitPosition);
      }
      if (nearestDelimiter === -1 || nearestDelimiter <= currentPosition) {
        nearestDelimiter = splitPosition - 1;
      }

      const nearestDelimiterAdjusted = nearestDelimiter + 1;

      const chunk = text.slice(currentPosition, nearestDelimiterAdjusted);

      const chunkWithRoot = rootTemplateMinimized(chunk);

      if (chunk.trim().length > 0) {
        chunks.push(chunkWithRoot);
      }

      currentPosition = nearestDelimiterAdjusted;
    }

    return chunks;
  }
}
