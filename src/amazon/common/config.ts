///Holds all configurations
export class ConfigAmazon {
  private constructor() {}

  private static _keyId: string;

  static get keyId(): string {
    if (!this._keyId) {
      throw new Error('Amazon Key ID is not initialized');
    }
    return this._keyId;
  }

  private static _accessKey: string;

  static get accessKey(): string {
    if (!this._accessKey) {
      throw new Error('Amazon Access Key is not initialized');
    }
    return this._accessKey;
  }

  private static _region: string;

  static get region(): string {
    if (!this._region) {
      throw new Error('Amazon Region is not initialized');
    }
    return this._region;
  }

  static init({
    keyId,
    accessKey,
    region,
  }: {
    keyId: string;
    accessKey: string;
    region: string;
  }): void {
    ConfigAmazon._keyId = keyId;
    ConfigAmazon._accessKey = accessKey;
    ConfigAmazon._region = region;
  }
}
