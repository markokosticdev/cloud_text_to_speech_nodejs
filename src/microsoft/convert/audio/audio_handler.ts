import { AuthenticationHeaderMicrosoft } from '../../auth/authentication_types.js';
import { AudioSuccessMicrosoft } from './audio_responses.js';
import axios, { AxiosInstance } from 'axios';
import { AudioResponseMapperMicrosoft } from './audio_response_mapper.js';
import { SsmlMicrosoft } from '../input/ssml.js';
import { EndpointsMicrosoft } from '../../common/constants.js';
import { VoicesClientMicrosoft } from '../../voices/voices_client.js';
import { AudioClientMicrosoft } from './audio_client.js';
import { BaseResponse } from '../../../common/http/base_response.js';
import { AudioTypeHeaderMicrosoft } from './audio_type_header.js';
import { ConvertParamsMicrosoft } from '../convert_params.js';
import { AudioHandler } from '../../../common/convert/audio/audio_handler.js';
import { AudioJoiner } from '../../../common/convert/audio/audio_joiner.js';
import { TextMicrosoft } from '../input/text.js';

export class AudioHandlerMicrosoft {
  async getAudio(
    params: ConvertParamsMicrosoft,
    authHeader: AuthenticationHeaderMicrosoft,
  ): Promise<AudioSuccessMicrosoft> {
    const client: AxiosInstance = axios.create();
    const audioClient: VoicesClientMicrosoft = new AudioClientMicrosoft(
      client,
      authHeader,
      new AudioTypeHeaderMicrosoft(params.audioOptions.audioFormat),
    );
    const mapper: AudioResponseMapperMicrosoft =
      new AudioResponseMapperMicrosoft();

    let audioSuccesses: AudioSuccessMicrosoft[];

    if (params.ssml || params.ssmlBatches) {
      audioSuccesses = await this.processFromSsml(params, audioClient, mapper);
    } else {
      audioSuccesses = await this.processFromText(params, audioClient, mapper);
    }

    const audios = audioSuccesses.map((item) => item.audio);

    return new AudioSuccessMicrosoft(AudioJoiner.join(audios));
  }

  private async processFromSsml(
    params: ConvertParamsMicrosoft,
    audioClient: VoicesClientMicrosoft,
    mapper: AudioResponseMapperMicrosoft,
  ): Promise<AudioSuccessMicrosoft[]> {
    const ssml = new SsmlMicrosoft({
      ssml: params.ssml,
      ssmlBatches: params.ssmlBatches,
      rate: params.rate,
      pitch: params.pitch,
      voice: params.voice,
      voiceId: params.voiceId,
      options: params.ssmlOptions,
    });

    if (params.processOptions.processAsync) {
      return await AudioHandler.handleAsync<AudioSuccessMicrosoft>(
        ssml.processedSsmlBatches(),
        async (batch) => {
          return await this.processItemFromSsml(
            params,
            batch,
            audioClient,
            mapper,
          );
        },
        params.processOptions.processLimit,
      );
    } else {
      return await AudioHandler.handleSync<AudioSuccessMicrosoft>(
        ssml.processedSsmlBatches(),
        async (batch) => {
          return await this.processItemFromSsml(
            params,
            batch,
            audioClient,
            mapper,
          );
        },
      );
    }
  }

  private async processItemFromSsml(
    params: ConvertParamsMicrosoft,
    ssml: string,
    audioClient: VoicesClientMicrosoft,
    mapper: AudioResponseMapperMicrosoft,
  ): Promise<AudioSuccessMicrosoft> {
    try {
      const httpProxy = params.httpProxy?.();

      const response = await audioClient.send({
        url: httpProxy?.url ?? EndpointsMicrosoft.tts,
        ...(httpProxy?.headers && { headers: httpProxy.headers }),
        ...(httpProxy?.params && { params: httpProxy.params }),
        data: ssml,
        method: 'POST',
        responseType: 'arraybuffer',
      });

      const audioResponse: BaseResponse = mapper.map(response);

      if (audioResponse instanceof AudioSuccessMicrosoft) {
        return audioResponse;
      } else {
        throw audioResponse;
      }
    } catch (e) {
      throw e;
    }
  }

  private async processFromText(
    params: ConvertParamsMicrosoft,
    audioClient: VoicesClientMicrosoft,
    mapper: AudioResponseMapperMicrosoft,
  ): Promise<AudioSuccessMicrosoft[]> {
    const text = new TextMicrosoft({
      text: params.text,
      textBatches: params.textBatches,
      rate: params.rate,
      pitch: params.pitch,
      voice: params.voice,
      voiceId: params.voiceId,
      options: params.ssmlOptions,
    });

    if (params.processOptions.processAsync) {
      return await AudioHandler.handleAsync<AudioSuccessMicrosoft>(
        text.processedTextBatches(),
        async (batch) => {
          return await this.processItemFromText(
            params,
            batch,
            audioClient,
            mapper,
          );
        },
        params.processOptions.processLimit,
      );
    } else {
      return await AudioHandler.handleSync<AudioSuccessMicrosoft>(
        text.processedTextBatches(),
        async (batch) => {
          return await this.processItemFromText(
            params,
            batch,
            audioClient,
            mapper,
          );
        },
      );
    }
  }

  private async processItemFromText(
    params: ConvertParamsMicrosoft,
    text: string,
    audioClient: VoicesClientMicrosoft,
    mapper: AudioResponseMapperMicrosoft,
  ): Promise<AudioSuccessMicrosoft> {
    try {
      const httpProxy = params.httpProxy?.();

      const response = await audioClient.send({
        url: httpProxy?.url ?? EndpointsMicrosoft.tts,
        ...(httpProxy?.headers && { headers: httpProxy.headers }),
        ...(httpProxy?.params && { params: httpProxy.params }),
        data: text,
        method: 'POST',
        responseType: 'arraybuffer',
      });

      const audioResponse: BaseResponse = mapper.map(response);

      if (audioResponse instanceof AudioSuccessMicrosoft) {
        return audioResponse;
      } else {
        throw audioResponse;
      }
    } catch (e) {
      throw e;
    }
  }
}
