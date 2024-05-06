import { BaseResponse } from '../../common/http/base_response.js';

export class ExceptionAmazon extends Error {
  response: BaseResponse;

  constructor(response: BaseResponse) {
    super(`[TtsExceptionAmazon] ${response.code}: ${response.reason}`);
    this.response = response;
    this.name = 'TtsExceptionAmazon';
  }
}
