import axios, { AxiosInstance } from 'axios';
import { VoicesSuccessGoogle } from './voices_responses.js';
import { VoicesClientGoogle } from './voices_client.js';
import { VoicesResponseMapperGoogle } from './voices_response_mapper.js';
import { EndpointsGoogle } from '../common/constants.js';
import { AuthenticationHeaderGoogle } from '../auth/authentication_types.js';

export class VoicesHandlerGoogle {
  public async getVoices(
    authHeader: AuthenticationHeaderGoogle,
  ): Promise<VoicesSuccessGoogle> {
    const client: AxiosInstance = axios.create();
    const voicesClient: VoicesClientGoogle = new VoicesClientGoogle(
      client,
      authHeader,
    );

    try {
      const mapper = new VoicesResponseMapperGoogle();

      const response = await voicesClient.send({
        url: EndpointsGoogle.voices,
        method: 'GET',
      });

      const voicesResponse = mapper.map(response);

      if (voicesResponse instanceof VoicesSuccessGoogle) {
        return voicesResponse;
      } else {
        throw voicesResponse;
      }
    } catch (e) {
      throw e;
    }
  }
}
