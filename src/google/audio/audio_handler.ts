import { AudioRequestParamsGoogle } from './audio_request_param.js';
import { AuthenticationHeaderGoogle } from '../auth/authentication_types.js';
import { AudioSuccessGoogle } from './audio_responses.js';
import axios, { AxiosInstance } from 'axios';
import { AudioResponseMapperGoogle } from './audio_response_mapper.js';
import { SsmlGoogle } from '../ssml/ssml.js';
import { EndpointsGoogle } from '../common/constants.js';
import { VoicesClientGoogle } from '../voices/voices_client.js';
import { AudioClientGoogle } from './audio_client.js';
import { BaseResponse } from '../../common/http/base_response.js';

export class AudioHandlerGoogle {
  async getAudio(
    params: AudioRequestParamsGoogle,
    authHeader: AuthenticationHeaderGoogle,
  ): Promise<AudioSuccessGoogle> {
    const client: AxiosInstance = axios.create();
    const audioClient: VoicesClientGoogle = new AudioClientGoogle(
      client,
      authHeader,
    );
    const mapper: AudioResponseMapperGoogle = new AudioResponseMapperGoogle();

    try {
      const ssml = new SsmlGoogle({
        text: params.text,
        rate: params.rate,
        pitch: params.pitch,
      });

      const body = {
        input: { ssml: ssml.sanitizedSsml },
        voice: {
          name: params.voice.code,
          languageCode: params.voice.locale.code,
        },
        audioConfig: { audioEncoding: params.audioFormat },
      };

      const bodyJson = JSON.stringify(body);

      const response = await audioClient.send({
        url: EndpointsGoogle.tts,
        data: bodyJson,
        method: 'POST',
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
