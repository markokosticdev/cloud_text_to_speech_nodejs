import { AudioOutputFormatUniversal } from './audio_output_format.js';
import { AudioOutputFormatGoogle } from '../../google/audio/audio_output_format.js';
import { AudioOutputFormatMicrosoft } from '../../microsoft/audio/audio_output_format.js';
import { AudioOutputFormatAmazon } from '../../amazon/audio/audio_output_format.js';

export class AudioOutputFormatMapper {
  static toGoogle(universalFormat: AudioOutputFormatUniversal): string {
    switch (universalFormat) {
      case AudioOutputFormatUniversal.pcm16Bit8KhzMono:
      case AudioOutputFormatUniversal.pcm16Bit16KhzMono:
      case AudioOutputFormatUniversal.pcm16Bit24KhzMono:
        return AudioOutputFormatGoogle.linear16;
      case AudioOutputFormatUniversal.mp3_32k:
      case AudioOutputFormatUniversal.mp3_64k:
      case AudioOutputFormatUniversal.mp3_128k:
        return AudioOutputFormatGoogle.mp3;
      // case AudioOutputFormatUniversal.oggVorbis:
      //   return AudioOutputFormatGoogle.oggOpus;  // Assuming OGG_OPUS is close to Ogg Vorbis
      case AudioOutputFormatUniversal.mulaw:
        return AudioOutputFormatGoogle.mulaw;
      // case AudioOutputFormatUniversal.alaw:
      //   return AudioOutputFormatGoogle.aLaw;
      default:
        throw new Error(`Format ${universalFormat} is not supported`);
    }
  }

  static toMicrosoft(universalFormat: AudioOutputFormatUniversal): string {
    switch (universalFormat) {
      case AudioOutputFormatUniversal.pcm16Bit8KhzMono:
        return AudioOutputFormatMicrosoft.raw8Khz8BitMonoMulaw;
      case AudioOutputFormatUniversal.pcm16Bit16KhzMono:
        return AudioOutputFormatMicrosoft.raw16Khz16BitMonoPcm;
      case AudioOutputFormatUniversal.pcm16Bit24KhzMono:
        return AudioOutputFormatMicrosoft.raw24Khz16BitMonoPcm;
      case AudioOutputFormatUniversal.mp3_32k:
        return AudioOutputFormatMicrosoft.audio16Khz32kBitrateMonoMp3;
      case AudioOutputFormatUniversal.mp3_64k:
        return AudioOutputFormatMicrosoft.audio16Khz64kBitrateMonoMp3;
      case AudioOutputFormatUniversal.mp3_128k:
        return AudioOutputFormatMicrosoft.audio16Khz128kBitrateMonoMp3;
      // case AudioOutputFormatUniversal.oggVorbis:
      //   return null;  // Microsoft does not support Ogg Vorbis
      case AudioOutputFormatUniversal.mulaw:
        return AudioOutputFormatMicrosoft.raw8Khz8BitMonoMulaw;
      // case AudioOutputFormatUniversal.alaw:
      //   return AudioOutputFormatMicrosoft.raw8Khz8BitMonoAlaw;
      default:
        throw new Error(`Format ${universalFormat} is not supported`);
    }
  }

  static toAmazon(universalFormat: AudioOutputFormatUniversal): string {
    switch (universalFormat) {
      case AudioOutputFormatUniversal.pcm16Bit8KhzMono:
      case AudioOutputFormatUniversal.pcm16Bit16KhzMono:
      case AudioOutputFormatUniversal.pcm16Bit24KhzMono:
        return AudioOutputFormatAmazon.pcm;
      case AudioOutputFormatUniversal.mp3_32k:
      case AudioOutputFormatUniversal.mp3_64k:
      case AudioOutputFormatUniversal.mp3_128k:
        return AudioOutputFormatAmazon.mp3;
      // case AudioOutputFormatUniversal.oggVorbis:
      //   return AudioOutputFormatAmazon.oggVorbis;
      // case AudioOutputFormatUniversal.mulaw:
      // case AudioOutputFormatUniversal.alaw:
      //   return null;  // Amazon does not support mu-law and A-law
      default:
        throw new Error(`Format ${universalFormat} is not supported`);
    }
  }
}
