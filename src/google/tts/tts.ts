// Assuming necessary imports are done above
import { AudioHandlerGoogle } from '../convert/audio/audio_handler.js';
import { VoicesHandlerGoogle } from '../voices/voices_handler.js';
import { RepositoryGoogle } from './tts_repository.js';
import { InitParamsGoogle } from '../common/init.js';
import { ConfigGoogle } from '../common/config.js';
import { Log } from '../../common/utils/log.js';
import { ConvertParamsGoogle } from '../convert/convert_params.js';
import { AudioSuccessGoogle } from '../convert/audio/audio_responses.js';
import { VoicesSuccessGoogle } from '../voices/voices_responses.js';
import { VoicesParamsGoogle } from '../voices/voices_params.js';

///Helper class for Google TTS requests
export class TtsGoogle {
  private static audioHandler: AudioHandlerGoogle = new AudioHandlerGoogle();
  private static voicesHandler: VoicesHandlerGoogle = new VoicesHandlerGoogle();
  private static repo: RepositoryGoogle;

  private constructor() {}

  private static _initDone: boolean = false;

  public static get initDone(): boolean {
    return TtsGoogle._initDone;
  }

  /// MUST be called first before any other call is made.
  ///
  /// **params** : Google Init Params
  ///
  /// **withLogs** : (optional) enable logs. *true* by default
  public static init({
    params,
    withLogs = true,
  }: {
    params: InitParamsGoogle;
    withLogs: boolean;
  }): void {
    this._init(params.apiKey, withLogs);
  }

  ///Get voices
  ///
  /// [voicesParams] request parameters
  ///
  ///Returns [VoicesSuccessGoogle]
  ///
  /// [VoicesSuccessGoogle] request succeeded
  ///
  /// On failure throws one of the following:
  /// [VoicesFailedBadRequestGoogle], [VoicesFailedBadRequestGoogle], [VoicesFailedUnauthorizedGoogle],
  /// [VoicesFailedTooManyRequestsGoogle], [VoicesFailedBadGateWayGoogle], [VoicesFailedUnknownErrorGoogle]
  public static async getVoices(
    voicesParams?: VoicesParamsGoogle,
  ): Promise<VoicesSuccessGoogle> {
    return TtsGoogle.repo.getVoices(voicesParams);
  }

  ///Converts text to speech and return audio file as [Uint8Array].
  ///
  /// [ttsParams] request parameters
  ///
  /// Returns [AudioResponseGoogle]
  ///
  /// [AudioSuccessGoogle] request succeeded
  ///
  /// On failure returns one of the following:
  /// [AudioFailedBadRequestGoogle], [AudioFailedUnauthorizedGoogle], [AudioFailedUnsupportedGoogle], [AudioFailedTooManyRequestGoogle],
  /// [AudioFailedBadGatewayGoogle], [AudioFailedBadGatewayGoogle], [AudioFailedUnknownErrorGoogle]
  public static async convertTts(
    ttsParams: ConvertParamsGoogle,
  ): Promise<AudioSuccessGoogle> {
    return TtsGoogle.repo.convertTts(ttsParams);
  }

  public static _init(apiKey: string, withLogs = true): void {
    if (!TtsGoogle._initDone) {
      ConfigGoogle.init({ apiKey });
      TtsGoogle._initRepository();
      TtsGoogle._initLogs(withLogs);
      TtsGoogle._initDone = true;
      Log.d('TtsGoogle initialised');
    } else {
      Log.d('TtsGoogle initialised already!');
    }
  }

  private static _initRepository(): void {
    TtsGoogle.repo = new RepositoryGoogle(
      TtsGoogle.voicesHandler,
      TtsGoogle.audioHandler,
    );
  }

  private static _initLogs(withLogs: boolean): void {
    withLogs ? Log.enable() : Log.disable();
  }
}
