import { TtsSsmlOptionsAmazon } from '../tts/tts_ssml_options.js';
import { SsmlBase } from '../../common/ssml/ssml_base.js';
import { VoiceAmazon } from "../voices/voice_model.js";

export class SsmlAmazon extends SsmlBase<VoiceAmazon, TtsSsmlOptionsAmazon> {
  protected get allowedElements(): { [p: string]: string[] } {
    return this.options.allowedElements;
  }

  protected ssmlRootTemplate(ssml: string): string {
    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis">
        <prosody rate="${this.rate}" pitch="${this.pitch}">
          ${ssml}
        </prosody>
      </speak>`;
  }
}
