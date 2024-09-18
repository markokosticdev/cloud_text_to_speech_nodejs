import { TEXT_SPLIT_LIMIT } from './tts_params_defaults.js';
import { TextOptions } from '../../common/text/text_options.js';

export class TtsTextOptionsAmazon extends TextOptions {
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
