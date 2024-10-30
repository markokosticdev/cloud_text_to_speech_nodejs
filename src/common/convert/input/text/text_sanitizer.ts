export class TextSanitizer {
  private constructor() {}

  static sanitize(text: string): string {
    return text.replace(/<\/?[^>]+(\/)?>/g, '').trim();
  }
}
