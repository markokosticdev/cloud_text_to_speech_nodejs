export class TextMinimizer {
  private constructor() {}

  static minimize(text: string): string {
    let minimizedText = text.replace(/[\t\n]+/g, ' ');

    minimizedText = minimizedText.replace(/\s{2,}/g, ' ');

    return minimizedText.trim();
  }
}
