import { BaseClient } from '../../../common/http/base_client.js';
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { AuthenticationHeaderMicrosoft } from '../../auth/authentication_types.js';
import axiosRetry, { IAxiosRetryConfig } from 'axios-retry';
import { AudioTypeHeaderMicrosoft } from './audio_type_header.js';

export class AudioClientMicrosoft extends BaseClient {
  private _audioTypeHeader: AudioTypeHeaderMicrosoft;

  constructor(
    client: AxiosInstance,
    header: AuthenticationHeaderMicrosoft,
    audioTypeHeader: AudioTypeHeaderMicrosoft,
  ) {
    const retryConfig: IAxiosRetryConfig = {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: axiosRetry.isRetryableError,
    };
    axiosRetry(client, retryConfig);
    super(client, header);
    this._audioTypeHeader = audioTypeHeader;
  }

  async send(requestConfig: AxiosRequestConfig): Promise<AxiosResponse> {
    requestConfig.headers = requestConfig.headers || {};
    requestConfig.headers[this.header.type] = this.header.headerValue;
    requestConfig.headers[this._audioTypeHeader.type] =
      this._audioTypeHeader.value;
    requestConfig.headers['Content-Type'] = 'application/ssml+xml';

    return await this.client.request(requestConfig);
  }
}
