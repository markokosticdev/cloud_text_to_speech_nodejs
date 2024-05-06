import { BaseResponse } from '../../common/http/base_response.js';

export abstract class AudioResponseAmazon extends BaseResponse {
  protected constructor(code: number, reason: string) {
    super(code, reason);
  }
}

export class AudioSuccessAmazon extends AudioResponseAmazon {
  constructor(public audio: Uint8Array) {
    super(200, 'Success');
  }
}

export class AudioFailedBadRequestAmazon extends AudioResponseAmazon {
  constructor(reasonPhrase?: string) {
    super(
      400,
      `Bad Request A required parameter is missing, empty, or null. Or, the value passed to either a required or optional parameter is invalid. A common issue is a header that is too long. ${reasonPhrase ?? ''}`,
    );
  }
}

export class AudioFailedUnauthorizedAmazon extends AudioResponseAmazon {
  constructor() {
    super(
      401,
      'Unauthorized The request is not authorized. Check to make sure your subscription key or token is valid and in the correct region.',
    );
  }
}

export class AudioFailedUnsupportedAmazon extends AudioResponseAmazon {
  constructor() {
    super(
      415,
      "Unsupported Media Type It's possible that the wrong Content-Type was provided. Content-Type should be set to application/ssml+xml.",
    );
  }
}

export class AudioFailedTooManyRequestAmazon extends AudioResponseAmazon {
  constructor() {
    super(
      429,
      'Too Many Requests You have exceeded the quota or rate of requests allowed for your subscription.',
    );
  }
}

export class AudioFailedBadGatewayAmazon extends AudioResponseAmazon {
  constructor() {
    super(
      502,
      'Bad Gateway Network or server-side issue. May also indicate invalid headers.',
    );
  }
}

export class AudioFailedUnknownErrorAmazon extends AudioResponseAmazon {
  constructor(code: number, reason: string) {
    super(code, reason);
  }
}
