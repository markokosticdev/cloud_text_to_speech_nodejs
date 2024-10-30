import { Helpers } from "../../../src/common/utils/helpers.js";
import { VoiceUniversal } from "../../../src/universal/voices/voice_model.js";
import { TtsProviders } from "../../../src/common/tts/tts_providers.js";
import { VoicesNameOptionsGoogle } from "../../../src/google/voices/voices_name_options.js";
import { VoiceBase } from "../../../src/common/voices/voices_base.js";
import { VoiceGoogle } from "../../../src/google/voices/voices_model.js";

describe("Helpers Tests", () => {
  const mockVoices = [
    new VoiceGoogle({
      engines: [],
      code: "voice1",
      name: "John",
      nativeName: "John",
      gender: "Male",
      locale: { code: "en-US", name: "English" }
    }),
    new VoiceGoogle({
      engines: [],
      code: "voice2",
      name: "Anna",
      nativeName: "Anna",
      gender: "Female",
      locale: { code: "en-GB", name: "English UK" }
    }),
    new VoiceGoogle({
      engines: [],
      code: "voice3",
      name: "Mary",
      nativeName: "Mary",
      gender: "Female",
      locale: { code: "en-US", name: "English" }
    })
  ];

  const cloneMockVoices = (): VoiceGoogle[] => {
    return [...mockVoices.map(voice => ({ ...voice, locale: {...voice.locale} }))];
  }

  const maleNames = ["David", "Mike", "Robert", "James", "William", "Charles"];
  const femaleNames = ["Olivia", "Maria", "Susan", "Jessica", "Emily", "Sophia"];
  const maleNamesMapper = <T extends VoiceBase>(voices: T[], index: number): string => `${voices[index].name} - ${index}`;
  const femaleNamesMapper = <T extends VoiceBase>(voices: T[], index: number): string => `${voices[index].name} - ${index}`;

  const mockOptions1 = new VoicesNameOptionsGoogle({
      maleNames, femaleNames,
  });

  const mockOptions2 = new VoicesNameOptionsGoogle({
    maleNamesMapper, femaleNamesMapper,
  });

  const mockOptions3 = new VoicesNameOptionsGoogle({
    maleNames, femaleNamesMapper,
  });

  const mockOptions4 = new VoicesNameOptionsGoogle({
    maleNamesMapper, femaleNames,
  });

  const mockOptionsAll = [mockOptions1, mockOptions2,mockOptions3, mockOptions4];

  describe('Helpers Tests for shuffleNamesByText', () => {
    test('should return an empty array if names list is empty', () => {
      const result = Helpers.shuffleNamesByText([], 'someText');
      expect(result).toEqual([]);
    });

    test('should shuffle names based on text seed', () => {
      const names = ['John', 'Mike', 'Anna'];
      const result = Helpers.shuffleNamesByText(names, 'seedText');
      expect(result).toHaveLength(3);
      expect(new Set(result)).toEqual(new Set(names));
    });

    test('should produce consistent shuffle for the same seed', () => {
      const names = ['John', 'Mike', 'Anna'];
      const result1 = Helpers.shuffleNamesByText(names, 'seedText');
      const result2 = Helpers.shuffleNamesByText(names, 'seedText');
      expect(result1).toEqual(result2);
    });
  });

  describe('Helpers Tests for mapVoiceNames', () => {
    test('should map male and female names correctly with mockOptionsAll', () => {
      mockOptionsAll.forEach((mockOptions, index) => {
        const voices = [
          ...cloneMockVoices(),
          ...cloneMockVoices()
        ];
        const result = Helpers.mapVoiceNames(voices, mockOptions);

        // Define expected names for each case
        const expectedNames = [
          ['James', 'Susan', 'Jessica', 'Robert', 'Jessica', 'Susan'],
          ['John - 0', 'Anna - 1', 'Mary - 2', 'John - 3', 'Anna - 4', 'Mary - 5'],
          ['James', 'Anna - 1', 'Mary - 2', 'Robert', 'Anna - 4', 'Mary - 5'],
          ['John - 0', 'Susan', 'Jessica', 'John - 3', 'Jessica', 'Susan'],
        ];

        expect(result).toHaveLength(6);
        expect(result.map(voice => voice.name)).toEqual(expectedNames[index]);
      });
    });

    test('should fallback to original name if no names are available for gender', () => {
      const voices = cloneMockVoices();
      const optionsWithNoNames = new VoicesNameOptionsGoogle({
        maleNames: [],
        femaleNames: [],
      });
      const result = Helpers.mapVoiceNames(voices, optionsWithNoNames);

      expect(result).toHaveLength(3);
      expect(result.map(voice => voice.name)).toEqual(['John', 'Anna', 'Mary']);
    });

    test('should use maleNamesMapper and femaleNamesMapper if provided', () => {
      const voices = cloneMockVoices();
      const customOptions = new VoicesNameOptionsGoogle({
        maleNamesMapper: (): string => 'CustomMale',
        femaleNamesMapper: (): string => 'CustomFemale',
      });
      const result = Helpers.mapVoiceNames(voices, customOptions);

      expect(result).toHaveLength(3);
      expect(result.map(voice => voice.name)).toEqual(['CustomMale', 'CustomFemale', 'CustomFemale']);
    });

    test('should return an empty array when no voices are provided', () => {
      const result = Helpers.mapVoiceNames([], mockOptionsAll[0]);

      expect(result).toEqual([]);
    });
  });

  describe('Helpers Tests for removeVoiceDuplicates', () => {
    test('should remove duplicate voices based on code', () => {
      const voicesWithDuplicates = [
        ...mockVoices,
        mockVoices[0],
      ];

      const result = Helpers.removeVoiceDuplicates(voicesWithDuplicates);

      expect(result).toHaveLength(3);
    });

    test('should return all voices if no duplicates', () => {
      const result = Helpers.removeVoiceDuplicates(mockVoices);
      expect(result).toHaveLength(3);
    });
  });

  describe('Helpers Tests for sortVoices', () => {
    test('should sort voices by locale and gender', () => {
      const unsortedVoices = [
        new VoiceUniversal({
          provider: TtsProviders.google,
          engines: [],
          code: 'voice2',
          name: 'Anna',
          nativeName: 'Anna',
          gender: 'Female',
          locale: { code: 'en-GB', name: 'English UK' },
        }),
        new VoiceUniversal({
          provider: TtsProviders.google,
          engines: [],
          code: 'voice1',
          name: 'John',
          nativeName: 'John',
          gender: 'Male',
          locale: { code: 'en-US', name: 'English' },
        }),
        new VoiceUniversal({
          provider: TtsProviders.google,
          engines: [],
          code: 'voice3',
          name: 'Mary',
          nativeName: 'Mary',
          gender: 'Female',
          locale: { code: 'en-US', name: 'English' },
        }),
      ];

      const result = Helpers.sortVoices(unsortedVoices);

      expect(result[0].locale.name).toBe('English');
      expect(result[0].gender).toBe('Female');
      expect(result[1].locale.name).toBe('English');
      expect(result[1].gender).toBe('Male');
      expect(result[2].locale.name).toBe('English UK');
    });

    test('should filter out voices with invalid locale names', () => {
      const invalidVoices = [
        new VoiceUniversal({
          provider: TtsProviders.google,
          engines: [],
          code: 'voice2',
          name: 'Invalid',
          nativeName: 'Invalid',
          gender: 'Female',
          locale: { code: 'en-GB', name: '' },
        }),
        new VoiceUniversal({
          provider: TtsProviders.google,
          engines: [],
          code: 'voice1',
          name: 'John',
          nativeName: 'John',
          gender: 'Male',
          locale: { code: 'en-US', name: 'English' },
        }),
      ];

      const result = Helpers.sortVoices(invalidVoices);
      expect(result).toHaveLength(1);
      expect(result[0].locale.name).toBe('English');
    });
  });
});
