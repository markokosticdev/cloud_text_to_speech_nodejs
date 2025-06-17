import { SsmlSanitizer } from './ssml_sanitizer.js';
import { SsmlMinimizer } from './ssml_minimizer.js';
import { SsmlSplitter } from './ssml_splitter.js';
import { SsmlValidator, SsmlValidationResult } from './ssml_validator.js';
import { SsmlOptions } from './ssml_options.js';
import { Log } from '../../../utils/log.js';

export abstract class SsmlBase<V, O extends SsmlOptions> {
  ssml: string | undefined;
  ssmlChunks: string[] | undefined;
  rate: string;
  pitch: string;
  voice: V | undefined;
  voiceId: string | undefined;
  options: O;

  constructor({
    ssml,
    ssmlChunks,
    rate,
    pitch,
    voice,
    voiceId,
    options,
  }: {
    ssml?: string;
    ssmlChunks?: string[];
    rate: string;
    pitch: string;
    voice?: V;
    voiceId?: string;
    options: O;
  }) {
    if (!voice && !voiceId) {
      throw new Error('Either voice or voiceId must be provided.');
    }

    if (voice && voiceId) {
      throw new Error('Only voice or voiceId must be provided.');
    }

    if (!ssml && !ssmlChunks) {
      throw new Error('Either input or ssmlChunks must be provided.');
    }

    if (ssml && ssmlChunks) {
      throw new Error('Only input or ssmlChunks must be provided.');
    }

    this.ssml = ssml;
    this.ssmlChunks = ssmlChunks;
    this.rate = rate;
    this.pitch = pitch;
    this.voice = voice;
    this.voiceId = voiceId;
    this.options = options;
  }

  get rawSsml(): string {
    return this.ssmlRootTemplate(this.ssml);
  }

  protected abstract get allowedElements(): { [key: string]: string[] };

  /**
   * Process SSML chunks with optional validation
   * Maintains backward compatibility while adding new validation features
   */
  processedSsmlChunks(): string[] {
    if (this.ssmlChunks) {
      return this.ssmlChunks.map((ssml) => {
        return this._processSingleSsmlChunk(ssml);
      });
    } else {
      // First validate the complete SSML if validation is enabled
      if (this.options.validation.enabled && this.ssml) {
        this._validateSsml(this.ssml);
      }

      const sanitizedSsml = SsmlSanitizer.sanitize(
        this.ssml,
        this.allowedElements,
      );
      const minimizedSsml = SsmlMinimizer.minimize(sanitizedSsml);
      
      return SsmlSplitter.split(
        minimizedSsml,
        (ssml) => this.ssmlRootTemplate(ssml),
        this.options,
      );
    }
  }

  /**
   * Process a single SSML chunk
   * @private
   */
  private _processSingleSsmlChunk(ssml: string): string {
    // Validate if enabled
    if (this.options.validation.enabled) {
      this._validateSsml(ssml);
    }

    const sanitizedSsml = SsmlSanitizer.sanitize(
      ssml,
      this.allowedElements,
    );
    const minimizedSsml = SsmlMinimizer.minimize(sanitizedSsml);
    return this.ssmlRootTemplate(minimizedSsml);
  }

  /**
   * Validate SSML content according to configuration
   * @private
   */
  private _validateSsml(ssml: string): void {
    try {
      const validationResult = SsmlValidator.validate(ssml, this.allowedElements);
      
      if (!validationResult.isValid) {
        this._handleValidationResult(validationResult);
      } else if (validationResult.warnings.length > 0) {
        this._handleValidationWarnings(validationResult);
      }
    } catch (error) {
      const message = `SSML validation failed: ${error.message}`;
      
      if (this.options.validation.mode === 'strict') {
        throw new Error(message);
      } else if (this.options.validation.mode === 'warn') {
        Log.d(message, 'SSML_VALIDATION');
      }
      // Silent mode does nothing
    }
  }

  /**
   * Handle validation errors according to configuration
   * @private
   */
  private _handleValidationResult(result: SsmlValidationResult): void {
    const errorMessage = `SSML validation failed:\n${result.errors.map(e => `- ${e.message}`).join('\n')}`;
    
    switch (this.options.validation.mode) {
      case 'strict':
        throw new Error(errorMessage);
      case 'warn':
        Log.d(errorMessage, 'SSML_VALIDATION_ERROR');
        break;
      case 'silent':
        // Do nothing
        break;
    }
  }

  /**
   * Handle validation warnings according to configuration
   * @private
   */
  private _handleValidationWarnings(result: SsmlValidationResult): void {
    if (this.options.validation.mode === 'silent') {
      return;
    }

    const warningMessage = `SSML validation warnings:\n${result.warnings.map(w => `- ${w.message}`).join('\n')}`;
    Log.d(warningMessage, 'SSML_VALIDATION_WARNING');
  }

  /**
   * Get validation result without throwing errors
   */
  getValidationResult(): SsmlValidationResult | null {
    if (!this.options.validation.enabled) {
      return null;
    }

    const ssmlToValidate = this.ssml || (this.ssmlChunks ? this.ssmlChunks.join(' ') : '');
    if (!ssmlToValidate) {
      return null;
    }

    try {
      return SsmlValidator.validate(ssmlToValidate, this.allowedElements);
    } catch {
      return null;
    }
  }

  protected abstract ssmlRootTemplate(ssml: string): string;
}
