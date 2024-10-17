import { VoicesHandlerAmazon } from '../voices/voices_handler.js';
import { AudioHandlerAmazon } from '../convert/audio/audio_handler.js';
import { VoicesSuccessAmazon } from '../voices/voices_responses.js';
import { ConvertParamsAmazon } from '../convert/convert_params.js';
import { AudioSuccessAmazon } from '../convert/audio/audio_responses.js';
import { VoicesParamsAmazon } from '../voices/voices_params.js';

///Implements repository pattern to access Amazon resources
export class RepositoryAmazon {
  private voicesHandler: VoicesHandlerAmazon;
  private audioHandler: AudioHandlerAmazon;

  constructor(
    voicesHandler: VoicesHandlerAmazon,
    audioHandler: AudioHandlerAmazon,
  ) {
    this.voicesHandler = voicesHandler;
    this.audioHandler = audioHandler;
  }

  ///Get voices
  ///
  ///Returns [VoicesResponseAmazon]
  ///
  /// [VoicesSuccessAmazon] request succeeded
  ///
  /// On failure returns one of the following:
  /// [VoicesFailedBadRequestAmazon], [VoicesFailedBadRequestAmazon], [VoicesFailedUnauthorizedAmazon],
  /// [VoicesFailedTooManyRequestsAmazon], [VoicesFailedBadGateWayAmazon], [VoicesFailedUnknownErrorAmazon]
  async getVoices(
    voicesParams?: VoicesParamsAmazon,
  ): Promise<VoicesSuccessAmazon> {
    voicesParams = voicesParams ?? new VoicesParamsAmazon();
    return await this.voicesHandler.getVoices(voicesParams);
  }

  ///Converts text to speech and return audio file as [Uint8Array].
  ///
  /// [ttsParams] request parameters
  ///
  /// Returns [AudioSuccessAmazon]
  ///
  /// [AudioSuccessAmazon] request succeeded
  ///
  /// On failure returns one of the following:
  /// [AudioFailedBadRequestAmazon], [AudioFailedUnauthorizedAmazon], [AudioFailedUnsupportedAmazon], [AudioFailedTooManyRequestAmazon],
  /// [AudioFailedBadGatewayAmazon], [AudioFailedBadGatewayAmazon], [AudioFailedUnknownErrorAmazon] or [AzureExceptionAmazon]
  async convertTts(
    ttsParams: ConvertParamsAmazon,
  ): Promise<AudioSuccessAmazon> {
    return await this.audioHandler.getAudio(ttsParams);
  }
}
