import { VoiceAmazon } from '../voices/voices_model.js';
import { ConvertAudioOptionsAmazon } from './convert_audio_options.js';
import { ConvertProcessOptionsAmazon } from './convert_process_options.js';
import { PITCH, RATE } from './convert_params_defaults.js';
import { ConvertSsmlOptionsAmazon } from './convert_ssml_options.js';
import { HttpProxyMapperBase } from '../../common/http/http_proxy_base.js';
import { ConvertTextOptionsAmazon } from './convert_text_options.js';

export class ConvertParamsAmazon {
  voice: VoiceAmazon | undefined;
  voiceId: string | undefined;
  ssml: string | undefined;
  ssmlChunks: string[] | undefined;
  text: string | undefined;
  textChunks: string[] | undefined;
  rate: string;
  pitch: string;
  audioOptions: ConvertAudioOptionsAmazon;
  processOptions: ConvertProcessOptionsAmazon;
  ssmlOptions: ConvertSsmlOptionsAmazon;
  textOptions: ConvertTextOptionsAmazon;
  httpProxy: HttpProxyMapperBase;

  constructor({
    voice,
    voiceId,
    ssml,
    ssmlChunks,
    text,
    textChunks,
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
    ssmlChunks?: string[];
    text?: string;
    textChunks?: string[];
    rate?: string;
    pitch?: string;
    audioOptions?: ConvertAudioOptionsAmazon;
    processOptions?: ConvertProcessOptionsAmazon;
    ssmlOptions?: ConvertSsmlOptionsAmazon;
    textOptions?: ConvertTextOptionsAmazon;
    httpProxy?: HttpProxyMapperBase;
  }) {
    if (!voice && !voiceId) {
      throw new Error('Either voice or voiceId must be provided.');
    }

    if (voice && voiceId) {
      throw new Error('Only voice or voiceId must be provided.');
    }

    if (!ssml && !ssmlChunks && !text && !textChunks) {
      throw new Error(
        'Either input, ssmlChunks, text or textChunks must be provided.',
      );
    }

    if ([ssml, ssmlChunks, text, textChunks].filter(Boolean).length >= 2) {
      throw new Error(
        'Only input, ssmlChunks, text or textChunks must be provided.',
      );
    }

    this.voice = voice;
    this.voiceId = voiceId;
    this.ssml = ssml;
    this.ssmlChunks = ssmlChunks;
    this.text = text;
    this.textChunks = textChunks;
    this.rate = rate ?? RATE;
    this.pitch = pitch ?? PITCH;
    this.audioOptions = audioOptions ?? new ConvertAudioOptionsAmazon();
    this.processOptions = processOptions ?? new ConvertProcessOptionsAmazon();
    this.ssmlOptions = ssmlOptions ?? new ConvertSsmlOptionsAmazon();
    this.textOptions = textOptions ?? new ConvertTextOptionsAmazon();
    this.httpProxy = httpProxy;
  }
}
