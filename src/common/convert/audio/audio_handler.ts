import { TtsError, TtsErrorCode } from '../../errors/tts_error.js';

export interface ProcessingResult<T> {
  success: boolean;
  data?: T;
  error?: TtsError;
  index: number;
  processingTime: number;
  retryAttempts?: number;
}

export interface ProcessingOptions {
  enableEnhancedErrors?: boolean;
  throwOnFirstError?: boolean;
  collectErrors?: boolean;
  enableTiming?: boolean;
  onProgress?: (completed: number, total: number, currentItem?: string) => void;
  onItemComplete?: (result: ProcessingResult<unknown>) => void;
}

export class AudioHandler {
  private constructor() {}

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
   * Enhanced processing with full options support
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
