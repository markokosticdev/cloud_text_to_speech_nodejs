import { TEXT_SPLIT_LIMIT } from './convert_params_defaults.js';
import { TextOptions } from '../../common/convert/input/text/text_options.js';

export class ConvertTextOptionsAmazon extends TextOptions {
  constructor({
    splitLimit,
  }: {
    splitLimit?: number;
  } = {}) {
    super(
      {
        splitLimit: TEXT_SPLIT_LIMIT,
      },
      { splitLimit },
    );
  }
}
