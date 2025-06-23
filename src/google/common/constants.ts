/**
 * @fileoverview Google Cloud Text-to-Speech API Endpoints and Constants
 * 
 * This module defines all API endpoints, URLs, and constants used for Google Cloud
 * Text-to-Speech service integration. It provides centralized endpoint management
 * with dynamic project ID configuration and ensures consistent API endpoint usage
 * throughout the Google TTS implementation.
 * 
 * The endpoints support both basic API operations and project-specific features,
 * with proper URL construction and validation for production deployments.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link https://cloud.google.com/text-to-speech/docs/reference/rest | Google TTS REST API}
 * @see {@link https://googleapis.dev/nodejs/text-to-speech/latest | Google TTS Node.js Client}
 * 
 * @example Basic Endpoint Usage
 * ```typescript
 * import { EndpointsGoogle } from './constants.js';
 * 
 * // Get voices endpoint
 * const voicesUrl = EndpointsGoogle.voices;
 * console.log(voicesUrl); // 'https://texttospeech.googleapis.com/v1/voices'
 * 
 * // Get TTS synthesis endpoint
 * const ttsUrl = EndpointsGoogle.tts;
 * console.log(ttsUrl); // 'https://texttospeech.googleapis.com/v1/text:synthesize'
 * ```
 * 
 * @example Project-Specific Endpoints
 * ```typescript
 * import { ConfigGoogle } from './config.js';
 * import { EndpointsGoogle } from './constants.js';
 * 
 * // Configure project ID first
 * ConfigGoogle.init({
 *   apiKey: 'your-api-key',
 *   projectId: 'my-gcp-project'
 * });
 * 
 * // Access project-specific endpoints
 * const projectUrl = EndpointsGoogle.projectId;
 * const customUrl = EndpointsGoogle.customConfig;
 * 
 * console.log(projectUrl); // 'https://texttospeech.googleapis.com/v1/projects/my-gcp-project'
 * console.log(customUrl);  // 'https://texttospeech.googleapis.com/v1/projects/my-gcp-project/custom'
 * ```
 * 
 * @example HTTP Client Integration
 * ```typescript
 * import { EndpointsGoogle } from './constants.js';
 * import { ApiKeyAuthenticationHeaderGoogle } from '../auth/authentication_types.js';
 * 
 * class GoogleTtsApiClient {
 *   private auth: ApiKeyAuthenticationHeaderGoogle;
 * 
 *   constructor(apiKey: string) {
 *     this.auth = new ApiKeyAuthenticationHeaderGoogle(apiKey);
 *   }
 * 
 *   async getVoices(): Promise<any> {
 *     const response = await fetch(EndpointsGoogle.voices, {
 *       headers: {
 *         [this.auth.type]: this.auth.headerValue
 *       }
 *     });
 *     return response.json();
 *   }
 * 
 *   async synthesize(params: any): Promise<any> {
 *     const response = await fetch(EndpointsGoogle.tts, {
 *       method: 'POST',
 *       headers: {
 *         [this.auth.type]: this.auth.headerValue,
 *         'Content-Type': 'application/json'
 *       },
 *       body: JSON.stringify(params)
 *     });
 *     return response.json();
 *   }
 * }
 * ```
 * 
 * @example Dynamic Endpoint Construction
 * ```typescript
 * import { EndpointsGoogle } from './constants.js';
 * import { ConfigGoogle } from './config.js';
 * 
 * function buildCustomVoiceEndpoint(voiceId: string): string {
 *   const baseUrl = EndpointsGoogle.customConfig;
 *   return `${baseUrl}/voices/${voiceId}`;
 * }
 * 
 * function buildLocationSpecificEndpoint(location: string): string {
 *   const projectUrl = EndpointsGoogle.projectId;
 *   return `${projectUrl}/locations/${location}`;
 * }
 * 
 * // Usage
 * ConfigGoogle.init({
 *   apiKey: 'your-key',
 *   projectId: 'my-project'
 * });
 * 
 * const customVoiceUrl = buildCustomVoiceEndpoint('my-custom-voice');
 * const usEastUrl = buildLocationSpecificEndpoint('us-east1');
 * ```
 */

import { ConfigGoogle } from './config.js';

/**
 * Google Cloud Text-to-Speech API endpoints and URL management
 * 
 * This class provides centralized access to all Google TTS API endpoints,
 * including basic service endpoints and project-specific URLs. It handles
 * dynamic URL construction based on project configuration and ensures
 * consistent endpoint usage throughout the application.
 * 
 * The endpoints are constructed using the official Google Cloud TTS API v1
 * base URL and support both public endpoints and project-specific resources
 * for advanced features like custom voice models.
 * 
 * @example Basic Endpoint Access
 * ```typescript
 * // Get standard API endpoints
 * const voicesEndpoint = EndpointsGoogle.voices;
 * const synthesizeEndpoint = EndpointsGoogle.tts;
 * 
 * console.log('Voices:', voicesEndpoint);
 * console.log('Synthesize:', synthesizeEndpoint);
 * ```
 * 
 * @example Project-Specific Endpoints
 * ```typescript
 * import { ConfigGoogle } from './config.js';
 * 
 * // Configure project first
 * ConfigGoogle.init({
 *   apiKey: 'your-key',
 *   projectId: 'my-gcp-project'
 * });
 * 
 * // Access project endpoints
 * const projectEndpoint = EndpointsGoogle.projectId;
 * const customEndpoint = EndpointsGoogle.customConfig;
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class EndpointsGoogle {
  /**
   * Private constructor to prevent instantiation
   * This class should only be used statically
   * @internal
   */
  private constructor() {}

  /**
   * Endpoint to retrieve a list of available voices
   * 
   * Returns the URL for the Google TTS voices endpoint, which provides
   * the complete list of available voices with their metadata including
   * supported languages, gender, sample rates, and voice types.
   * 
   * @returns The Google TTS voices API endpoint URL
   * 
   * @example
   * ```typescript
   * const voicesUrl = EndpointsGoogle.voices;
   * 
   * // Use in HTTP request
   * const response = await fetch(voicesUrl, {
   *   headers: {
   *     'X-goog-api-key': 'your-api-key'
   *   }
   * });
   * 
   * const voicesData = await response.json();
   * console.log(`Found ${voicesData.voices.length} voices`);
   * ```
   */
  static get voices(): string {
    return 'https://texttospeech.googleapis.com/v1/voices';
  }

  /**
   * Endpoint for synthesizing speech from text
   * 
   * Returns the URL for the Google TTS text synthesis endpoint, which
   * converts text or SSML input into synthesized speech audio data.
   * This is the primary endpoint for TTS operations.
   * 
   * @returns The Google TTS text synthesis API endpoint URL
   * 
   * @example
   * ```typescript
   * const synthesizeUrl = EndpointsGoogle.tts;
   * 
   * // Use in synthesis request
   * const response = await fetch(synthesizeUrl, {
   *   method: 'POST',
   *   headers: {
   *     'X-goog-api-key': 'your-api-key',
   *     'Content-Type': 'application/json'
   *   },
   *   body: JSON.stringify({
   *     input: { text: 'Hello world' },
   *     voice: { languageCode: 'en-US', name: 'en-US-Neural2-A' },
   *     audioConfig: { audioEncoding: 'MP3' }
   *   })
   * });
   * ```
   */
  static get tts(): string {
    return 'https://texttospeech.googleapis.com/v1/text:synthesize';
  }

  /**
   * Endpoint to access project-specific settings or resources
   * 
   * Returns the base URL for project-specific Google TTS endpoints.
   * This endpoint is used for accessing custom voice models, project
   * configurations, and other project-scoped resources.
   * 
   * @returns The project-specific Google TTS API endpoint URL
   * @throws {@link Error} When project ID is not configured
   * 
   * @example
   * ```typescript
   * import { ConfigGoogle } from './config.js';
   * 
   * // Configure project first
   * ConfigGoogle.init({
   *   apiKey: 'your-key',
   *   projectId: 'my-gcp-project'
   * });
   * 
   * const projectUrl = EndpointsGoogle.projectId;
   * console.log(projectUrl); // 'https://texttospeech.googleapis.com/v1/projects/my-gcp-project'
   * 
   * // Use for project-specific operations
   * const customVoicesUrl = `${projectUrl}/voices`;
   * ```
   */
  static get projectId(): string {
    return `https://texttospeech.googleapis.com/v1/projects/${ConfigGoogle.projectId}`;
  }

  /**
   * Endpoint for accessing custom voice models or other configurations
   * 
   * Returns the URL for project-specific custom configurations including
   * custom voice models, specialized audio profiles, and advanced
   * project features that require project-level access.
   * 
   * @returns The custom configuration Google TTS API endpoint URL
   * @throws {@link Error} When project ID is not configured
   * 
   * @example
   * ```typescript
   * import { ConfigGoogle } from './config.js';
   * 
   * // Configure project with custom voices
   * ConfigGoogle.init({
   *   apiKey: 'your-key',
   *   projectId: 'my-gcp-project'
   * });
   * 
   * const customUrl = EndpointsGoogle.customConfig;
   * console.log(customUrl); // 'https://texttospeech.googleapis.com/v1/projects/my-gcp-project/custom'
   * 
   * // Access custom voice models
   * const customVoicesUrl = `${customUrl}/voices`;
   * const response = await fetch(customVoicesUrl, {
   *   headers: {
   *     'X-goog-api-key': 'your-api-key'
   *   }
   * });
   * ```
   * 
   * @example Custom Voice Model Management
   * ```typescript
   * const customConfigUrl = EndpointsGoogle.customConfig;
   * 
   * // Create a custom voice model endpoint
   * const createModelUrl = `${customConfigUrl}/models`;
   * 
   * // Train a custom voice endpoint
   * const trainModelUrl = `${customConfigUrl}/models/my-model:train`;
   * 
   * // Get custom model status
   * const modelStatusUrl = `${customConfigUrl}/models/my-model`;
   * ```
   */
  static get customConfig(): string {
    return `https://texttospeech.googleapis.com/v1/projects/${ConfigGoogle.projectId}/custom`;
  }
}
