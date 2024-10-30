import { HttpHeaderBase } from '../../../common/http/http_header_base.js';

export class AudioTypeHeaderMicrosoft extends HttpHeaderBase {
  ///Audio format should be selected from [AudioOutputFormat] class.
  constructor(audioFormat: string) {
    super('X-Microsoft-OutputFormat', audioFormat);
  }

  get headerValue(): string {
    return this.value;
  }
}
