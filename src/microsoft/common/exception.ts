import { HttpResponseBase } from '../../common/http/http_response_base.js';

export class ExceptionMicrosoft extends Error {
  response: HttpResponseBase;

  constructor(response: HttpResponseBase) {
    super(`[TtsExceptionMicrosoft] ${response.code}: ${response.reason}`);
    this.response = response;
    this.name = 'TtsExceptionMicrosoft';
  }
}
