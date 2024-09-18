import { TtsTextOptionsAmazon } from '../tts/tts_text_options.js';
import { TextBase } from '../../common/text/text_base.js';
import { VoiceAmazon } from '../voices/voice_model.js';

export class TextAmazon extends TextBase<VoiceAmazon, TtsTextOptionsAmazon> {}
