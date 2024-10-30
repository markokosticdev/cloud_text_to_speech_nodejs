import { VoiceBase } from '../voices_base.js';

export type VoiceNameMapper<T extends VoiceBase> = (
  voices: T[],
  index: number,
) => string;

export class NameOptions<T extends VoiceBase> {
  maleNames: string[] | undefined;
  maleNamesMapper: VoiceNameMapper<T> | undefined;
  femaleNames: string[] | undefined;
  femaleNamesMapper: VoiceNameMapper<T> | undefined;

  constructor(
    defaults: {
      maleNames?: string[];
      maleNamesMapper?: VoiceNameMapper<T>;
      femaleNames?: string[];
      femaleNamesMapper?: VoiceNameMapper<T>;
    },
    options: {
      maleNames?: string[];
      maleNamesMapper?: VoiceNameMapper<T>;
      femaleNames?: string[];
      femaleNamesMapper?: VoiceNameMapper<T>;
    },
  ) {
    if (options.maleNames && options.maleNamesMapper) {
      throw new Error('Only maleNames or maleNamesMapper must be provided.');
    }

    if (options.femaleNames && options.femaleNamesMapper) {
      throw new Error(
        'Only femaleNames or femaleNamesMapper must be provided.',
      );
    }

    if (options.maleNamesMapper) {
      this.maleNames = options.maleNames;
    } else {
      this.maleNames = options.maleNames ?? defaults.maleNames;
    }

    if (options.maleNames) {
      this.maleNamesMapper = options.maleNamesMapper;
    } else {
      this.maleNamesMapper =
        options.maleNamesMapper ?? defaults.maleNamesMapper;
    }

    if (options.femaleNamesMapper) {
      this.femaleNames = options.femaleNames;
    } else {
      this.femaleNames = options.femaleNames ?? defaults.femaleNames;
    }

    if (options.femaleNames) {
      this.femaleNamesMapper = options.femaleNamesMapper;
    } else {
      this.femaleNamesMapper =
        options.femaleNamesMapper ?? defaults.femaleNamesMapper;
    }
  }
}
