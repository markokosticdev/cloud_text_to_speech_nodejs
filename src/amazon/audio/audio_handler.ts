import { AudioSuccessAmazon } from './audio_responses.js';
import axios, { AxiosInstance } from 'axios';
import { AudioResponseMapperAmazon } from './audio_response_mapper.js';
import { SsmlAmazon } from '../ssml/ssml.js';
import { EndpointsAmazon } from '../common/constants.js';
import { VoicesClientAmazon } from '../voices/voices_client.js';
import { AudioClientAmazon } from './audio_client.js';
import { BaseResponse } from '../../common/http/base_response.js';
import { TtsParamsAmazon } from '../tts/tts_params.js';
import { AudioHandler } from '../../common/audio/audio_header.js';
import { AudioJoiner } from '../../common/audio/audio_joiner.js';

export class AudioHandlerAmazon {
  async getAudio(params: TtsParamsAmazon): Promise<AudioSuccessAmazon> {
    const client: AxiosInstance = axios.create();
    const audioClient: VoicesClientAmazon = new AudioClientAmazon(client);
    const mapper: AudioResponseMapperAmazon = new AudioResponseMapperAmazon();

    const ssml = new SsmlAmazon({
      ssml: params.text,
      rate: params.rate,
      pitch: params.pitch,
      voice: params.voice,
      options: params.ssmlOptions,
    });

    let audioSuccesses: AudioSuccessAmazon[];

    if (params.processOptions.processAsync) {
      audioSuccesses = await AudioHandler.handleAsync<AudioSuccessAmazon>(
        ssml.processedSsmlBatches(),
        async (ssml) => {
          return await this.processItem(params, ssml, mapper, audioClient);
        },
        params.processOptions.processLimit,
      );
    } else {
      audioSuccesses = await AudioHandler.handleSync<AudioSuccessAmazon>(
        ssml.processedSsmlBatches(),
        async (ssml) => {
          return await this.processItem(params, ssml, mapper, audioClient);
        },
      );
    }

    const audios = audioSuccesses.map((item) => item.audio);

    return new AudioSuccessAmazon(AudioJoiner.join(audios));
  }

  async processItem(
    params: TtsParamsAmazon,
    ssml: string,
    mapper: AudioResponseMapperAmazon,
    audioClient: VoicesClientAmazon,
  ): Promise<AudioSuccessAmazon> {
    try {
      const body = {
        OutputFormat: params.audioOptions.audioFormat,
        Text: ssml,
        TextType: 'ssml',
        VoiceId: params.voice.code,
        // 'Engine': params.voice.engines
      };

      const bodyJson = JSON.stringify(body);

      const response = await audioClient.send({
        url: EndpointsAmazon.tts,
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
