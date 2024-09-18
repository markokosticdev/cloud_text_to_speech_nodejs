import { VoiceLocale } from '../locale/locale_model.js';

export class VoiceBase {
  provider: string;
  engines: string[];
  code: string;
  name: string;
  nativeName: string;
  gender: string;
  locale: VoiceLocale;

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
    this.provider = provider;
    this.engines = engines;
    this.code = code;
    this.name = name;
    this.nativeName = nativeName;
    this.gender = gender;
    this.locale = locale;
  }
}
