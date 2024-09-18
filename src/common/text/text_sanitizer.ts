export class TextSanitizer {
  private constructor() {}

  static sanitize(text: string): string {
    const regex = /<\/?[^>]+(\/)?>/g;

    return text.replace(regex, '').trim();
  }
}
