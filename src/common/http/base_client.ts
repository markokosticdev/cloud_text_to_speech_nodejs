import { AxiosInstance } from 'axios';
import { BaseHeader } from './base_header.js';

export abstract class BaseClient {
  constructor(client: AxiosInstance, header?: BaseHeader) {
    this._header = header;
    this._client = client;
  }

  protected _header?: BaseHeader;

  get header(): BaseHeader | undefined {
    return this._header;
  }

  protected _client: AxiosInstance;

  get client(): AxiosInstance {
    return this._client;
  }
}
