import { ConfigAmazon } from './config.js';

export class EndpointsAmazon {
  private constructor() {}

  /// Endpoint to retrieve a list of available voices.
  static get voices(): string {
    return `https://polly.${ConfigAmazon.region}.amazonaws.com/v1/voices`;
  }

  /// Endpoint for synthesizing speech from text.
  static get tts(): string {
    return `https://polly.${ConfigAmazon.region}.amazonaws.com/v1/speech`;
  }

  /// Endpoint for lexicon operations.
  static get lexicon(): string {
    return `https://polly.${ConfigAmazon.region}.amazonaws.com/v1/lexicons`;
  }

  /// Endpoint for pronunciation lexicons.
  static get pronunciation(): string {
    return `https://polly.${ConfigAmazon.region}.amazonaws.com/v1/pronunciation`;
  }
}
