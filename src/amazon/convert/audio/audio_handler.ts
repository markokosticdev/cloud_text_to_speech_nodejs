import { AudioSuccessAmazon } from './audio_responses.js';
import axios, { AxiosInstance } from 'axios';
import { AudioResponseMapperAmazon } from './audio_response_mapper.js';
import { SsmlAmazon } from '../input/ssml.js';
import { EndpointsAmazon } from '../../common/constants.js';
import { VoicesClientAmazon } from '../../voices/voices_client.js';
import { AudioClientAmazon } from './audio_client.js';
import { BaseResponse } from '../../../common/http/base_response.js';
import { ConvertParamsAmazon } from '../convert_params.js';
import { AudioHandler } from '../../../common/convert/audio/audio_handler.js';
import { AudioJoiner } from '../../../common/convert/audio/audio_joiner.js';
import { TextAmazon } from '../input/text.js';

export class AudioHandlerAmazon {
  async getAudio(params: ConvertParamsAmazon): Promise<AudioSuccessAmazon> {
    const client: AxiosInstance = axios.create();
    const audioClient: VoicesClientAmazon = new AudioClientAmazon(client);
    const mapper: AudioResponseMapperAmazon = new AudioResponseMapperAmazon();

    let audioSuccesses: AudioSuccessAmazon[];

    if (params.ssml || params.ssmlBatches) {
      audioSuccesses = await this.processFromSsml(params, audioClient, mapper);
    } else {
      audioSuccesses = await this.processFromText(params, audioClient, mapper);
    }

    const audios = audioSuccesses.map((item) => item.audio);

    return new AudioSuccessAmazon(AudioJoiner.join(audios));
  }

  private async processFromSsml(
    params: ConvertParamsAmazon,
    audioClient: VoicesClientAmazon,
    mapper: AudioResponseMapperAmazon,
  ): Promise<AudioSuccessAmazon[]> {
    const ssml = new SsmlAmazon({
      ssml: params.ssml,
      ssmlBatches: params.ssmlBatches,
      rate: params.rate,
      pitch: params.pitch,
      voice: params.voice,
      voiceId: params.voiceId,
      options: params.ssmlOptions,
    });

    if (params.processOptions.processAsync) {
      return await AudioHandler.handleAsync<AudioSuccessAmazon>(
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
      return await AudioHandler.handleSync<AudioSuccessAmazon>(
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
    params: ConvertParamsAmazon,
    ssml: string,
    audioClient: VoicesClientAmazon,
    mapper: AudioResponseMapperAmazon,
  ): Promise<AudioSuccessAmazon> {
    try {
      const body = {
        OutputFormat: params.audioOptions.audioFormat,
        Text: ssml,
        TextType: 'ssml',
        VoiceId: params.voice?.code ?? params.voiceId,
        // 'Engine': params.voice.engines
      };

      const bodyJson = JSON.stringify(body);

      const httpProxy = params.httpProxy?.();

      const response = await audioClient.send({
        url: httpProxy?.url ?? EndpointsAmazon.tts,
        ...(httpProxy?.headers && { headers: httpProxy.headers }),
        ...(httpProxy?.params && { params: httpProxy.params }),
        data: bodyJson,
        method: 'POST',
        responseType: 'arraybuffer',
      });

      const audioResponse: BaseResponse = mapper.map(response);

      if (audioResponse instanceof AudioSuccessAmazon) {
        return audioResponse;
      } else {
        throw audioResponse;
      }
    } catch (e) {
      throw e;
    }
  }

  private async processFromText(
    params: ConvertParamsAmazon,
    audioClient: VoicesClientAmazon,
    mapper: AudioResponseMapperAmazon,
  ): Promise<AudioSuccessAmazon[]> {
    const text = new TextAmazon({
      text: params.text,
      textBatches: params.textBatches,
      rate: params.rate,
      pitch: params.pitch,
      voice: params.voice,
      voiceId: params.voiceId,
      options: params.ssmlOptions,
    });

    if (params.processOptions.processAsync) {
      return await AudioHandler.handleAsync<AudioSuccessAmazon>(
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
      return await AudioHandler.handleSync<AudioSuccessAmazon>(
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
    params: ConvertParamsAmazon,
    text: string,
    audioClient: VoicesClientAmazon,
    mapper: AudioResponseMapperAmazon,
  ): Promise<AudioSuccessAmazon> {
    try {
      const body = {
        OutputFormat: params.audioOptions.audioFormat,
        Text: text,
        TextType: 'text',
        VoiceId: params.voice?.code ?? params.voiceId,
        // 'Engine': params.voice.engines
      };

      const bodyJson = JSON.stringify(body);

      const httpProxy = params.httpProxy?.();

      const response = await audioClient.send({
        url: httpProxy?.url ?? EndpointsAmazon.tts,
        ...(httpProxy?.headers && { headers: httpProxy.headers }),
        ...(httpProxy?.params && { params: httpProxy.params }),
        data: bodyJson,
        method: 'POST',
        responseType: 'arraybuffer',
      });

      const audioResponse: BaseResponse = mapper.map(response);

      if (audioResponse instanceof AudioSuccessAmazon) {
        return audioResponse;
      } else {
        throw audioResponse;
      }
    } catch (e) {
      throw e;
    }
  }
}
