import { VoiceMicrosoft } from '../voices/voices_model.js';
import { ConvertAudioOptionsMicrosoft } from './convert_audio_options.js';
import { ConvertProcessOptionsMicrosoft } from './convert_process_options.js';
import { PITCH, RATE } from './convert_params_defaults.js';
import { ConvertSsmlOptionsMicrosoft } from './convert_ssml_options.js';
import { HttpProxyMapperBase } from '../../common/http/http_proxy_base.js';
import { ConvertTextOptionsMicrosoft } from './convert_text_options.js';

export class ConvertParamsMicrosoft {
  voice: VoiceMicrosoft | undefined;
  voiceId: string | undefined;
  ssml: string | undefined;
  ssmlChunks: string[] | undefined;
  text: string | undefined;
  textChunks: string[] | undefined;
  rate: string;
  pitch: string;
  audioOptions: ConvertAudioOptionsMicrosoft;
  processOptions: ConvertProcessOptionsMicrosoft;
  ssmlOptions: ConvertSsmlOptionsMicrosoft;
  textOptions: ConvertTextOptionsMicrosoft;
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
    voice?: VoiceMicrosoft;
    voiceId?: string;
    ssml?: string;
    ssmlChunks?: string[];
    text?: string;
    textChunks?: string[];
    rate?: string;
    pitch?: string;
    audioOptions?: ConvertAudioOptionsMicrosoft;
    processOptions?: ConvertProcessOptionsMicrosoft;
    ssmlOptions?: ConvertSsmlOptionsMicrosoft;
    textOptions?: ConvertTextOptionsMicrosoft;
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
    this.audioOptions = audioOptions ?? new ConvertAudioOptionsMicrosoft();
    this.processOptions =
      processOptions ?? new ConvertProcessOptionsMicrosoft();
    this.ssmlOptions = ssmlOptions ?? new ConvertSsmlOptionsMicrosoft();
    this.textOptions = textOptions ?? new ConvertTextOptionsMicrosoft();
    this.httpProxy = httpProxy;
  }
}
