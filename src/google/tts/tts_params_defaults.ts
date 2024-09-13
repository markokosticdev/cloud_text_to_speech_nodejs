import { AudioOutputStreamFormatGoogle } from '../audio/audio_output_stream_format.js';
import { AudioOutputFormatGoogle } from '../audio/audio_output_format.js';

export const RATE = 'default';
export const PITCH = 'default';
export const AUDIO_FORMAT = AudioOutputFormatGoogle.mp3;
export const AUDIO_STREAM_FORMAT = AudioOutputStreamFormatGoogle.mp3;
export const PROCESS_ASYNC = true;
export const PROCESS_LIMIT = 4;
export const ALLOWED_ELEMENTS = {
  audio: [
    'src',
    'clipBegin',
    'clipEnd',
    'speed',
    'repeatCount',
    'repeatDur',
    'soundLevel',
  ],
  break: ['time', 'strength'],
  emphasis: ['level'],
  lang: ['xml:lang'],
  mark: ['name'],
  media: [
    'xml:id',
    'begin',
    'end',
    'repeatCount',
    'repeatDur',
    'soundLevel',
    'fadeInDur',
    'fadeOutDur',
  ],
  p: [],
  par: [],
  phoneme: ['alphabet', 'ph'],
  s: [],
  'say-as': ['interpret-as', 'language', 'google:style', 'format', 'detail'],
  seq: [],
  sub: ['alias'],
};
