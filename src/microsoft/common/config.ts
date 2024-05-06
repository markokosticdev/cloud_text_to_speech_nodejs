///Holds all configurations
export class ConfigMicrosoft {
  private constructor() {}

  private static _subscriptionKey: string;

  static get subscriptionKey(): string {
    if (!this._subscriptionKey) {
      throw new Error('Microsoft Subscription Key is not initialized');
    }
    return this._subscriptionKey;
  }

  private static _region: string;

  static get region(): string | undefined {
    if (!this._region) {
      throw new Error('Microsoft Region is not initialized');
    }
    return this._region;
  }

  static init({
    subscriptionKey,
    region,
  }: {
    subscriptionKey: string;
    region: string;
  }): void {
    ConfigMicrosoft._subscriptionKey = subscriptionKey;
    ConfigMicrosoft._region = region;
  }
}
