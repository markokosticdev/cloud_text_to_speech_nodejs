import { BaseClient } from '../../common/http/base_client.js';
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axiosRetry, { IAxiosRetryConfig } from 'axios-retry';
import { ConfigAmazon } from '../common/config.js';
import { aws4Interceptor } from 'aws4-axios';

export class AudioClientAmazon extends BaseClient {
  constructor(client: AxiosInstance) {
    const retryConfig: IAxiosRetryConfig = {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: axiosRetry.isRetryableError,
    };
    axiosRetry(client, retryConfig);
    super(client);
  }

  async send(requestConfig: AxiosRequestConfig): Promise<AxiosResponse> {
    requestConfig.headers = requestConfig.headers || {};
    requestConfig.headers['Content-Type'] = 'application/json';

    const interceptor = aws4Interceptor({
      options: {
        region: ConfigAmazon.region,
        service: 'polly',
      },
      credentials: {
        accessKeyId: ConfigAmazon.keyId,
        secretAccessKey: ConfigAmazon.accessKey,
      },
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    this.client.interceptors.request.use(interceptor);

    return await this.client.request(requestConfig);
  }
}
