import { HttpHeaderBase } from '../../common/http/http_header_base.js';

///Base class that all authentications types must implement.
export abstract class AuthenticationHeaderAmazon extends HttpHeaderBase {
  ///[type] The type of Amazon Authorisation Header to use.
  ///[value] The value assigned to the [type].
  constructor(type: string, value: string) {
    super(type, value);
  }
}
