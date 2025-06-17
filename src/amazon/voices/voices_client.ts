import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { HttpClientBase } from '../../common/http/http_client_base.js';
import axiosRetry, { IAxiosRetryConfig } from 'axios-retry';
import { ConfigAmazon } from '../common/config.js';
import { aws4Interceptor } from 'aws4-axios';

export class VoicesClientAmazon extends HttpClientBase {
  constructor(client: AxiosInstance) {
    const retryConfig: IAxiosRetryConfig = {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return axiosRetry.isRetryableError(error);
      },
    };
    axiosRetry(client, retryConfig);
    super(client);
  }

  async send(requestConfig: AxiosRequestConfig): Promise<AxiosResponse> {
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
    // @ts-ignore - aws4Interceptor types are not fully compatible with axios interceptor types
    this.client.interceptors.request.use(interceptor as unknown);

    return await this.client.request(requestConfig);
  }
}
