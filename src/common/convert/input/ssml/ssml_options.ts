/**
 * @fileoverview SSML Processing Configuration and Options System
 * 
 * This module defines comprehensive configuration interfaces and options for
 * Speech Synthesis Markup Language (SSML) processing operations. It provides
 * flexible configuration structures for validation, splitting, sanitization,
 * and provider-specific processing parameters to ensure optimal TTS results
 * across different cloud services and use cases.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link SsmlValidator} for validation implementation
 * @see {@link SsmlSplitter} for content splitting
 * @see {@link SsmlSanitizer} for content sanitization
 * @see {@link SsmlBase} for base processing class
 * 
 * @example Basic SSML options configuration
 * ```typescript
 * import { SsmlOptions } from 'cloud-text-to-speech';
 * 
 * const basicOptions: SsmlOptions = {
 *   splitLimit: 5000,
 *   allowedElements: {
 *     speak: ['version', 'xmlns'],
 *     break: ['time', 'strength'],
 *     emphasis: ['level']
 *   },
 *   validation: {
 *     enabled: true,
 *     mode: 'warn'
 *   }
 * };
 * ```
 * 
 * @example Advanced configuration with all options
 * ```typescript
 * const advancedOptions: SsmlOptions = {
 *   splitLimit: 4000,
 *   preserveElements: true,
 *   allowedElements: googleAllowedElements,
 *   validation: {
 *     enabled: true,
 *     mode: 'strict',
 *     validateAttributes: true,
 *     validateAttributeValues: true,
 *     allowUnknownElements: false,
 *     customRules: customValidationRules
 *   },
 *   splitting: {
 *     respectSentenceBoundaries: true,
 *     preferredBreakpoints: ['</p>', '</s>', '<break'],
 *     minChunkSize: 500,
 *     overlap: 50
 *   }
 * };
 * ```
 */

/**
 * SSML Validation Configuration Options
 * 
 * Defines comprehensive validation settings for SSML content processing
 * including validation modes, rule enforcement, and error handling strategies.
 * Provides fine-grained control over validation behavior to balance strictness
 * with processing flexibility for different production environments.
 * 
 * @category SSML Configuration
 * 
 * @example Strict validation configuration
 * ```typescript
 * import { SsmlValidationOptions } from 'cloud-text-to-speech';
 * 
 * const strictValidation: SsmlValidationOptions = {
 *   enabled: true,
 *   mode: 'strict',              // Throw errors on validation failures
 *   validateAttributes: true,     // Check attribute validity
 *   validateAttributeValues: true, // Validate attribute value formats
 *   allowUnknownElements: false,  // Reject unknown SSML elements
 *   maxDepth: 10                 // Limit nesting depth
 * };
 * ```
 * 
 * @example Development-friendly validation
 * ```typescript
 * const devValidation: SsmlValidationOptions = {
 *   enabled: true,
 *   mode: 'warn',               // Log warnings but continue processing
 *   validateAttributes: true,
 *   validateAttributeValues: false, // Skip complex value validation
 *   allowUnknownElements: true,  // Allow experimental elements
 *   customRules: {
 *     allowEmptyElements: true,
 *     requireClosingTags: false
 *   }
 * };
 * ```
 * 
 * @example Production validation with monitoring
 * ```typescript
 * const prodValidation: SsmlValidationOptions = {
 *   enabled: true,
 *   mode: 'silent',             // No console output
 *   validateAttributes: true,
 *   validateAttributeValues: true,
 *   allowUnknownElements: false,
 *   reportingCallback: (result) => {
 *     // Send validation metrics to monitoring system
 *     metrics.record('ssml_validation', {
 *       valid: result.isValid,
 *       errors: result.errors.length,
 *       warnings: result.warnings.length
 *     });
 *   }
 * };
 * ```
 */
export interface SsmlValidationOptions {
  /** Whether SSML validation is enabled */
  enabled: boolean;
  
  /** 
   * Validation mode determining error handling behavior:
   * - 'strict': Throw errors on validation failures
   * - 'warn': Log warnings but continue processing  
   * - 'silent': Perform validation but suppress output
   */
  mode: 'strict' | 'warn' | 'silent';
  
  /** Whether to validate element attributes for correctness */
  validateAttributes?: boolean;
  
  /** Whether to validate attribute values against format rules */
  validateAttributeValues?: boolean;
  
  /** Whether to allow unknown/unsupported SSML elements */
  allowUnknownElements?: boolean;
  
  /** Maximum allowed nesting depth for SSML elements */
  maxDepth?: number;
  
  /** Custom validation rules for specialized requirements */
  customRules?: {
    /** Allow elements with no content */
    allowEmptyElements?: boolean;
    /** Require proper closing tags for all elements */
    requireClosingTags?: boolean;
    /** Maximum allowed content length per element */
    maxElementLength?: number;
    /** Custom element-specific validation functions */
    elementValidators?: Record<string, (element: unknown) => boolean>;
  };
  
  /** Callback function for validation result reporting */
  reportingCallback?: (result: SsmlValidationResult) => void;
}

/**
 * SSML Validation Result Interface
 * 
 * Represents the outcome of SSML validation operations including validity status,
 * detailed error information, warnings, and metadata about the validation process.
 * Used for reporting, debugging, and quality assurance workflows.
 * 
 * @category SSML Validation
 * 
 * @example Processing validation results
 * ```typescript
 * import { SsmlValidationResult } from 'cloud-text-to-speech';
 * 
 * const handleValidationResult = (result: SsmlValidationResult) => {
 *   console.log(`Validation Status: ${result.isValid ? 'PASS' : 'FAIL'}`);
 *   console.log(`Errors: ${result.errors.length}`);
 *   console.log(`Warnings: ${result.warnings.length}`);
 *   
 *   if (!result.isValid) {
 *     result.errors.forEach(error => {
 *       console.error(`Error [${error.code}]: ${error.message}`);
 *       if (error.line) console.error(`  Line: ${error.line}`);
 *       if (error.column) console.error(`  Column: ${error.column}`);
 *     });
 *   }
 *   
 *   result.warnings.forEach(warning => {
 *     console.warn(`Warning [${warning.code}]: ${warning.message}`);
 *   });
 * };
 * ```
 * 
 * @example Quality metrics from validation
 * ```typescript
 * const extractQualityMetrics = (result: SsmlValidationResult) => {
 *   return {
 *     overallScore: result.isValid ? 100 : Math.max(0, 100 - result.errors.length * 10),
 *     errorTypes: result.errors.reduce((types, error) => {
 *       types[error.code] = (types[error.code] || 0) + 1;
 *       return types;
 *     }, {} as Record<string, number>),
 *     warningTypes: result.warnings.reduce((types, warning) => {
 *       types[warning.code] = (types[warning.code] || 0) + 1;
 *       return types;
 *     }, {} as Record<string, number>),
 *     validationTime: result.processingTime
 *   };
 * };
 * ```
 */
export interface SsmlValidationResult {
  /** Whether the SSML content is valid */
  isValid: boolean;
  
  /** Array of validation errors that prevent processing */
  errors: SsmlValidationError[];
  
  /** Array of validation warnings for potential issues */
  warnings: SsmlValidationWarning[];
  
  /** Time taken for validation in milliseconds */
  processingTime?: number;
  
  /** Additional metadata about the validation process */
  metadata?: {
    /** Number of elements validated */
    elementCount?: number;
    /** Maximum nesting depth found */
    maxDepth?: number;
    /** Total content length validated */
    contentLength?: number;
    /** Validation rule set used */
    ruleSet?: string;
  };
}

/**
 * SSML Validation Error Interface
 * 
 * Represents a specific validation error that prevents successful SSML processing.
 * Includes detailed information about the error location, type, and suggested
 * remediation for effective debugging and content correction workflows.
 * 
 * @category SSML Validation
 * 
 * @example Error handling and reporting
 * ```typescript
 * import { SsmlValidationError } from 'cloud-text-to-speech';
 * 
 * const processValidationError = (error: SsmlValidationError) => {
 *   const errorReport = {
 *     severity: 'error',
 *     code: error.code,
 *     message: error.message,
 *     location: error.line ? `Line ${error.line}` : 'Unknown',
 *     element: error.elementName || 'Unknown',
 *     suggestion: error.suggestion || 'Check SSML documentation'
 *   };
 *   
 *   // Log structured error
 *   console.error('SSML Validation Error:', errorReport);
 *   
 *   // Send to error tracking service
 *   errorTracker.captureException(new Error(error.message), {
 *     tags: { ssml_validation: true, error_code: error.code },
 *     extra: errorReport
 *   });
 * };
 * ```
 */
export interface SsmlValidationError {
  /** Unique error code for categorization */
  code: string;
  
  /** Human-readable error message */
  message: string;
  
  /** Line number where error occurred (if available) */
  line?: number;
  
  /** Column number where error occurred (if available) */
  column?: number;
  
  /** Name of the SSML element causing the error */
  elementName?: string;
  
  /** Suggested fix or remediation */
  suggestion?: string;
  
  /** Severity level of the error */
  severity?: 'error' | 'warning' | 'info';
}

/**
 * SSML Validation Warning Interface
 * 
 * Represents a validation warning that indicates potential issues but doesn't
 * prevent processing. Provides information about best practices, deprecated
 * features, or suboptimal SSML usage patterns for quality improvement.
 * 
 * @category SSML Validation
 * 
 * @example Warning analysis and improvement suggestions
 * ```typescript
 * import { SsmlValidationWarning } from 'cloud-text-to-speech';
 * 
 * const analyzeWarnings = (warnings: SsmlValidationWarning[]) => {
 *   const warningCategories = warnings.reduce((categories, warning) => {
 *     const category = warning.category || 'general';
 *     categories[category] = categories[category] || [];
 *     categories[category].push(warning);
 *     return categories;
 *   }, {} as Record<string, SsmlValidationWarning[]>);
 *   
 *   Object.entries(warningCategories).forEach(([category, categoryWarnings]) => {
 *     console.log(`${category.toUpperCase()} Warnings (${categoryWarnings.length}):`);
 *     categoryWarnings.forEach(warning => {
 *       console.log(`  - ${warning.message}`);
 *       if (warning.suggestion) {
 *         console.log(`    Suggestion: ${warning.suggestion}`);
 *       }
 *     });
 *   });
 * };
 * ```
 */
export interface SsmlValidationWarning {
  /** Warning code for categorization */
  code: string;
  
  /** Human-readable warning message */
  message: string;
  
  /** Category of the warning (e.g., 'performance', 'compatibility') */
  category?: string;
  
  /** Line number where warning applies (if available) */
  line?: number;
  
  /** Column number where warning applies (if available) */
  column?: number;
  
  /** SSML element related to the warning */
  elementName?: string;
  
  /** Suggested improvement or best practice */
  suggestion?: string;
}

/**
 * SSML Content Splitting Configuration Options
 * 
 * Defines advanced options for intelligent SSML content splitting including
 * semantic boundary preservation, overlap strategies, and size constraints.
 * Enables fine-tuned control over content chunking for optimal TTS processing
 * across different service providers and content types.
 * 
 * @category SSML Configuration
 * 
 * @example Basic splitting configuration
 * ```typescript
 * import { SsmlSplittingOptions } from 'cloud-text-to-speech';
 * 
 * const basicSplitting: SsmlSplittingOptions = {
 *   respectSentenceBoundaries: true,
 *   minChunkSize: 100,
 *   maxChunkSize: 5000
 * };
 * ```
 * 
 * @example Advanced splitting with semantic preservation
 * ```typescript
 * const semanticSplitting: SsmlSplittingOptions = {
 *   respectSentenceBoundaries: true,
 *   respectParagraphBoundaries: true,
 *   preferredBreakpoints: [
 *     '</p>',      // Paragraph endings (highest priority)
 *     '</s>',      // Sentence endings
 *     '<break',    // SSML breaks
 *     '. ',        // Natural sentence endings
 *     '! ',        // Exclamations
 *     '? '         // Questions
 *   ],
 *   minChunkSize: 500,
 *   maxChunkSize: 4000,
 *   overlap: 50,
 *   overlapStrategy: 'word'
 * };
 * ```
 * 
 * @example Provider-optimized splitting
 * ```typescript
 * const googleSplitting: SsmlSplittingOptions = {
 *   respectSentenceBoundaries: true,
 *   preferredBreakpoints: ['</p>', '</s>', '<break', '<mark'],
 *   minChunkSize: 200,
 *   maxChunkSize: 5000,
 *   preserveElements: ['audio', 'mark', 'break'],
 *   avoidSplittingElements: ['emphasis', 'prosody']
 * };
 * ```
 */
export interface SsmlSplittingOptions {
  /** Whether to respect sentence boundaries when splitting */
  respectSentenceBoundaries?: boolean;
  
  /** Whether to respect paragraph boundaries when splitting */
  respectParagraphBoundaries?: boolean;
  
  /** Ordered list of preferred break points (highest priority first) */
  preferredBreakpoints?: string[];
  
  /** Minimum allowed chunk size in characters */
  minChunkSize?: number;
  
  /** Maximum allowed chunk size in characters */
  maxChunkSize?: number;
  
  /** Number of characters to overlap between chunks */
  overlap?: number;
  
  /** Strategy for overlap calculation ('character' | 'word' | 'sentence') */
  overlapStrategy?: 'character' | 'word' | 'sentence';
  
  /** SSML elements that should be preserved intact */
  preserveElements?: string[];
  
  /** SSML elements that should not be split across chunks */
  avoidSplittingElements?: string[];
  
  /** Custom boundary detection function */
  customBoundaryDetector?: (content: string, position: number) => number;
}

/**
 * Comprehensive SSML Processing Options Interface
 * 
 * Main configuration interface that combines all SSML processing options including
 * validation, splitting, element allowlists, and provider-specific settings.
 * Provides a unified configuration structure for all SSML processing operations
 * across the text-to-speech processing pipeline.
 * 
 * @category SSML Configuration
 * 
 * @example Complete SSML configuration
 * ```typescript
 * import { SsmlOptions } from 'cloud-text-to-speech';
 * 
 * const completeOptions: SsmlOptions = {
 *   // Basic settings
 *   splitLimit: 5000,
 *   preserveElements: true,
 *   
 *   // Element allowlist
 *   allowedElements: {
 *     speak: ['version', 'xmlns'],
 *     voice: ['name'],
 *     prosody: ['rate', 'pitch', 'volume'],
 *     break: ['time', 'strength'],
 *     emphasis: ['level'],
 *     audio: ['src'],
 *     mark: ['name']
 *   },
 *   
 *   // Validation configuration
 *   validation: {
 *     enabled: true,
 *     mode: 'warn',
 *     validateAttributes: true,
 *     validateAttributeValues: true,
 *     allowUnknownElements: false
 *   },
 *   
 *   // Splitting configuration
 *   splitting: {
 *     respectSentenceBoundaries: true,
 *     preferredBreakpoints: ['</p>', '</s>', '<break'],
 *     minChunkSize: 500,
 *     overlap: 30
 *   }
 * };
 * ```
 * 
 * @example Provider-specific configurations
 * ```typescript
 * const createProviderOptions = (provider: 'google' | 'microsoft' | 'amazon'): SsmlOptions => {
 *   const baseOptions: SsmlOptions = {
 *     preserveElements: true,
 *     validation: {
 *       enabled: true,
 *       mode: 'warn',
 *       validateAttributes: true
 *     }
 *   };
 *   
 *   switch (provider) {
 *     case 'google':
 *       return {
 *         ...baseOptions,
 *         splitLimit: 5000,
 *         allowedElements: googleAllowedElements,
 *         splitting: {
 *           respectSentenceBoundaries: true,
 *           preferredBreakpoints: ['</p>', '<mark', '<break']
 *         }
 *       };
 *       
 *     case 'microsoft':
 *       return {
 *         ...baseOptions,
 *         splitLimit: 8000,
 *         allowedElements: microsoftAllowedElements,
 *         splitting: {
 *           respectSentenceBoundaries: true,
 *           preferredBreakpoints: ['</p>', '</s>', '<mstts:silence']
 *         }
 *       };
 *       
 *     case 'amazon':
 *       return {
 *         ...baseOptions,
 *         splitLimit: 6000,
 *         allowedElements: amazonAllowedElements,
 *         splitting: {
 *           respectSentenceBoundaries: true,
 *           preferredBreakpoints: ['</p>', '</s>', '<amazon:domain']
 *         }
 *       };
 *   }
 * };
 * ```
 * 
 * @example Dynamic configuration based on content
 * ```typescript
 * const createContentAwareOptions = (ssml: string): SsmlOptions => {
 *   const contentLength = ssml.length;
 *   const hasAudio = ssml.includes('<audio');
 *   const hasComplexMarkup = ssml.includes('<prosody') || ssml.includes('<voice');
 *   
 *   return {
 *     splitLimit: contentLength > 10000 ? 3000 : 5000,
 *     preserveElements: hasComplexMarkup,
 *     allowedElements: getAppropriateElements(ssml),
 *     validation: {
 *       enabled: true,
 *       mode: hasAudio ? 'strict' : 'warn',
 *       validateAttributes: hasComplexMarkup,
 *       validateAttributeValues: true
 *     },
 *     splitting: {
 *       respectSentenceBoundaries: true,
 *       minChunkSize: hasAudio ? 1000 : 200,
 *       preferredBreakpoints: hasAudio 
 *         ? ['</audio>', '</p>', '</s>'] 
 *         : ['</p>', '</s>', '<break']
 *     }
 *   };
 * };
 * ```
 */
export class SsmlOptions {
  /** Maximum character limit for split chunks */
  splitLimit?: number;
  
  /** Whether to preserve SSML element structure during processing */
  preserveElements?: boolean;
  
  /** Mapping of allowed SSML elements to their permitted attributes */
  allowedElements?: { [key: string]: string[] };
  
  /** Validation configuration options */
  validation: SsmlValidationOptions;
  
  /** Content splitting configuration options */
  splitting?: SsmlSplittingOptions;
  
  /** Provider-specific processing options */
  providerOptions?: {
    /** Provider identifier */
    provider?: 'google' | 'microsoft' | 'amazon';
    
    /** Provider-specific feature flags */
    features?: {
      /** Support for neural voices */
      neuralVoices?: boolean;
      
      /** Support for audio elements */
      audioElements?: boolean;
      
      /** Support for custom pronunciations */
      customPronunciations?: boolean;
      
      /** Support for emotional expressions */
      emotionalExpressions?: boolean;
    };
    
    /** Provider-specific rate limits */
    rateLimits?: {
      /** Requests per second */
      requestsPerSecond?: number;
      
      /** Characters per minute */
      charactersPerMinute?: number;
      
      /** Concurrent requests */
      concurrentRequests?: number;
    };
  };
  
  /** Performance optimization options */
  performance?: {
    /** Enable caching of processed SSML */
    enableCaching?: boolean;
    
    /** Cache TTL in seconds */
    cacheTtl?: number;
    
    /** Enable parallel processing */
    enableParallelProcessing?: boolean;
    
    /** Maximum concurrent operations */
    maxConcurrency?: number;
  };
  
  /** Debug and monitoring options */
  debug?: {
    /** Enable detailed logging */
    enableLogging?: boolean;
    
    /** Log level */
    logLevel?: 'error' | 'warn' | 'info' | 'debug';
    
    /** Enable performance metrics */
    enableMetrics?: boolean;
    
    /** Custom logger function */
    logger?: (level: string, message: string, data?: unknown) => void;
  };

  constructor(
    defaultOptions: Partial<SsmlOptions> & { validation: SsmlValidationOptions },
    overrideOptions?: Partial<SsmlOptions>
  ) {
    this.splitLimit = overrideOptions?.splitLimit ?? defaultOptions.splitLimit;
    this.preserveElements = overrideOptions?.preserveElements ?? defaultOptions.preserveElements;
    this.allowedElements = overrideOptions?.allowedElements ?? defaultOptions.allowedElements;
    this.validation = { ...defaultOptions.validation, ...overrideOptions?.validation };
    this.splitting = overrideOptions?.splitting ?? defaultOptions.splitting;
    this.providerOptions = overrideOptions?.providerOptions ?? defaultOptions.providerOptions;
    this.performance = overrideOptions?.performance ?? defaultOptions.performance;
    this.debug = overrideOptions?.debug ?? defaultOptions.debug;
  }
}
