import { SsmlAllowedElementsUniversal } from '../ssml/ssml_allowed_elements_mapper.js';

export class TtsSsmlOptionsUniversal {
  allowedElements: SsmlAllowedElementsUniversal;

  constructor({
    allowedElements,
  }: {
    allowedElements?: SsmlAllowedElementsUniversal;
  } = {}) {
    this.allowedElements =
      allowedElements ?? new SsmlAllowedElementsUniversal();
  }
}
