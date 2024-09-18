import { VoiceLocale } from '../../common/locale/locale_model.js';
import { VoiceBase } from '../../common/voices/voices_base.js';

export class VoiceUniversal extends VoiceBase {
  constructor({
    provider,
    engines,
    code,
    name,
    nativeName,
    gender,
    locale,
  }: {
    provider: string;
    engines: string[];
    code: string;
    name: string;
    nativeName: string;
    gender: string;
    locale: VoiceLocale;
  }) {
    super({
      provider,
      engines,
      code,
      name,
      nativeName,
      gender,
      locale,
    });
  }
}
