import { BaseResponse } from '../../common/http/base_response.js';

export class ExceptionGoogle extends Error {
  response: BaseResponse;

  constructor(response: BaseResponse) {
    super(`[TtsExceptionGoogle] ${response.code}: ${response.reason}`);
    this.response = response;
    this.name = 'TtsExceptionGoogle';
  }
}
