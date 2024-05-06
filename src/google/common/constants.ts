import { ConfigGoogle } from './config.js';

export class EndpointsGoogle {
  private constructor() {}

  /// Endpoint to retrieve a list of available voices.
  static get voices(): string {
    return 'https://texttospeech.googleapis.com/v1/voices';
  }

  /// Endpoint for synthesizing speech from text.
  static get tts(): string {
    return 'https://texttospeech.googleapis.com/v1/text:synthesize';
  }

  /// Endpoint to access project-specific settings or resources.
  static get projectId(): string {
    return `https://texttospeech.googleapis.com/v1/projects/${ConfigGoogle.projectId}`;
  }

  /// Endpoint for accessing custom voice models or other configurations.
  static get customConfig(): string {
    return `https://texttospeech.googleapis.com/v1/projects/${ConfigGoogle.projectId}/custom`;
  }
}
