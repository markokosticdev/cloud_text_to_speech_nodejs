export class Log {
  private static _enabled: boolean = false;
  private static _package: string = '[cloud_text_to_speech]';

  static get isEnabled(): boolean {
    return Log._enabled;
  }

  static enable(): void {
    Log._enabled = true;
  }

  static disable(): void {
    Log._enabled = false;
  }

  static d(message: string, tag?: string): void {
    if (Log.isEnabled) {
      console.log(`${Log._package} -> ${tag || ''} : ${message}`);
    }
  }
}
