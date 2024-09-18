import {
  AUDIO_FORMAT,
  AUDIO_STREAM_FORMAT,
} from './convert_params_defaults.js';
import { AudioOutputStreamFormatGoogle } from './audio/audio_output_stream_format.js';
import { AudioOutputFormatGoogle } from './audio/audio_output_format.js';

export class ConvertAudioOptionsGoogle {
  audioFormat: AudioOutputFormatGoogle;
  audioStreamFormat: AudioOutputStreamFormatGoogle;

  constructor({
    audioFormat,
    audioStreamFormat,
  }: {
    audioFormat?: AudioOutputFormatGoogle;
    audioStreamFormat?: AudioOutputStreamFormatGoogle;
  } = {}) {
    this.audioFormat = audioFormat ?? AUDIO_FORMAT;
    this.audioStreamFormat = audioStreamFormat ?? AUDIO_STREAM_FORMAT;
  }
}
