import axios, { AxiosInstance } from 'axios';
import { VoicesSuccessAmazon } from './voices_responses.js';
import { VoicesClientAmazon } from './voices_client.js';
import { VoicesResponseMapperAmazon } from './voices_response_mapper.js';
import { EndpointsAmazon } from '../common/constants.js';

export class VoicesHandlerAmazon {
  public async getVoices(): Promise<VoicesSuccessAmazon> {
    const client: AxiosInstance = axios.create();
    const voicesClient: VoicesClientAmazon = new VoicesClientAmazon(client);

    try {
      const mapper = new VoicesResponseMapperAmazon();

      const response = await voicesClient.send({
        url: EndpointsAmazon.voices,
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
