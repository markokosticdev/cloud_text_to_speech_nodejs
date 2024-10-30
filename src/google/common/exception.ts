import { HttpResponseBase } from '../../common/http/http_response_base.js';

export class ExceptionGoogle extends Error {
  response: HttpResponseBase;

  constructor(response: HttpResponseBase) {
    super(`[TtsExceptionGoogle] ${response.code}: ${response.reason}`);
    this.response = response;
    this.name = 'TtsExceptionGoogle';
  }
}
