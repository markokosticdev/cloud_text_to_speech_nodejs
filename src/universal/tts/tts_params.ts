import { VoiceUniversal } from '../voices/voice_model.js';
import { TtsAudioOptionsUniversal } from './tts_audio_options.js';
import { TtsProcessOptionsUniversal } from './tts_process_options.js';
import { PITCH, RATE } from './tts_params_defaults.js';
import { BaseProxyMapper } from '../../common/http/base_proxy.js';
import { TtsOptionsUniversal } from "./tts_optionsl.js";
import { TtsSsmlOptionsGoogle } from "../../google/tts/tts_ssml_options.js";
import { TtsSsmlOptionsMicrosoft } from "../../microsoft/tts/tts_ssml_options.js";
import { TtsSsmlOptionsAmazon } from "../../amazon/tts/tts_ssml_options.js";
import { TtsTextOptionsGoogle } from "../../google/tts/tts_text_options.js";
import { TtsTextOptionsMicrosoft } from "../../microsoft/tts/tts_text_options.js";
import { TtsTextOptionsAmazon } from "../../amazon/tts/tts_text_options.js";

export class TtsParamsUniversal {
  voice: VoiceUniversal;
  ssml: string | undefined;
  ssmlBatches: string[] | undefined;
  text: string | undefined;
  textBatches: string[] | undefined;
  rate: string;
  pitch: string;
  audioOptions: TtsAudioOptionsUniversal;
  processOptions: TtsProcessOptionsUniversal;
  ssmlOptions: TtsOptionsUniversal<TtsSsmlOptionsGoogle, TtsSsmlOptionsMicrosoft, TtsSsmlOptionsAmazon>;
  textOptions: TtsOptionsUniversal<TtsTextOptionsGoogle, TtsTextOptionsMicrosoft, TtsTextOptionsAmazon>;
  httpProxy: BaseProxyMapper;

  constructor({
    voice,
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
    voice: VoiceUniversal;
    ssml?: string;
    ssmlBatches?: string[];
    text?: string;
    textBatches?: string[];
    rate?: string;
    pitch?: string;
    audioOptions?: TtsAudioOptionsUniversal;
    processOptions?: TtsProcessOptionsUniversal;
    ssmlOptions?: TtsOptionsUniversal<TtsSsmlOptionsGoogle, TtsSsmlOptionsMicrosoft, TtsSsmlOptionsAmazon>;
    textOptions?: TtsOptionsUniversal<TtsTextOptionsGoogle, TtsTextOptionsMicrosoft, TtsTextOptionsAmazon>;
    httpProxy?: BaseProxyMapper;
  }) {
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
    this.ssml = ssml;
    this.ssmlBatches = ssmlBatches;
    this.text = text;
    this.textBatches = textBatches;
    this.rate = rate ?? RATE;
    this.pitch = pitch ?? PITCH;
    this.audioOptions = audioOptions ?? new TtsAudioOptionsUniversal();
    this.processOptions = processOptions ?? new TtsProcessOptionsUniversal();
    this.ssmlOptions = ssmlOptions ?? new TtsOptionsUniversal({
      google: new TtsSsmlOptionsGoogle(),
      microsoft: new TtsSsmlOptionsMicrosoft(),
      amazon: new TtsSsmlOptionsAmazon(),
    });
    this.textOptions = textOptions ?? new TtsOptionsUniversal({
      google: new TtsTextOptionsGoogle(),
      microsoft: new TtsTextOptionsMicrosoft(),
      amazon: new TtsTextOptionsAmazon(),
    });
    this.httpProxy = httpProxy;
  }
}
