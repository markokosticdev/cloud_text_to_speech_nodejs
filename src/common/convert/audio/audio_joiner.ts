/**
 * @fileoverview Audio Concatenation Utility for Cloud Text-to-Speech Services
 * 
 * This module provides efficient audio joining capabilities for combining multiple
 * audio byte arrays into a single continuous audio stream. It's optimized for
 * TTS applications where text is split into chunks and synthesized separately,
 * then needs to be recombined into a seamless audio output.
 * 
 * @author Marko Kostich
 * @since 3.0.0
 * @see {@link https://github.com/markokosticdev/cloud_text_to_speech_nodejs | GitHub Repository}
 * @see {@link AudioHandler} for batch processing utilities
 * 
 * @example Basic audio joining
 * ```typescript
 * import { AudioJoiner } from 'cloud-text-to-speech';
 * 
 * const audioChunks = [
 *   new Uint8Array([1, 2, 3]),
 *   new Uint8Array([4, 5, 6]),
 *   new Uint8Array([7, 8, 9])
 * ];
 * 
 * const combinedAudio = AudioJoiner.join(audioChunks);
 * console.log('Combined audio size:', combinedAudio.length, 'bytes');
 * ```
 * 
 * @example TTS batch processing workflow
 * ```typescript
 * import { AudioHandler, AudioJoiner } from 'cloud-text-to-speech';
 * 
 * const textChunks = ['Hello', ' world', '!', ' How are you?'];
 * 
 * // Synthesize all chunks in parallel
 * const audioChunks = await AudioHandler.handleAsync(
 *   textChunks,
 *   async (text) => await ttsService.synthesize(text),
 *   3 // max 3 concurrent requests
 * );
 * 
 * // Join all audio chunks into one continuous stream
 * const finalAudio = AudioJoiner.join(audioChunks);
 * 
 * // Save to file or stream to client
 * await fs.writeFile('combined_speech.mp3', finalAudio);
 * ```
 * 
 * @example Memory-efficient streaming
 * ```typescript
 * const processLargeText = async (text: string) => {
 *   const chunks = splitTextIntoChunks(text, 1000); // 1000 char chunks
 *   const audioChunks: Uint8Array[] = [];
 *   
 *   // Process in smaller batches to manage memory
 *   for (let i = 0; i < chunks.length; i += 10) {
 *     const batch = chunks.slice(i, i + 10);
 *     const batchAudio = await AudioHandler.handleAsync(
 *       batch,
 *       async (chunk) => await ttsService.synthesize(chunk),
 *       3
 *     );
 *     
 *     audioChunks.push(...batchAudio);
 *     
 *     // Optionally join intermediate results to free memory
 *     if (audioChunks.length > 50) {
 *       const intermediate = AudioJoiner.join(audioChunks);
 *       audioChunks.length = 0; // Clear array
 *       audioChunks.push(intermediate);
 *     }
 *   }
 *   
 *   return AudioJoiner.join(audioChunks);
 * };
 * ```
 */

/**
 * Utility class for concatenating audio byte arrays into continuous audio streams.
 * Provides efficient memory management and optimized copying for TTS audio processing
 * workflows where multiple audio chunks need to be combined seamlessly.
 * 
 * @category Audio Processing
 * 
 * @example Simple audio concatenation
 * ```typescript
 * import { AudioJoiner } from 'cloud-text-to-speech';
 * 
 * const chunk1 = new Uint8Array([0x49, 0x44, 0x33]); // ID3 header
 * const chunk2 = new Uint8Array([0xFF, 0xFB, 0x90]); // MP3 frame
 * const chunk3 = new Uint8Array([0x00, 0x00, 0x00]); // Audio data
 * 
 * const combined = AudioJoiner.join([chunk1, chunk2, chunk3]);
 * console.log('Total audio bytes:', combined.length);
 * ```
 * 
 * @example Production TTS pipeline
 * ```typescript
 * class TtsAudioPipeline {
 *   async synthesizeLongText(text: string): Promise<Uint8Array> {
 *     // Split text into manageable chunks
 *     const textChunks = this.splitText(text, this.config.chunkSize);
 *     
 *     // Synthesize all chunks
 *     const audioChunks = await AudioHandler.handleAsync(
 *       textChunks,
 *       async (chunk) => await this.synthesizeChunk(chunk),
 *       this.config.maxConcurrency,
 *       {
 *         onProgress: (completed, total) => {
 *           this.updateProgress(completed / total * 0.8); // 80% for synthesis
 *         }
 *       }
 *     );
 *     
 *     // Join all audio chunks
 *     this.updateProgress(0.9); // 90% - starting join
 *     const finalAudio = AudioJoiner.join(audioChunks);
 *     this.updateProgress(1.0); // 100% - complete
 *     
 *     return finalAudio;
 *   }
 * }
 * ```
 * 
 * @example Audio format validation and joining
 * ```typescript
 * const joinWithValidation = (audioChunks: Uint8Array[]): Uint8Array => {
 *   // Validate all chunks are non-empty
 *   const validChunks = audioChunks.filter(chunk => chunk.length > 0);
 *   
 *   if (validChunks.length === 0) {
 *     throw new Error('No valid audio chunks to join');
 *   }
 *   
 *   // Optional: Validate audio format consistency
 *   const firstChunkHeader = validChunks[0].slice(0, 4);
 *   const hasConsistentFormat = validChunks.every(chunk => {
 *     if (chunk.length < 4) return true; // Skip validation for very small chunks
 *     const header = chunk.slice(0, 4);
 *     return header.every((byte, index) => byte === firstChunkHeader[index]);
 *   });
 *   
 *   if (!hasConsistentFormat) {
 *     console.warn('Audio chunks may have inconsistent formats');
 *   }
 *   
 *   return AudioJoiner.join(validChunks);
 * };
 * ```
 * 
 * @example Streaming audio assembly
 * ```typescript
 * class StreamingAudioAssembler {
 *   private chunks: Uint8Array[] = [];
 *   private maxChunks: number = 100;
 *   
 *   addChunk(audioChunk: Uint8Array): void {
 *     this.chunks.push(audioChunk);
 *     
 *     // Periodically consolidate chunks to manage memory
 *     if (this.chunks.length >= this.maxChunks) {
 *       this.consolidate();
 *     }
 *   }
 *   
 *   private consolidate(): void {
 *     if (this.chunks.length > 1) {
 *       const consolidated = AudioJoiner.join(this.chunks);
 *       this.chunks = [consolidated];
 *     }
 *   }
 *   
 *   getCompleteAudio(): Uint8Array {
 *     return this.chunks.length === 1 
 *       ? this.chunks[0] 
 *       : AudioJoiner.join(this.chunks);
 *   }
 *   
 *   getTotalSize(): number {
 *     return this.chunks.reduce((total, chunk) => total + chunk.length, 0);
 *   }
 *   
 *   clear(): void {
 *     this.chunks = [];
 *   }
 * }
 * 
 * // Usage
 * const assembler = new StreamingAudioAssembler();
 * 
 * // Add chunks as they become available
 * for await (const audioChunk of audioStream) {
 *   assembler.addChunk(audioChunk);
 * }
 * 
 * const finalAudio = assembler.getCompleteAudio();
 * ```
 */
export class AudioJoiner {
  /** Private constructor to prevent instantiation - use static methods */
  private constructor() {}

  /**
   * Joins multiple audio byte arrays into a single continuous audio stream.
   * Efficiently concatenates audio data while preserving binary integrity
   * and minimizing memory allocations through optimized array operations.
   * 
   * @param audios - Array of audio byte arrays to concatenate
   * @returns Single Uint8Array containing all audio data in sequence
   * 
   * @example Basic audio joining
   * ```typescript
   * const audioFiles = [
   *   await fs.readFile('intro.mp3'),
   *   await fs.readFile('content.mp3'),
   *   await fs.readFile('outro.mp3')
   * ];
   * 
   * const combinedAudio = AudioJoiner.join(audioFiles);
   * await fs.writeFile('complete.mp3', combinedAudio);
   * ```
   * 
   * @example TTS chunk assembly
   * ```typescript
   * const textParts = [
   *   'Welcome to our service.',
   *   'Please hold while we connect you.',
   *   'Thank you for waiting.'
   * ];
   * 
   * // Synthesize each part separately
   * const audioChunks = await Promise.all(
   *   textParts.map(text => ttsService.synthesize(text))
   * );
   * 
   * // Join into seamless audio
   * const completeMessage = AudioJoiner.join(audioChunks);
   * console.log('Complete message:', completeMessage.length, 'bytes');
   * ```
   * 
   * @example Error handling and validation
   * ```typescript
   * const safeJoin = (audioChunks: Uint8Array[]): Uint8Array => {
   *   // Filter out empty chunks
   *   const validChunks = audioChunks.filter(chunk => 
   *     chunk && chunk.length > 0
   *   );
   *   
   *   if (validChunks.length === 0) {
   *     return new Uint8Array(0); // Return empty array
   *   }
   *   
   *   if (validChunks.length === 1) {
   *     return validChunks[0]; // No joining needed
   *   }
   *   
   *   try {
   *     return AudioJoiner.join(validChunks);
   *   } catch (error) {
   *     console.error('Audio joining failed:', error);
   *     throw new Error('Failed to join ' + validChunks.length + ' audio chunks: ' + error.message);
   *   }
   * };
   * ```
   * 
   * @example Memory usage monitoring
   * ```typescript
   * const joinWithMemoryTracking = (audioChunks: Uint8Array[]): Uint8Array => {
   *   const totalInputSize = audioChunks.reduce((sum, chunk) => sum + chunk.length, 0);
   *   console.log('Joining ' + audioChunks.length + ' chunks, total size: ' + totalInputSize + ' bytes');
   *   
   *   const memBefore = process.memoryUsage().heapUsed;
   *   const result = AudioJoiner.join(audioChunks);
   *   const memAfter = process.memoryUsage().heapUsed;
   *   
    *   console.log('Memory delta: ' + ((memAfter - memBefore) / 1024 / 1024).toFixed(2) + ' MB');
 *   console.log('Output size: ' + result.length + ' bytes');
   *   
   *   return result;
   * };
   * ```
   * 
   * @example Progressive joining for large datasets
   * ```typescript
   * const joinLargeDataset = (audioChunks: Uint8Array[]): Uint8Array => {
   *   const batchSize = 50; // Join in batches to manage memory
   *   let result = new Uint8Array(0);
   *   
   *   for (let i = 0; i < audioChunks.length; i += batchSize) {
   *     const batch = audioChunks.slice(i, i + batchSize);
   *     const batchResult = AudioJoiner.join(batch);
   *     
   *     // Join current result with batch result
   *     result = AudioJoiner.join([result, batchResult]);
   *     
   *     console.log('Processed batch ' + (Math.floor(i/batchSize) + 1) + '/' + Math.ceil(audioChunks.length/batchSize));
   *   }
   *   
   *   return result;
   * };
   */
  static join(audios: Uint8Array[]): Uint8Array {
    const totalLength = audios.reduce((sum, array) => sum + array.length, 0);

    const result = new Uint8Array(totalLength);

    let offset = 0;
    audios.forEach((array) => {
      result.set(array, offset);
      offset += array.length;
    });

    return result;
  }
}
