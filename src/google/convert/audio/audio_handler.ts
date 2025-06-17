import { AuthenticationHeaderGoogle } from '../../auth/authentication_types.js';
import { AudioSuccessGoogle } from './audio_responses.js';
import axios, { AxiosInstance } from 'axios';
import { AudioResponseMapperGoogle } from './audio_response_mapper.js';
import { SsmlGoogle } from '../input/ssml.js';
import { EndpointsGoogle } from '../../common/constants.js';
import { VoicesClientGoogle } from '../../voices/voices_client.js';
import { AudioClientGoogle } from './audio_client.js';
import { HttpResponseBase } from '../../../common/http/http_response_base.js';
import { ConvertParamsGoogle } from '../convert_params.js';
import { AudioHandler, ProcessingOptions } from '../../../common/convert/audio/audio_handler.js';
import { AudioJoiner } from '../../../common/convert/audio/audio_joiner.js';
import { TextGoogle } from '../input/text.js';
import { HttpClientEnhancer } from '../../../common/http/http_interceptors.js';

export class AudioHandlerGoogle {
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
      options: params.ssmlOptions,
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
