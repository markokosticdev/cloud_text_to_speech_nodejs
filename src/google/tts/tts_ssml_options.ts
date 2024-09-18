import {
  SSML_ALLOWED_ELEMENTS,
  SSML_SPLIT_LIMIT,
} from './tts_params_defaults.js';
import { SsmlOptions } from '../../common/ssml/ssml_options.js';

export class TtsSsmlOptionsGoogle extends SsmlOptions {
  constructor({
    allowedElements,
    splitLimit,
  }: {
    allowedElements?: { [key: string]: string[] };
    splitLimit?: number;
  } = {}) {
    super(
      {
        allowedElements: SSML_ALLOWED_ELEMENTS,
        splitLimit: SSML_SPLIT_LIMIT,
      },
      { allowedElements, splitLimit },
    );
  }
}
