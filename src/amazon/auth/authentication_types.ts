import { BaseHeader } from "../../common/http/base_header.js";

///Base class that all authentications types must implement.
export abstract class AuthenticationHeaderAmazon extends BaseHeader {
  ///[type] The type of Amazon Authorisation Header to use.
  ///[value] The value assigned to the [type].
  constructor(type: string, value: string) {
    super(type, value);
  }
}
