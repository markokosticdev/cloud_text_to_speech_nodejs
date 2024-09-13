import { AuthenticationHeaderMicrosoft } from '../auth/authentication_types.js';
import { AudioSuccessMicrosoft } from './audio_responses.js';
import axios, { AxiosInstance } from 'axios';
import { AudioResponseMapperMicrosoft } from './audio_response_mapper.js';
import { SsmlMicrosoft } from '../ssml/ssml.js';
import { EndpointsMicrosoft } from '../common/constants.js';
import { VoicesClientMicrosoft } from '../voices/voices_client.js';
import { AudioClientMicrosoft } from './audio_client.js';
import { BaseResponse } from '../../common/http/base_response.js';
import { AudioTypeHeaderMicrosoft } from './audio_type_header.js';
import { TtsParamsMicrosoft } from '../tts/tts_params.js';
import { AudioHandler } from '../../common/audio/audio_header.js';
import { AudioJoiner } from '../../common/audio/audio_joiner.js';

export class AudioHandlerMicrosoft {
  async getAudio(
    params: TtsParamsMicrosoft,
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

    const ssml = new SsmlMicrosoft({
      ssml: params.text,
      rate: params.rate,
      pitch: params.pitch,
      voice: params.voice,
      options: params.ssmlOptions,
    });

    let audioSuccesses: AudioSuccessMicrosoft[];

    if (params.processOptions.processAsync) {
      audioSuccesses = await AudioHandler.handleAsync<AudioSuccessMicrosoft>(
        ssml.processedSsmlBatches(),
        async (ssml) => {
          return await this.processItem(ssml, mapper, audioClient);
        },
        params.processOptions.processLimit,
      );
    } else {
      audioSuccesses = await AudioHandler.handleSync<AudioSuccessMicrosoft>(
        ssml.processedSsmlBatches(),
        async (ssml) => {
          return await this.processItem(ssml, mapper, audioClient);
        },
      );
    }

    const audios = audioSuccesses.map((item) => item.audio);

    return new AudioSuccessMicrosoft(AudioJoiner.join(audios));
  }

  async processItem(
    ssml: string,
    mapper: AudioResponseMapperMicrosoft,
    audioClient: VoicesClientMicrosoft,
  ): Promise<AudioSuccessMicrosoft> {
    try {
      const response = await audioClient.send({
        url: EndpointsMicrosoft.tts,
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
}
