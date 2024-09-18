import { AudioOutputStreamFormatUniversal } from './audio_output_stream_format.js';
import { AudioOutputStreamFormatGoogle } from '../../../google/convert/audio/audio_output_stream_format.js';
import { AudioOutputStreamFormatMicrosoft } from '../../../microsoft/convert/audio/audio_output_stream_format.js';
import { AudioOutputStreamFormatAmazon } from '../../../amazon/convert/audio/audio_output_stream_format.js';

export type AudioStreamFormatMapperGoogle = (
  universalStreamFormat: AudioOutputStreamFormatUniversal,
) => AudioOutputStreamFormatGoogle;
export type AudioStreamFormatMapperMicrosoft = (
  universalStreamFormat: AudioOutputStreamFormatUniversal,
) => AudioOutputStreamFormatMicrosoft;
export type AudioStreamFormatMapperAmazon = (
  universalStreamFormat: AudioOutputStreamFormatUniversal,
) => AudioOutputStreamFormatAmazon;

export class AudioOutputStreamFormatMapperUniversal {
  mapperGoogle: AudioStreamFormatMapperGoogle | undefined;
  mapperMicrosoft: AudioStreamFormatMapperMicrosoft | undefined;
  mapperAmazon: AudioStreamFormatMapperAmazon | undefined;

  constructor({
    mapperGoogle,
    mapperMicrosoft,
    mapperAmazon,
  }: {
    mapperGoogle?: AudioStreamFormatMapperGoogle;
    mapperMicrosoft?: AudioStreamFormatMapperMicrosoft;
    mapperAmazon?: AudioStreamFormatMapperAmazon;
  } = {}) {
    this.mapperGoogle = mapperGoogle;
    this.mapperMicrosoft = mapperMicrosoft;
    this.mapperAmazon = mapperAmazon;
  }

  static defaultToGoogle(
    universalStreamFormat: AudioOutputStreamFormatUniversal,
  ): AudioOutputStreamFormatGoogle {
    switch (universalStreamFormat) {
      case AudioOutputStreamFormatUniversal.pcm16Bit8KhzMono:
      case AudioOutputStreamFormatUniversal.pcm16Bit16KhzMono:
      case AudioOutputStreamFormatUniversal.pcm16Bit24KhzMono:
        return AudioOutputStreamFormatGoogle.linear16;
      case AudioOutputStreamFormatUniversal.mp3_32k:
      case AudioOutputStreamFormatUniversal.mp3_64k:
      case AudioOutputStreamFormatUniversal.mp3_128k:
        return AudioOutputStreamFormatGoogle.mp3;
      // case AudioOutputStreamFormatUniversal.oggVorbis:
      //   return AudioOutputStreamFormatGoogle.oggOpus;  // Assuming OGG_OPUS is close to Ogg Vorbis
      case AudioOutputStreamFormatUniversal.mulaw:
        return AudioOutputStreamFormatGoogle.mulaw;
      // case AudioOutputStreamFormatUniversal.alaw:
      //   return AudioOutputStreamFormatGoogle.aLaw;
      default:
        throw new Error(
          `StreamFormat ${universalStreamFormat} is not supported`,
        );
    }
  }

  static defaultToMicrosoft(
    universalStreamFormat: AudioOutputStreamFormatUniversal,
  ): AudioOutputStreamFormatMicrosoft {
    switch (universalStreamFormat) {
      case AudioOutputStreamFormatUniversal.pcm16Bit8KhzMono:
        return AudioOutputStreamFormatMicrosoft.raw8Khz8BitMonoMulaw;
      case AudioOutputStreamFormatUniversal.pcm16Bit16KhzMono:
        return AudioOutputStreamFormatMicrosoft.raw16Khz16BitMonoPcm;
      case AudioOutputStreamFormatUniversal.pcm16Bit24KhzMono:
        return AudioOutputStreamFormatMicrosoft.raw24Khz16BitMonoPcm;
      case AudioOutputStreamFormatUniversal.mp3_32k:
        return AudioOutputStreamFormatMicrosoft.audio16Khz32kBitrateMonoMp3;
      case AudioOutputStreamFormatUniversal.mp3_64k:
        return AudioOutputStreamFormatMicrosoft.audio16Khz64kBitrateMonoMp3;
      case AudioOutputStreamFormatUniversal.mp3_128k:
        return AudioOutputStreamFormatMicrosoft.audio16Khz128kBitrateMonoMp3;
      // case AudioOutputStreamFormatUniversal.oggVorbis:
      //   return null;  // Microsoft does not support Ogg Vorbis
      case AudioOutputStreamFormatUniversal.mulaw:
        return AudioOutputStreamFormatMicrosoft.raw8Khz8BitMonoMulaw;
      // case AudioOutputStreamFormatUniversal.alaw:
      //   return AudioOutputStreamFormatMicrosoft.raw8Khz8BitMonoAlaw;
      default:
        throw new Error(
          `StreamFormat ${universalStreamFormat} is not supported`,
        );
    }
  }

  static defaultToAmazon(
    universalStreamFormat: AudioOutputStreamFormatUniversal,
  ): AudioOutputStreamFormatAmazon {
    switch (universalStreamFormat) {
      case AudioOutputStreamFormatUniversal.pcm16Bit8KhzMono:
      case AudioOutputStreamFormatUniversal.pcm16Bit16KhzMono:
      case AudioOutputStreamFormatUniversal.pcm16Bit24KhzMono:
        return AudioOutputStreamFormatAmazon.pcm;
      case AudioOutputStreamFormatUniversal.mp3_32k:
      case AudioOutputStreamFormatUniversal.mp3_64k:
      case AudioOutputStreamFormatUniversal.mp3_128k:
        return AudioOutputStreamFormatAmazon.mp3;
      // case AudioOutputStreamFormatUniversal.oggVorbis:
      //   return AudioOutputStreamFormatAmazon.oggVorbis;
      // case AudioOutputStreamFormatUniversal.mulaw:
      // case AudioOutputStreamFormatUniversal.alaw:
      //   return null;  // Amazon does not support mu-law and A-law
      default:
        throw new Error(
          `StreamFormat ${universalStreamFormat} is not supported`,
        );
    }
  }

  toGoogle(
    universalStreamFormat: AudioOutputStreamFormatUniversal,
  ): AudioOutputStreamFormatGoogle {
    if (this.mapperGoogle) {
      return this.mapperGoogle(universalStreamFormat);
    }
    return AudioOutputStreamFormatMapperUniversal.defaultToGoogle(
      universalStreamFormat,
    );
  }

  toMicrosoft(
    universalStreamFormat: AudioOutputStreamFormatUniversal,
  ): AudioOutputStreamFormatMicrosoft {
    if (this.mapperMicrosoft) {
      return this.mapperMicrosoft(universalStreamFormat);
    }
    return AudioOutputStreamFormatMapperUniversal.defaultToMicrosoft(
      universalStreamFormat,
    );
  }

  toAmazon(
    universalStreamFormat: AudioOutputStreamFormatUniversal,
  ): AudioOutputStreamFormatAmazon {
    if (this.mapperAmazon) {
      return this.mapperAmazon(universalStreamFormat);
    }
    return AudioOutputStreamFormatMapperUniversal.defaultToAmazon(
      universalStreamFormat,
    );
  }
}
