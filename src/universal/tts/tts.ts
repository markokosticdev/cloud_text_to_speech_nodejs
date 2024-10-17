import { InitParamsGoogle } from '../../google/common/init.js';
import { InitParamsMicrosoft } from '../../microsoft/common/init.js';
import { InitParamsAmazon } from '../../amazon/common/init.js';
import { VoicesSuccessUniversal } from '../voices/voices_responses.js';
import { TtsProviders } from '../../common/tts/tts_providers.js';
import { TtsGoogle } from '../../google/tts/tts.js';
import { TtsMicrosoft } from '../../microsoft/tts/tts.js';
import { TtsAmazon } from '../../amazon/tts/tts.js';
import { ConvertParamsUniversal } from '../convert/convert_params.js';
import { AudioSuccessUniversal } from '../convert/audio/audio_responses.js';
import { ConvertParamsMapper } from '../convert/convert_params_mapper.js';
import { Log } from '../../common/utils/log.js';
import { Helpers } from '../../common/utils/helpers.js';
import { VoicesParamsUniversal } from '../voices/voices_params.js';
import { VoicesParamsMapper } from '../voices/voices_params_mapper.js';

export class TtsUniversal {
  private static _provider: string;
  private static _initDone: boolean = false;

  static get initDone(): boolean {
    return TtsUniversal._initDone;
  }

  static setProvider(provider: string): void {
    TtsUniversal._provider = provider.toLowerCase();
  }

  /// MUST be called first before any other call is made.
  ///
  /// **provider** : TTS Provider
  ///
  /// **googleParams** : Google Init Params
  ///
  /// **microsoftParams** : Microsoft Init Params
  ///
  /// **amazonParams** : Amazon Init Params
  ///
  /// **withLogs** : (optional) enable logs. *true* by default
  static init({
    provider,
    googleParams,
    microsoftParams,
    amazonParams,
    withLogs,
  }: {
    provider: string;
    googleParams: InitParamsGoogle;
    microsoftParams: InitParamsMicrosoft;
    amazonParams: InitParamsAmazon;
    withLogs: boolean;
  }): void {
    TtsUniversal._init(
      provider,
      googleParams,
      microsoftParams,
      amazonParams,
      withLogs,
    );
  }

  ///Get voices
  ///
  /// [voicesParams] request parameters
  ///
  ///Returns [VoicesSuccessUniversal]
  ///
  /// [VoicesSuccessUniversal] request succeeded
  ///
  /// On failure throws one of the following:
  /// [VoicesFailedBadRequestGoogle], [VoicesFailedBadRequestGoogle], [VoicesFailedUnauthorizedGoogle],
  /// [VoicesFailedTooManyRequestsGoogle], [VoicesFailedBadGateWayGoogle], [VoicesFailedUnknownErrorGoogle],
  /// [VoicesFailedBadRequestMicrosoft], [VoicesFailedBadRequestMicrosoft], [VoicesFailedUnauthorizedMicrosoft],
  /// [VoicesFailedTooManyRequestsMicrosoft], [VoicesFailedBadGateWayMicrosoft], [VoicesFailedUnknownErrorMicrosoft],
  /// [VoicesFailedBadRequestAmazon], [VoicesFailedBadRequestAmazon], [VoicesFailedUnauthorizedAmazon],
  /// [VoicesFailedTooManyRequestsAmazon], [VoicesFailedBadGateWayAmazon], [VoicesFailedUnknownErrorAmazon]
  static async getVoices(
    voicesParams?: VoicesParamsUniversal,
  ): Promise<VoicesSuccessUniversal> {
    return this.handleProvider<Promise<VoicesSuccessUniversal>>({
      google: () => this._getVoices(TtsProviders.google, voicesParams),
      microsoft: () => this._getVoices(TtsProviders.microsoft, voicesParams),
      amazon: () => this._getVoices(TtsProviders.amazon, voicesParams),
      combine: async () => {
        const providers = [
          TtsProviders.google,
          TtsProviders.microsoft,
          TtsProviders.amazon,
        ];

        const activeProviders = providers.filter((provider) =>
          this.isProviderInitDone(provider),
        );

        const allVoicesPromises = activeProviders.map((provider) =>
          this._getVoices(provider, voicesParams),
        );

        const allVoices = await Promise.all(allVoicesPromises);

        const aggregatedVoices = new VoicesSuccessUniversal(
          [],
          200,
          'Aggregated voices',
        );
        let voices = allVoices.flatMap((voicesResult) => voicesResult.voices);

        voices = Helpers.sortVoices(voices);

        aggregatedVoices.voices = voices;

        return aggregatedVoices;
      },
    });
  }

  ///Converts text to speech and return audio file as [Uint8List].
  ///
  /// [ttsParams] request parameters
  ///
  /// Returns [AudioResponseMicrosoft]
  ///
  /// [AudioSuccessUniversal] request succeeded
  ///
  /// On failure returns one of the following:
  /// [AudioFailedBadRequestGoogle], [AudioFailedUnauthorizedGoogle], [AudioFailedUnsupportedGoogle], [AudioFailedTooManyRequestGoogle],
  /// [AudioFailedBadGatewayGoogle], [AudioFailedBadGatewayGoogle], [AudioFailedUnknownErrorGoogle],
  /// [AudioFailedBadRequestMicrosoft], [AudioFailedUnauthorizedMicrosoft], [AudioFailedUnsupportedMicrosoft], [AudioFailedTooManyRequestMicrosoft],
  /// [AudioFailedBadGatewayMicrosoft], [AudioFailedBadGatewayMicrosoft], [AudioFailedUnknownErrorMicrosoft],
  /// [AudioFailedBadRequestAmazon], [AudioFailedUnauthorizedAmazon], [AudioFailedUnsupportedAmazon], [AudioFailedTooManyRequestAmazon],
  /// [AudioFailedBadGatewayAmazon], [AudioFailedBadGatewayAmazon], [AudioFailedUnknownErrorAmazon]
  static async convertTts(
    ttsParams: ConvertParamsUniversal,
  ): Promise<AudioSuccessUniversal> {
    return TtsUniversal.handleProvider<Promise<AudioSuccessUniversal>>({
      google: async () => {
        const audio = await TtsGoogle.convertTts(
          ConvertParamsMapper.toGoogle(ttsParams),
        );
        return new AudioSuccessUniversal(audio.audio, audio.code, audio.reason);
      },
      microsoft: async () => {
        const audio = await TtsMicrosoft.convertTts(
          ConvertParamsMapper.toMicrosoft(ttsParams),
        );
        return new AudioSuccessUniversal(audio.audio, audio.code, audio.reason);
      },
      amazon: async () => {
        const audio = await TtsAmazon.convertTts(
          ConvertParamsMapper.toAmazon(ttsParams),
        );
        return new AudioSuccessUniversal(audio.audio, audio.code, audio.reason);
      },
      provider: ttsParams.voice.provider,
    });
  }

  private static async _getVoices(
    provider: string,
    voicesParams?: VoicesParamsUniversal,
  ): Promise<VoicesSuccessUniversal> {
    return this.handleProvider<Promise<VoicesSuccessUniversal>>({
      google: async () => {
        const voicesParamsGoogle = voicesParams
          ? VoicesParamsMapper.toGoogle(voicesParams)
          : undefined;
        const voices = await TtsGoogle.getVoices(voicesParamsGoogle);
        return new VoicesSuccessUniversal(
          voices.voices,
          voices.code,
          voices.reason,
        );
      },
      microsoft: async () => {
        const voicesParamsMicrosoft = voicesParams
          ? VoicesParamsMapper.toMicrosoft(voicesParams)
          : undefined;
        const voices = await TtsMicrosoft.getVoices(voicesParamsMicrosoft);
        return new VoicesSuccessUniversal(
          voices.voices,
          voices.code,
          voices.reason,
        );
      },
      amazon: async () => {
        const voicesParamsAmazon = voicesParams
          ? VoicesParamsMapper.toAmazon(voicesParams)
          : undefined;
        const voices = await TtsAmazon.getVoices(voicesParamsAmazon);
        return new VoicesSuccessUniversal(
          voices.voices,
          voices.code,
          voices.reason,
        );
      },
      provider: provider,
    });
  }

  private static _init(
    provider: string,
    google?: InitParamsGoogle,
    microsoft?: InitParamsMicrosoft,
    amazon?: InitParamsAmazon,
    withLogs: boolean = true,
  ): void {
    TtsUniversal._assertInitParams(provider, google, microsoft, amazon);
    TtsUniversal._initLogs(withLogs);

    TtsUniversal._provider = provider.toLowerCase();
    Log.d(`TtsUniversal provider set to: ${provider}`);

    const initializedProviders = [];

    if (!TtsUniversal._initDone) {
      if (google) {
        TtsGoogle.init({ params: google, withLogs });
        initializedProviders.push(TtsProviders.google);
      }
      if (microsoft) {
        TtsMicrosoft.init({ params: microsoft, withLogs });
        initializedProviders.push(TtsProviders.microsoft);
      }
      if (amazon) {
        TtsAmazon.init({ params: amazon, withLogs });
        initializedProviders.push(TtsProviders.amazon);
      }

      TtsUniversal._initDone = true;
      Log.d(`TtsUniversal initialised for: ${initializedProviders.join(', ')}`);
    } else {
      Log.d('TtsUniversal initialised already!');
    }
  }

  private static _assertInitParams(
    provider: string,
    google?: InitParamsGoogle,
    microsoft?: InitParamsMicrosoft,
    amazon?: InitParamsAmazon,
  ): void {
    if (!google && !microsoft && !amazon) {
      throw new Error(
        'Initialization parameters are missing for all providers.',
      );
    }

    switch (provider) {
      case TtsProviders.google:
        if (!google)
          throw new Error('Google initialization parameters are missing.');
        break;
      case TtsProviders.microsoft:
        if (!microsoft)
          throw new Error('Microsoft initialization parameters are missing.');
        break;
      case TtsProviders.amazon:
        if (!amazon)
          throw new Error('Amazon initialization parameters are missing.');
        break;
      case TtsProviders.combine:
        break;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  private static handleProvider<T>(options: {
    google?: () => T;
    microsoft?: () => T;
    amazon?: () => T;
    combine?: () => T;
    provider?: string;
  }): T {
    const provider = options.provider || TtsUniversal._provider;
    switch (provider) {
      case TtsProviders.google:
        if (!options.google)
          throw new Error('Google handle function is missing.');
        return options.google();
      case TtsProviders.microsoft:
        if (!options.microsoft)
          throw new Error('Microsoft handle function is missing.');
        return options.microsoft();
      case TtsProviders.amazon:
        if (!options.amazon)
          throw new Error('Amazon handle function is missing.');
        return options.amazon();
      case TtsProviders.combine:
        if (!options.combine)
          throw new Error('Combine handle function is missing.');
        return options.combine();
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  private static _initLogs(withLogs: boolean): void {
    withLogs ? Log.enable() : Log.disable();
  }

  private static isProviderInitDone(provider: string): boolean {
    switch (provider) {
      case TtsProviders.google:
        return TtsGoogle.initDone;
      case TtsProviders.microsoft:
        return TtsMicrosoft.initDone;
      case TtsProviders.amazon:
        return TtsAmazon.initDone;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }
}
