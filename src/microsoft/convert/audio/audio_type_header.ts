import { BaseHeader } from '../../../common/http/base_header.js';

export class AudioTypeHeaderMicrosoft extends BaseHeader {
  ///Audio format should be selected from [AudioOutputFormat] class.
  constructor(audioFormat: string) {
    super('X-Microsoft-OutputFormat', audioFormat);
  }

  get headerValue(): string {
    return this.value;
  }
}
