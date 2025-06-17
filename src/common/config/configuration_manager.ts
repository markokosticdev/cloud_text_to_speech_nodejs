import { InitParamsGoogle } from '../../google/common/init.js';
import { InitParamsMicrosoft } from '../../microsoft/common/init.js';
import { InitParamsAmazon } from '../../amazon/common/init.js';

export interface UniversalConfig {
  google?: InitParamsGoogle;
  microsoft?: InitParamsMicrosoft;
  amazon?: InitParamsAmazon;
  withLogs?: boolean;
  defaultProvider?: string;
}

export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ConfigurationManager {
  private constructor() {}

  /**
   * Load configuration from environment variables
   * Follows 12-factor app principles
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
   * Load configuration from JSON file
   * @param filePath - Path to configuration file
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
   * Validate configuration object
   * @param config - Configuration to validate
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
   * Merge multiple configuration sources
   * Priority: explicit config > file config > environment config
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