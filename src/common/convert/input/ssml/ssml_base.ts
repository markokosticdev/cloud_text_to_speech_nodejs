/**
 * @fileoverview Abstract Base Class for SSML Processing System for Text-to-Speech Services
 * 
 * This module provides the foundational abstract class for SSML processing across
 * all TTS providers. It implements comprehensive SSML validation, sanitization,
 * minimization, and splitting capabilities with provider-agnostic interfaces
 * and flexible configuration options for robust text-to-speech operations.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link SsmlValidator} for validation implementation
 * @see {@link SsmlSanitizer} for content sanitization
 * @see {@link SsmlMinimizer} for content optimization
 * @see {@link SsmlSplitter} for chunk management
 * 
 * @example Basic SSML processing implementation
 * ```typescript
 * import { SsmlBase, SsmlOptions } from 'cloud-text-to-speech';
 * 
 * class CustomSsmlProcessor extends SsmlBase<VoiceType, CustomOptions> {
 *   protected get allowedElements() {
 *     return {
 *       speak: ['version', 'xmlns'],
 *       break: ['time', 'strength'],
 *       emphasis: ['level']
 *     };
 *   }
 *   
 *   protected ssmlRootTemplate(ssml: string): string {
 *     return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis">${ssml}</speak>`;
 *   }
 * }
 * ```
 * 
 * @example Advanced SSML processing with validation
 * ```typescript
 * const processor = new CustomSsmlProcessor({
 *   ssml: '<break time="2s"/>Hello world<emphasis level="strong">!</emphasis>',
 *   rate: '1.0',
 *   pitch: '0',
 *   voice: myVoice,
 *   options: {
 *     allowedElements: customElements,
 *     splitLimit: 5000,
 *     validation: {
 *       enabled: true,
 *       mode: 'strict',
 *       validateAttributes: true,
 *       validateAttributeValues: true,
 *       allowUnknownElements: false
 *     }
 *   }
 * });
 * 
 * const processedChunks = processor.processedSsmlChunks();
 * const validationResult = processor.getValidationResult();
 * ```
 */

import { SsmlSanitizer } from './ssml_sanitizer.js';
import { SsmlMinimizer } from './ssml_minimizer.js';
import { SsmlSplitter } from './ssml_splitter.js';
import { SsmlValidator, SsmlValidationResult } from './ssml_validator.js';
import { SsmlOptions } from './ssml_options.js';
import { Log } from '../../../utils/log.js';

/**
 * Abstract base class for SSML processing across all TTS providers.
 * Provides comprehensive SSML validation, sanitization, minimization, and splitting
 * capabilities with provider-agnostic interfaces and flexible configuration options.
 * Implements the template method pattern for consistent processing workflows while
 * allowing provider-specific customization through abstract methods.
 * 
 * @template V - Voice type specific to the TTS provider
 * @template O - Options type extending SsmlOptions for provider-specific configuration
 * 
 * @category SSML Processing
 * 
 * @example Basic provider implementation
 * ```typescript
 * import { SsmlBase, SsmlOptions } from 'cloud-text-to-speech';
 * 
 * interface GoogleVoice {
 *   name: string;
 *   languageCode: string;
 * }
 * 
 * interface GoogleSsmlOptions extends SsmlOptions {
 *   googleSpecific?: boolean;
 * }
 * 
 * class GoogleSsmlProcessor extends SsmlBase<GoogleVoice, GoogleSsmlOptions> {
 *   protected get allowedElements() {
 *     return {
 *       speak: ['version', 'xmlns'],
 *       audio: ['src', 'clipBegin', 'clipEnd'],
 *       break: ['time', 'strength'],
 *       emphasis: ['level'],
 *       mark: ['name'],
 *       p: [],
 *       s: []
 *     };
 *   }
 *   
 *   protected ssmlRootTemplate(ssml: string): string {
 *     const voiceName = this.voice?.name || this.voiceId;
 *     return `
 *       <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis">
 *         <voice name="${voiceName}">
 *           ${ssml}
 *         </voice>
 *       </speak>
 *     `;
 *   }
 * }
 * ```
 * 
 * @example Advanced processing with validation modes
 * ```typescript
 * class ProductionSsmlProcessor extends SsmlBase<Voice, Options> {
 *   constructor(params: ConstructorParams) {
 *     super({
 *       ...params,
 *       options: {
 *         ...params.options,
 *         validation: {
 *           enabled: true,
 *           mode: 'warn', // Log warnings but don't throw
 *           validateAttributes: true,
 *           validateAttributeValues: true,
 *           allowUnknownElements: false
 *         }
 *       }
 *     });
 *   }
 *   
 *   processWithErrorHandling(): string[] {
 *     try {
 *       const chunks = this.processedSsmlChunks();
 *       const validation = this.getValidationResult();
 *       
 *       if (validation && !validation.isValid) {
 *         console.warn('SSML validation issues detected:', validation.errors);
 *       }
 *       
 *       return chunks;
 *     } catch (error) {
 *       console.error('SSML processing failed:', error);
 *       throw new Error(`SSML processing error: ${error.message}`);
 *     }
 *   }
 * }
 * ```
 * 
 * @example Batch processing with progress tracking
 * ```typescript
 * class BatchSsmlProcessor extends SsmlBase<Voice, Options> {
 *   processBatch(ssmlInputs: string[]): Promise<string[][]> {
 *     return Promise.all(
 *       ssmlInputs.map(async (ssml, index) => {
 *         console.log(`Processing SSML ${index + 1}/${ssmlInputs.length}`);
 *         
 *         const processor = new BatchSsmlProcessor({
 *           ssml,
 *           rate: this.rate,
 *           pitch: this.pitch,
 *           voice: this.voice,
 *           options: this.options
 *         });
 *         
 *         return processor.processedSsmlChunks();
 *       })
 *     );
 *   }
 * }
 * ```
 */
export abstract class SsmlBase<V, O extends SsmlOptions> {
  /** Raw SSML content to be processed */
  ssml: string | undefined;
  /** Pre-chunked SSML content for batch processing */
  ssmlChunks: string[] | undefined;
  /** Speech rate modifier (e.g., "1.0", "slow", "fast") */
  rate: string;
  /** Pitch modifier (e.g., "0", "high", "low") */
  pitch: string;
  /** Voice configuration object specific to the provider */
  voice: V | undefined;
  /** Voice identifier string as alternative to voice object */
  voiceId: string | undefined;
  /** Processing options including validation and splitting configuration */
  options: O;

  /**
   * Constructs a new SSML processor with comprehensive validation and configuration.
   * Enforces mutually exclusive input patterns and validates required parameters
   * to ensure consistent and predictable processing behavior across all providers.
   * 
   * @param params - Configuration parameters for SSML processing
   * @param params.ssml - Raw SSML content (mutually exclusive with ssmlChunks)
   * @param params.ssmlChunks - Pre-processed SSML chunks (mutually exclusive with ssml)
   * @param params.rate - Speech rate modifier
   * @param params.pitch - Pitch modifier
   * @param params.voice - Voice configuration object (mutually exclusive with voiceId)
   * @param params.voiceId - Voice identifier string (mutually exclusive with voice)
   * @param params.options - Processing configuration options
   * 
   * @throws {Error} When neither voice nor voiceId is provided
   * @throws {Error} When both voice and voiceId are provided
   * @throws {Error} When neither ssml nor ssmlChunks is provided
   * @throws {Error} When both ssml and ssmlChunks are provided
   * 
   * @example Basic construction
   * ```typescript
   * const processor = new CustomSsmlProcessor({
   *   ssml: '<speak>Hello <break time="1s"/> world</speak>',
   *   rate: '1.0',
   *   pitch: '0',
   *   voice: { name: 'en-US-Standard-A', languageCode: 'en-US' },
   *   options: defaultOptions
   * });
   * ```
   * 
   * @example Construction with pre-chunked content
   * ```typescript
   * const processor = new CustomSsmlProcessor({
   *   ssmlChunks: [
   *     '<speak>First chunk</speak>',
   *     '<speak>Second chunk</speak>'
   *   ],
   *   rate: 'slow',
   *   pitch: 'high',
   *   voiceId: 'voice-id-123',
   *   options: customOptions
   * });
   * ```
   * 
   * @example Construction with validation configuration
   * ```typescript
   * const processor = new CustomSsmlProcessor({
   *   ssml: '<speak><break time="2s"/>Content</speak>',
   *   rate: '1.2',
   *   pitch: '0',
   *   voice: voiceConfig,
   *   options: {
   *     allowedElements: providerElements,
   *     splitLimit: 5000,
   *     validation: {
   *       enabled: true,
   *       mode: 'strict',
   *       validateAttributes: true,
   *       validateAttributeValues: true,
   *       allowUnknownElements: false
   *     }
   *   }
   * });
   * ```
   */
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

  /**
   * Gets the complete SSML document with provider-specific root template applied.
   * Wraps the raw SSML content in the appropriate root element structure
   * required by the specific TTS provider, including necessary namespaces
   * and voice specifications.
   * 
   * @returns Complete SSML document ready for TTS service consumption
   * 
   * @example Getting formatted SSML
   * ```typescript
   * const processor = new GoogleSsmlProcessor({
   *   ssml: 'Hello <break time="1s"/> world',
   *   rate: '1.0',
   *   pitch: '0',
   *   voice: { name: 'en-US-Standard-A' },
   *   options: options
   * });
   * 
   * const formattedSsml = processor.rawSsml;
   * console.log(formattedSsml);
   * // Output: <speak version="1.0" xmlns="..."><voice name="en-US-Standard-A">Hello <break time="1s"/> world</voice></speak>
   * ```
   * 
   * @example Debugging SSML structure
   * ```typescript
   * const debugSsml = (processor: SsmlBase<any, any>) => {
   *   const raw = processor.rawSsml;
   *   console.log('Raw SSML length:', raw.length);
   *   console.log('Contains voice element:', raw.includes('<voice'));
   *   console.log('Contains break elements:', raw.includes('<break'));
   *   return raw;
   * };
   * ```
   */
  get rawSsml(): string {
    return this.ssmlRootTemplate(this.ssml);
  }

  /**
   * Gets the provider-specific allowed SSML elements and their attributes.
   * This abstract property must be implemented by each provider to define
   * which SSML elements and attributes are supported for validation and
   * sanitization processes.
   * 
   * @returns Object mapping element names to arrays of allowed attribute names
   * 
   * @example Google Cloud TTS implementation
   * ```typescript
   * protected get allowedElements(): { [key: string]: string[] } {
   *   return {
   *     speak: ['version', 'xmlns'],
   *     audio: ['src', 'clipBegin', 'clipEnd', 'speed'],
   *     break: ['time', 'strength'],
   *     emphasis: ['level'],
   *     mark: ['name'],
   *     p: [],
   *     s: []
   *   };
   * }
   * ```
   * 
   * @example Amazon Polly implementation
   * ```typescript
   * protected get allowedElements(): { [key: string]: string[] } {
   *   return {
   *     speak: ['version', 'xmlns'],
   *     'amazon:domain': ['name'],
   *     'amazon:effect': ['name', 'phonation', 'vocal-tract-length'],
   *     break: ['time', 'strength'],
   *     emphasis: ['level'],
   *     w: ['role']
   *   };
   * }
   * ```
   */
  protected abstract get allowedElements(): { [key: string]: string[] };

  /**
   * Processes SSML chunks with comprehensive validation, sanitization, and optimization.
   * Implements the complete SSML processing pipeline including optional validation,
   * content sanitization, minimization, and intelligent splitting for optimal
   * TTS service consumption. Maintains backward compatibility while adding
   * advanced validation features.
   * 
   * @returns Array of processed SSML chunks ready for TTS synthesis
   * 
   * @throws {Error} When validation is enabled in strict mode and SSML is invalid
   * 
   * @example Basic chunk processing
   * ```typescript
   * const processor = new CustomSsmlProcessor({
   *   ssml: '<speak>Hello <break time="2s"/> world <emphasis level="strong">!</emphasis></speak>',
   *   rate: '1.0',
   *   pitch: '0',
   *   voice: voice,
   *   options: options
   * });
   * 
   * const chunks = processor.processedSsmlChunks();
   * console.log(`Generated ${chunks.length} chunks`);
   * chunks.forEach((chunk, index) => {
   *   console.log(`Chunk ${index + 1}: ${chunk}`);
   * });
   * ```
   * 
   * @example Processing with validation
   * ```typescript
   * const processor = new CustomSsmlProcessor({
   *   ssml: ssmlContent,
   *   rate: '1.0',
   *   pitch: '0',
   *   voice: voice,
   *   options: {
   *     allowedElements: elements,
   *     splitLimit: 5000,
   *     validation: {
   *       enabled: true,
   *       mode: 'warn', // Log warnings but continue processing
   *       validateAttributes: true,
   *       validateAttributeValues: true,
   *       allowUnknownElements: false
   *     }
   *   }
   * });
   * 
   * try {
   *   const chunks = processor.processedSsmlChunks();
   *   console.log('Processing successful:', chunks.length, 'chunks generated');
   * } catch (error) {
   *   console.error('Processing failed:', error.message);
   * }
   * ```
   * 
   * @example Batch processing workflow
   * ```typescript
   * const processBatch = (ssmlInputs: string[]) => {
   *   return ssmlInputs.map((ssml, index) => {
   *     const processor = new CustomSsmlProcessor({
   *       ssml,
   *       rate: '1.0',
   *       pitch: '0',
   *       voice: voice,
   *       options: options
   *     });
   *     
   *     try {
   *       const chunks = processor.processedSsmlChunks();
   *       console.log(`Input ${index + 1}: ${chunks.length} chunks`);
   *       return chunks;
   *     } catch (error) {
   *       console.error(`Input ${index + 1} failed:`, error.message);
   *       return [];
   *     }
   *   });
   * };
   * ```
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
   * Processes a single SSML chunk with validation and optimization.
   * Internal method that applies the complete processing pipeline to individual
   * SSML chunks, including validation, sanitization, and minimization while
   * applying the provider-specific root template.
   * 
   * @param ssml - Single SSML chunk to process
   * @returns Processed SSML chunk with root template applied
   * @private
   * 
   * @example Internal chunk processing flow
   * ```typescript
   * // This method is called internally for each chunk
   * const processChunk = (ssml: string) => {
   *   // 1. Validate if enabled
   *   if (this.options.validation.enabled) {
   *     this._validateSsml(ssml);
   *   }
   *   
   *   // 2. Sanitize content
   *   const sanitized = SsmlSanitizer.sanitize(ssml, this.allowedElements);
   *   
   *   // 3. Minimize whitespace and formatting
   *   const minimized = SsmlMinimizer.minimize(sanitized);
   *   
   *   // 4. Apply provider template
   *   return this.ssmlRootTemplate(minimized);
   * };
   * ```
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
   * Validates SSML content according to configuration settings.
   * Internal validation method that handles different validation modes
   * and provides appropriate error handling and logging based on the
   * configured validation strategy.
   * 
   * @param ssml - SSML content to validate
   * @throws {Error} When validation fails in strict mode
   * @private
   * 
   * @example Validation modes handling
   * ```typescript
   * // Strict mode - throws on any validation error
   * const strictProcessor = new CustomSsmlProcessor({
   *   ssml: invalidSsml,
   *   options: {
   *     validation: { enabled: true, mode: 'strict' }
   *   }
   * });
   * // Will throw Error if SSML is invalid
   * 
   * // Warn mode - logs warnings but continues
   * const warnProcessor = new CustomSsmlProcessor({
   *   ssml: invalidSsml,
   *   options: {
   *     validation: { enabled: true, mode: 'warn' }
   *   }
   * });
   * // Will log warnings but continue processing
   * 
   * // Silent mode - ignores validation errors
   * const silentProcessor = new CustomSsmlProcessor({
   *   ssml: invalidSsml,
   *   options: {
   *     validation: { enabled: true, mode: 'silent' }
   *   }
   * });
   * // Will process without any error reporting
   * ```
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
   * Handles validation errors according to configuration mode.
   * Internal method that processes validation failures and applies
   * appropriate error handling strategies based on the configured
   * validation mode (strict, warn, silent).
   * 
   * @param result - Validation result containing errors and warnings
   * @throws {Error} When in strict mode
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
   * Handles validation warnings according to configuration mode.
   * Internal method that processes validation warnings and provides
   * appropriate logging and reporting based on the configured
   * validation strategy.
   * 
   * @param result - Validation result containing warnings
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
   * Gets validation result without throwing errors for analysis and debugging.
   * Provides safe access to validation results for monitoring, debugging,
   * and quality assurance without interrupting the processing workflow.
   * Returns null when validation is disabled or no content is available.
   * 
   * @returns Validation result object or null if validation disabled/unavailable
   * 
   * @example Validation result analysis
   * ```typescript
   * const processor = new CustomSsmlProcessor({
   *   ssml: ssmlContent,
   *   rate: '1.0',
   *   pitch: '0',
   *   voice: voice,
   *   options: { validation: { enabled: true } }
   * });
   * 
   * const result = processor.getValidationResult();
   * if (result) {
   *   console.log('Validation status:', result.isValid ? 'PASS' : 'FAIL');
   *   console.log('Errors found:', result.errors.length);
   *   console.log('Warnings found:', result.warnings.length);
   *   
   *   if (!result.isValid) {
   *     result.errors.forEach(error => {
   *       console.error(`Error: ${error.message} (Code: ${error.code})`);
   *     });
   *   }
   *   
   *   result.warnings.forEach(warning => {
   *     console.warn(`Warning: ${warning.message} (Code: ${warning.code})`);
   *   });
   * } else {
   *   console.log('Validation not enabled or no content available');
   * }
   * ```
   * 
   * @example Quality metrics collection
   * ```typescript
   * const collectQualityMetrics = (processors: SsmlBase<any, any>[]) => {
   *   const metrics = {
   *     totalProcessed: processors.length,
   *     validationEnabled: 0,
   *     validSsml: 0,
   *     invalidSsml: 0,
   *     warningsFound: 0,
   *     commonErrors: new Map<string, number>()
   *   };
   *   
   *   processors.forEach(processor => {
   *     const result = processor.getValidationResult();
   *     
   *     if (result) {
   *       metrics.validationEnabled++;
   *       
   *       if (result.isValid) {
   *         metrics.validSsml++;
   *       } else {
   *         metrics.invalidSsml++;
   *         
   *         result.errors.forEach(error => {
   *           const count = metrics.commonErrors.get(error.code) || 0;
   *           metrics.commonErrors.set(error.code, count + 1);
   *         });
   *       }
   *       
   *       metrics.warningsFound += result.warnings.length;
   *     }
   *   });
   *   
   *   return metrics;
   * };
   * ```
   * 
   * @example Conditional processing based on validation
   * ```typescript
   * const processWithQualityCheck = (processor: SsmlBase<any, any>) => {
   *   const validation = processor.getValidationResult();
   *   
   *   if (!validation) {
   *     // No validation available, proceed normally
   *     return processor.processedSsmlChunks();
   *   }
   *   
   *   if (validation.isValid && validation.warnings.length === 0) {
   *     // Perfect SSML, use optimized processing
   *     return processor.processedSsmlChunks();
   *   } else if (validation.isValid) {
   *     // Valid but with warnings, log and continue
   *     console.warn(`Processing SSML with ${validation.warnings.length} warnings`);
   *     return processor.processedSsmlChunks();
   *   } else {
   *     // Invalid SSML, apply fallback processing
   *     console.error(`Invalid SSML detected: ${validation.errors.length} errors`);
   *     return applyFallbackProcessing(processor);
   *   }
   * };
   * ```
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

  /**
   * Applies provider-specific SSML root template to content.
   * Abstract method that must be implemented by each provider to wrap
   * SSML content in the appropriate document structure required by
   * their TTS service, including namespaces, voice specifications,
   * and other provider-specific requirements.
   * 
   * @param ssml - SSML content to wrap in provider template
   * @returns Complete SSML document with provider-specific root structure
   * 
   * @example Google Cloud TTS implementation
   * ```typescript
   * protected ssmlRootTemplate(ssml: string): string {
   *   const voiceName = this.voice?.name || this.voiceId;
   *   return `
   *     <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"
   *            xmlns:mstts="https://www.w3.org/2001/mstts"
   *            xml:lang="${this.voice?.languageCode || 'en-US'}">
   *       <voice name="${voiceName}">
   *         <prosody rate="${this.rate}" pitch="${this.pitch}">
   *           ${ssml}
   *         </prosody>
   *       </voice>
   *     </speak>
   *   `.trim();
   * }
   * ```
   * 
   * @example Amazon Polly implementation
   * ```typescript
   * protected ssmlRootTemplate(ssml: string): string {
   *   return `
   *     <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis">
   *       <prosody rate="${this.rate}" pitch="${this.pitch}">
   *         ${ssml}
   *       </prosody>
   *     </speak>
   *   `.trim();
   * }
   * ```
   * 
   * @example Microsoft Azure TTS implementation
   * ```typescript
   * protected ssmlRootTemplate(ssml: string): string {
   *   const voiceName = this.voice?.name || this.voiceId;
   *   return `
   *     <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"
   *            xmlns:mstts="https://www.w3.org/2001/mstts"
   *            xml:lang="${this.voice?.locale || 'en-US'}">
   *       <voice name="${voiceName}">
   *         <prosody rate="${this.rate}" pitch="${this.pitch}">
   *           ${ssml}
   *         </prosody>
   *       </voice>
   *     </speak>
   *   `.trim();
   * }
   * ```
   */
  protected abstract ssmlRootTemplate(ssml: string): string;
}
