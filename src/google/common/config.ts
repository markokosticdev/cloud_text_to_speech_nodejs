///Holds all configurations
export class ConfigGoogle {
  private constructor() {}

  private static _apiKey: string;

  static get apiKey(): string {
    if (!this._apiKey) {
      throw new Error('Google API Key is not initialized');
    }
    return this._apiKey;
  }

  private static _projectId?: string;

  static get projectId(): string | undefined {
    return this._projectId;
  }

  static init({
    apiKey,
    projectId,
  }: {
    apiKey: string;
    projectId?: string;
  }): void {
    ConfigGoogle._apiKey = apiKey;
    ConfigGoogle._projectId = projectId;
  }
}
