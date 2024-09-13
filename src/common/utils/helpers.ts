import { integer, MersenneTwister19937 } from "random-js";
import { VoiceUniversal } from "../../universal/voices/voice_model.js";
import { Log } from "./log.js";

// import * as fs from "fs";

export class Helpers {
  private constructor() {}

  static shuffleNamesByText(names: string[], text: string): string[] {
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

  static mapVoiceNames<T extends VoiceUniversal>(
    voices: T[],
    maleVoiceNames: string[],
    femaleVoiceNames: string[],
  ): T[] {
    let locale = '';
    let gender = '';
    let names: string[] = [];
    let nameIndex = 0;

    return voices.map((voice) => {
      if (locale !== voice.locale.code || gender !== voice.gender) {
        nameIndex = 0;
        locale = voice.locale.code;
        gender = voice.gender;
        switch (gender.toLowerCase()) {
          case 'male':
            names = this.shuffleNamesByText(maleVoiceNames, locale);
            break;
          case 'female':
          case 'neutral':
          default:
            names = this.shuffleNamesByText(femaleVoiceNames, locale);
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

  static removeVoiceDuplicates<T extends VoiceUniversal>(voices: T[]): T[] {
    const uniqueCodes = new Set<string>();

    return voices.filter((voice) => {
      if (uniqueCodes.has(voice.code)) {
        return false;
      }
      uniqueCodes.add(voice.code);
      return true;
    });
  }

  static sortVoices<T extends VoiceUniversal>(voices: T[]): T[] {
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
