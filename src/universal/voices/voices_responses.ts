import { HttpResponseBase } from '../../common/http/http_response_base.js';
import { VoiceUniversal } from './voice_model.js';

export class VoicesResponseUniversal extends HttpResponseBase {
  constructor(code: number, reason: string) {
    super(code, reason);
  }
}

export class VoicesSuccessUniversal extends VoicesResponseUniversal {
  voices: VoiceUniversal[];

  constructor(voices: VoiceUniversal[], code: number, reason: string) {
    super(code, reason);
    this.voices = voices;
  }
}
