import {
  SSML_SPLIT_LIMIT,
} from './convert_params_defaults.js';
import { SsmlOptions, SsmlValidationOptions } from '../../common/convert/input/ssml/ssml_options.js';
import { MICROSOFT_SSML_ALLOWED_ELEMENTS } from '../../common/convert/input/ssml/schemas/microsoft_ssml_schema.js';

export class ConvertSsmlOptionsMicrosoft extends SsmlOptions {
  constructor({
    allowedElements,
    splitLimit,
    validation,
  }: {
    allowedElements?: { [key: string]: string[] };
    splitLimit?: number;
    validation?: Partial<SsmlValidationOptions>;
  } = {}) {
    // Default validation options for Microsoft TTS
    const defaultValidation: SsmlValidationOptions = {
      enabled: true,
      mode: 'warn',
      validateAttributes: true,
      validateAttributeValues: true,
      allowUnknownElements: false,
    };

    super(
      {
        allowedElements: MICROSOFT_SSML_ALLOWED_ELEMENTS,
        splitLimit: SSML_SPLIT_LIMIT,
        validation: defaultValidation,
      },
      { 
        allowedElements, 
        splitLimit,
        validation,
      },
    );
  }
}
