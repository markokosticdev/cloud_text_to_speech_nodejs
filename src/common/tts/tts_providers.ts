export class TtsProviders {
  static readonly google: string = 'google';
  static readonly microsoft: string = 'microsoft';
  static readonly amazon: string = 'amazon';
  static readonly combine: string = 'combine';

  private constructor() {} // Prevent instantiation

  static all(): string[] {
    return [
      TtsProviders.google,
      TtsProviders.microsoft,
      TtsProviders.amazon,
      TtsProviders.combine,
    ];
  }

  static allSingle(): string[] {
    return [TtsProviders.google, TtsProviders.microsoft, TtsProviders.amazon];
  }
}
