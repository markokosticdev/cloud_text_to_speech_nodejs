import { AudioOutputStreamFormatAmazon } from './audio/audio_output_stream_format.js';
import { AudioOutputFormatAmazon } from './audio/audio_output_format.js';

export const RATE = 'default';
export const PITCH = 'default';
export const AUDIO_FORMAT = AudioOutputFormatAmazon.mp3;
export const AUDIO_STREAM_FORMAT = AudioOutputStreamFormatAmazon.mp3;
export const PROCESS_ASYNC = true;
export const PROCESS_LIMIT = 4;
export const SSML_ALLOWED_ELEMENTS = {
  'amazon:domain': ['name'],
  'amazon:effect': ['name', 'phonation', 'vocal-tract-length'],
  break: ['time', 'strength'],
  emphasis: ['level'],
  lang: [],
  mark: [],
  p: [],
  phoneme: [],
  s: [],
  'say-as': [],
  sub: [],
  w: [],
};

export const SSML_SPLIT_LIMIT = 3000;

export const TEXT_SPLIT_LIMIT = 3000;
