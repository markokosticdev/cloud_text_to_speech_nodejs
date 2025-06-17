export interface SsmlValidationOptions {
  /** Enable SSML validation */
  enabled: boolean;
  /** Validation mode: 'strict' throws errors, 'warn' logs warnings, 'silent' ignores */
  mode: 'strict' | 'warn' | 'silent';
  /** Validate element attributes according to provider rules */
  validateAttributes: boolean;
  /** Validate attribute values according to provider rules */
  validateAttributeValues: boolean;
  /** Skip validation for elements not in schema (backward compatibility) */
  allowUnknownElements: boolean;
}

export class SsmlOptions {
  allowedElements: { [key: string]: string[] };
  splitLimit: number;
  validation: SsmlValidationOptions;

  constructor(
    defaults: {
      allowedElements: { [key: string]: string[] };
      splitLimit: number;
      validation?: SsmlValidationOptions;
    },
    options: {
      allowedElements?: { [key: string]: string[] };
      splitLimit?: number;
      validation?: Partial<SsmlValidationOptions>;
    },
  ) {
    this.allowedElements = options.allowedElements ?? defaults.allowedElements;
    this.splitLimit = options.splitLimit ?? defaults.splitLimit;
    
    // Default validation options
    const defaultValidation: SsmlValidationOptions = {
      enabled: true,
      mode: 'warn',
      validateAttributes: true,
      validateAttributeValues: true,
      allowUnknownElements: false,
      ...defaults.validation,
    };
    
    this.validation = {
      ...defaultValidation,
      ...options.validation,
    };
  }
}
