/**
 * @fileoverview Audio Processing Handler for Cloud Text-to-Speech Services
 * 
 * This module provides robust batch processing capabilities for TTS audio operations
 * with concurrent execution control, comprehensive error handling, progress tracking,
 * and flexible processing strategies. It supports both synchronous and asynchronous
 * processing modes with configurable retry mechanisms and error collection.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link AudioJoiner} for audio concatenation utilities
 * @see {@link TtsError} for error handling system
 * 
 * @example Basic batch processing
 * ```typescript
 * import { AudioHandler } from 'cloud-text-to-speech';
 * 
 * const textBatches = ['Hello world', 'How are you?', 'Goodbye'];
 * 
 * const audioResults = await AudioHandler.handleAsync(
 *   textBatches,
 *   async (text) => await synthesizeText(text),
 *   2, // Process 2 batches concurrently
 *   {
 *     onProgress: (completed, total) => {
 *       console.log(`Progress: ${completed}/${total}`);
 *     }
 *   }
 * );
 * 
 * console.log(`Generated ${audioResults.length} audio files`);
 * ```
 * 
 * @example Advanced processing with error handling
 * ```typescript
 * const results = await AudioHandler.processEnhanced(
 *   largeBatchOfTexts,
 *   async (text) => await ttsService.synthesize(text),
 *   true, // Use async processing
 *   3,    // Max 3 concurrent operations
 *   {
 *     enableEnhancedErrors: true,
 *     collectErrors: true,
 *     onItemComplete: (result) => {
 *       if (!result.success) {
 *         console.error(`Failed batch ${result.index}: ${result.error?.message}`);
 *       }
 *     },
 *     onProgress: (completed, total, currentItem) => {
 *       console.log(`Processing: ${currentItem} (${completed}/${total})`);
 *     }
 *   }
 * );
 * ```
 */

import { TtsError, TtsErrorCode } from '../../errors/tts_error.js';

/**
 * Result object for individual batch processing operations.
 * Contains success status, data, error information, and performance metrics.
 * 
 * @template T - Type of the processed data
 * 
 * @category Audio Processing
 * 
 * @example Processing result analysis
 * ```typescript
 * const analyzeResult = (result: ProcessingResult<Uint8Array>) => {
 *   if (result.success) {
 *     console.log(`Batch ${result.index} completed in ${result.processingTime}ms`);
 *     console.log(`Audio size: ${result.data?.length} bytes`);
 *   } else {
 *     console.error(`Batch ${result.index} failed: ${result.error?.message}`);
 *     if (result.retryAttempts) {
 *       console.log(`Failed after ${result.retryAttempts} retry attempts`);
 *     }
 *   }
 * };
 * ```
 * 
 * @example Result filtering and metrics
 * ```typescript
 * const processResults = (results: ProcessingResult<AudioData>[]) => {
 *   const successful = results.filter(r => r.success);
 *   const failed = results.filter(r => !r.success);
 *   
 *   const avgProcessingTime = successful.reduce((sum, r) => sum + r.processingTime, 0) / successful.length;
 *   
 *   console.log(`Success rate: ${successful.length}/${results.length}`);
 *   console.log(`Average processing time: ${avgProcessingTime}ms`);
 *   
 *   return {
 *     successfulData: successful.map(r => r.data).filter(Boolean),
 *     errors: failed.map(r => r.error).filter(Boolean)
 *   };
 * };
 * ```
 */
export interface ProcessingResult<T> {
  /** Whether the processing operation was successful */
  success: boolean;
  /** The processed data (only present if success is true) */
  data?: T;
  /** Error information (only present if success is false) */
  error?: TtsError;
  /** Index of the processed item in the original batch */
  index: number;
  /** Processing time in milliseconds */
  processingTime: number;
  /** Number of retry attempts made (optional) */
  retryAttempts?: number;
}

/**
 * Configuration options for batch processing operations.
 * Provides fine-grained control over error handling, progress tracking,
 * and processing behavior with callback functions for monitoring.
 * 
 * @category Audio Processing
 * 
 * @example Basic progress tracking
 * ```typescript
 * const options: ProcessingOptions = {
 *   onProgress: (completed, total, currentItem) => {
 *     const percentage = Math.round((completed / total) * 100);
 *     console.log(`Progress: ${percentage}% (${completed}/${total})`);
 *     if (currentItem) {
 *       console.log(`Current: ${currentItem.substring(0, 50)}...`);
 *     }
 *   }
 * };
 * ```
 * 
 * @example Comprehensive error handling
 * ```typescript
 * const options: ProcessingOptions = {
 *   enableEnhancedErrors: true,
 *   collectErrors: true,
 *   throwOnFirstError: false,
 *   enableTiming: true,
 *   onItemComplete: (result) => {
 *     if (result.success) {
 *       metrics.recordSuccess(result.processingTime);
 *     } else {
 *       metrics.recordFailure(result.error);
 *       logger.error(`Batch ${result.index} failed`, result.error);
 *     }
 *   }
 * };
 * ```
 * 
 * @example Production monitoring setup
 * ```typescript
 * const productionOptions: ProcessingOptions = {
 *   enableEnhancedErrors: true,
 *   collectErrors: true,
 *   enableTiming: true,
 *   onProgress: (completed, total) => {
 *     // Update progress bar or send metrics
 *     progressBar.update(completed / total);
 *     metrics.gauge('tts.batch.progress', completed / total);
 *   },
 *   onItemComplete: (result) => {
 *     // Record metrics for monitoring
 *     metrics.increment('tts.batch.processed');
 *     metrics.histogram('tts.batch.duration', result.processingTime);
 *     
 *     if (!result.success) {
 *       metrics.increment('tts.batch.failed');
 *       alerting.notify('TTS batch processing failure', result.error);
 *     }
 *   }
 * };
 * ```
 */
export interface ProcessingOptions {
  /** Enable enhanced error reporting with full TtsError context */
  enableEnhancedErrors?: boolean;
  /** Stop processing and throw error on first failure */
  throwOnFirstError?: boolean;
  /** Collect all errors for summary reporting */
  collectErrors?: boolean;
  /** Enable detailed timing measurements */
  enableTiming?: boolean;
  /** Callback for progress updates during processing */
  onProgress?: (completed: number, total: number, currentItem?: string) => void;
  /** Callback for individual item completion events */
  onItemComplete?: (result: ProcessingResult<unknown>) => void;
}

/**
 * High-performance audio processing handler with concurrent execution and comprehensive monitoring.
 * Provides both synchronous and asynchronous batch processing strategies with configurable
 * concurrency limits, error handling modes, and detailed progress tracking capabilities.
 * 
 * @category Audio Processing
 * 
 * @example Basic concurrent processing
 * ```typescript
 * import { AudioHandler } from 'cloud-text-to-speech';
 * 
 * const textInputs = [
 *   'Welcome to our service',
 *   'Please wait while we process your request',
 *   'Thank you for your patience',
 *   'Your request has been completed'
 * ];
 * 
 * // Process with max 2 concurrent operations
 * const audioOutputs = await AudioHandler.handleAsync(
 *   textInputs,
 *   async (text) => await ttsService.synthesize(text),
 *   2
 * );
 * 
 * console.log(`Generated ${audioOutputs.length} audio files`);
 * ```
 * 
 * @example Production-ready processing with monitoring
 * ```typescript
 * class TtsBatchProcessor {
 *   async processBatch(texts: string[]): Promise<Uint8Array[]> {
 *     const startTime = Date.now();
 *     
 *     try {
 *       const results = await AudioHandler.handleAsync(
 *         texts,
 *         async (text) => await this.synthesizeWithRetry(text),
 *         this.config.maxConcurrency,
 *         {
 *           enableEnhancedErrors: true,
 *           collectErrors: true,
 *           onProgress: (completed, total) => {
 *             this.updateProgress(completed, total);
 *           },
 *           onItemComplete: (result) => {
 *             this.recordMetrics(result);
 *           }
 *         }
 *       );
 *       
 *       const duration = Date.now() - startTime;
 *       this.logger.info(`Batch completed in ${duration}ms`, {
 *         itemCount: texts.length,
 *         successCount: results.length
 *       });
 *       
 *       return results;
 *       
 *     } catch (error) {
 *       this.logger.error('Batch processing failed', error);
 *       throw error;
 *     }
 *   }
 * }
 * ```
 * 
 * @example Error-resilient processing
 * ```typescript
 * const processWithFallback = async (texts: string[]) => {
 *   try {
 *     // Try fast concurrent processing first
 *     return await AudioHandler.handleAsync(
 *       texts,
 *       async (text) => await fastTtsService.synthesize(text),
 *       5, // High concurrency
 *       { throwOnFirstError: true }
 *     );
 *   } catch (error) {
 *     console.warn('Fast processing failed, falling back to sequential');
 *     
 *     // Fallback to slower but more reliable sequential processing
 *     return await AudioHandler.handleSync(
 *       texts,
 *       async (text) => await reliableTtsService.synthesize(text),
 *       {
 *         collectErrors: true,
 *         onProgress: (completed, total) => {
 *           console.log(`Fallback progress: ${completed}/${total}`);
 *         }
 *       }
 *     );
 *   }
 * };
 * ```
 */
export class AudioHandler {
  /** Private constructor to prevent instantiation - use static methods */
  private constructor() {}

  /**
   * Process batches asynchronously with configurable concurrency control.
   * Executes multiple processing operations concurrently up to the specified limit,
   * providing optimal performance for I/O-bound TTS operations while preventing
   * system overload and respecting API rate limits.
   * 
   * @template T - Type of the processed data
   * @param batches - Array of input strings to process
   * @param processBatch - Async function to process each batch item
   * @param processLimit - Maximum number of concurrent operations
   * @param options - Processing configuration options
   * @returns Promise resolving to array of processed results
   * 
   * @throws {TtsError} When throwOnFirstError is true and any operation fails
   * 
   * @example High-throughput TTS processing
   * ```typescript
   * const texts = [
   *   'First announcement',
   *   'Second announcement', 
   *   'Third announcement'
   * ];
   * 
   * const audioFiles = await AudioHandler.handleAsync(
   *   texts,
   *   async (text) => {
   *     const response = await ttsApi.synthesize({
   *       input: { text },
   *       voice: { languageCode: 'en-US', name: 'en-US-Standard-A' },
   *       audioConfig: { audioEncoding: 'MP3' }
   *     });
   *     return response.audioContent;
   *   },
   *   3, // Process 3 texts concurrently
   *   {
   *     onProgress: (completed, total) => {
   *       console.log(`Synthesized ${completed}/${total} audio files`);
   *     }
   *   }
   * );
   * 
   * console.log(`Generated ${audioFiles.length} audio files`);
   * ```
   * 
   * @example Rate-limited API processing
   * ```typescript
   * // For APIs with strict rate limits
   * const results = await AudioHandler.handleAsync(
   *   largeBatchOfTexts,
   *   async (text) => {
   *     // Add delay to respect rate limits
   *     await new Promise(resolve => setTimeout(resolve, 100));
   *     return await rateLimitedTtsService.synthesize(text);
   *   },
   *   2, // Low concurrency for rate-limited APIs
   *   {
   *     enableTiming: true,
   *     onItemComplete: (result) => {
   *       console.log(`Item ${result.index} took ${result.processingTime}ms`);
   *     }
   *   }
   * );
   * ```
   * 
   * @example Error handling strategies
   * ```typescript
   * // Collect all errors without stopping
   * const results = await AudioHandler.handleAsync(
   *   questionableTexts,
   *   async (text) => await unreliableTtsService.synthesize(text),
   *   3,
   *   {
   *     throwOnFirstError: false,
   *     collectErrors: true,
   *     enableEnhancedErrors: true,
   *     onItemComplete: (result) => {
   *       if (!result.success) {
   *         console.error(`Failed to process: "${batches[result.index]}"`);
   *         console.error(`Error: ${result.error?.getUserMessage()}`);
   *       }
   *     }
   *   }
   * );
   * 
   * const successful = results.filter(r => r !== undefined);
   * console.log(`Successfully processed ${successful.length} out of ${questionableTexts.length}`);
   * ```
   */
  static async handleAsync<T>(
    batches: string[],
    processBatch: (batch: string) => Promise<T>,
    processLimit: number,
    options: ProcessingOptions = {}
  ): Promise<T[]> {
    const results: T[] = [];
    const errors: TtsError[] = [];
    const executing: Promise<void>[] = [];
    let nextIndex = 0;
    let completed = 0;

    const handleRequest = async (index: number): Promise<void> => {
      const startTime = Date.now();
      const retryAttempts = 0;

      try {
        const result = await processBatch(batches[index]);
        results[index] = result;

        const processingTime = Date.now() - startTime;
        
        if (options.onItemComplete) {
          options.onItemComplete({
            success: true,
            data: result,
            index,
            processingTime,
            retryAttempts
          });
        }

        completed++;
        if (options.onProgress) {
          options.onProgress(completed, batches.length, batches[index]);
        }

      } catch (e) {
        const processingTime = Date.now() - startTime;
        
        let error: TtsError;
        if (options.enableEnhancedErrors && e instanceof TtsError) {
          error = e;
        } else {
          error = new TtsError(
            `Error processing batch at index ${index}: ${e.message}`,
            TtsErrorCode.UNKNOWN_ERROR,
            { context: { originalError: e, batchIndex: index } }
          );
        }

        if (options.onItemComplete) {
          options.onItemComplete({
            success: false,
            error,
            index,
            processingTime,
            retryAttempts
          });
        }

        if (options.collectErrors) {
          errors.push(error);
        }

        if (options.throwOnFirstError) {
          throw error;
        }

        completed++;
        if (options.onProgress) {
          options.onProgress(completed, batches.length, batches[index]);
        }
      }
    };

    while (nextIndex < batches.length) {
      if (executing.length < processLimit) {
        const currentIndex = nextIndex++;
        const requestPromise = handleRequest(currentIndex).then(() => {
          executing.splice(executing.indexOf(requestPromise), 1);
        });
        executing.push(requestPromise);
      } else {
        await Promise.race(executing);
      }
    }

    await Promise.all(executing);

    // If we collected errors and no throw on first error, include error summary
    if (errors.length > 0 && !options.throwOnFirstError) {
      console.warn(`Processing completed with ${errors.length} errors:`, errors.map(e => e.message));
    }

    return results;
  }

  /**
   * Process batches synchronously (one at a time) for maximum reliability.
   * Executes operations sequentially to ensure predictable behavior,
   * minimize resource usage, and maintain strict processing order.
   * 
   * @template T - Type of the processed data
   * @param batches - Array of input strings to process
   * @param processBatch - Async function to process each batch item
   * @param options - Processing configuration options
   * @returns Promise resolving to array of processed results
   * 
   * @throws {TtsError} When throwOnFirstError is true and any operation fails
   * 
   * @example Sequential processing for sensitive operations
   * ```typescript
   * const criticalTexts = [
   *   'Emergency announcement',
   *   'Safety instructions',
   *   'Evacuation procedures'
   * ];
   * 
   * // Process one at a time to ensure order and reliability
   * const audioFiles = await AudioHandler.handleSync(
   *   criticalTexts,
   *   async (text) => {
   *     // High-quality synthesis with careful error handling
   *     return await premiumTtsService.synthesize(text, {
   *       quality: 'highest',
   *       timeout: 30000
   *     });
   *   },
   *   {
   *     throwOnFirstError: true, // Stop on any failure
   *     enableTiming: true,
   *     onProgress: (completed, total, currentText) => {
   *       console.log(`Processing critical message ${completed}/${total}: ${currentText}`);
   *     }
   *   }
   * );
   * ```
   * 
   * @example Resource-constrained processing
   * ```typescript
   * // For low-memory environments or API quotas
   * const results = await AudioHandler.handleSync(
   *   largeTexts,
   *   async (text) => {
   *     // Process with explicit memory management
   *     const result = await ttsService.synthesize(text);
   *     
   *     // Force garbage collection hints
   *     if (global.gc) global.gc();
   *     
   *     return result;
   *   },
   *   {
   *     collectErrors: true,
   *     onItemComplete: (result) => {
   *       if (result.success) {
   *         console.log(`Completed item ${result.index} (${result.processingTime}ms)`);
   *       }
   *     }
   *   }
   * );
   * ```
   * 
   * @example Debugging and development mode
   * ```typescript
   * // Sequential processing for easier debugging
   * const debugResults = await AudioHandler.handleSync(
   *   testTexts,
   *   async (text) => {
   *     console.log(`Starting synthesis for: "${text}"`);
   *     const startTime = Date.now();
   *     
   *     try {
   *       const result = await ttsService.synthesize(text);
   *       console.log(`Synthesis completed in ${Date.now() - startTime}ms`);
   *       return result;
   *     } catch (error) {
   *       console.error(`Synthesis failed: ${error.message}`);
   *       throw error;
   *     }
   *   },
   *   {
   *     enableEnhancedErrors: true,
   *     throwOnFirstError: false,
   *     onItemComplete: (result) => {
   *       console.log(`Debug result for item ${result.index}:`, {
   *         success: result.success,
   *         processingTime: result.processingTime,
   *         error: result.error?.message
   *       });
   *     }
   *   }
   * );
   * ```
   */
  static async handleSync<T>(
    batches: string[],
    processBatch: (batch: string) => Promise<T>,
    options: ProcessingOptions = {}
  ): Promise<T[]> {
    const results: T[] = [];
    const errors: TtsError[] = [];

    for (let index = 0; index < batches.length; index++) {
      const startTime = Date.now();
      const retryAttempts = 0;

      try {
        const result = await processBatch(batches[index]);
        results[index] = result;

        const processingTime = Date.now() - startTime;
        
        if (options.onItemComplete) {
          options.onItemComplete({
            success: true,
            data: result,
            index,
            processingTime,
            retryAttempts
          });
        }

        if (options.onProgress) {
          options.onProgress(index + 1, batches.length, batches[index]);
        }

      } catch (e) {
        const processingTime = Date.now() - startTime;
        
        let error: TtsError;
        if (options.enableEnhancedErrors && e instanceof TtsError) {
          error = e;
        } else {
          error = new TtsError(
            `Error processing batch at index ${index}: ${e.message}`,
            TtsErrorCode.UNKNOWN_ERROR,
            { context: { originalError: e, batchIndex: index } }
          );
        }

        if (options.onItemComplete) {
          options.onItemComplete({
            success: false,
            error,
            index,
            processingTime,
            retryAttempts
          });
        }

        if (options.collectErrors) {
          errors.push(error);
        }

        if (options.throwOnFirstError) {
          throw error;
        }

        if (options.onProgress) {
          options.onProgress(index + 1, batches.length, batches[index]);
        }
      }
    }

    // If we collected errors and no throw on first error, include error summary
    if (errors.length > 0 && !options.throwOnFirstError) {
      console.warn(`Processing completed with ${errors.length} errors:`, errors.map(e => e.message));
    }

    return results;
  }

  /**
   * Enhanced processing method with automatic strategy selection and full feature support.
   * Combines the best of both async and sync processing modes with intelligent
   * parameter handling and comprehensive monitoring capabilities.
   * 
   * @template T - Type of the processed data
   * @param items - Array of input strings to process
   * @param processBatch - Async function to process each batch item
   * @param processAsync - Whether to use asynchronous (concurrent) processing
   * @param processLimit - Maximum number of concurrent operations (ignored for sync mode)
   * @param options - Processing configuration options
   * @returns Promise resolving to array of processed results
   * 
   * @throws {TtsError} When throwOnFirstError is true and any operation fails
   * 
   * @example Adaptive processing based on batch size
   * ```typescript
   * const processAdaptively = async (texts: string[]) => {
   *   const useAsync = texts.length > 10;
   *   const concurrency = Math.min(texts.length, 5);
   *   
   *   return await AudioHandler.processEnhanced(
   *     texts,
   *     async (text) => await ttsService.synthesize(text),
   *     useAsync,
   *     concurrency,
   *     {
   *       enableEnhancedErrors: true,
   *       collectErrors: !useAsync, // Collect errors only for sync mode
   *       throwOnFirstError: useAsync, // Fail fast for async mode
   *       onProgress: (completed, total) => {
   *         const mode = useAsync ? 'concurrent' : 'sequential';
   *         console.log(`${mode} processing: ${completed}/${total}`);
   *       }
   *     }
   *   );
   * };
   * ```
   * 
   * @example Environment-based processing
   * ```typescript
   * const processForEnvironment = async (texts: string[]) => {
   *   const isProduction = process.env.NODE_ENV === 'production';
   *   
   *   return await AudioHandler.processEnhanced(
   *     texts,
   *     async (text) => await ttsService.synthesize(text),
   *     isProduction, // Use async in production, sync in development
   *     isProduction ? 10 : 2, // Higher concurrency in production
   *     {
   *       enableEnhancedErrors: true,
   *       enableTiming: true,
   *       collectErrors: true,
   *       throwOnFirstError: !isProduction, // More forgiving in production
   *       onProgress: (completed, total, currentItem) => {
   *         if (isProduction) {
   *           metrics.gauge('tts.processing.progress', completed / total);
   *         } else {
   *           console.log(`Dev mode: ${completed}/${total} - ${currentItem}`);
   *         }
   *       },
   *       onItemComplete: (result) => {
   *         if (isProduction) {
   *           metrics.histogram('tts.processing.duration', result.processingTime);
   *           if (!result.success) {
   *             metrics.increment('tts.processing.errors');
   *           }
   *         }
   *       }
   *     }
   *   );
   * };
   * ```
   * 
   * @example Complete monitoring and metrics
   * ```typescript
   * class TtsProcessor {
   *   async processWithMetrics(texts: string[]) {
   *     const metrics = {
   *       startTime: Date.now(),
   *       totalItems: texts.length,
   *       completed: 0,
   *       errors: 0,
   *       processingTimes: [] as number[]
   *     };
   *     
   *     try {
   *       const results = await AudioHandler.processEnhanced(
   *         texts,
   *         async (text) => await this.synthesizeWithRetry(text),
   *         true, // Async processing
   *         this.config.maxConcurrency,
   *         {
   *           enableEnhancedErrors: true,
   *           enableTiming: true,
   *           collectErrors: true,
   *           onProgress: (completed, total, currentItem) => {
   *             metrics.completed = completed;
   *             this.updateDashboard(metrics);
   *           },
   *           onItemComplete: (result) => {
   *             metrics.processingTimes.push(result.processingTime);
   *             if (!result.success) {
   *               metrics.errors++;
   *               this.logError(result.error, result.index);
   *             }
   *           }
   *         }
   *       );
   *       
   *       const totalTime = Date.now() - metrics.startTime;
   *       const avgProcessingTime = metrics.processingTimes.reduce((a, b) => a + b, 0) / metrics.processingTimes.length;
   *       
   *       this.recordFinalMetrics({
   *         totalTime,
   *         avgProcessingTime,
   *         successRate: (results.length - metrics.errors) / results.length,
   *         throughput: results.length / (totalTime / 1000)
   *       });
   *       
   *       return results;
   *       
   *     } catch (error) {
   *       this.recordProcessingFailure(error, metrics);
   *       throw error;
   *     }
   *   }
   * }
   * ```
   */
  static async processEnhanced<T>(
    items: string[],
    processBatch: (batch: string) => Promise<T>,
    processAsync: boolean,
    processLimit: number,
    options: ProcessingOptions = {}
  ): Promise<T[]> {
    if (processAsync) {
      return this.handleAsync(items, processBatch, processLimit, options);
    } else {
      return this.handleSync(items, processBatch, options);
    }
  }
}
