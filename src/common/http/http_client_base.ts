import { AxiosInstance } from 'axios';
import { HttpHeaderBase } from './http_header_base.js';

export abstract class HttpClientBase {
  constructor(client: AxiosInstance, header?: HttpHeaderBase) {
    this._header = header;
    this._client = client;
  }

  protected _header?: HttpHeaderBase;

  get header(): HttpHeaderBase | undefined {
    return this._header;
  }

  protected _client: AxiosInstance;

  get client(): AxiosInstance {
    return this._client;
  }
}
