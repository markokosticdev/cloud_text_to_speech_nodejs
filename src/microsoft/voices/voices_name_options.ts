import {
  NameOptions,
  VoiceNameMapper,
} from '../../common/voices/input/name_options.js';
import { VoiceMicrosoft } from './voices_model.js';

export type VoicesMicrosoftNameMapper = VoiceNameMapper<VoiceMicrosoft>;

export class VoicesNameOptionsMicrosoft extends NameOptions<VoiceMicrosoft> {
  constructor({
    maleNames,
    maleNamesMapper,
    femaleNames,
    femaleNamesMapper,
    neutralNames,
    neutralNamesMapper,
  }: {
    maleNames?: string[];
    maleNamesMapper?: VoicesMicrosoftNameMapper;
    femaleNames?: string[];
    femaleNamesMapper?: VoicesMicrosoftNameMapper;
    neutralNames?: string[];
    neutralNamesMapper?: VoicesMicrosoftNameMapper;
  } = {}) {
    super(
      {},
      { 
        maleNames, 
        maleNamesMapper, 
        femaleNames, 
        femaleNamesMapper,
        neutralNames,
        neutralNamesMapper
      }
    );
  }
}
