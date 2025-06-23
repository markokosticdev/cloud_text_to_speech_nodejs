/**
 * @fileoverview Configuration Management System for Cloud Text-to-Speech Services
 * 
 * This module provides comprehensive configuration management for multi-provider TTS operations
 * across Google Cloud TTS, Microsoft Azure TTS, and Amazon Polly. It follows 12-factor app
 * principles with support for environment variables, JSON files, and explicit configuration
 * with defined precedence hierarchy and comprehensive validation.
 * 
 * The configuration system enables flexible deployment patterns, supports multiple configuration
 * sources with proper precedence, and provides detailed validation with both errors and warnings
 * for production-ready TTS service deployment.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link UniversalConfig} for configuration structure
 * @see {@link ConfigValidationResult} for validation system
 * 
 * @example Environment-based configuration
 * ```typescript
 * import { ConfigurationManager } from './configuration_manager.js';
 * 
 * // Set environment variables
 * process.env.GOOGLE_TTS_API_KEY = 'your-google-api-key';
 * process.env.AZURE_TTS_SUBSCRIPTION_KEY = 'your-azure-key';
 * process.env.AZURE_TTS_REGION = 'eastus';
 * process.env.TTS_WITH_LOGS = 'true';
 * 
 * // Load configuration from environment
 * const config = ConfigurationManager.loadFromEnvironment();
 * 
 * // Validate before use
 * const validation = ConfigurationManager.validate(config);
 * if (!validation.isValid) {
 *   throw new Error(`Configuration errors: ${validation.errors.join(', ')}`);
 * }
 * 
 * console.log('Configuration loaded and validated successfully');
 * ```
 * 
 * @example Multi-source configuration with precedence
 * ```typescript
 * async function initializeConfiguration(): Promise<UniversalConfig> {
 *   // 1. Load base configuration from environment
 *   const envConfig = ConfigurationManager.loadFromEnvironment();
 *   
 *   // 2. Load file-based overrides
 *   let fileConfig: UniversalConfig | undefined;
 *   try {
 *     fileConfig = await ConfigurationManager.loadFromFile('./config.json');
 *   } catch (error) {
 *     console.warn('No config file found, using environment only');
 *   }
 *   
 *   // 3. Apply runtime overrides
 *   const explicitConfig: UniversalConfig = {
 *     withLogs: process.env.NODE_ENV === 'development',
 *     defaultProvider: process.env.FORCE_PROVIDER || undefined
 *   };
 *   
 *   // 4. Merge with proper precedence (explicit > file > environment)
 *   const finalConfig = ConfigurationManager.merge(envConfig, fileConfig, explicitConfig);
 *   
 *   // 5. Validate merged configuration
 *   const validation = ConfigurationManager.validate(finalConfig);
 *   if (!validation.isValid) {
 *     throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
 *   }
 *   
 *   // 6. Log warnings but continue
 *   validation.warnings.forEach(warning => {
 *     console.warn(`Configuration Warning: ${warning}`);
 *   });
 *   
 *   return finalConfig;
 * }
 * ```
 * 
 * @example Production deployment configuration
 * ```typescript
 * // config.json for production
 * const productionConfig = {
 *   "google": {
 *     "apiKey": process.env.GOOGLE_TTS_API_KEY
 *   },
 *   "microsoft": {
 *     "subscriptionKey": process.env.AZURE_TTS_SUBSCRIPTION_KEY,
 *     "region": process.env.AZURE_TTS_REGION
 *   },
 *   "amazon": {
 *     "keyId": process.env.AWS_TTS_KEY_ID,
 *     "accessKey": process.env.AWS_TTS_ACCESS_KEY,
 *     "region": process.env.AWS_TTS_REGION
 *   },
 *   "withLogs": false,
 *   "defaultProvider": "combine"
 * };
 * 
 * // Validation and deployment
 * const validation = ConfigurationManager.validate(productionConfig);
 * if (!validation.isValid) {
 *   console.error('❌ Production configuration invalid:');
 *   validation.errors.forEach(error => console.error(`  - ${error}`));
 *   process.exit(1);
 * }
 * 
 * if (validation.warnings.length > 0) {
 *   console.warn('⚠️ Production configuration warnings:');
 *   validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
 * }
 * 
 * console.log('✅ Production configuration validated successfully');
 * ```
 * 
 * @example Configuration validation and error handling
 * ```typescript
 * const validateAndHandleErrors = (config: UniversalConfig): void => {
 *   const result = ConfigurationManager.validate(config);
 *   
 *   if (!result.isValid) {
 *     console.error('Configuration Errors:');
 *     result.errors.forEach((error, index) => {
 *       console.error(`  ${index + 1}. ${error}`);
 *     });
 *     
 *     throw new Error('Invalid configuration - cannot start service');
 *   }
 *   
 *   if (result.warnings.length > 0) {
 *     console.warn('Configuration Warnings:');
 *     result.warnings.forEach((warning, index) => {
 *       console.warn(`  ${index + 1}. ${warning}`);
 *     });
 *   }
 *   
 *   // Log successful validation
 *   const providers = [];
 *   if (config.google) providers.push('Google Cloud TTS');
 *   if (config.microsoft) providers.push('Microsoft Azure TTS');
 *   if (config.amazon) providers.push('Amazon Polly');
 *   
 *   console.log(`✅ Configuration valid with providers: ${providers.join(', ')}`);
 *   console.log(`📋 Default provider: ${config.defaultProvider}`);
 *   console.log(`📝 Logging enabled: ${config.withLogs}`);
 * };
 * ```
 */

import { InitParamsGoogle } from '../../google/common/init.js';
import { InitParamsMicrosoft } from '../../microsoft/common/init.js';
import { InitParamsAmazon } from '../../amazon/common/init.js';

/**
 * Universal configuration interface for all supported TTS providers
 * 
 * This interface defines the configuration structure for initializing multiple
 * Text-to-Speech providers including Google Cloud, Microsoft Azure, and Amazon Polly.
 * It supports provider-specific configurations and global settings.
 * 
 * @example Basic Configuration
 * ```typescript
 * const config: UniversalConfig = {
 *   google: {
 *     apiKey: 'your-google-api-key'
 *   },
 *   microsoft: {
 *     subscriptionKey: 'your-azure-key',
 *     region: 'eastus'
 *   },
 *   withLogs: true,
 *   defaultProvider: 'google'
 * };
 * ```
 * 
 * @example Environment-based Configuration
 * ```typescript
 * // Load from environment variables
 * const envConfig: UniversalConfig = ConfigurationManager.loadFromEnvironment();
 * 
 * // Merge with additional settings
 * const finalConfig = ConfigurationManager.merge(envConfig, {
 *   withLogs: false,
 *   defaultProvider: 'combine'
 * });
 * ```
 * 
 * @category Configuration
 * @since 3.0.0
 */
export interface UniversalConfig {
  /**
   * Google Cloud Text-to-Speech configuration
   * @see {@link InitParamsGoogle} for available options
   */
  google?: InitParamsGoogle;
  
  /**
   * Microsoft Azure Speech Services configuration
   * @see {@link InitParamsMicrosoft} for available options
   */
  microsoft?: InitParamsMicrosoft;
  
  /**
   * Amazon Polly Text-to-Speech configuration
   * @see {@link InitParamsAmazon} for available options
   */
  amazon?: InitParamsAmazon;
  
  /**
   * Enable detailed logging for TTS operations
   * @defaultValue true
   */
  withLogs?: boolean;
  
  /**
   * Default provider to use when multiple providers are configured
   * @remarks Valid values: 'google', 'microsoft', 'amazon', 'combine'
   * @defaultValue 'combine'
   */
  defaultProvider?: string;
}

/**
 * Result of configuration validation process
 * 
 * Provides detailed feedback about configuration validity including
 * critical errors that prevent operation and warnings about potential issues.
 * 
 * @example Handling Validation Results
 * ```typescript
 * const config: UniversalConfig = { google: { apiKey: 'test' } };
 * const validation = ConfigurationManager.validate(config);
 * 
 * if (!validation.isValid) {
 *   console.error('Configuration errors:', validation.errors);
 *   throw new Error('Invalid configuration');
 * }
 * 
 * if (validation.warnings.length > 0) {
 *   console.warn('Configuration warnings:', validation.warnings);
 * }
 * ```
 * 
 * @category Configuration
 * @since 3.0.0
 */
export interface ConfigValidationResult {
  /**
   * Whether the configuration is valid and can be used
   * @readonly
   */
  isValid: boolean;
  
  /**
   * Critical errors that prevent the configuration from being used
   * @readonly
   */
  errors: string[];
  
  /**
   * Non-critical warnings about potential configuration issues
   * @readonly
   */
  warnings: string[];
}

/**
 * Centralized configuration management for Text-to-Speech services
 * 
 * This class provides comprehensive configuration management following 12-factor app
 * principles, supporting multiple configuration sources including environment variables,
 * JSON files, and explicit configuration objects. It handles validation, merging,
 * and provider-specific configuration requirements.
 * 
 * The ConfigurationManager enables flexible deployment patterns by supporting
 * configuration precedence: explicit config > file config > environment config.
 * 
 * @example Environment-based Configuration
 * ```typescript
 * // Load configuration from environment variables
 * const envConfig = ConfigurationManager.loadFromEnvironment();
 * 
 * // Validate the configuration
 * const validation = ConfigurationManager.validate(envConfig);
 * if (!validation.isValid) {
 *   throw new Error(`Configuration error: ${validation.errors.join(', ')}`);
 * }
 * 
 * console.log('Configuration loaded successfully');
 * ```
 * 
 * @example File-based Configuration
 * ```typescript
 * import { ConfigurationManager } from './configuration_manager.js';
 * 
 * try {
 *   // Load from JSON file
 *   const fileConfig = await ConfigurationManager.loadFromFile('./config.json');
 *   
 *   // Merge with environment variables
 *   const envConfig = ConfigurationManager.loadFromEnvironment();
 *   const finalConfig = ConfigurationManager.merge(envConfig, fileConfig);
 *   
 *   // Validate merged configuration
 *   const result = ConfigurationManager.validate(finalConfig);
 *   if (result.isValid) {
 *     console.log('Configuration ready for use');
 *   }
 * } catch (error) {
 *   console.error('Failed to load configuration:', error.message);
 * }
 * ```
 * 
 * @example Multi-source Configuration with Precedence
 * ```typescript
 * // Define explicit overrides
 * const explicitConfig: UniversalConfig = {
 *   withLogs: false,
 *   defaultProvider: 'google'
 * };
 * 
 * // Load from all sources with proper precedence
 * const envConfig = ConfigurationManager.loadFromEnvironment();
 * const fileConfig = await ConfigurationManager.loadFromFile('./config.json');
 * const finalConfig = ConfigurationManager.merge(envConfig, fileConfig, explicitConfig);
 * 
 * // Explicit config takes highest precedence
 * console.log(finalConfig.withLogs); // false (from explicit)
 * console.log(finalConfig.google?.apiKey); // from file or env
 * ```
 * 
 * @category Configuration
 * @since 3.0.0
 * @see {@link UniversalConfig} for configuration structure
 * @see {@link ConfigValidationResult} for validation results
 */
export class ConfigurationManager {
  private constructor() {}

  /**
   * Load configuration from environment variables following 12-factor app principles
   * 
   * Automatically detects and loads TTS provider configurations from standard
   * environment variables. This method enables cloud-native deployment patterns
   * where sensitive credentials are managed through environment variables rather
   * than configuration files.
   * 
   * @returns Configuration object populated from environment variables
   * 
   * @example Basic Environment Loading
   * ```typescript
   * // Set environment variables (typically in .env file or deployment config)
   * process.env.GOOGLE_TTS_API_KEY = 'your-google-api-key';
   * process.env.AZURE_TTS_SUBSCRIPTION_KEY = 'your-azure-key';
   * process.env.AZURE_TTS_REGION = 'eastus';
   * process.env.TTS_WITH_LOGS = 'true';
   * process.env.TTS_DEFAULT_PROVIDER = 'google';
   * 
   * // Load configuration
   * const config = ConfigurationManager.loadFromEnvironment();
   * console.log(config.google?.apiKey); // 'your-google-api-key'
   * console.log(config.withLogs); // true
   * ```
   * 
   * @example Environment Variables Reference
   * ```typescript
   * // Supported environment variables:
   * // Google Cloud TTS
   * // GOOGLE_TTS_API_KEY - Google Cloud API key
   * 
   * // Microsoft Azure Speech
   * // AZURE_TTS_SUBSCRIPTION_KEY - Azure subscription key
   * // AZURE_TTS_REGION - Azure region (e.g., 'eastus')
   * 
   * // Amazon Polly
   * // AWS_TTS_KEY_ID - AWS access key ID
   * // AWS_TTS_ACCESS_KEY - AWS secret access key
   * // AWS_TTS_REGION - AWS region (e.g., 'us-east-1')
   * 
   * // Global settings
   * // TTS_WITH_LOGS - Enable logging ('true'/'false')
   * // TTS_DEFAULT_PROVIDER - Default provider ('google'/'microsoft'/'amazon'/'combine')
   * 
   * const config = ConfigurationManager.loadFromEnvironment();
   * ```
   * 
   * @static
   * @category Configuration
   * @since 3.0.0
   */
  static loadFromEnvironment(): UniversalConfig {
    const config: UniversalConfig = {};

    // Google Configuration
    if (process.env.GOOGLE_TTS_API_KEY) {
      config.google = {
        apiKey: process.env.GOOGLE_TTS_API_KEY,
      };
    }

    // Microsoft Configuration
    if (process.env.AZURE_TTS_SUBSCRIPTION_KEY && process.env.AZURE_TTS_REGION) {
      config.microsoft = {
        subscriptionKey: process.env.AZURE_TTS_SUBSCRIPTION_KEY,
        region: process.env.AZURE_TTS_REGION,
      };
    }

    // Amazon Configuration
    if (process.env.AWS_TTS_KEY_ID && process.env.AWS_TTS_ACCESS_KEY && process.env.AWS_TTS_REGION) {
      config.amazon = {
        keyId: process.env.AWS_TTS_KEY_ID,
        accessKey: process.env.AWS_TTS_ACCESS_KEY,
        region: process.env.AWS_TTS_REGION,
      };
    }

    // General Configuration
    config.withLogs = process.env.TTS_WITH_LOGS !== 'false';
    config.defaultProvider = process.env.TTS_DEFAULT_PROVIDER || 'combine';

    return config;
  }

  /**
   * Load configuration from JSON file with error handling
   * 
   * Reads and parses a JSON configuration file, providing detailed error
   * information if the file cannot be read or parsed. This method supports
   * both relative and absolute file paths.
   * 
   * @param filePath - Path to configuration file (relative or absolute)
   * @returns Promise resolving to parsed configuration object
   * 
   * @throws {Error} When file cannot be read, parsed, or doesn't exist
   * 
   * @example Loading from JSON File
   * ```typescript
   * // config.json file structure:
   * // {
   * //   "google": { "apiKey": "your-api-key" },
   * //   "microsoft": { 
   * //     "subscriptionKey": "your-key",
   * //     "region": "eastus"
   * //   },
   * //   "withLogs": true,
   * //   "defaultProvider": "google"
   * // }
   * 
   * try {
   *   const config = await ConfigurationManager.loadFromFile('./config.json');
   *   console.log('Configuration loaded from file:', config);
   * } catch (error) {
   *   console.error('Failed to load config file:', error.message);
   * }
   * ```
   * 
   * @example Error Handling
   * ```typescript
   * try {
   *   const config = await ConfigurationManager.loadFromFile('./nonexistent.json');
   * } catch (error) {
   *   if (error.message.includes('ENOENT')) {
   *     console.error('Configuration file not found');
   *   } else if (error.message.includes('JSON')) {
   *     console.error('Invalid JSON in configuration file');
   *   } else {
   *     console.error('Unexpected error loading configuration');
   *   }
   * }
   * ```
   * 
   * @static
   * @category Configuration
   * @since 3.0.0
   */
  static async loadFromFile(filePath: string): Promise<UniversalConfig> {
    try {
      const fs = await import('fs/promises');
      const content = await fs.readFile(filePath, 'utf-8');
      const config = JSON.parse(content) as UniversalConfig;
      
      return config;
    } catch (error) {
      throw new Error(`Failed to load configuration from ${filePath}: ${error.message}`);
    }
  }

  /**
   * Validate configuration object with comprehensive error reporting
   * 
   * Performs thorough validation of configuration including provider-specific
   * requirements, credential format validation, and cross-provider compatibility
   * checks. Returns detailed feedback with both critical errors and warnings.
   * 
   * @param config - Configuration object to validate
   * @returns Validation result with errors, warnings, and validity status
   * 
   * @example Basic Validation
   * ```typescript
   * const config: UniversalConfig = {
   *   google: { apiKey: 'test-key' },
   *   withLogs: true,
   *   defaultProvider: 'google'
   * };
   * 
   * const result = ConfigurationManager.validate(config);
   * if (result.isValid) {
   *   console.log('Configuration is valid');
   * } else {
   *   console.error('Validation errors:', result.errors);
   * }
   * 
   * if (result.warnings.length > 0) {
   *   console.warn('Validation warnings:', result.warnings);
   * }
   * ```
   * 
   * @example Handling Invalid Configuration
   * ```typescript
   * const invalidConfig: UniversalConfig = {
   *   // No providers configured
   *   withLogs: true,
   *   defaultProvider: 'invalid-provider'
   * };
   * 
   * const validation = ConfigurationManager.validate(invalidConfig);
   * // validation.isValid will be false
   * // validation.errors will contain specific issues
   * 
   * validation.errors.forEach(error => {
   *   console.error(`Configuration Error: ${error}`);
   * });
   * ```
   * 
   * @example Production Validation Pattern
   * ```typescript
   * function validateAndStart(config: UniversalConfig): void {
   *   const validation = ConfigurationManager.validate(config);
   *   
   *   if (!validation.isValid) {
   *     const errorMsg = `Invalid configuration: ${validation.errors.join(', ')}`;
   *     throw new Error(errorMsg);
   *   }
   *   
   *   // Log warnings but continue
   *   validation.warnings.forEach(warning => {
   *     console.warn(`Configuration Warning: ${warning}`);
   *   });
   *   
   *   // Proceed with valid configuration
   *   console.log('Starting TTS service with valid configuration');
   * }
   * ```
   * 
   * @static
   * @category Configuration
   * @since 3.0.0
   */
  static validate(config: UniversalConfig): ConfigValidationResult {
    const result: ConfigValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    // Check if at least one provider is configured
    const hasProvider = config.google || config.microsoft || config.amazon;
    if (!hasProvider) {
      result.errors.push('At least one TTS provider must be configured');
      result.isValid = false;
    }

    // Validate Google configuration
    if (config.google) {
      const googleValidation = ConfigurationManager._validateGoogleConfig(config.google);
      result.errors.push(...googleValidation.errors);
      result.warnings.push(...googleValidation.warnings);
      if (!googleValidation.isValid) {
        result.isValid = false;
      }
    }

    // Validate Microsoft configuration
    if (config.microsoft) {
      const microsoftValidation = ConfigurationManager._validateMicrosoftConfig(config.microsoft);
      result.errors.push(...microsoftValidation.errors);
      result.warnings.push(...microsoftValidation.warnings);
      if (!microsoftValidation.isValid) {
        result.isValid = false;
      }
    }

    // Validate Amazon configuration
    if (config.amazon) {
      const amazonValidation = ConfigurationManager._validateAmazonConfig(config.amazon);
      result.errors.push(...amazonValidation.errors);
      result.warnings.push(...amazonValidation.warnings);
      if (!amazonValidation.isValid) {
        result.isValid = false;
      }
    }

    // Validate default provider
    if (config.defaultProvider) {
      const validProviders = ['google', 'microsoft', 'amazon', 'combine'];
      if (!validProviders.includes(config.defaultProvider)) {
        result.errors.push(`Invalid default provider: ${config.defaultProvider}`);
        result.isValid = false;
      }
    }

    return result;
  }

  /**
   * Merge multiple configuration sources with defined precedence
   * 
   * Combines configuration from multiple sources following a clear precedence hierarchy:
   * explicit config (highest) > file config > environment config (lowest).
   * This enables flexible deployment patterns where base configuration comes from
   * environment variables, is overridden by file-based configuration, and finally
   * customized with explicit runtime parameters.
   * 
   * @param envConfig - Base configuration from environment variables
   * @param fileConfig - Optional configuration from file (overrides env)
   * @param explicitConfig - Optional explicit configuration (highest precedence)
   * @returns Merged configuration with proper precedence applied
   * 
   * @example Basic Configuration Merging
   * ```typescript
   * // Environment provides base configuration
   * const envConfig = ConfigurationManager.loadFromEnvironment();
   * 
   * // File overrides some settings
   * const fileConfig: UniversalConfig = {
   *   withLogs: false,
   *   defaultProvider: 'microsoft'
   * };
   * 
   * // Explicit config has highest precedence
   * const explicitConfig: UniversalConfig = {
   *   defaultProvider: 'google'
   * };
   * 
   * const merged = ConfigurationManager.merge(envConfig, fileConfig, explicitConfig);
   * // Result: defaultProvider will be 'google' (from explicit)
   * //         withLogs will be false (from file)
   * //         provider configs will come from env
   * ```
   * 
   * @example Production Deployment Pattern
   * ```typescript
   * async function initializeConfiguration(): Promise<UniversalConfig> {
   *   // 1. Load base configuration from environment
   *   const envConfig = ConfigurationManager.loadFromEnvironment();
   *   
   *   // 2. Try to load file-based overrides
   *   let fileConfig: UniversalConfig | undefined;
   *   try {
   *     fileConfig = await ConfigurationManager.loadFromFile('./config.json');
   *   } catch (error) {
   *     console.warn('No config file found, using environment only');
   *   }
   *   
   *   // 3. Apply runtime overrides based on conditions
   *   const explicitConfig: UniversalConfig = {
   *     withLogs: process.env.NODE_ENV === 'development',
   *     defaultProvider: process.env.FORCE_PROVIDER || undefined
   *   };
   *   
   *   // 4. Merge with proper precedence
   *   const finalConfig = ConfigurationManager.merge(envConfig, fileConfig, explicitConfig);
   *   
   *   // 5. Validate before use
   *   const validation = ConfigurationManager.validate(finalConfig);
   *   if (!validation.isValid) {
   *     throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
   *   }
   *   
   *   return finalConfig;
   * }
   * ```
   * 
   * @example Conditional Provider Selection
   * ```typescript
   * // Base configuration with multiple providers
   * const baseConfig = ConfigurationManager.loadFromEnvironment();
   * 
   * // Conditionally override provider based on feature flags
   * const featureFlagConfig: UniversalConfig = {
   *   defaultProvider: process.env.FEATURE_NEW_PROVIDER === 'true' ? 'amazon' : 'google'
   * };
   * 
   * const finalConfig = ConfigurationManager.merge(baseConfig, undefined, featureFlagConfig);
   * console.log(`Using provider: ${finalConfig.defaultProvider}`);
   * ```
   * 
   * @static
   * @category Configuration
   * @since 3.0.0
   */
  static merge(
    envConfig: UniversalConfig,
    fileConfig?: UniversalConfig,
    explicitConfig?: UniversalConfig,
  ): UniversalConfig {
    const merged: UniversalConfig = { ...envConfig };

    if (fileConfig) {
      merged.google = fileConfig.google || merged.google;
      merged.microsoft = fileConfig.microsoft || merged.microsoft;
      merged.amazon = fileConfig.amazon || merged.amazon;
      merged.withLogs = fileConfig.withLogs ?? merged.withLogs;
      merged.defaultProvider = fileConfig.defaultProvider || merged.defaultProvider;
    }

    if (explicitConfig) {
      merged.google = explicitConfig.google || merged.google;
      merged.microsoft = explicitConfig.microsoft || merged.microsoft;
      merged.amazon = explicitConfig.amazon || merged.amazon;
      merged.withLogs = explicitConfig.withLogs ?? merged.withLogs;
      merged.defaultProvider = explicitConfig.defaultProvider || merged.defaultProvider;
    }

    return merged;
  }

  /**
   * Validate Google Cloud Text-to-Speech configuration
   * 
   * @param config - Google configuration to validate
   * @returns Validation result with provider-specific checks
   * @internal
   */
  private static _validateGoogleConfig(config: InitParamsGoogle): ConfigValidationResult {
    const result: ConfigValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    if (!config.apiKey || config.apiKey.trim().length === 0) {
      result.errors.push('Google API key is required');
      result.isValid = false;
    }

    if (config.apiKey && config.apiKey.length < 10) {
      result.warnings.push('Google API key appears to be too short');
    }

    return result;
  }

  /**
   * Validate Microsoft Azure Speech Services configuration
   * 
   * @param config - Microsoft configuration to validate
   * @returns Validation result with provider-specific checks
   * @internal
   */
  private static _validateMicrosoftConfig(config: InitParamsMicrosoft): ConfigValidationResult {
    const result: ConfigValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    if (!config.subscriptionKey || config.subscriptionKey.trim().length === 0) {
      result.errors.push('Microsoft subscription key is required');
      result.isValid = false;
    }

    if (!config.region || config.region.trim().length === 0) {
      result.errors.push('Microsoft region is required');
      result.isValid = false;
    }

    const validRegions = ['eastus', 'westus', 'westus2', 'eastus2', 'southcentralus', 'westeurope', 'northeurope'];
    if (config.region && !validRegions.includes(config.region.toLowerCase())) {
      result.warnings.push(`Microsoft region '${config.region}' may not be valid`);
    }

    return result;
  }

  /**
   * Validate Amazon Polly Text-to-Speech configuration
   * 
   * @param config - Amazon configuration to validate
   * @returns Validation result with provider-specific checks
   * @internal
   */
  private static _validateAmazonConfig(config: InitParamsAmazon): ConfigValidationResult {
    const result: ConfigValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    if (!config.keyId || config.keyId.trim().length === 0) {
      result.errors.push('Amazon key ID is required');
      result.isValid = false;
    }

    if (!config.accessKey || config.accessKey.trim().length === 0) {
      result.errors.push('Amazon access key is required');
      result.isValid = false;
    }

    if (!config.region || config.region.trim().length === 0) {
      result.errors.push('Amazon region is required');
      result.isValid = false;
    }

    const validRegions = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-2'];
    if (config.region && !validRegions.includes(config.region)) {
      result.warnings.push(`Amazon region '${config.region}' may not be valid`);
    }

    return result;
  }
} 