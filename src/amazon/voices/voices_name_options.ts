import {
  NameOptions,
  VoiceNameMapper,
} from '../../common/voices/input/name_options.js';
import { VoiceAmazon } from './voices_model.js';

export type VoicesAmazonNameMapper = VoiceNameMapper<VoiceAmazon>;

export class VoicesNameOptionsAmazon extends NameOptions<VoiceAmazon> {
  constructor({
    maleNames,
    maleNamesMapper,
    femaleNames,
    femaleNamesMapper,
    neutralNames,
    neutralNamesMapper,
  }: {
    maleNames?: string[];
    maleNamesMapper?: VoicesAmazonNameMapper;
    femaleNames?: string[];
    femaleNamesMapper?: VoicesAmazonNameMapper;
    neutralNames?: string[];
    neutralNamesMapper?: VoicesAmazonNameMapper;
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
