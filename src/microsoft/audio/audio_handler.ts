import { AudioRequestParamsMicrosoft } from './audio_request_param.js';
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

export class AudioHandlerMicrosoft {
  async getAudio(
    params: AudioRequestParamsMicrosoft,
    authHeader: AuthenticationHeaderMicrosoft,
  ): Promise<AudioSuccessMicrosoft> {
    const client: AxiosInstance = axios.create();
    const audioClient: VoicesClientMicrosoft = new AudioClientMicrosoft(
      client,
      authHeader,
      new AudioTypeHeaderMicrosoft(params.audioFormat),
    );
    const mapper: AudioResponseMapperMicrosoft =
      new AudioResponseMapperMicrosoft();

    try {
      const ssml = new SsmlMicrosoft({
        text: params.text,
        rate: params.rate,
        pitch: params.pitch,
        voice: params.voice,
      });

      const response = await audioClient.send({
        url: EndpointsMicrosoft.tts,
        data: ssml.sanitizedSsml,
        responseType: 'arraybuffer',
        method: 'POST',
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
