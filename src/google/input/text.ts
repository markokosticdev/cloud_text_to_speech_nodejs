import { TtsTextOptionsGoogle } from '../tts/tts_text_options.js';
import { TextBase } from '../../common/text/text_base.js';
import { VoiceGoogle } from '../voices/voice_model.js';

export class TextGoogle extends TextBase<VoiceGoogle, TtsTextOptionsGoogle> {}
