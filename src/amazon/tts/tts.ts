// Assuming necessary imports are done above
import { AudioHandlerAmazon } from "../audio/audio_handler.js";
import { VoicesHandlerAmazon } from "../voices/voices_handler.js";
import { RepositoryAmazon } from "./tts_repository.js";
import { InitParamsAmazon } from "../common/init.js";
import { ConfigAmazon } from "../common/config.js";
import { Log } from "../../common/utils/log.js";
import { TtsParamsAmazon } from "./tts_params.js";
import { AudioSuccessAmazon } from "../audio/audio_responses.js";
import { VoicesSuccessAmazon } from "../voices/voices_responses.js";

///Helper class for Amazon TTS requests
export class TtsAmazon {
  private static audioHandler: AudioHandlerAmazon = new AudioHandlerAmazon();
  private static voicesHandler: VoicesHandlerAmazon = new VoicesHandlerAmazon();
  private static repo: RepositoryAmazon;

  private constructor() {}

  private static _initDone: boolean = false;

  /// MUST be called first before any other call is made.
  ///
  /// **params** : Amazon Init Params
  ///
  /// **withLogs** : (optional) enable logs. *true* by default

  public static get initDone(): boolean {
    return TtsAmazon._initDone;
  }

  ///Get voices
  ///
  ///Returns [VoicesSuccessAmazon]
  ///
  /// [VoicesSuccessAmazon] request succeeded
  ///
  /// On failure throws one of the following:
  /// [VoicesFailedBadRequestAmazon], [VoicesFailedBadRequestAmazon], [VoicesFailedUnauthorizedAmazon],
  /// [VoicesFailedTooManyRequestsAmazon], [VoicesFailedBadGateWayAmazon], [VoicesFailedUnknownErrorAmazon]

  ///
  public static init({
    params,
    withLogs = true,
  }: {
    params: InitParamsAmazon;
    withLogs: boolean;
  }): void {
    this._init(params.keyId, params.accessKey, params.region, withLogs);
  }

  ///Converts text to speech and return audio file as [Uint8Array].
  ///
  /// [ttsParams] request parameters
  ///
  /// Returns [AudioResponseAmazon]
  ///
  /// [AudioSuccessAmazon] request succeeded
  ///
  /// On failure returns one of the following:
  /// [AudioFailedBadRequestAmazon], [AudioFailedUnauthorizedAmazon], [AudioFailedUnsupportedAmazon], [AudioFailedTooManyRequestAmazon],
  /// [AudioFailedBadGatewayAmazon], [AudioFailedBadGatewayAmazon], [AudioFailedUnknownErrorAmazon]

  ///
  public static async getVoices(): Promise<VoicesSuccessAmazon> {
    return TtsAmazon.repo.getVoices();
  }

  ///
  public static async convertTts(
    ttsParams: TtsParamsAmazon,
  ): Promise<AudioSuccessAmazon> {
    return TtsAmazon.repo.convertTts(ttsParams);
  }

  public static _init(
    keyId: string,
    accessKey: string,
    region: string,
    withLogs = true,
  ): void {
    if (!TtsAmazon._initDone) {
      ConfigAmazon.init({ keyId, accessKey, region });
      TtsAmazon._initRepository();
      TtsAmazon._initLogs(withLogs);
      TtsAmazon._initDone = true;
      Log.d('TtsAmazon initialised');
    } else {
      Log.d('TtsAmazon initialised already!');
    }
  }

  private static _initRepository(): void {
    TtsAmazon.repo = new RepositoryAmazon(
      TtsAmazon.voicesHandler,
      TtsAmazon.audioHandler,
    );
  }

  private static _initLogs(withLogs: boolean): void {
    withLogs ? Log.enable() : Log.disable();
  }
}
