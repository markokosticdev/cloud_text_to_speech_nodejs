export class VoiceLocale {
  code: string;
  name?: string;
  nativeName?: string;
  languageCode?: string;
  languageName?: string;
  nativeLanguageName?: string;
  countryCode?: string;
  countryName?: string;
  nativeCountryName?: string;
  scriptCode?: string;
  scriptName?: string;
  nativeScriptName?: string;

  constructor({
    code,
    name,
    nativeName,
    languageCode,
    languageName,
    nativeLanguageName,
    countryCode,
    countryName,
    nativeCountryName,
    scriptCode,
    scriptName,
    nativeScriptName,
  }: {
    code: string;
    name?: string;
    nativeName?: string;
    languageCode?: string;
    languageName?: string;
    nativeLanguageName?: string;
    countryCode?: string;
    countryName?: string;
    nativeCountryName?: string;
    scriptCode?: string;
    scriptName?: string;
    nativeScriptName?: string;
  }) {
    this.code = code;
    this.name = name;
    this.nativeName = nativeName;
    this.languageCode = languageCode;
    this.languageName = languageName;
    this.nativeLanguageName = nativeLanguageName;
    this.countryCode = countryCode;
    this.countryName = countryName;
    this.nativeCountryName = nativeCountryName;
    this.scriptCode = scriptCode;
    this.scriptName = scriptName;
    this.nativeScriptName = nativeScriptName;
  }

  // Static method to create an instance with only code
  static fromCode(code: string): VoiceLocale {
    return new VoiceLocale({ code });
  }

  toString(): string {
    return `VoiceLocale{code: ${this.code}, name: ${this.name}, nativeName: ${this.nativeName}, languageCode: ${this.languageCode}, languageName: ${this.languageName}, nativeLanguageName: ${this.nativeLanguageName}, countryCode: ${this.countryCode}, countryName: ${this.countryName}, nativeCountryName: ${this.nativeCountryName}, scriptCode: ${this.scriptCode}, scriptName: ${this.scriptName}, nativeScriptName: ${this.nativeScriptName}}`;
  }
}
