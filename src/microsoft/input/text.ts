import { TtsTextOptionsMicrosoft } from '../tts/tts_text_options.js';
import { TextBase } from '../../common/text/text_base.js';
import { VoiceMicrosoft } from '../voices/voice_model.js';

export class TextMicrosoft extends TextBase<
  VoiceMicrosoft,
  TtsTextOptionsMicrosoft
> {
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
