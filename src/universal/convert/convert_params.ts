import { VoiceUniversal } from '../voices/voice_model.js';
import { ConvertAudioOptionsUniversal } from './convert_audio_options.js';
import { ConvertProcessOptionsUniversal } from './convert_process_options.js';
import { PITCH, RATE } from './convert_params_defaults.js';
import { BaseProxyMapper } from '../../common/http/base_proxy.js';
import {
  ConvertSsmlOptionsUniversal,
  ConvertTextOptionsUniversal,
} from './convert_options.js';
import { ConvertSsmlOptionsGoogle } from '../../google/convert/convert_ssml_options.js';
import { ConvertSsmlOptionsMicrosoft } from '../../microsoft/convert/convert_ssml_options.js';
import { ConvertSsmlOptionsAmazon } from '../../amazon/convert/convert_ssml_options.js';
import { ConvertTextOptionsGoogle } from '../../google/convert/convert_text_options.js';
import { ConvertTextOptionsMicrosoft } from '../../microsoft/convert/convert_text_options.js';
import { ConvertTextOptionsAmazon } from '../../amazon/convert/convert_text_options.js';

export class ConvertParamsUniversal {
  voice: VoiceUniversal;
  ssml: string | undefined;
  ssmlBatches: string[] | undefined;
  text: string | undefined;
  textBatches: string[] | undefined;
  rate: string;
  pitch: string;
  audioOptions: ConvertAudioOptionsUniversal;
  processOptions: ConvertProcessOptionsUniversal;
  ssmlOptions: ConvertSsmlOptionsUniversal;
  textOptions: ConvertTextOptionsUniversal;
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
    audioOptions?: ConvertAudioOptionsUniversal;
    processOptions?: ConvertProcessOptionsUniversal;
    ssmlOptions?: ConvertSsmlOptionsUniversal;
    textOptions?: ConvertTextOptionsUniversal;
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
    this.audioOptions = audioOptions ?? new ConvertAudioOptionsUniversal();
    this.processOptions =
      processOptions ?? new ConvertProcessOptionsUniversal();
    this.ssmlOptions =
      ssmlOptions ??
      new ConvertSsmlOptionsUniversal({
        google: new ConvertSsmlOptionsGoogle(),
        microsoft: new ConvertSsmlOptionsMicrosoft(),
        amazon: new ConvertSsmlOptionsAmazon(),
      });
    this.textOptions =
      textOptions ??
      new ConvertTextOptionsUniversal({
        google: new ConvertTextOptionsGoogle(),
        microsoft: new ConvertTextOptionsMicrosoft(),
        amazon: new ConvertTextOptionsAmazon(),
      });
    this.httpProxy = httpProxy;
  }
}
