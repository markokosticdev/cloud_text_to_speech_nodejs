/**
 * @fileoverview Cloud Text-to-Speech Library Main Entry Point
 * 
 * This module serves as the main entry point for the Cloud Text-to-Speech library,
 * providing access to universal APIs and provider-specific implementations for
 * Google Cloud Text-to-Speech, Microsoft Azure Cognitive Services Speech,
 * and Amazon Polly.
 * 
 * The library supports both provider-specific and universal implementations,
 * allowing developers to choose between maximum control or simplified cross-provider
 * compatibility.
 * 
 * @example Basic Universal Usage
 * ```typescript
 * import { TtsUniversal } from 'cloud-text-to-speech';
 * 
 * // Initialize with a provider
 * TtsUniversal.init({
 *   provider: 'google',
 *   googleParams: { apiKey: 'your-api-key' },
 *   microsoftParams: { subscriptionKey: 'your-key', region: 'us-east-1' },
 *   amazonParams: { accessKeyId: 'your-key', secretAccessKey: 'your-secret', region: 'us-east-1' },
 *   withLogs: true
 * });
 * 
 * // Convert text to speech
 * const result = await TtsUniversal.convertTts({
 *   text: 'Hello world',
 *   voice: { name: 'en-US-Standard-A' }
 * });
 * 
 * console.log(`Generated ${result.audio.length} bytes of audio`);
 * ```
 * 
 * @example Provider-Specific Usage
 * ```typescript
 * import { TtsGoogle, InitParamsGoogle } from 'cloud-text-to-speech';
 * 
 * // Initialize Google-specific implementation
 * const config: InitParamsGoogle = { apiKey: 'your-google-api-key' };
 * TtsGoogle.init(config);
 * 
 * // Use Google-specific features
 * const result = await TtsGoogle.convertTts({
 *   text: 'Hello world',
 *   voice: { name: 'en-US-Standard-A', languageCode: 'en-US' },
 *   audioConfig: {
 *     audioEncoding: 'MP3',
 *     speakingRate: 1.2,
 *     pitch: 2.0
 *   }
 * });
 * ```
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link TtsUniversal} for universal cross-provider API
 */

// Universal API and Common Utilities
export * from './common/tts/tts_providers.js';
export * from './common/locale/locale_model.js';
export * from './common/http/http_proxy_base.js';

// Error Handling and Utilities
export * from './common/errors/tts_error.js';
export * from './common/errors/retry_handler.js';
export * from './common/http/http_rate_limiter.js';
export * from './common/http/http_interceptors.js';
export * from './common/cache/cache_manager.js';

// Google Cloud Text-to-Speech API
export * from './google/common/common.js';
export * from './google/voices/voices.js';
export * from './google/convert/audio/audio.js';
export * from './google/convert/convert.js';
export * from './google/tts/tts.js';

// Microsoft Azure Cognitive Services Speech API
export * from './microsoft/common/common.js';
export * from './microsoft/voices/voices.js';
export * from './microsoft/convert/audio/audio.js';
export * from './microsoft/convert/convert.js';
export * from './microsoft/tts/tts.js';

// Amazon Polly Text-to-Speech API
export * from './amazon/common/common.js';
export * from './amazon/voices/voices.js';
export * from './amazon/convert/audio/audio.js';
export * from './amazon/convert/convert.js';
export * from './amazon/tts/tts.js';

// Universal Cross-Provider API
export * from './universal/voices/voices.js';
export * from './universal/convert/audio/audio.js';
export * from './universal/convert/convert.js';
export * from './universal/tts/tts.js';