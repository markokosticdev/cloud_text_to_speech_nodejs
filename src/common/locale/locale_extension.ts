import pkg from 'country-codes-list';

const { customList } = pkg;

export class Locale {
  private static _deprecatedLanguageSubtagMap: { [key: string]: string } = {
    in: 'id',
    iw: 'he',
    ji: 'yi',
    jw: 'jv',
    mo: 'ro',
    aam: 'aas',
    adp: 'dz',
    aue: 'ktz',
    ayx: 'nun',
    bgm: 'bcg',
    bjd: 'drl',
    ccq: 'rki',
    cjr: 'mom',
    cka: 'cmr',
    cmk: 'xch',
    coy: 'pij',
    cqu: 'quh',
    drh: 'khk',
    drw: 'prs',
    gav: 'dev',
    gfx: 'vaj',
    ggn: 'gvr',
    gti: 'nyc',
    guv: 'duz',
    hrr: 'jal',
    ibi: 'opa',
    ilw: 'gal',
    jeg: 'oyb',
    kgc: 'tdf',
    kgh: 'kml',
    koj: 'kwv',
    krm: 'bmf',
    ktr: 'dtp',
    kvs: 'gdj',
    kwq: 'yam',
    kxe: 'tvd',
    kzj: 'dtp',
    kzt: 'dtp',
    lii: 'raq',
    lmm: 'rmx',
    meg: 'cir',
    mst: 'mry',
    mwj: 'vaj',
    myt: 'mry',
    nad: 'xny',
    ncp: 'kdz',
    nnx: 'ngv',
    nts: 'pij',
    oun: 'vaj',
    pcr: 'adx',
    pmc: 'huw',
    pmu: 'phr',
    ppa: 'bfy',
    ppr: 'lcq',
    pry: 'prt',
    puz: 'pub',
    sca: 'hle',
    skk: 'oyb',
    tdu: 'dtp',
    thc: 'tpo',
    thx: 'oyb',
    tie: 'ras',
    tkk: 'twm',
    tlw: 'weo',
    tmp: 'tyj',
    tne: 'kak',
    tnf: 'prs',
    tsf: 'taj',
    uok: 'ema',
    xba: 'cax',
    xia: 'acn',
    xkh: 'waw',
    xsj: 'suj',
    ybd: 'rki',
    yma: 'lrr',
    ymt: 'mtm',
    yos: 'zom',
    yuu: 'yug',
  };
  private static _deprecatedRegionSubtagMap: { [key: string]: string } = {
    BU: 'MM',
    DD: 'DE',
    FX: 'FR',
    TP: 'TL',
    YD: 'YE',
    ZR: 'CD',
  };
  public scriptCode?: string;

  constructor(languageCode: string, countryCode?: string) {
    if (!languageCode) throw new Error('languageCode cannot be empty');
    this._languageCode = languageCode;
    this._countryCode = countryCode;
    this.scriptCode = null;
  }

  private _languageCode: string;

  get languageCode(): string {
    return (
      Locale._deprecatedLanguageSubtagMap[this._languageCode] ||
      this._languageCode
    );
  }

  private _countryCode?: string;

  get countryCode(): string | undefined {
    return (
      Locale._deprecatedRegionSubtagMap[this._countryCode ?? ''] ||
      this._countryCode
    );
  }

  get defaultDisplayLanguage(): string {
    const languages = customList(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      'officialLanguageCode',
      '{officialLanguageNameEn}',
    );
    return languages[this._languageCode];
  }

  get nativeDisplayLanguage(): string {
    const languages = customList(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      'officialLanguageCode',
      '{officialLanguageNameLocal}',
    );
    return languages[this._languageCode];
  }

  get defaultDisplayCountry(): string {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const countries = customList('countryCode', '{countryNameEn}');
    return countries[this._countryCode];
  }

  get nativeDisplayCountry(): string {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const countries = customList('countryCode', '{countryNameLocal}');
    return countries[this._countryCode];
  }

  get defaultDisplayScript(): string {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const scripts = customList('countryCode', '{countryNameLocal}');
    return scripts[this.scriptCode];
  }

  get nativeDisplayScript(): string {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const scripts = customList('countryCode', '{countryNameLocal}');
    return scripts[this.scriptCode];
  }

  static fromSubtags({
    languageCode = 'und',
    scriptCode,
    countryCode,
  }: {
    languageCode?: string;
    scriptCode?: string;
    countryCode?: string;
  }): Locale {
    if (!languageCode) throw new Error('languageCode cannot be empty');
    // if (scriptCode !== undefined) throw new Error("scriptCode cannot be empty");
    // if (countryCode !== undefined) throw new Error("countryCode cannot be empty");
    const locale = new Locale(languageCode, countryCode);
    locale.scriptCode = scriptCode;
    return locale;
  }

  equals(other: Locale): boolean {
    if (this === other) {
      return true;
    }
    const thisCountryCode = this.countryCode;
    const otherCountryCode = other.countryCode;
    return (
      other.languageCode === this.languageCode &&
      other.scriptCode === this.scriptCode &&
      (other.countryCode === thisCountryCode ||
        (otherCountryCode !== undefined &&
          otherCountryCode === '' &&
          thisCountryCode === undefined) ||
        (thisCountryCode !== undefined &&
          thisCountryCode === '' &&
          other.countryCode === undefined))
    );
  }

  toString(): string {
    const localeString = this.toLanguageTag();
    return localeString;
  }

  toLanguageTag(): string {
    let result = this.languageCode;
    if (this.scriptCode) {
      result += `-${this.scriptCode}`;
    }
    if (this._countryCode) {
      result += `-${this.countryCode}`;
    }
    return result;
  }
}
