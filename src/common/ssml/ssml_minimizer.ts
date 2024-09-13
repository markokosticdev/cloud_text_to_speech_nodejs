export class SsmlMinimizer {
  private constructor() {}

  static minimize(ssml: string): string {
    return ssml.replace(/\s*\n\s*/g, '').replace(/\s*(<[^>]+>)\s*/g, '$1');
  }
}
