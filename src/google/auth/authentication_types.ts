import { BaseHeader } from '../../common/http/base_header.js';

///Base class that all authentications types must implement.
export abstract class AuthenticationHeaderGoogle extends BaseHeader {
  ///[type] The type of Microsoft Authorisation Header to use.
  ///[value] The value assigned to the [type].
  constructor(type: string, value: string) {
    super(type, value);
  }
}

///Authentication using X-goog-api-key header type
export class ApiKeyAuthenticationHeaderGoogle extends AuthenticationHeaderGoogle {
  constructor(apiKey: string) {
    super('X-goog-api-key', apiKey);
  }

  get headerValue(): string {
    return this.value;
  }
}
