import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

export class SsmlSanitizer {
  private constructor() {}

  static sanitize(
    ssml: string,
    allowedElements: { [key: string]: string[] },
  ): string {
    if (!ssml.trim().startsWith('<speak>')) {
      ssml = `<speak>${ssml}</speak>`;
    }

    const document = new DOMParser().parseFromString(ssml, 'text/xml');
    const rootElement = document.documentElement;
    const serializer = new XMLSerializer();

    SsmlSanitizer._sanitizeNode(rootElement, allowedElements);

    if (!Object.prototype.hasOwnProperty.call(allowedElements, 'speak')) {
      return Array.from(rootElement.childNodes)
        .map((child) => serializer.serializeToString(child))
        .join('');
    } else {
      return serializer.serializeToString(document);
    }
  }

  private static _sanitizeNode(
    node: Node,
    allowedElements: { [key: string]: string[] },
  ): void {
    if (node.nodeType === node.ELEMENT_NODE) {
      const element = node as Element;

      Array.from(element.childNodes).forEach((child) => {
        SsmlSanitizer._sanitizeNode(child, allowedElements);
      });

      if (
        !Object.prototype.hasOwnProperty.call(allowedElements, element.nodeName)
      ) {
        const parent = element.parentNode;
        const children = Array.from(element.childNodes).map((node) =>
          node.cloneNode(true),
        );
        const nextSibling = element.nextSibling;
        parent.removeChild(element);
        children.forEach((child) => {
          parent.insertBefore(child, nextSibling);
        });
      } else {
        const allowedAttributes = allowedElements[element.nodeName] || [];
        Array.from(element.attributes).forEach((attribute) => {
          if (!allowedAttributes.includes(attribute.name)) {
            element.removeAttribute(attribute.name);
          }
        });
      }
    } else if (node.nodeType === node.TEXT_NODE) {
      const text = node as Text;
      if (text.data.trim() === '') {
        node.parentNode.removeChild(node);
      }
    }
  }
}
