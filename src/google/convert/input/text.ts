import { ConvertTextOptionsGoogle } from '../convert_text_options.js';
import { TextBase } from '../../../common/convert/input/text/text_base.js';
import { VoiceGoogle } from '../../voices/voices_model.js';

export class TextGoogle extends TextBase<
  VoiceGoogle,
  ConvertTextOptionsGoogle
> {}
