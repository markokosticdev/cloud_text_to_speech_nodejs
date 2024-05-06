import axios, { AxiosInstance } from 'axios';
import { VoicesSuccessMicrosoft } from './voices_responses.js';
import { VoicesClientMicrosoft } from './voices_client.js';
import { VoicesResponseMapperMicrosoft } from './voices_response_mapper.js';
import { EndpointsMicrosoft } from '../common/constants.js';
import { AuthenticationHeaderMicrosoft } from '../auth/authentication_types.js';

export class VoicesHandlerMicrosoft {
  public async getVoices(
    authHeader: AuthenticationHeaderMicrosoft,
  ): Promise<VoicesSuccessMicrosoft> {
    const client: AxiosInstance = axios.create();
    const voicesClient: VoicesClientMicrosoft = new VoicesClientMicrosoft(
      client,
      authHeader,
    );

    try {
      const mapper = new VoicesResponseMapperMicrosoft();

      const response = await voicesClient.send({
        url: EndpointsMicrosoft.voices,
        method: 'GET',
      });

      const voicesResponse = mapper.map(response);

      if (voicesResponse instanceof VoicesSuccessMicrosoft) {
        return voicesResponse;
      } else {
        throw voicesResponse;
      }
    } catch (e) {
      throw e;
    }
  }
}
