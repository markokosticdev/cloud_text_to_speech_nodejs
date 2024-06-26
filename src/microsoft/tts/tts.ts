// Assuming necessary imports are done above
import { AudioHandlerMicrosoft } from "../audio/audio_handler.js";
import { VoicesHandlerMicrosoft } from "../voices/voices_handler.js";
import { RepositoryMicrosoft } from "./tts_repository.js";
import { InitParamsMicrosoft } from "../common/init.js";
import { ConfigMicrosoft } from "../common/config.js";
import { Log } from "../../common/utils/log.js";
import { TtsParamsMicrosoft } from "./tts_params.js";
import { AudioSuccessMicrosoft } from "../audio/audio_responses.js";
import { VoicesSuccessMicrosoft } from "../voices/voices_responses.js";

///Helper class for Microsoft TTS requests
export class TtsMicrosoft {
  private static audioHandler: AudioHandlerMicrosoft =
    new AudioHandlerMicrosoft();
  private static voicesHandler: VoicesHandlerMicrosoft =
    new VoicesHandlerMicrosoft();
  private static repo: RepositoryMicrosoft;

  private constructor() {}

  private static _initDone: boolean = false;

  /// MUST be called first before any other call is made.
  ///
  /// **params** : Microsoft Init Params
  ///
  /// **withLogs** : (optional) enable logs. *true* by default

  public static get initDone(): boolean {
    return TtsMicrosoft._initDone;
  }

  ///Get voices
  ///
  ///Returns [VoicesSuccessMicrosoft]
  ///
  /// [VoicesSuccessMicrosoft] request succeeded
  ///
  /// On failure throws one of the following:
  /// [VoicesFailedBadRequestMicrosoft], [VoicesFailedBadRequestMicrosoft], [VoicesFailedUnauthorizedMicrosoft],
  /// [VoicesFailedTooManyRequestsMicrosoft], [VoicesFailedBadGateWayMicrosoft], [VoicesFailedUnknownErrorMicrosoft]

  ///
  public static init({
    params,
    withLogs = true,
  }: {
    params: InitParamsMicrosoft;
    withLogs: boolean;
  }): void {
    this._init(params.subscriptionKey, params.region, withLogs);
  }

  ///Converts text to speech and return audio file as [Uint8Array].
  ///
  /// [ttsParams] request parameters
  ///
  /// Returns [AudioResponseMicrosoft]
  ///
  /// [AudioSuccessMicrosoft] request succeeded
  ///
  /// On failure returns one of the following:
  /// [AudioFailedBadRequestMicrosoft], [AudioFailedUnauthorizedMicrosoft], [AudioFailedUnsupportedMicrosoft], [AudioFailedTooManyRequestMicrosoft],
  /// [AudioFailedBadGatewayMicrosoft], [AudioFailedBadGatewayMicrosoft], [AudioFailedUnknownErrorMicrosoft]

  ///
  public static async getVoices(): Promise<VoicesSuccessMicrosoft> {
    return TtsMicrosoft.repo.getVoices();
  }

  ///
  public static async convertTts(
    ttsParams: TtsParamsMicrosoft,
  ): Promise<AudioSuccessMicrosoft> {
    return TtsMicrosoft.repo.convertTts(ttsParams);
  }

  public static _init(
    subscriptionKey: string,
    region: string,
    withLogs = true,
  ): void {
    if (!TtsMicrosoft._initDone) {
      ConfigMicrosoft.init({ subscriptionKey, region });
      TtsMicrosoft._initRepository();
      TtsMicrosoft._initLogs(withLogs);
      TtsMicrosoft._initDone = true;
      Log.d('TtsMicrosoft initialised');
    } else {
      Log.d('TtsMicrosoft initialised already!');
    }
  }

  private static _initRepository(): void {
    TtsMicrosoft.repo = new RepositoryMicrosoft(
      TtsMicrosoft.voicesHandler,
      TtsMicrosoft.audioHandler,
    );
  }

  private static _initLogs(withLogs: boolean): void {
    withLogs ? Log.enable() : Log.disable();
  }
}
