export class TextOptions {
  splitLimit: number;

  constructor(
    defaults: { splitLimit: number },
    options: { splitLimit?: number },
  ) {
    this.splitLimit = options.splitLimit ?? defaults.splitLimit;
  }
}
