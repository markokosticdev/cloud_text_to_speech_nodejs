import { BaseClient } from '../../common/http/base_client.js';
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { AuthenticationHeaderGoogle } from '../auth/authentication_types.js';
import axiosRetry, { IAxiosRetryConfig } from 'axios-retry';

export class AudioClientGoogle extends BaseClient {
  constructor(client: AxiosInstance, header: AuthenticationHeaderGoogle) {
    const retryConfig: IAxiosRetryConfig = {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: axiosRetry.isRetryableError,
    };
    axiosRetry(client, retryConfig);
    super(client, header);
  }

  async send(requestConfig: AxiosRequestConfig): Promise<AxiosResponse> {
    requestConfig.headers = requestConfig.headers || {};
    requestConfig.headers[this.header.type] = this.header.headerValue;
    requestConfig.headers['Content-Type'] = 'application/json';
    return await this.client.request(requestConfig);
  }
}
