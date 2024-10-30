import { HttpResponseBase } from '../../common/http/http_response_base.js';

export class ExceptionAmazon extends Error {
  response: HttpResponseBase;

  constructor(response: HttpResponseBase) {
    super(`[TtsExceptionAmazon] ${response.code}: ${response.reason}`);
    this.response = response;
    this.name = 'TtsExceptionAmazon';
  }
}
