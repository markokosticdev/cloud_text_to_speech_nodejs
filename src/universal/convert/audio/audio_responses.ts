import { HttpResponseBase } from '../../../common/http/http_response_base.js';

export abstract class AudioResponseUniversal extends HttpResponseBase {
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
