import axios, { AxiosInstance } from 'axios';
import { VoicesSuccessAmazon } from './voices_responses.js';
import { VoicesClientAmazon } from './voices_client.js';
import { VoicesResponseMapperAmazon } from './voices_response_mapper.js';
import { EndpointsAmazon } from '../common/constants.js';
import { VoicesParamsAmazon } from './voices_params.js';

export class VoicesHandlerAmazon {
  public async getVoices(
    params: VoicesParamsAmazon,
  ): Promise<VoicesSuccessAmazon> {
    const client: AxiosInstance = axios.create();
    const voicesClient: VoicesClientAmazon = new VoicesClientAmazon(client);
    const mapper = new VoicesResponseMapperAmazon(params);

    try {
      const httpProxy = params.httpProxy?.();

      const response = await voicesClient.send({
        url: httpProxy?.url ?? EndpointsAmazon.voices,
        ...(httpProxy?.headers && { headers: httpProxy.headers }),
        ...(httpProxy?.params && { params: httpProxy.params }),
        method: 'GET',
      });

      const voicesResponse = mapper.map(response);

      if (voicesResponse instanceof VoicesSuccessAmazon) {
        return voicesResponse;
      } else {
        throw voicesResponse;
      }
    } catch (e) {
      throw e;
    }
  }
}
