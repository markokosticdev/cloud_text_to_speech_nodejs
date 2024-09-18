import { AudioOutputStreamFormatMicrosoft } from '../audio/audio_output_stream_format.js';
import { AudioOutputFormatMicrosoft } from '../audio/audio_output_format.js';

export const RATE = 'default';
export const PITCH = 'default';
export const AUDIO_FORMAT =
  AudioOutputFormatMicrosoft.audio16Khz32kBitrateMonoMp3;
export const AUDIO_STREAM_FORMAT =
  AudioOutputStreamFormatMicrosoft.audio16Khz32kBitrateMonoMp3;
export const PROCESS_ASYNC = true;
export const PROCESS_LIMIT = 4;
export const SSML_ALLOWED_ELEMENTS = {
  audio: ['src'],
  bookmark: ['mark'],
  break: ['time', 'strength'],
  emphasis: ['level'],
  lang: ['xml:lang'],
  lexicon: ['uri'],
  math: ['xmlns'],
  'mstts:audioduration': ['value'],
  'mstts:express-as': ['style', 'styledegree', 'role'],
  'mstts:silence': ['type', 'value'],
  'mstts:viseme': ['type'],
  p: [],
  phoneme: ['alphabet', 'ph'],
  s: [],
  'say-as': ['interpret-as', 'format', 'detail'],
  sub: ['alias'],
};

export const SSML_SPLIT_LIMIT = 10000;

export const TEXT_SPLIT_LIMIT = 10000;
