import { VoiceAmazon } from '../voices/voice_model.js';
import { TtsAudioOptionsAmazon } from './tts_audio_options.js';
import { TtsProcessOptionsAmazon } from './tts_process_options.js';
import { PITCH, RATE } from './tts_params_defaults.js';
import { TtsSsmlOptionsAmazon } from './tts_ssml_options.js';

export class TtsParamsAmazon {
  /// Rate is the speed at which the voice will speak.
  ///
  /// * `rate` default to default.

  voice: VoiceAmazon | undefined;
  voiceId: string | undefined;
  text: string | undefined;
  textBatches: string[] | undefined;
  rate: string;
  pitch: string;
  audioOptions: TtsAudioOptionsAmazon;
  processOptions: TtsProcessOptionsAmazon;
  ssmlOptions: TtsSsmlOptionsAmazon;

  constructor({
    voice,
    voiceId,
    text,
    textBatches,
    rate,
    pitch,
    audioOptions,
    processOptions,
    ssmlOptions,
  }: {
    voice?: VoiceAmazon;
    voiceId?: string;
    text?: string;
    textBatches?: string[];
    rate: string;
    pitch: string;
    audioOptions?: TtsAudioOptionsAmazon;
    processOptions?: TtsProcessOptionsAmazon;
    ssmlOptions?: TtsSsmlOptionsAmazon;
  }) {
    if (!voice && !voiceId) {
      throw new Error('Either voice or voiceId must be provided.');
    }

    if (voice && voiceId) {
      throw new Error('Only voice or voiceId must be provided.');
    }

    if (!text && !textBatches) {
      throw new Error('Either text or textBatches must be provided.');
    }

    if (text && textBatches) {
      throw new Error('Only text or textBatches must be provided.');
    }

    this.voice = voice;
    this.voiceId = voiceId;
    this.text = text;
    this.textBatches = textBatches;
    this.rate = rate ?? RATE;
    this.pitch = pitch ?? PITCH;
    this.audioOptions = audioOptions ?? new TtsAudioOptionsAmazon();
    this.processOptions = processOptions ?? new TtsProcessOptionsAmazon();
    this.ssmlOptions = ssmlOptions ?? new TtsSsmlOptionsAmazon();
  }
}
