import { VoiceMicrosoft } from '../voices/voice_model.js';
import { TtsSsmlOptionsMicrosoft } from '../tts/tts_ssml_options.js';
import { SsmlBase } from '../../common/ssml/ssml_base.js';

export class SsmlMicrosoft extends SsmlBase<
  VoiceMicrosoft,
  TtsSsmlOptionsMicrosoft
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
