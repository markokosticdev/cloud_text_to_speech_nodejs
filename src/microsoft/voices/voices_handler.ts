import axios, { AxiosInstance } from 'axios';
import { VoicesSuccessMicrosoft } from './voices_responses.js';
import { VoicesClientMicrosoft } from './voices_client.js';
import { VoicesResponseMapperMicrosoft } from './voices_response_mapper.js';
import { EndpointsMicrosoft } from '../common/constants.js';
import { AuthenticationHeaderMicrosoft } from '../auth/authentication_types.js';
import { VoicesParamsMicrosoft } from './voices_params.js';

export class VoicesHandlerMicrosoft {
  public async getVoices(
    params: VoicesParamsMicrosoft,
    authHeader: AuthenticationHeaderMicrosoft,
  ): Promise<VoicesSuccessMicrosoft> {
    const client: AxiosInstance = axios.create();
    const voicesClient: VoicesClientMicrosoft = new VoicesClientMicrosoft(
      client,
      authHeader,
    );
    const mapper = new VoicesResponseMapperMicrosoft(params);

    try {
      const httpProxy = params.httpProxy?.();

      const response = await voicesClient.send({
        url: httpProxy?.url ?? EndpointsMicrosoft.voices,
        ...(httpProxy?.headers && { headers: httpProxy.headers }),
        ...(httpProxy?.params && { params: httpProxy.params }),
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
