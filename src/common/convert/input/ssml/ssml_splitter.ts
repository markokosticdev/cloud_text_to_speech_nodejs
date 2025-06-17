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
        `Split limit is too small to split the SSML. It must be greater than the length of the root template plus ${minimumContentLength}, which is ${
          rootTemplateLength + minimumContentLength
        }.`,
      );
    }

    if (!ssml.trim().startsWith('<speak')) {
      ssml = `<speak>${ssml}</speak>`;
    }

    const document = new DOMParser().parseFromString(ssml, 'text/xml');
    const rootElement = document.documentElement;

    const chunks: string[] = [];
    let currentChunk: string = '';
    let currentTextLength: number = 0;
    let hasTextContent: boolean = false;

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

    const getAncestorTagsLength = (ancestors: Element[]): number => {
      const openTagsLength = ancestors
        .map((element) => getOpenTag(element).length)
        .reduce((sum, len) => sum + len, 0);
      const closeTagsLength = ancestors
        .slice()
        .reverse()
        .map((element) => getCloseTag(element).length)
        .reduce((sum, len) => sum + len, 0);
      return openTagsLength + closeTagsLength;
    };

    const processNode = (node: Node, ancestors: Element[]): void => {
      if (node.nodeType === node.ELEMENT_NODE) {
        const element = node as Element;

        // For self-closing elements, add them directly to the chunk
        if (element.childNodes.length === 0) {
          const selfClosingTag = getOpenTag(element);
          currentChunk += selfClosingTag;
          // Self-closing tags don't contribute to text length for splitting purposes
          // but we should check if they have significant impact on chunk size
          return;
        }

        // For elements with children, add opening tag
        const openTag = getOpenTag(element);
        currentChunk += openTag;
        
        // Push the current element onto the ancestors stack
        ancestors.push(element);

        // Recursively process child nodes
        Array.from(element.childNodes).forEach((childNode) => {
          processNode(childNode, ancestors);
        });

        // Pop the current element from the ancestors stack
        ancestors.pop();
        
        // Add closing tag
        const closeTag = getCloseTag(element);
        currentChunk += closeTag;
      } else if (node.nodeType === node.TEXT_NODE) {
        const text = node.nodeValue || '';
        let currentPosition = 0;

        while (currentPosition < text.length) {
          const ancestorTagsLength = getAncestorTagsLength(ancestors);
          const availableLength = adjustedSplitLimit - ancestorTagsLength;

          let splitPosition: number;

          if (availableLength <= 0) {
            // Ancestor tags alone exceed splitLimit
            // Split after 15 characters or at first blank space
            splitPosition = currentPosition + 15;
            const nextSpace = text.indexOf(' ', splitPosition);
            if (nextSpace !== -1) {
              splitPosition = nextSpace + 1;
            } else {
              splitPosition = Math.min(splitPosition, text.length);
            }
          } else {
            // Split based on available length
            splitPosition = currentPosition + availableLength - currentTextLength;
            splitPosition = Math.min(splitPosition, text.length);

            // Try to split at nearest delimiter
            let nearestDelimiter = -1;
            const delimiters = ['.', ';', ',', ' '];
            for (const delimiter of delimiters) {
              const index = text.lastIndexOf(delimiter, splitPosition);
              if (index > currentPosition) {
                nearestDelimiter = index + 1;
                break;
              }
            }
            if (nearestDelimiter > currentPosition) {
              splitPosition = nearestDelimiter;
            }
          }

          const chunkText = text.slice(currentPosition, splitPosition);
          currentChunk += chunkText;
          currentTextLength += chunkText.length;
          currentPosition = splitPosition;

          if (/\S/.test(chunkText)) {
            hasTextContent = true;
          }

          // Check if we need to start a new chunk
          if (
            currentTextLength >= availableLength &&
            currentPosition < text.length
          ) {
            // Close all open tags
            currentChunk += ancestors
              .slice()
              .reverse()
              .map(getCloseTag)
              .join('');

            if (hasTextContent && currentChunk.trim()) {
              // Add the chunk
              chunks.push(rootTemplateMinimized(currentChunk));
            }

            // Reset for new chunk
            currentChunk = '';
            currentTextLength = 0;
            hasTextContent = false;

            // Reopen ancestor tags for the next chunk
            currentChunk += ancestors.map(getOpenTag).join('');
          }
        }
      }
    };

    // Start processing with root element
    currentChunk += getOpenTag(rootElement);

    Array.from(rootElement.childNodes).forEach((node) =>
      processNode(node, [rootElement]),
    );

    // Close any remaining tags and add the last chunk if it has content
    currentChunk += getCloseTag(rootElement);
    if (hasTextContent && currentChunk.trim()) {
      chunks.push(rootTemplateMinimized(currentChunk));
    }

    return chunks;
  }
}
