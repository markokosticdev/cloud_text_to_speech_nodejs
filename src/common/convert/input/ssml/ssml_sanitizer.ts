import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

export class SsmlSanitizer {
  private constructor() {}

  static sanitize(
    ssml: string,
    allowedElements: { [key: string]: string[] },
  ): string {
    // Handle empty input
    if (!ssml || ssml.trim() === '') {
      return '';
    }

    // Track if the original input had a speak wrapper
    const originalHadSpeakWrapper = ssml.trim().startsWith('<speak>') || ssml.trim().startsWith('<speak ');
    
    // Ensure we have a speak wrapper for processing
    let processingSsml = ssml;
    if (!originalHadSpeakWrapper) {
      processingSsml = `<speak>${ssml}</speak>`;
    }

    const document = new DOMParser().parseFromString(processingSsml, 'text/xml');
    const rootElement = document.documentElement;
    const serializer = new XMLSerializer();

    SsmlSanitizer._sanitizeNode(rootElement, allowedElements);

    // Always return inner content without speak wrapper
    // This is the correct behavior for the processing pipeline in SsmlBase
    const childContent = Array.from(rootElement.childNodes)
      .map((child) => serializer.serializeToString(child))
      .join('');
    
    // Return empty string if no meaningful content
    return childContent.trim() === '' ? '' : childContent;
  }

  private static _sanitizeNode(
    node: Node,
    allowedElements: { [key: string]: string[] },
  ): void {
    if (node.nodeType === node.ELEMENT_NODE) {
      const element = node as Element;

      // First, recursively sanitize child nodes
      Array.from(element.childNodes).forEach((child) => {
        SsmlSanitizer._sanitizeNode(child, allowedElements);
      });

      // Check if this element is allowed
      if (
        !Object.prototype.hasOwnProperty.call(allowedElements, element.nodeName)
      ) {
        // Element not allowed - replace with its content
        const parent = element.parentNode;
        if (parent) {
          const children = Array.from(element.childNodes);
          const nextSibling = element.nextSibling;
          
          // Remove the element first
          parent.removeChild(element);
          
          // Insert children in place
          children.forEach((child) => {
            const clonedChild = child.cloneNode(true);
            if (nextSibling) {
              parent.insertBefore(clonedChild, nextSibling);
            } else {
              parent.appendChild(clonedChild);
            }
          });
        }
      } else {
        // Element is allowed - clean up attributes
        const allowedAttributes = allowedElements[element.nodeName] || [];
        Array.from(element.attributes).forEach((attribute) => {
          if (!allowedAttributes.includes(attribute.name)) {
            element.removeAttribute(attribute.name);
          }
        });
      }
    } else if (node.nodeType === node.TEXT_NODE) {
      const text = node as Text;
      // Only remove completely empty text nodes (whitespace-only), 
      // but preserve meaningful whitespace
      if (text.data.trim() === '' && text.data.length > 1) {
        const parent = node.parentNode;
        if (parent) {
          parent.removeChild(node);
        }
      }
    }
  }
}
