import { VoiceAmazon } from '../voices/voices_model.js';
import { ConvertAudioOptionsAmazon } from './convert_audio_options.js';
import { ConvertProcessOptionsAmazon } from './convert_process_options.js';
import { PITCH, RATE } from './convert_params_defaults.js';
import { ConvertSsmlOptionsAmazon } from './convert_ssml_options.js';
import { BaseProxyMapper } from '../../common/http/base_proxy.js';
import { ConvertTextOptionsAmazon } from './convert_text_options.js';

export class ConvertParamsAmazon {
  voice: VoiceAmazon | undefined;
  voiceId: string | undefined;
  ssml: string | undefined;
  ssmlBatches: string[] | undefined;
  text: string | undefined;
  textBatches: string[] | undefined;
  rate: string;
  pitch: string;
  audioOptions: ConvertAudioOptionsAmazon;
  processOptions: ConvertProcessOptionsAmazon;
  ssmlOptions: ConvertSsmlOptionsAmazon;
  textOptions: ConvertTextOptionsAmazon;
  httpProxy: BaseProxyMapper;

  constructor({
    voice,
    voiceId,
    ssml,
    ssmlBatches,
    text,
    textBatches,
    rate,
    pitch,
    audioOptions,
    processOptions,
    ssmlOptions,
    textOptions,
    httpProxy,
  }: {
    voice?: VoiceAmazon;
    voiceId?: string;
    ssml?: string;
    ssmlBatches?: string[];
    text?: string;
    textBatches?: string[];
    rate?: string;
    pitch?: string;
    audioOptions?: ConvertAudioOptionsAmazon;
    processOptions?: ConvertProcessOptionsAmazon;
    ssmlOptions?: ConvertSsmlOptionsAmazon;
    textOptions?: ConvertTextOptionsAmazon;
    httpProxy?: BaseProxyMapper;
  }) {
    if (!voice && !voiceId) {
      throw new Error('Either voice or voiceId must be provided.');
    }

    if (voice && voiceId) {
      throw new Error('Only voice or voiceId must be provided.');
    }

    if (!ssml && !ssmlBatches && !text && !textBatches) {
      throw new Error(
        'Either input, ssmlBatches, text or textBatches must be provided.',
      );
    }

    if ([ssml, ssmlBatches, text, textBatches].filter(Boolean).length >= 2) {
      throw new Error(
        'Only input, ssmlBatches, text or textBatches must be provided.',
      );
    }

    this.voice = voice;
    this.voiceId = voiceId;
    this.ssml = ssml;
    this.ssmlBatches = ssmlBatches;
    this.text = text;
    this.textBatches = textBatches;
    this.rate = rate ?? RATE;
    this.pitch = pitch ?? PITCH;
    this.audioOptions = audioOptions ?? new ConvertAudioOptionsAmazon();
    this.processOptions = processOptions ?? new ConvertProcessOptionsAmazon();
    this.ssmlOptions = ssmlOptions ?? new ConvertSsmlOptionsAmazon();
    this.textOptions = textOptions ?? new ConvertTextOptionsAmazon();
    this.httpProxy = httpProxy;
  }
}
