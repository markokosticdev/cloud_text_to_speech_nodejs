import { VoiceUniversal } from '../voices/voice_model.js';
import { TtsAudioOptionsUniversal } from './tts_audio_options.js';
import { TtsProcessOptionsUniversal } from './tts_process_options.js';
import { PITCH, RATE } from './tts_params_defaults.js';
import { TtsSsmlOptionsUniversal } from './tts_ssml_options.js';

export class TtsParamsUniversal {
  /// Rate is the speed at which the voice will speak.
  ///
  /// * `rate` default to default.

  voice: VoiceUniversal | undefined;
  voiceId: string | undefined;
  text: string | undefined;
  textBatches: string[] | undefined;
  rate: string;
  pitch: string;
  audioOptions: TtsAudioOptionsUniversal;
  processOptions: TtsProcessOptionsUniversal;
  ssmlOptions: TtsSsmlOptionsUniversal;

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
    voice?: VoiceUniversal;
    voiceId?: string;
    text?: string;
    textBatches?: string[];
    rate?: string;
    pitch?: string;
    audioOptions?: TtsAudioOptionsUniversal;
    processOptions?: TtsProcessOptionsUniversal;
    ssmlOptions?: TtsSsmlOptionsUniversal;
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
    this.audioOptions = audioOptions ?? new TtsAudioOptionsUniversal();
    this.processOptions = processOptions ?? new TtsProcessOptionsUniversal();
    this.ssmlOptions = ssmlOptions ?? new TtsSsmlOptionsUniversal();
  }
}
