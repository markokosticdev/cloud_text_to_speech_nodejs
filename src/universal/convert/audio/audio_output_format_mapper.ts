import { AudioOutputFormatUniversal } from './audio_output_format.js';
import { AudioOutputFormatGoogle } from '../../../google/convert/audio/audio_output_format.js';
import { AudioOutputFormatMicrosoft } from '../../../microsoft/convert/audio/audio_output_format.js';
import { AudioOutputFormatAmazon } from '../../../amazon/convert/audio/audio_output_format.js';

export type AudioFormatMapperGoogle = (
  universalFormat: AudioOutputFormatUniversal,
) => AudioOutputFormatGoogle;
export type AudioFormatMapperMicrosoft = (
  universalFormat: AudioOutputFormatUniversal,
) => AudioOutputFormatMicrosoft;
export type AudioFormatMapperAmazon = (
  universalFormat: AudioOutputFormatUniversal,
) => AudioOutputFormatAmazon;

export class AudioOutputFormatMapperUniversal {
  mapperGoogle: AudioFormatMapperGoogle | undefined;
  mapperMicrosoft: AudioFormatMapperMicrosoft | undefined;
  mapperAmazon: AudioFormatMapperAmazon | undefined;

  constructor({
    mapperGoogle,
    mapperMicrosoft,
    mapperAmazon,
  }: {
    mapperGoogle?: AudioFormatMapperGoogle;
    mapperMicrosoft?: AudioFormatMapperMicrosoft;
    mapperAmazon?: AudioFormatMapperAmazon;
  } = {}) {
    this.mapperGoogle = mapperGoogle;
    this.mapperMicrosoft = mapperMicrosoft;
    this.mapperAmazon = mapperAmazon;
  }

  static defaultToGoogle(
    universalFormat: AudioOutputFormatUniversal,
  ): AudioOutputFormatGoogle {
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

  static defaultToMicrosoft(
    universalFormat: AudioOutputFormatUniversal,
  ): AudioOutputFormatMicrosoft {
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

  static defaultToAmazon(
    universalFormat: AudioOutputFormatUniversal,
  ): AudioOutputFormatAmazon {
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

  toGoogle(
    universalFormat: AudioOutputFormatUniversal,
  ): AudioOutputFormatGoogle {
    if (this.mapperGoogle) {
      return this.mapperGoogle(universalFormat);
    }
    return AudioOutputFormatMapperUniversal.defaultToGoogle(universalFormat);
  }

  toMicrosoft(
    universalFormat: AudioOutputFormatUniversal,
  ): AudioOutputFormatMicrosoft {
    if (this.mapperMicrosoft) {
      return this.mapperMicrosoft(universalFormat);
    }
    return AudioOutputFormatMapperUniversal.defaultToMicrosoft(universalFormat);
  }

  toAmazon(
    universalFormat: AudioOutputFormatUniversal,
  ): AudioOutputFormatAmazon {
    if (this.mapperAmazon) {
      return this.mapperAmazon(universalFormat);
    }
    return AudioOutputFormatMapperUniversal.defaultToAmazon(universalFormat);
  }
}
