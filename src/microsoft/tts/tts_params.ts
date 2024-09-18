import { VoiceMicrosoft } from '../voices/voice_model.js';
import { TtsAudioOptionsMicrosoft } from './tts_audio_options.js';
import { TtsProcessOptionsMicrosoft } from './tts_process_options.js';
import { PITCH, RATE } from './tts_params_defaults.js';
import { TtsSsmlOptionsMicrosoft } from './tts_ssml_options.js';
import { BaseProxyMapper } from '../../common/http/base_proxy.js';
import { TtsTextOptionsMicrosoft } from './tts_text_options.js';

export class TtsParamsMicrosoft {
  voice: VoiceMicrosoft | undefined;
  voiceId: string | undefined;
  ssml: string | undefined;
  ssmlBatches: string[] | undefined;
  text: string | undefined;
  textBatches: string[] | undefined;
  rate: string;
  pitch: string;
  audioOptions: TtsAudioOptionsMicrosoft;
  processOptions: TtsProcessOptionsMicrosoft;
  ssmlOptions: TtsSsmlOptionsMicrosoft;
  textOptions: TtsTextOptionsMicrosoft;
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
    voice?: VoiceMicrosoft;
    voiceId?: string;
    ssml?: string;
    ssmlBatches?: string[];
    text?: string;
    textBatches?: string[];
    rate?: string;
    pitch?: string;
    audioOptions?: TtsAudioOptionsMicrosoft;
    processOptions?: TtsProcessOptionsMicrosoft;
    ssmlOptions?: TtsSsmlOptionsMicrosoft;
    textOptions?: TtsTextOptionsMicrosoft;
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
    this.audioOptions = audioOptions ?? new TtsAudioOptionsMicrosoft();
    this.processOptions = processOptions ?? new TtsProcessOptionsMicrosoft();
    this.ssmlOptions = ssmlOptions ?? new TtsSsmlOptionsMicrosoft();
    this.textOptions = textOptions ?? new TtsTextOptionsMicrosoft();
    this.httpProxy = httpProxy;
  }
}
