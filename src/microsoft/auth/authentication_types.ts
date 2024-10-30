import { HttpHeaderBase } from '../../common/http/http_header_base.js';

///Base class that all authentications types must implement.
export abstract class AuthenticationHeaderMicrosoft extends HttpHeaderBase {
  ///[type] The type of Microsoft Authorisation Header to use.
  ///[value] The value assigned to the [type].
  constructor(type: string, value: string) {
    super(type, value);
  }
}

///Authentication using Ocp-Apim-Subscription-Key header type
export class SubscriptionKeyAuthenticationHeaderMicrosoft extends AuthenticationHeaderMicrosoft {
  constructor(subscriptionKey: string) {
    super('Ocp-Apim-Subscription-Key', subscriptionKey);
  }

  get headerValue(): string {
    return this.value;
  }
}
