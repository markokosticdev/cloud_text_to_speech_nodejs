import { BaseResponse } from '../../common/http/base_response.js';

export class ExceptionMicrosoft extends Error {
  response: BaseResponse;

  constructor(response: BaseResponse) {
    super(`[TtsExceptionMicrosoft] ${response.code}: ${response.reason}`);
    this.response = response;
    this.name = 'TtsExceptionMicrosoft';
  }
}
