export class TextSanitizer {
  private constructor() {}

  static sanitize(text: string): string {
    // Handle empty input
    if (!text || text.trim() === '') {
      return '';
    }

    let cleaned = text;

    // First remove HTML tags (including malformed ones)
    cleaned = this._removeHtmlTags(cleaned);

    // Then decode HTML entities
    cleaned = this._decodeHtmlEntities(cleaned);

    // Finally normalize whitespace
    cleaned = this._normalizeWhitespace(cleaned);

    // Trim and return
    return cleaned.trim();
  }

  private static _decodeHtmlEntities(text: string): string {
    const entityMap: { [key: string]: string } = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&apos;': "'",
      '&nbsp;': ' ',
    };

    return text.replace(/&[#\w]+;/g, (entity) => {
      return entityMap[entity] || entity;
    });
  }

  private static _removeHtmlTags(text: string): string {
    // Remove complete HTML tags
    let cleaned = text.replace(/<\/?[^>]+>/g, '');
    
    // Handle malformed tags (unclosed < without matching >)
    cleaned = cleaned.replace(/<[^>]*$/g, '');
    
    return cleaned;
  }

  private static _normalizeWhitespace(text: string): string {
    // Replace multiple whitespace characters (spaces, tabs, newlines) with single space
    return text.replace(/\s+/g, ' ');
  }
}
