import { BaseResponse } from '../../../common/http/base_response.js';

export abstract class AudioResponseUniversal extends BaseResponse {
  constructor(code: number, reason: string) {
    super(code, reason);
  }
}

export class AudioSuccessUniversal extends AudioResponseUniversal {
  audio: Uint8Array;

  constructor(audio: Uint8Array, code: number, reason: string) {
    super(code, reason);
    this.audio = audio;
  }
}
