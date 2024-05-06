import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { BaseClient } from '../../common/http/base_client.js';
import { AuthenticationHeaderMicrosoft } from '../auth/authentication_types.js';
import axiosRetry, { IAxiosRetryConfig } from 'axios-retry';

export class VoicesClientMicrosoft extends BaseClient {
  constructor(client: AxiosInstance, header: AuthenticationHeaderMicrosoft) {
    const retryConfig: IAxiosRetryConfig = {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return axiosRetry.isRetryableError(error);
      },
    };
    axiosRetry(client, retryConfig);
    super(client, header);
  }

  async send(requestConfig: AxiosRequestConfig): Promise<AxiosResponse> {
    requestConfig.headers = requestConfig.headers || {};
    requestConfig.headers[this.header.type] = this.header.headerValue;

    return await this.client.request(requestConfig);
  }
}
