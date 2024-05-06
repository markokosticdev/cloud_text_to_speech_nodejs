import { BaseResponse } from '../../common/http/base_response.js';
import { VoiceUniversal } from './voice_model.js';

export class VoicesResponseUniversal extends BaseResponse {
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
