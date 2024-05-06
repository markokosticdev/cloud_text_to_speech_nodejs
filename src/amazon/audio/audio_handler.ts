import { AudioRequestParamsAmazon } from './audio_request_param.js';
import { AudioSuccessAmazon } from './audio_responses.js';
import axios, { AxiosInstance } from 'axios';
import { AudioResponseMapperAmazon } from './audio_response_mapper.js';
import { SsmlAmazon } from '../ssml/ssml.js';
import { EndpointsAmazon } from '../common/constants.js';
import { VoicesClientAmazon } from '../voices/voices_client.js';
import { AudioClientAmazon } from './audio_client.js';
import { BaseResponse } from '../../common/http/base_response.js';

export class AudioHandlerAmazon {
  async getAudio(
    params: AudioRequestParamsAmazon,
  ): Promise<AudioSuccessAmazon> {
    const client: AxiosInstance = axios.create();
    const audioClient: VoicesClientAmazon = new AudioClientAmazon(client);
    const mapper: AudioResponseMapperAmazon = new AudioResponseMapperAmazon();

    try {
      const ssml = new SsmlAmazon({
        text: params.text,
        rate: params.rate,
        pitch: params.pitch,
      });

      const body = {
        OutputFormat: params.audioFormat,
        Text: ssml.sanitizedSsml,
        TextType: 'ssml',
        VoiceId: params.voice.code,
        // 'Engine': params.voice.engines
      };

      const bodyJson = JSON.stringify(body);

      const response = await audioClient.send({
        url: EndpointsAmazon.tts,
        data: bodyJson,
        responseType: 'arraybuffer',
        method: 'POST',
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
