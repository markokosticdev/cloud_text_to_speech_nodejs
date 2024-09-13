import { AuthenticationHeaderGoogle } from '../auth/authentication_types.js';
import { AudioSuccessGoogle } from './audio_responses.js';
import axios, { AxiosInstance } from 'axios';
import { AudioResponseMapperGoogle } from './audio_response_mapper.js';
import { SsmlGoogle } from '../ssml/ssml.js';
import { EndpointsGoogle } from '../common/constants.js';
import { VoicesClientGoogle } from '../voices/voices_client.js';
import { AudioClientGoogle } from './audio_client.js';
import { BaseResponse } from '../../common/http/base_response.js';
import { TtsParamsGoogle } from '../tts/tts_params.js';
import { AudioHandler } from '../../common/audio/audio_header.js';
import { AudioJoiner } from '../../common/audio/audio_joiner.js';

export class AudioHandlerGoogle {
  async getAudio(
    params: TtsParamsGoogle,
    authHeader: AuthenticationHeaderGoogle,
  ): Promise<AudioSuccessGoogle> {
    const client: AxiosInstance = axios.create();
    const audioClient: VoicesClientGoogle = new AudioClientGoogle(
      client,
      authHeader,
    );
    const mapper: AudioResponseMapperGoogle = new AudioResponseMapperGoogle();

    const ssml = new SsmlGoogle({
      ssml: params.text,
      rate: params.rate,
      pitch: params.pitch,
      voice: params.voice,
      options: params.ssmlOptions,
    });

    let audioSuccesses: AudioSuccessGoogle[];

    if (params.processOptions.processAsync) {
      audioSuccesses = await AudioHandler.handleAsync<AudioSuccessGoogle>(
        ssml.processedSsmlBatches(),
        async (ssml) => {
          return await this.processItem(params, ssml, mapper, audioClient);
        },
        params.processOptions.processLimit,
      );
    } else {
      audioSuccesses = await AudioHandler.handleSync<AudioSuccessGoogle>(
        ssml.processedSsmlBatches(),
        async (ssml) => {
          return await this.processItem(params, ssml, mapper, audioClient);
        },
      );
    }

    const audios = audioSuccesses.map((item) => item.audio);

    return new AudioSuccessGoogle(AudioJoiner.join(audios));
  }

  async processItem(
    params: TtsParamsGoogle,
    ssml: string,
    mapper: AudioResponseMapperGoogle,
    audioClient: VoicesClientGoogle,
  ): Promise<AudioSuccessGoogle> {
    try {
      const body = {
        input: { ssml: ssml },
        voice: {
          name: params.voice.code,
          languageCode: params.voice.locale.code,
        },
        audioConfig: { audioEncoding: params.audioOptions.audioFormat },
      };

      const bodyJson = JSON.stringify(body);

      const response = await audioClient.send({
        url: EndpointsGoogle.tts,
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
