import { PROCESS_ASYNC, PROCESS_LIMIT } from './tts_params_defaults.js';

export class TtsProcessOptionsGoogle {
  processAsync: boolean;
  processLimit: number;

  constructor({
    processAsync,
    processLimit,
  }: {
    processAsync?: boolean;
    processLimit?: number;
  } = {}) {
    this.processAsync = processAsync ?? PROCESS_ASYNC;
    this.processLimit = processLimit ?? PROCESS_LIMIT;
  }
}
