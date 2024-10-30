import { SsmlMinimizer } from './ssml_minimizer.js';
import { SsmlOptions } from './ssml_options.js';
import { DOMParser } from '@xmldom/xmldom';

export type SsmlRootTemplateMapper = (ssml: string) => string;

export class SsmlSplitter {
  private constructor() {}

  static split<O extends SsmlOptions>(
    ssml: string,
    rootTemplate: SsmlRootTemplateMapper,
    options: O,
  ): string[] {
    const rootTemplateMinimized = (ssml: string): string =>
      SsmlMinimizer.minimize(rootTemplate(ssml));
    const rootTemplateLength = rootTemplateMinimized('').length;
    const adjustedSplitLimit = options.splitLimit - rootTemplateLength;
    const minimumContentLength = 50;

    if (adjustedSplitLimit <= minimumContentLength) {
      throw new Error(
        `Split limit is too small to split the SSML. It must be greater than the length of the root template plus ${minimumContentLength}, which is ${rootTemplateLength + minimumContentLength}.`,
      );
    }

    if (!ssml.trim().startsWith('<speak')) {
      ssml = `<speak>${ssml}</speak>`;
    }

    const document = new DOMParser().parseFromString(ssml, 'text/xml');
    const rootElement = document.documentElement;

    const chunks: string[] = [];
    let currentChunk: string = '';
    let currentLength: number = 0;

    const getOpenTag = (element: Element): string => {
      const attributes = Array.from(element.attributes)
        .map((attr) => `${attr.name}="${attr.value}"`)
        .join(' ');

      if (element.childNodes.length === 0) {
        // For empty elements, return a self-closing tag
        return `<${element.nodeName}${attributes ? ' ' + attributes : ''}/>`;
      } else {
        return `<${element.nodeName}${attributes ? ' ' + attributes : ''}>`;
      }
    };

    const getCloseTag = (element: Element): string => {
      // Return an empty string for self-closing tags
      if (element.childNodes.length === 0) {
        return '';
      } else {
        return `</${element.nodeName}>`;
      }
    };

    const getOpenTags = (ancestors: Element[]): string => {
      return ancestors
        .map((element) => getOpenTag(element))
        .join('');
    };

    const getCloseTags = (ancestors: Element[]): string => {
      return ancestors
        .slice()
        .reverse()
        .map((element) => getCloseTag(element))
        .join('');
    };

    const processNode = (node: Node, ancestors: Element[]): void => {
      if (node.nodeType === node.ELEMENT_NODE) {
        const element = node as Element;

        const openTag = getOpenTag(element);
        const closeTag = getCloseTag(element);

        // Push the current element onto the ancestors stack
        ancestors.push(element);

        // Handle opening the element
        if (currentLength + openTag.length > adjustedSplitLimit && currentLength > 0) {
          // Close all open tags before starting a new chunk
          currentChunk += getCloseTags(ancestors.slice(0, -1));
          if (currentChunk.trim()) {
            chunks.push(rootTemplateMinimized(currentChunk));
          }
          currentChunk = '';
          currentLength = 0;

          // Reopen ancestor tags for the new chunk
          currentChunk += getOpenTags(ancestors.slice(0, -1));
          currentLength += currentChunk.length;
        }

        currentChunk += openTag;
        currentLength += openTag.length;

        // Recursively process child nodes
        Array.from(element.childNodes).forEach((childNode) => {
          processNode(childNode, ancestors);
        });

        currentChunk += closeTag;
        currentLength += closeTag.length;

        // Pop the current element from the ancestors stack
        ancestors.pop();
      } else if (node.nodeType === node.TEXT_NODE) {
        const text = node.nodeValue || '';
        let currentPosition = 0;

        while (currentPosition < text.length) {
          const splitPosition = Math.min(
            currentPosition + adjustedSplitLimit - currentLength,
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

          const chunkText = text.slice(currentPosition, nearestDelimiterAdjusted);

          currentChunk += chunkText;
          currentLength += chunkText.length;
          currentPosition = nearestDelimiterAdjusted;

          if (currentLength >= adjustedSplitLimit || currentPosition < text.length) {
            // Close all open tags
            currentChunk += getCloseTags(ancestors);

            if (currentChunk.trim()) {
              chunks.push(rootTemplateMinimized(currentChunk));
            }

            currentChunk = '';
            currentLength = 0;

            // Reopen ancestor tags for the next chunk
            currentChunk += getOpenTags(ancestors);
            currentLength += currentChunk.length;
          }
        }
      }
    };

    Array.from(rootElement.childNodes).forEach((node) => processNode(node, []));

    if (currentLength > 0) {
      currentChunk += getCloseTags([]);
      chunks.push(rootTemplateMinimized(currentChunk));
    }

    return chunks;
  }
}
