import { AUDIO_FORMAT, AUDIO_STREAM_FORMAT } from './tts_params_defaults.js';
import { AudioOutputStreamFormatMicrosoft } from '../audio/audio_output_stream_format.js';
import { AudioOutputFormatMicrosoft } from '../audio/audio_output_format.js';

export class TtsAudioOptionsMicrosoft {
  audioFormat: AudioOutputFormatMicrosoft;
  audioStreamFormat: AudioOutputStreamFormatMicrosoft;

  constructor({
    audioFormat,
    audioStreamFormat,
  }: {
    audioFormat?: AudioOutputFormatMicrosoft;
    audioStreamFormat?: AudioOutputStreamFormatMicrosoft;
  } = {}) {
    this.audioFormat = audioFormat ?? AUDIO_FORMAT;
    this.audioStreamFormat = audioStreamFormat ?? AUDIO_STREAM_FORMAT;
  }
}
