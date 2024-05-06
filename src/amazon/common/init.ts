export class InitParamsAmazon {
  keyId: string;
  accessKey: string;
  region: string;

  constructor(keyId: string, accessKey: string, region: string) {
    this.keyId = keyId;
    this.accessKey = accessKey;
    this.region = region;
  }
}
