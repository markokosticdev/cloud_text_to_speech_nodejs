import { VoiceGoogle } from '../voices/voices_model.js';
import { ConvertAudioOptionsGoogle } from './convert_audio_options.js';
import { ConvertProcessOptionsGoogle } from './convert_process_options.js';
import { PITCH, RATE } from './convert_params_defaults.js';
import { ConvertSsmlOptionsGoogle } from './convert_ssml_options.js';
import { HttpProxyMapperBase } from '../../common/http/http_proxy_base.js';
import { ConvertTextOptionsGoogle } from './convert_text_options.js';

export class ConvertParamsGoogle {
  voice: VoiceGoogle | undefined;
  voiceId: string | undefined;
  ssml: string | undefined;
  ssmlChunks: string[] | undefined;
  text: string | undefined;
  textChunks: string[] | undefined;
  rate: string;
  pitch: string;
  audioOptions: ConvertAudioOptionsGoogle;
  processOptions: ConvertProcessOptionsGoogle;
  ssmlOptions: ConvertSsmlOptionsGoogle;
  textOptions: ConvertTextOptionsGoogle;
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
    voice?: VoiceGoogle;
    voiceId?: string;
    ssml?: string;
    ssmlChunks?: string[];
    text?: string;
    textChunks?: string[];
    rate?: string;
    pitch?: string;
    audioOptions?: ConvertAudioOptionsGoogle;
    processOptions?: ConvertProcessOptionsGoogle;
    ssmlOptions?: ConvertSsmlOptionsGoogle;
    textOptions?: ConvertTextOptionsGoogle;
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
    this.audioOptions = audioOptions ?? new ConvertAudioOptionsGoogle();
    this.processOptions = processOptions ?? new ConvertProcessOptionsGoogle();
    this.ssmlOptions = ssmlOptions ?? new ConvertSsmlOptionsGoogle();
    this.textOptions = textOptions ?? new ConvertTextOptionsGoogle();
    this.httpProxy = httpProxy;
  }
}
