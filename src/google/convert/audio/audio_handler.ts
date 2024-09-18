import { AuthenticationHeaderGoogle } from '../../auth/authentication_types.js';
import { AudioSuccessGoogle } from './audio_responses.js';
import axios, { AxiosInstance } from 'axios';
import { AudioResponseMapperGoogle } from './audio_response_mapper.js';
import { SsmlGoogle } from '../input/ssml.js';
import { EndpointsGoogle } from '../../common/constants.js';
import { VoicesClientGoogle } from '../../voices/voices_client.js';
import { AudioClientGoogle } from './audio_client.js';
import { BaseResponse } from '../../../common/http/base_response.js';
import { ConvertParamsGoogle } from '../convert_params.js';
import { AudioHandler } from '../../../common/convert/audio/audio_handler.js';
import { AudioJoiner } from '../../../common/convert/audio/audio_joiner.js';
import { TextGoogle } from '../input/text.js';

export class AudioHandlerGoogle {
  async getAudio(
    params: ConvertParamsGoogle,
    authHeader: AuthenticationHeaderGoogle,
  ): Promise<AudioSuccessGoogle> {
    const client: AxiosInstance = axios.create();
    const audioClient: VoicesClientGoogle = new AudioClientGoogle(
      client,
      authHeader,
    );
    const mapper: AudioResponseMapperGoogle = new AudioResponseMapperGoogle();

    let audioSuccesses: AudioSuccessGoogle[];

    if (params.ssml || params.ssmlBatches) {
      audioSuccesses = await this.processFromSsml(params, audioClient, mapper);
    } else {
      audioSuccesses = await this.processFromText(params, audioClient, mapper);
    }

    const audios = audioSuccesses.map((item) => item.audio);

    return new AudioSuccessGoogle(AudioJoiner.join(audios));
  }

  private async processFromSsml(
    params: ConvertParamsGoogle,
    audioClient: VoicesClientGoogle,
    mapper: AudioResponseMapperGoogle,
  ): Promise<AudioSuccessGoogle[]> {
    const ssml = new SsmlGoogle({
      ssml: params.ssml,
      ssmlBatches: params.ssmlBatches,
      rate: params.rate,
      pitch: params.pitch,
      voice: params.voice,
      voiceId: params.voiceId,
      options: params.ssmlOptions,
    });

    if (params.processOptions.processAsync) {
      return await AudioHandler.handleAsync<AudioSuccessGoogle>(
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
      return await AudioHandler.handleSync<AudioSuccessGoogle>(
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
    params: ConvertParamsGoogle,
    ssml: string,
    audioClient: VoicesClientGoogle,
    mapper: AudioResponseMapperGoogle,
  ): Promise<AudioSuccessGoogle> {
    try {
      const body = {
        input: { ssml: ssml },
        voice: {
          name: params.voice?.code ?? params.voiceId,
        },
        audioConfig: { audioEncoding: params.audioOptions.audioFormat },
      };

      const bodyJson = JSON.stringify(body);

      const httpProxy = params.httpProxy?.();

      const response = await audioClient.send({
        url: httpProxy?.url ?? EndpointsGoogle.tts,
        ...(httpProxy?.headers && { headers: httpProxy.headers }),
        ...(httpProxy?.params && { params: httpProxy.params }),
        data: bodyJson,
        method: 'POST',
        responseType: 'arraybuffer',
      });

      const audioResponse: BaseResponse = mapper.map(response);

      if (audioResponse instanceof AudioSuccessGoogle) {
        return audioResponse;
      } else {
        throw audioResponse;
      }
    } catch (e) {
      throw e;
    }
  }

  private async processFromText(
    params: ConvertParamsGoogle,
    audioClient: VoicesClientGoogle,
    mapper: AudioResponseMapperGoogle,
  ): Promise<AudioSuccessGoogle[]> {
    const text = new TextGoogle({
      text: params.text,
      textBatches: params.textBatches,
      rate: params.rate,
      pitch: params.pitch,
      voice: params.voice,
      voiceId: params.voiceId,
      options: params.ssmlOptions,
    });

    if (params.processOptions.processAsync) {
      return await AudioHandler.handleAsync<AudioSuccessGoogle>(
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
      return await AudioHandler.handleSync<AudioSuccessGoogle>(
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
    params: ConvertParamsGoogle,
    text: string,
    audioClient: VoicesClientGoogle,
    mapper: AudioResponseMapperGoogle,
  ): Promise<AudioSuccessGoogle> {
    try {
      const body = {
        input: { text: text },
        voice: {
          name: params.voice?.code ?? params.voiceId,
        },
        audioConfig: { audioEncoding: params.audioOptions.audioFormat },
      };

      const bodyJson = JSON.stringify(body);

      const httpProxy = params.httpProxy?.();

      const response = await audioClient.send({
        url: httpProxy?.url ?? EndpointsGoogle.tts,
        ...(httpProxy?.headers && { headers: httpProxy.headers }),
        ...(httpProxy?.params && { params: httpProxy.params }),
        data: bodyJson,
        method: 'POST',
        responseType: 'arraybuffer',
      });

      const audioResponse: BaseResponse = mapper.map(response);

      if (audioResponse instanceof AudioSuccessGoogle) {
        return audioResponse;
      } else {
        throw audioResponse;
      }
    } catch (e) {
      throw e;
    }
  }
}
