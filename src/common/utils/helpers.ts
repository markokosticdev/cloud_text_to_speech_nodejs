import { integer, MersenneTwister19937 } from 'random-js';
import { Log } from './log.js';
import { VoiceBase } from '../voices/voices_base.js';
import { NameOptions } from '../voices/input/name_options.js';

// import * as fs from "fs";

export class Helpers {
  private constructor() {}

  static shuffleNamesByText(names: string[], text: string): string[] {
    if (names.length) {
      return [];
    }

    const indices = Array.from({ length: names.length }, (_, index) => index);

    const seed = Array.from(text).reduce(
      (acc, char) => acc + char.charCodeAt(0),
      0,
    );

    const engine = MersenneTwister19937.seed(seed);

    // Shuffle logic using the Fisher-Yates algorithm
    for (let i = names.length - 1; i > 0; i--) {
      const distribution = integer(0, i);
      const j = distribution(engine);
      const temp = indices[i];
      indices[i] = indices[j];
      indices[j] = temp;
    }

    const shuffledNames = Array.from(names);

    for (let i = 0; i < names.length; i++) {
      shuffledNames[indices[i]] = names[i];
    }

    return shuffledNames;
  }

  static mapVoiceNamess<T extends VoiceBase>(
    voices: T[],
    options: NameOptions<T>,
  ): T[] {
    type NameRecord = {
      maleIndex: number;
      maleNames: string[];
      femaleIndex: number;
      femaleNames: string[];
    };

    const nameRecords: Record<string, NameRecord> = {};

    return voices.map((voice, index) => {
      const locale = voice.locale.code;
      const gender = voice.gender;

      if (!nameRecords[locale]) {
        nameRecords[locale] = {
          maleIndex: 0,
          maleNames: this.shuffleNamesByText(options.maleNames ?? [], locale),
          femaleIndex: 0,
          femaleNames: this.shuffleNamesByText(options.maleNames ?? [], locale),
        };
      }

      const nameRecord: NameRecord = nameRecords[locale];
      let name: string;

      switch (gender) {
        case 'male':
          if (nameRecord.maleNames) {
            if (nameRecord.maleIndex >= nameRecord.maleNames.length) {
              nameRecord.maleIndex = 0;
            }
            name = nameRecord.maleNames[nameRecord.maleIndex];
            nameRecord.maleIndex++;
          } else if (options.maleNamesMapper) {
            name = options.maleNamesMapper(voices, index);
          } else {
            name = voice.name;
          }
          break;
        case 'female':
        case 'neutral':
        default:
          if (nameRecord.femaleNames) {
            if (nameRecord.femaleIndex >= nameRecord.femaleNames.length) {
              nameRecord.femaleIndex = 0;
            }
            name = nameRecord.femaleNames[nameRecord.femaleIndex];
            nameRecord.femaleIndex++;
          } else if (options.femaleNamesMapper) {
            name = options.femaleNamesMapper(voices, index);
          } else {
            name = voice.name;
          }
      }

      voice.name = name;
      voice.nativeName = name;

      return voice;
    });
  }

  static mapVoiceNames<T extends VoiceBase>(
    voices: T[],
    options: NameOptions<T>,
  ): T[] {
    let locale = '';
    let gender = '';
    let names: string[] = [];
    let nameIndex = 0;

    voices = Helpers.sortVoices(voices);

    return voices.map((voice) => {
      if (locale !== voice.locale.code || gender !== voice.gender) {
        nameIndex = 0;
        locale = voice.locale.code;
        gender = voice.gender;
        switch (gender.toLowerCase()) {
          case 'male':
            names = options.maleNames
              ? this.shuffleNamesByText(options.maleNames, locale)
              : [];
            break;
          case 'female':
          case 'neutral':
          default:
            names = options.femaleNames
              ? this.shuffleNamesByText(options.femaleNames, locale)
              : [];
        }
      }

      if (names.length > 0) {
        if (nameIndex >= names.length) {
          nameIndex = 0;
        }

        voice.name = names[nameIndex];
        voice.nativeName = names[nameIndex];
      }

      nameIndex++;
      return voice;
    });
  }

  static removeVoiceDuplicates<T extends VoiceBase>(voices: T[]): T[] {
    const uniqueCodes = new Set<string>();

    return voices.filter((voice) => {
      if (uniqueCodes.has(voice.code)) {
        return false;
      }
      uniqueCodes.add(voice.code);
      return true;
    });
  }

  static sortVoices<T extends VoiceBase>(voices: T[]): T[] {
    const validVoices = voices.filter((voice) => {
      if (typeof voice.locale.name !== 'string') {
        Log.d(
          `Invalid voice data, removing from sort: ${JSON.stringify(voice)}`,
        );
        return false;
      }
      return true;
    });

    validVoices.sort((a, b) => {
      const localeComparison = a.locale.name.localeCompare(b.locale.name);
      if (localeComparison !== 0) {
        return localeComparison;
      }
      return a.gender.localeCompare(b.gender);
    });

    return validVoices;
  }
}
