import { ConfigMicrosoft } from './config.js';

export class EndpointsMicrosoft {
  private constructor() {}

  /// Endpoint to retrieve a list of available voices.
  static get voices(): string {
    return `https://${ConfigMicrosoft.region}.tts.speech.microsoft.com/cognitiveservices/voices/list`;
  }

  /// Endpoint for synthesizing speech from text.
  static get tts(): string {
    return `https://${ConfigMicrosoft.region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  }

  /// Endpoint for handling long audio requests, typically for converting large text files to audio.
  static get longAudio(): string {
    return `https://${ConfigMicrosoft.region}.customvoice.api.speech.microsoft.com`;
  }

  /// Endpoint to retrieve a list of custom voices, if any are available for use.
  static get customVoicesList(): string {
    return `https://${ConfigMicrosoft.region}.voice.speech.microsoft.com/cognitiveservices/v1?deploymentId=`;
  }

  /// Endpoint to obtain an Access Token for authenticating API requests.
  static get issueToken(): string {
    return `https://${ConfigMicrosoft.region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;
  }
}
