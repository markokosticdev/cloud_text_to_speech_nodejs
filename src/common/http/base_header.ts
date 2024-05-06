export abstract class BaseHeader {
  private readonly _type: string;

  ///[value] The value assigned to the [type].
  constructor(type: string, value: string) {
    this._type = type;
    this._value = value;
  }

  ///[type] The type of Header to use.

  private _value: string;

  get value(): string {
    return this._value;
  }

  get type(): string {
    return this._type;
  }

  abstract get headerValue(): string;
}
