/**
 * @fileoverview Google Cloud Text-to-Speech Audio Processing Handler
 * 
 * This module provides the main audio processing handler for Google Cloud Text-to-Speech
 * operations. It orchestrates the complete TTS pipeline including input processing,
 * HTTP client management, concurrent request handling, and audio response processing.
 * 
 * The handler supports both SSML and plain text input, implements advanced processing
 * options like async/sync execution, rate limiting, error handling, and progress
 * monitoring. It provides a comprehensive solution for Google TTS audio generation
 * with enterprise-grade features and optimizations.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link https://cloud.google.com/text-to-speech/docs | Google TTS Documentation}
 * @see {@link AudioHandler} for base audio processing functionality
 * 
 * @example Basic Audio Processing
 * ```typescript
 * import { AudioHandlerGoogle } from './audio_handler.js';
 * import { ConvertParamsGoogle } from '../convert_params.js';
 * import { AuthenticationHeaderGoogle } from '../../auth/authentication_types.js';
 * 
 * const handler = new AudioHandlerGoogle();
 * const authHeader: AuthenticationHeaderGoogle = {
 *   type: 'Authorization',
 *   headerValue: 'Bearer your-access-token'
 * };
 * 
 * const params = new ConvertParamsGoogle({
 *   text: 'Hello, world!',
 *   voice: { name: 'en-US-Neural2-A' },
 *   audioOptions: { audioFormat: 'MP3' }
 * });
 * 
 * const audioResponse = await handler.getAudio(params, authHeader);
 * const audioBuffer = Buffer.from(audioResponse.audio);
 * ```
 * 
 * @example Advanced Processing with SSML
 * ```typescript
 * import { AudioHandlerGoogle } from './audio_handler.js';
 * 
 * const handler = new AudioHandlerGoogle();
 * 
 * const params = new ConvertParamsGoogle({
 *   ssml: '<speak><prosody rate="slow">Hello world</prosody></speak>',
 *   voice: { name: 'en-US-Neural2-A' },
 *   audioOptions: { audioFormat: 'LINEAR16' },
 *   processOptions: {
 *     processAsync: true,
 *     processLimit: 5,
 *     enableMonitoring: true,
 *     enableRetry: true
 *   }
 * });
 * 
 * const audioResponse = await handler.getAudio(params, authHeader);
 * ```
 * 
 * @example Production Pipeline with Error Handling
 * ```typescript
 * import { AudioHandlerGoogle } from './audio_handler.js';
 * 
 * class GoogleTTSPipeline {
 *   private handler = new AudioHandlerGoogle();
 * 
 *   async synthesizeAudio(
 *     text: string,
 *     voice: string,
 *     authHeader: AuthenticationHeaderGoogle
 *   ): Promise<Buffer> {
 *     try {
 *       const params = new ConvertParamsGoogle({
 *         text,
 *         voice: { name: voice },
 *         audioOptions: { audioFormat: 'MP3' },
 *         processOptions: {
 *           enableEnhancedErrors: true,
 *           enableRetry: true,
 *           enableRateLimiting: true,
 *           onProgress: (progress) => {
 *             console.log(`Progress: ${progress.percentage}%`);
 *           }
 *         }
 *       });
 * 
 *       const result = await this.handler.getAudio(params, authHeader);
 *       return Buffer.from(result.audio);
 *     } catch (error) {
 *       console.error('TTS synthesis failed:', error);
 *       throw error;
 *     }
 *   }
 * }
 * ```
 * 
 * @example Long Text Processing with Chunking
 * ```typescript
 * import { AudioHandlerGoogle } from './audio_handler.js';
 * 
 * const handler = new AudioHandlerGoogle();
 * 
 * const longText = "Very long text that will be automatically chunked...";
 * 
 * const params = new ConvertParamsGoogle({
 *   textChunks: [longText], // Will be automatically processed in chunks
 *   voice: { name: 'en-US-Neural2-A' },
 *   audioOptions: { audioFormat: 'MP3' },
 *   processOptions: {
 *     processAsync: true,
 *     processLimit: 3, // Process 3 chunks concurrently
 *     enableTiming: true,
 *     onItemComplete: (index, result) => {
 *       console.log(`Chunk ${index} completed`);
 *     }
 *   }
 * });
 * 
 * const audioResponse = await handler.getAudio(params, authHeader);
 * // Audio from all chunks is automatically joined
 * ```
 */

import { AuthenticationHeaderGoogle } from '../../auth/authentication_types.js';
import { AudioSuccessGoogle } from './audio_responses.js';
import axios, { AxiosInstance } from 'axios';
import { AudioResponseMapperGoogle } from './audio_response_mapper.js';
import { SsmlGoogle } from '../input/ssml/ssml.js';
import { EndpointsGoogle } from '../../common/constants.js';
import { VoicesClientGoogle } from '../../voices/voices_client.js';
import { AudioClientGoogle } from './audio_client.js';
import { HttpResponseBase } from '../../../common/http/http_response_base.js';
import { ConvertParamsGoogle } from '../convert_params.js';
import { AudioHandler, ProcessingOptions } from '../../../common/convert/audio/audio_handler.js';
import { AudioJoiner } from '../../../common/convert/audio/audio_joiner.js';
import { TextGoogle } from '../input/text/text.js';
import { HttpClientEnhancer } from '../../../common/http/http_interceptors.js';

/**
 * Google Cloud Text-to-Speech audio processing handler
 * 
 * Main handler class that orchestrates the complete Google TTS audio processing
 * pipeline. Manages HTTP clients, processes both SSML and text input, handles
 * concurrent operations, and provides comprehensive error handling and monitoring.
 * 
 * The handler automatically determines the input type (SSML vs text), creates
 * optimized HTTP clients with interceptors, processes content in chunks for
 * large inputs, and joins audio results into a single response.
 * 
 * @example Basic Audio Generation
 * ```typescript
 * const handler = new AudioHandlerGoogle();
 * const result = await handler.getAudio(params, authHeader);
 * const audioData = result.audio; // Uint8Array
 * ```
 * 
 * @example With Progress Monitoring
 * ```typescript
 * const handler = new AudioHandlerGoogle();
 * // Configure params with monitoring options
 * const result = await handler.getAudio(paramsWithMonitoring, authHeader);
 * ```
 * 
 * @category Google Cloud TTS
 * @since 3.0.0
 */
export class AudioHandlerGoogle {
  /**
   * Generates audio from text or SSML using Google Cloud Text-to-Speech
   * 
   * Main method that orchestrates the complete audio generation process.
   * Automatically detects input type (SSML vs text), creates enhanced HTTP
   * clients with interceptors, processes content in chunks if needed, and
   * joins multiple audio responses into a single result.
   * 
   * @param params - Complete conversion parameters including input, voice, and processing options
   * @param authHeader - Google Cloud authentication header configuration
   * @returns Promise resolving to successful audio response with generated audio data
   * 
   * @throws {AudioFailedBadRequestGoogle} When request parameters are invalid
   * @throws {AudioFailedUnauthorizedGoogle} When authentication fails
   * @throws {AudioFailedTooManyRequestGoogle} When rate limits are exceeded
   * @throws {Error} For other processing errors
   * 
   * @example Basic Text Synthesis
   * ```typescript
   * const handler = new AudioHandlerGoogle();
   * 
   * const params = new ConvertParamsGoogle({
   *   text: 'Hello, world!',
   *   voice: { name: 'en-US-Neural2-A' },
   *   audioOptions: { audioFormat: 'MP3' }
   * });
   * 
   * const authHeader = {
   *   type: 'Authorization',
   *   headerValue: 'Bearer your-token'
   * };
   * 
   * const result = await handler.getAudio(params, authHeader);
   * const audioBuffer = Buffer.from(result.audio);
   * ```
   * 
   * @example SSML Synthesis with Processing Options
   * ```typescript
   * const params = new ConvertParamsGoogle({
   *   ssml: '<speak><prosody rate="slow">Hello world</prosody></speak>',
   *   voice: { name: 'en-US-Neural2-A' },
   *   audioOptions: { audioFormat: 'LINEAR16' },
   *   processOptions: {
   *     processAsync: true,
   *     processLimit: 5,
   *     enableMonitoring: true
   *   }
   * });
   * 
   * const result = await handler.getAudio(params, authHeader);
   * ```
   * 
   * @example Large Content Processing
   * ```typescript
   * const params = new ConvertParamsGoogle({
   *   textChunks: ['Chunk 1...', 'Chunk 2...', 'Chunk 3...'],
   *   voice: { name: 'en-US-Neural2-A' },
   *   audioOptions: { audioFormat: 'MP3' },
   *   processOptions: {
   *     processAsync: true,
   *     processLimit: 3, // Process 3 chunks concurrently
   *     onProgress: (progress) => console.log(`${progress.percentage}%`)
   *   }
   * });
   * 
   * const result = await handler.getAudio(params, authHeader);
   * // All chunks automatically joined into single audio
   * ```
   */
  async getAudio(
    params: ConvertParamsGoogle,
    authHeader: AuthenticationHeaderGoogle,
  ): Promise<AudioSuccessGoogle> {
    // Create enhanced HTTP client with interceptors
    const client: AxiosInstance = this.createEnhancedClient(params);
    
    const audioClient: VoicesClientGoogle = new AudioClientGoogle(
      client,
      authHeader,
    );
    const mapper: AudioResponseMapperGoogle = new AudioResponseMapperGoogle();

    let audioSuccesses: AudioSuccessGoogle[];

    if (params.ssml || params.ssmlChunks) {
      audioSuccesses = await this.processFromSsml(params, audioClient, mapper);
    } else {
      audioSuccesses = await this.processFromText(params, audioClient, mapper);
    }

    const audios = audioSuccesses.map((item) => item.audio);

    return new AudioSuccessGoogle(AudioJoiner.join(audios));
  }

  private createEnhancedClient(params: ConvertParamsGoogle): AxiosInstance {
    const client = axios.create();
    
    // Enhanced client with interceptors based on process options
    return HttpClientEnhancer.enhance(client, 'google', {
      rateLimiting: params.processOptions.getRateLimitConfig(),
      rateLimitAlgorithm: params.processOptions.rateLimitOptions?.algorithm,
      errorHandling: params.processOptions.isEnhancedErrorsEnabled(),
      retry: params.processOptions.isRetryEnabled() ? params.processOptions.retryOptions : undefined
    });
  }

  private createProcessingOptions(params: ConvertParamsGoogle): ProcessingOptions {
    return {
      enableEnhancedErrors: params.processOptions.isEnhancedErrorsEnabled(),
      throwOnFirstError: params.processOptions.errorOptions?.throwOnFirstError,
      collectErrors: params.processOptions.errorOptions?.collectErrors,
      enableTiming: params.processOptions.monitoringOptions?.enableTiming,
      onProgress: params.processOptions.monitoringOptions?.onProgress,
      onItemComplete: params.processOptions.monitoringOptions?.onItemComplete
    };
  }

  private async processFromSsml(
    params: ConvertParamsGoogle,
    audioClient: VoicesClientGoogle,
    mapper: AudioResponseMapperGoogle,
  ): Promise<AudioSuccessGoogle[]> {
    const ssml = new SsmlGoogle({
      ssml: params.ssml,
      ssmlChunks: params.ssmlChunks,
      rate: params.rate,
      pitch: params.pitch,
      voice: params.voice,
      voiceId: params.voiceId,
      options: params.ssmlOptions,
    });

    const processingOptions = this.createProcessingOptions(params);

    if (params.processOptions.processAsync) {
      return await AudioHandler.handleAsync<AudioSuccessGoogle>(
        ssml.processedSsmlChunks(),
        async (batch) => {
          return await this.processItemFromSsml(
            params,
            batch,
            audioClient,
            mapper,
          );
        },
        params.processOptions.processLimit,
        processingOptions
      );
    } else {
      return await AudioHandler.handleSync<AudioSuccessGoogle>(
        ssml.processedSsmlChunks(),
        async (batch) => {
          return await this.processItemFromSsml(
            params,
            batch,
            audioClient,
            mapper,
          );
        },
        processingOptions
      );
    }
  }

  private async processItemFromSsml(
    params: ConvertParamsGoogle,
    ssml: string,
    audioClient: VoicesClientGoogle,
    mapper: AudioResponseMapperGoogle,
  ): Promise<AudioSuccessGoogle> {
    try {
      const body = {
        input: { ssml: ssml },
        voice: {
          name: params.voice?.code ?? params.voiceId,
        },
        audioConfig: { audioEncoding: params.audioOptions.audioFormat },
      };

      const bodyJson = JSON.stringify(body);

      const httpProxy = params.httpProxy?.();

      const response = await audioClient.send({
        url: httpProxy?.url ?? EndpointsGoogle.tts,
        ...(httpProxy?.headers && { headers: httpProxy.headers }),
        ...(httpProxy?.params && { params: httpProxy.params }),
        data: bodyJson,
        method: 'POST',
        responseType: 'arraybuffer',
      });

      const audioResponse: HttpResponseBase = mapper.map(response);

      if (audioResponse instanceof AudioSuccessGoogle) {
        return audioResponse;
      } else {
        throw audioResponse;
      }
    } catch (e) {
      throw e;
    }
  }

  private async processFromText(
    params: ConvertParamsGoogle,
    audioClient: VoicesClientGoogle,
    mapper: AudioResponseMapperGoogle,
  ): Promise<AudioSuccessGoogle[]> {
    const text = new TextGoogle({
      text: params.text,
      textChunks: params.textChunks,
      rate: params.rate,
      pitch: params.pitch,
      voice: params.voice,
      voiceId: params.voiceId,
      options: params.textOptions,
    });

    const processingOptions = this.createProcessingOptions(params);

    if (params.processOptions.processAsync) {
      return await AudioHandler.handleAsync<AudioSuccessGoogle>(
        text.processedTextChunks(),
        async (batch) => {
          return await this.processItemFromText(
            params,
            batch,
            audioClient,
            mapper,
          );
        },
        params.processOptions.processLimit,
        processingOptions
      );
    } else {
      return await AudioHandler.handleSync<AudioSuccessGoogle>(
        text.processedTextChunks(),
        async (batch) => {
          return await this.processItemFromText(
            params,
            batch,
            audioClient,
            mapper,
          );
        },
        processingOptions
      );
    }
  }

  private async processItemFromText(
    params: ConvertParamsGoogle,
    text: string,
    audioClient: VoicesClientGoogle,
    mapper: AudioResponseMapperGoogle,
  ): Promise<AudioSuccessGoogle> {
    try {
      const body = {
        input: { text: text },
        voice: {
          name: params.voice?.code ?? params.voiceId,
        },
        audioConfig: { audioEncoding: params.audioOptions.audioFormat },
      };

      const bodyJson = JSON.stringify(body);

      const httpProxy = params.httpProxy?.();

      const response = await audioClient.send({
        url: httpProxy?.url ?? EndpointsGoogle.tts,
        ...(httpProxy?.headers && { headers: httpProxy.headers }),
        ...(httpProxy?.params && { params: httpProxy.params }),
        data: bodyJson,
        method: 'POST',
        responseType: 'arraybuffer',
      });

      const audioResponse: HttpResponseBase = mapper.map(response);

      if (audioResponse instanceof AudioSuccessGoogle) {
        return audioResponse;
      } else {
        throw audioResponse;
      }
    } catch (e) {
      throw e;
    }
  }
}
