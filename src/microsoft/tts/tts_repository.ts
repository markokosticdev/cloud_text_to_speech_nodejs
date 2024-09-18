import { VoicesHandlerMicrosoft } from "../voices/voices_handler.js";
import { AudioHandlerMicrosoft } from "../convert/audio/audio_handler.js";
import { VoicesSuccessMicrosoft } from "../voices/voices_responses.js";
import { SubscriptionKeyAuthenticationHeaderMicrosoft } from "../auth/authentication_types.js";
import { ConfigMicrosoft } from "../common/config.js";
import { ConvertParamsMicrosoft } from "../convert/convert_params.js";
import { AudioSuccessMicrosoft } from "../convert/audio/audio_responses.js";

///Implements repository pattern to access Microsoft resources
export class RepositoryMicrosoft {
  private voicesHandler: VoicesHandlerMicrosoft;
  private audioHandler: AudioHandlerMicrosoft;

  constructor(
    voicesHandler: VoicesHandlerMicrosoft,
    audioHandler: AudioHandlerMicrosoft,
  ) {
    this.voicesHandler = voicesHandler;
    this.audioHandler = audioHandler;
  }

  ///Get voices
  ///
  ///Returns [VoicesResponseMicrosoft]
  ///
  /// [VoicesSuccessMicrosoft] request succeeded
  ///
  /// On failure returns one of the following:
  /// [VoicesFailedBadRequestMicrosoft], [VoicesFailedBadRequestMicrosoft], [VoicesFailedUnauthorizedMicrosoft],
  /// [VoicesFailedTooManyRequestsMicrosoft], [VoicesFailedBadGateWayMicrosoft], [VoicesFailedUnknownErrorMicrosoft]
  async getVoices(): Promise<VoicesSuccessMicrosoft> {
    return await this.voicesHandler.getVoices(
      new SubscriptionKeyAuthenticationHeaderMicrosoft(
        ConfigMicrosoft.subscriptionKey,
      ),
    );
  }

  ///Converts text to speech and return audio file as [Uint8Array].
  ///
  /// [ttsParams] request parameters
  ///
  /// Returns [AudioSuccessMicrosoft]
  ///
  /// [AudioSuccessMicrosoft] request succeeded
  ///
  /// On failure returns one of the following:
  /// [AudioFailedBadRequestMicrosoft], [AudioFailedUnauthorizedMicrosoft], [AudioFailedUnsupportedMicrosoft], [AudioFailedTooManyRequestMicrosoft],
  /// [AudioFailedBadGatewayMicrosoft], [AudioFailedBadGatewayMicrosoft], [AudioFailedUnknownErrorMicrosoft] or [AzureExceptionMicrosoft]
  async convertTts(
    ttsParams: ConvertParamsMicrosoft,
  ): Promise<AudioSuccessMicrosoft> {
    return await this.audioHandler.getAudio(
      ttsParams,
      new SubscriptionKeyAuthenticationHeaderMicrosoft(
        ConfigMicrosoft.subscriptionKey,
      ),
    );
  }
}
