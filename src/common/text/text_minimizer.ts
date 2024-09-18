export class TextMinimizer {
  private constructor() {}

  static minimize(ssml: string): string {
    let minimizedSsml = ssml.replace(/[\t\n]+/g, ' ');

    minimizedSsml = minimizedSsml.replace(/\s{2,}/g, ' ');

    return minimizedSsml.trim();
  }
}
