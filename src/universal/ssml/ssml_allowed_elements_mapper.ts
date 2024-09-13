import { TtsSsmlOptionsGoogle } from '../../google/tts/tts_ssml_options.js';
import { TtsSsmlOptionsMicrosoft } from '../../microsoft/tts/tts_ssml_options.js';
import { TtsSsmlOptionsAmazon } from '../../amazon/tts/tts_ssml_options.js';

export class SsmlAllowedElementsUniversal {
  allowedElementsGoogle: { [key: string]: string[] };
  allowedElementsMicrosoft: { [key: string]: string[] };
  allowedElementsAmazon: { [key: string]: string[] };

  constructor({
    allowedElementsGoogle,
    allowedElementsMicrosoft,
    allowedElementsAmazon,
  }: {
    allowedElementsGoogle?: { [key: string]: string[] };
    allowedElementsMicrosoft?: { [key: string]: string[] };
    allowedElementsAmazon?: { [key: string]: string[] };
  } = {}) {
    const optionsGoogle = new TtsSsmlOptionsGoogle();
    const optionsMicrosoft = new TtsSsmlOptionsMicrosoft();
    const optionsAmazon = new TtsSsmlOptionsAmazon();

    this.allowedElementsGoogle =
      allowedElementsGoogle ?? optionsGoogle.allowedElements;
    this.allowedElementsMicrosoft =
      allowedElementsMicrosoft ?? optionsMicrosoft.allowedElements;
    this.allowedElementsAmazon =
      allowedElementsAmazon ?? optionsAmazon.allowedElements;
  }
}
