import {
  SSML_ALLOWED_ELEMENTS,
  SSML_SPLIT_LIMIT,
} from './convert_params_defaults.js';
import { SsmlOptions } from '../../common/convert/input/ssml/ssml_options.js';

export class ConvertSsmlOptionsAmazon extends SsmlOptions {
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
