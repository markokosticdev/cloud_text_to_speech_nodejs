export class SsmlOptions {
  allowedElements: { [key: string]: string[] };
  splitLimit: number;

  constructor(
    defaults: {
      allowedElements: { [key: string]: string[] };
      splitLimit: number;
    },
    options: {
      allowedElements?: { [key: string]: string[] };
      splitLimit?: number;
    },
  ) {
    this.allowedElements = options.allowedElements ?? defaults.allowedElements;
    this.splitLimit = options.splitLimit ?? defaults.splitLimit;
  }
}
