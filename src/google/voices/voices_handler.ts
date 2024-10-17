import axios, { AxiosInstance } from 'axios';
import { VoicesSuccessGoogle } from './voices_responses.js';
import { VoicesClientGoogle } from './voices_client.js';
import { VoicesResponseMapperGoogle } from './voices_response_mapper.js';
import { EndpointsGoogle } from '../common/constants.js';
import { AuthenticationHeaderGoogle } from '../auth/authentication_types.js';
import { VoicesParamsGoogle } from './voices_params.js';

export class VoicesHandlerGoogle {
  public async getVoices(
    params: VoicesParamsGoogle,
    authHeader: AuthenticationHeaderGoogle,
  ): Promise<VoicesSuccessGoogle> {
    const client: AxiosInstance = axios.create();
    const voicesClient: VoicesClientGoogle = new VoicesClientGoogle(
      client,
      authHeader,
    );
    const mapper = new VoicesResponseMapperGoogle(params);

    try {
      const httpProxy = params.httpProxy?.();

      const response = await voicesClient.send({
        url: httpProxy?.url ?? EndpointsGoogle.voices,
        ...(httpProxy?.headers && { headers: httpProxy.headers }),
        ...(httpProxy?.params && { params: httpProxy.params }),
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
