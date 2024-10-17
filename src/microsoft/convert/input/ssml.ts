import { ConvertSsmlOptionsMicrosoft } from '../convert_ssml_options.js';
import { SsmlBase } from '../../../common/convert/input/ssml/ssml_base.js';
import { VoiceMicrosoft } from '../../voices/voices_model.js';

export class SsmlMicrosoft extends SsmlBase<
  VoiceMicrosoft,
  ConvertSsmlOptionsMicrosoft
> {
  protected get allowedElements(): { [p: string]: string[] } {
    return this.options.allowedElements;
  }

  protected ssmlRootTemplate(ssml: string): string {
    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${this.voice.locale.code}">
        <voice xml:lang="${this.voice.locale.code}" xml:gender="${this.voice.gender}" name="${this.voice.code}">
          <prosody rate="${this.rate}" pitch="${this.pitch}">
            ${ssml}
          </prosody>
        </voice>
      </speak>`;
  }
}
