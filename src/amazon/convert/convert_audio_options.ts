import {
  AUDIO_FORMAT,
  AUDIO_STREAM_FORMAT,
} from './convert_params_defaults.js';
import { AudioOutputStreamFormatAmazon } from './audio/audio_output_stream_format.js';
import { AudioOutputFormatAmazon } from './audio/audio_output_format.js';

export class ConvertAudioOptionsAmazon {
  audioFormat: AudioOutputFormatAmazon;
  audioStreamFormat: AudioOutputStreamFormatAmazon;

  constructor({
    audioFormat,
    audioStreamFormat,
  }: {
    audioFormat?: AudioOutputFormatAmazon;
    audioStreamFormat?: AudioOutputStreamFormatAmazon;
  } = {}) {
    this.audioFormat = audioFormat ?? AUDIO_FORMAT;
    this.audioStreamFormat = audioStreamFormat ?? AUDIO_STREAM_FORMAT;
  }
}
