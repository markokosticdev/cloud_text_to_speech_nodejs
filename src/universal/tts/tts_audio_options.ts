import { AUDIO_FORMAT, AUDIO_STREAM_FORMAT } from './tts_params_defaults.js';
import { AudioOutputStreamFormatUniversal } from '../audio/audio_output_stream_format.js';
import { AudioOutputFormatUniversal } from '../audio/audio_output_format.js';
import { AudioOutputStreamFormatMapperUniversal } from '../audio/audio_output_stream_format_mapper.js';
import { AudioOutputFormatMapperUniversal } from '../audio/audio_output_format_mapper.js';

export class TtsAudioOptionsUniversal {
  audioFormat: AudioOutputFormatUniversal;
  audioFormatMapper: AudioOutputFormatMapperUniversal;
  audioStreamFormat: AudioOutputStreamFormatUniversal;
  audioStreamFormatMapper: AudioOutputStreamFormatMapperUniversal;

  constructor({
    audioFormat,
    audioFormatMapper,
    audioStreamFormat,
    audioStreamFormatMapper,
  }: {
    audioFormat?: AudioOutputFormatUniversal;
    audioFormatMapper?: AudioOutputFormatMapperUniversal;
    audioStreamFormat?: AudioOutputStreamFormatUniversal;
    audioStreamFormatMapper?: AudioOutputStreamFormatMapperUniversal;
  } = {}) {
    this.audioFormat = audioFormat ?? AUDIO_FORMAT;
    this.audioFormatMapper =
      audioFormatMapper ?? new AudioOutputFormatMapperUniversal();
    this.audioStreamFormat = audioStreamFormat ?? AUDIO_STREAM_FORMAT;
    this.audioStreamFormatMapper =
      audioStreamFormatMapper ?? new AudioOutputStreamFormatMapperUniversal();
  }
}
