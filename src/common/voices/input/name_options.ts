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
  neutralNames: string[] | undefined;
  neutralNamesMapper: VoiceNameMapper<T> | undefined;

  constructor(
    defaults: {
      maleNames?: string[];
      maleNamesMapper?: VoiceNameMapper<T>;
      femaleNames?: string[];
      femaleNamesMapper?: VoiceNameMapper<T>;
      neutralNames?: string[];
      neutralNamesMapper?: VoiceNameMapper<T>;
    },
    options: {
      maleNames?: string[];
      maleNamesMapper?: VoiceNameMapper<T>;
      femaleNames?: string[];
      femaleNamesMapper?: VoiceNameMapper<T>;
      neutralNames?: string[];
      neutralNamesMapper?: VoiceNameMapper<T>;
    },
  ) {
    // Validate male name options
    if (options.maleNames && options.maleNamesMapper) {
      throw new Error('Only maleNames or maleNamesMapper must be provided.');
    }

    // Validate female name options
    if (options.femaleNames && options.femaleNamesMapper) {
      throw new Error(
        'Only femaleNames or femaleNamesMapper must be provided.',
      );
    }

    // Validate neutral name options
    if (options.neutralNames && options.neutralNamesMapper) {
      throw new Error(
        'Only neutralNames or neutralNamesMapper must be provided.',
      );
    }

    // Set male names/mapper
    if (!options.maleNamesMapper) {
      this.maleNames = options.maleNames ?? defaults.maleNames;
    }

    if (!options.maleNames) {
      this.maleNamesMapper =
        options.maleNamesMapper ?? defaults.maleNamesMapper;
    }

    // Set female names/mapper
    if (!options.femaleNamesMapper) {
      this.femaleNames = options.femaleNames ?? defaults.femaleNames;
    }

    if (!options.femaleNames) {
      this.femaleNamesMapper =
        options.femaleNamesMapper ?? defaults.femaleNamesMapper;
    }

    // Set neutral names/mapper
    if (!options.neutralNamesMapper) {
      this.neutralNames = options.neutralNames ?? defaults.neutralNames;
    }

    if (!options.neutralNames) {
      this.neutralNamesMapper =
        options.neutralNamesMapper ?? defaults.neutralNamesMapper;
    }
  }

  /**
   * Get names for a specific gender
   */
  getNamesForGender(gender: string): string[] | undefined {
    const normalizedGender = gender.toLowerCase();
    switch (normalizedGender) {
      case 'male':
        return this.maleNames;
      case 'female':
        return this.femaleNames;
      case 'neutral':
        return this.neutralNames;
      default:
        return this.neutralNames; // Default to neutral for unknown genders
    }
  }

  /**
   * Get name mapper for a specific gender
   */
  getMapperForGender(gender: string): VoiceNameMapper<T> | undefined {
    const normalizedGender = gender.toLowerCase();
    switch (normalizedGender) {
      case 'male':
        return this.maleNamesMapper;
      case 'female':
        return this.femaleNamesMapper;
      case 'neutral':
        return this.neutralNamesMapper;
      default:
        return this.neutralNamesMapper; // Default to neutral for unknown genders
    }
  }

  /**
   * Check if any names are configured for a gender
   */
  hasNamesForGender(gender: string): boolean {
    return this.getNamesForGender(gender) !== undefined || 
           this.getMapperForGender(gender) !== undefined;
  }
}
