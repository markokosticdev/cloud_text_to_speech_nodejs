import {
  SSML_SPLIT_LIMIT,
} from './convert_params_defaults.js';
import { SsmlOptions, SsmlValidationOptions } from '../../common/convert/input/ssml/ssml_options.js';
import { AMAZON_SSML_ALLOWED_ELEMENTS } from './input/ssml/ssml_schema.js';

export class ConvertSsmlOptionsAmazon extends SsmlOptions {
  constructor({
    allowedElements,
    splitLimit,
    validation,
  }: {
    allowedElements?: { [key: string]: string[] };
    splitLimit?: number;
    validation?: Partial<SsmlValidationOptions>;
  } = {}) {
    // Default validation options for Amazon TTS
    const defaultValidation: SsmlValidationOptions = {
      enabled: true,
      mode: 'warn',
      validateAttributes: true,
      validateAttributeValues: true,
      allowUnknownElements: false,
    };

    const mergedValidation: SsmlValidationOptions = { ...defaultValidation, ...validation };

    super(
      {
        allowedElements: AMAZON_SSML_ALLOWED_ELEMENTS,
        splitLimit: SSML_SPLIT_LIMIT,
        validation: defaultValidation,
        preserveElements: true,
      },
      { 
        allowedElements, 
        splitLimit,
        validation: mergedValidation,
      }
    );
  }
}
