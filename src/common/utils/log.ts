/**
 * @fileoverview Simple logging utility for TTS library with enable/disable functionality.
 * Provides centralized logging control for debugging and development purposes with
 * optional debug output that can be toggled at runtime for production environments.
 * 
 * @author Marko Kostich
 * @since 1.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * 
 * @example Basic logging usage
 * ```typescript
 * import { Log } from './log.js';
 * 
 * // Enable logging for development
 * Log.enable();
 * 
 * // Log debug messages
 * Log.d('Voice synthesis completed successfully');
 * Log.d('API request took 245ms', 'PERFORMANCE');
 * Log.d('Cache hit for voice data', 'CACHE');
 * 
 * // Disable logging for production
 * Log.disable();
 * Log.d('This will not be printed'); // Silent in production
 * ```
 * 
 * @example Conditional logging in applications
 * ```typescript
 * // Enable logging based on environment
 * if (process.env.NODE_ENV === 'development') {
 *   Log.enable();
 * }
 * 
 * // Use throughout the application
 * Log.d('TTS initialization started');
 * Log.d(`Processing text: "${inputText}"`, 'TTS');
 * Log.d(`Selected voice: ${voice.name}`, 'VOICE');
 * Log.d('Audio synthesis complete', 'SUCCESS');
 * ```
 * 
 * @example Logging with tags for categorization
 * ```typescript
 * // Different categories of logs
 * Log.d('Google TTS API call initiated', 'GOOGLE');
 * Log.d('Microsoft Azure response received', 'MICROSOFT');
 * Log.d('Amazon Polly authentication successful', 'AMAZON');
 * Log.d('Voice cache miss, fetching from API', 'CACHE');
 * Log.d('SSML validation completed', 'SSML');
 * ```
 */

/**
 * Simple logging utility class providing conditional debug output for the TTS library.
 * Features enable/disable functionality for production environments and optional
 * tagging for message categorization and filtering during development.
 * 
 * @category Utilities
 * 
 * @example Development logging setup
 * ```typescript
 * // Enable logging during development
 * Log.enable();
 * 
 * // Check if logging is enabled
 * if (Log.isEnabled) {
 *   console.log('Debug logging is active');
 * }
 * 
 * // Log various operations
 * Log.d('TTS library initialized');
 * Log.d('Voice loading started', 'INIT');
 * Log.d('Configuration loaded successfully', 'CONFIG');
 * ```
 * 
 * @example Production logging control
 * ```typescript
 * // Disable logging in production
 * if (process.env.NODE_ENV === 'production') {
 *   Log.disable();
 * }
 * 
 * // Logs will be silent in production
 * Log.d('This debug message will not appear in production');
 * ```
 * 
 * @example Tagged logging for different modules
 * ```typescript
 * // Voice management logs
 * Log.d('Voice filtering applied', 'VOICES');
 * Log.d('Voice selection completed', 'VOICES');
 * 
 * // Audio processing logs
 * Log.d('Audio format conversion started', 'AUDIO');
 * Log.d('Audio buffer size: 1024 bytes', 'AUDIO');
 * 
 * // API communication logs
 * Log.d('HTTP request sent to provider', 'API');
 * Log.d('Response received in 150ms', 'API');
 * ```
 */
export class Log {
  /** Internal flag to control logging output */
  private static _enabled: boolean = false;
  /** Package identifier prefix for all log messages */
  private static _package: string = '[cloud_text_to_speech]';

  /**
   * Gets the current logging enabled state.
   * 
   * @returns True if logging is enabled, false otherwise
   * 
   * @example Checking logging state
   * ```typescript
   * // Conditional expensive debug operations
   * if (Log.isEnabled) {
   *   const debugData = performExpensiveDebugCalculation();
   *   Log.d(`Debug data: ${JSON.stringify(debugData)}`, 'DEBUG');
   * }
   * 
   * // Avoid string concatenation when logging is disabled
   * if (Log.isEnabled) {
   *   Log.d(`Voice processing took ${endTime - startTime}ms`);
   * }
   * ```
   * 
   * @example Conditional logging setup
   * ```typescript
   * // Only set up debug listeners if logging is enabled
   * if (Log.isEnabled) {
   *   setupDetailedEventListeners();
   * }
   * ```
   */
  static get isEnabled(): boolean {
    return Log._enabled;
  }

  /**
   * Enables debug logging output. All subsequent calls to Log.d() will produce console output.
   * Useful for development environments and debugging scenarios.
   * 
   * @example Development environment setup
   * ```typescript
   * // Enable logging in development
   * if (process.env.NODE_ENV === 'development') {
   *   Log.enable();
   *   Log.d('Development logging enabled');
   * }
   * ```
   * 
   * @example Dynamic logging control
   * ```typescript
   * // Enable logging based on user preference or debug flag
   * if (userPreferences.debugMode || process.argv.includes('--debug')) {
   *   Log.enable();
   *   Log.d('Debug mode activated by user preference');
   * }
   * ```
   * 
   * @example Temporary debugging
   * ```typescript
   * // Temporarily enable logging for troubleshooting
   * Log.enable();
   * await performComplexOperation();
   * Log.disable(); // Re-disable after debugging
   * ```
   */
  static enable(): void {
    Log._enabled = true;
  }

  /**
   * Disables debug logging output. All subsequent calls to Log.d() will be silent.
   * Recommended for production environments to avoid console clutter and improve performance.
   * 
   * @example Production environment setup
   * ```typescript
   * // Disable logging in production
   * if (process.env.NODE_ENV === 'production') {
   *   Log.disable();
   * }
   * ```
   * 
   * @example Performance-critical sections
   * ```typescript
   * // Disable logging during performance-critical operations
   * Log.disable();
   * await performHighFrequencyOperation();
   * Log.enable(); // Re-enable after performance section
   * ```
   * 
   * @example Security considerations
   * ```typescript
   * // Disable logging to prevent sensitive data exposure
   * if (handlingSensitiveData) {
   *   Log.disable();
   * }
   * ```
   */
  static disable(): void {
    Log._enabled = false;
  }

  /**
   * Outputs a debug message to the console if logging is enabled.
   * Messages are prefixed with the package identifier and optional tag for categorization.
   * 
   * @param message - The debug message to log
   * @param tag - Optional tag for message categorization (e.g., 'API', 'CACHE', 'VOICE')
   * 
   * @example Basic debug logging
   * ```typescript
   * // Simple debug messages
   * Log.d('TTS initialization completed');
   * Log.d('Voice synthesis started');
   * Log.d('Audio processing finished');
   * ```
   * 
   * @example Tagged debug messages
   * ```typescript
   * // Categorized debug messages
   * Log.d('API request initiated', 'HTTP');
   * Log.d('Cache hit for voice data', 'CACHE');
   * Log.d('Voice selection algorithm completed', 'ALGORITHM');
   * Log.d('Audio format conversion successful', 'AUDIO');
   * ```
   * 
   * @example Performance logging
   * ```typescript
   * // Performance monitoring
   * const startTime = Date.now();
   * await performOperation();
   * const duration = Date.now() - startTime;
   * Log.d(`Operation completed in ${duration}ms`, 'PERFORMANCE');
   * ```
   * 
   * @example Error context logging
   * ```typescript
   * try {
   *   await synthesizeText(text);
   * } catch (error) {
   *   Log.d(`Synthesis failed: ${error.message}`, 'ERROR');
   *   Log.d(`Input text length: ${text.length}`, 'ERROR');
   *   Log.d(`Voice configuration: ${JSON.stringify(voiceConfig)}`, 'ERROR');
   * }
   * ```
   * 
   * @example State tracking
   * ```typescript
   * // Track application state changes
   * Log.d('Application started', 'STATE');
   * Log.d('Voice providers initialized', 'STATE');
   * Log.d('Configuration loaded', 'STATE');
   * Log.d('Ready for TTS operations', 'STATE');
   * ```
   */
  static d(message: string, tag?: string): void {
    if (Log.isEnabled) {
      console.log(`${Log._package} -> ${tag || ''} : ${message}`);
    }
  }
}
