import { ALLOWED_ELEMENTS } from './tts_params_defaults.js';

export class TtsSsmlOptionsGoogle {
  allowedElements: { [key: string]: string[] };

  constructor({
    allowedElements,
  }: {
    allowedElements?: { [key: string]: string[] };
  } = {}) {
    this.allowedElements = allowedElements ?? ALLOWED_ELEMENTS;
  }
}
