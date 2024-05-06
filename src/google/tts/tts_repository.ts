import { VoicesHandlerGoogle } from "../voices/voices_handler.js";
import { AudioHandlerGoogle } from "../audio/audio_handler.js";
import { VoicesSuccessGoogle } from "../voices/voices_responses.js";
import { ApiKeyAuthenticationHeaderGoogle } from "../auth/authentication_types.js";
import { ConfigGoogle } from "../common/config.js";
import { TtsParamsGoogle } from "./tts_params.js";
import { AudioSuccessGoogle } from "../audio/audio_responses.js";

///Implements repository pattern to access Google resources
export class RepositoryGoogle {
  private voicesHandler: VoicesHandlerGoogle;
  private audioHandler: AudioHandlerGoogle;

  constructor(
    voicesHandler: VoicesHandlerGoogle,
    audioHandler: AudioHandlerGoogle,
  ) {
    this.voicesHandler = voicesHandler;
    this.audioHandler = audioHandler;
  }

  ///Get voices
  ///
  ///Returns [VoicesResponseGoogle]
  ///
  /// [VoicesSuccessGoogle] request succeeded
  ///
  /// On failure returns one of the following:
  /// [VoicesFailedBadRequestGoogle], [VoicesFailedBadRequestGoogle], [VoicesFailedUnauthorizedGoogle],
  /// [VoicesFailedTooManyRequestsGoogle], [VoicesFailedBadGateWayGoogle], [VoicesFailedUnknownErrorGoogle]
  async getVoices(): Promise<VoicesSuccessGoogle> {
    return await this.voicesHandler.getVoices(
      new ApiKeyAuthenticationHeaderGoogle(ConfigGoogle.apiKey),
    );
  }

  ///Converts text to speech and return audio file as [Uint8Array].
  ///
  /// [ttsParams] request parameters
  ///
  /// Returns [AudioSuccessGoogle]
  ///
  /// [AudioSuccessGoogle] request succeeded
  ///
  /// On failure returns one of the following:
  /// [AudioFailedBadRequestGoogle], [AudioFailedUnauthorizedGoogle], [AudioFailedUnsupportedGoogle], [AudioFailedTooManyRequestGoogle],
  /// [AudioFailedBadGatewayGoogle], [AudioFailedBadGatewayGoogle], [AudioFailedUnknownErrorGoogle] or [AzureExceptionGoogle]
  async convertTts(ttsParams: TtsParamsGoogle): Promise<AudioSuccessGoogle> {
    return await this.audioHandler.getAudio(
      ttsParams,
      new ApiKeyAuthenticationHeaderGoogle(ConfigGoogle.apiKey),
    );
  }
}
