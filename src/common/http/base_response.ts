export class BaseResponse {
  public reason: string;
  public code: number;

  constructor(code: number, reason: string) {
    this.code = code;
    this.reason = reason;
  }

  toString(): string {
    return `${this.code}: ${this.reason}`;
  }
}
