import {
  NameOptions,
  VoiceNameMapper,
} from '../../common/voices/input/name_options.js';
import { VoiceGoogle } from './voices_model.js';
import { VoiceNames } from '../../common/voices/voices_names.js';

export type VoicesGoogleNameMapper = VoiceNameMapper<VoiceGoogle>;

export class VoicesNameOptionsGoogle extends NameOptions<VoiceGoogle> {
  constructor({
    maleNames,
    maleNamesMapper,
    femaleNames,
    femaleNamesMapper,
    neutralNames,
    neutralNamesMapper,
  }: {
    maleNames?: string[];
    maleNamesMapper?: VoicesGoogleNameMapper;
    femaleNames?: string[];
    femaleNamesMapper?: VoicesGoogleNameMapper;
    neutralNames?: string[];
    neutralNamesMapper?: VoicesGoogleNameMapper;
  } = {}) {
    super(
      { 
        maleNames: VoiceNames.male, 
        femaleNames: VoiceNames.female,
        neutralNames: VoiceNames.neutral
      },
      { 
        maleNames, 
        maleNamesMapper, 
        femaleNames, 
        femaleNamesMapper,
        neutralNames,
        neutralNamesMapper
      },
    );
  }
}
