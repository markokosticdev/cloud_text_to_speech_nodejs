export class SsmlMinimizer {
  private constructor() {}

  static minimize(ssml: string): string {
    let minimizedSsml = ssml.replace(/[\t\n]+/g, ' ');

    minimizedSsml = minimizedSsml.replace(/\s{2,}/g, ' ');

    minimizedSsml = minimizedSsml.replace(/(\S)(\s+)(<[^/][^>]*>)/g, '$1 $3');

    minimizedSsml = minimizedSsml.replace(/(^|\s)(\s+)(<[^/][^>]*>)/g, '$1$3');

    minimizedSsml = minimizedSsml.replace(/(<\/[^>]*>|<[^>]*\/>)\s+/g, '$1');

    minimizedSsml = minimizedSsml.replace(/\s+\/>/g, '/>');

    minimizedSsml = minimizedSsml.replace(/<([^>]+)>\s+/g, '<$1>');

    minimizedSsml = minimizedSsml.replace(/\s+<\/([^>]+)>/g, '</$1>');

    return minimizedSsml.trim();
  }
}
