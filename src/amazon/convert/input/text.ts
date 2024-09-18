import { ConvertTextOptionsAmazon } from '../convert_text_options.js';
import { VoiceAmazon } from '../../voices/voices_model.js';
import { TextBase } from '../../../common/convert/input/text/text_base.js';

export class TextAmazon extends TextBase<
  VoiceAmazon,
  ConvertTextOptionsAmazon
> {}
