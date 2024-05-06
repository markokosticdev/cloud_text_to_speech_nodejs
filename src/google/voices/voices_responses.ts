import { BaseResponse } from '../../common/http/base_response.js';
import { VoiceGoogle } from './voice_model.js';

export class VoicesResponseGoogle extends BaseResponse {
  protected constructor(code: number, reason: string) {
    super(code, reason);
  }
}

export class VoicesSuccessGoogle extends VoicesResponseGoogle {
  constructor(public voices: VoiceGoogle[]) {
    super(200, 'Success');
  }
}

export class VoicesFailedBadRequestGoogle extends VoicesResponseGoogle {
  constructor(reasonPhrase?: string) {
    super(
      400,
      `Bad Request A required parameter is missing, empty, or null. Or, the value passed to either a required or optional parameter is invalid. A common issue is a header that is too long. ${reasonPhrase ?? ''}`,
    );
  }
}

export class VoicesFailedUnauthorizedGoogle extends VoicesResponseGoogle {
  constructor() {
    super(
      401,
      'Unauthorized The request is not authorized. Check to make sure your subscription key or token is valid and in the correct region.',
    );
  }
}

export class VoicesFailedTooManyRequestsGoogle extends VoicesResponseGoogle {
  constructor() {
    super(
      429,
      'Too Many Requests You have exceeded the quota or rate of requests allowed for your subscription.',
    );
  }
}

export class VoicesFailedBadGateWayGoogle extends VoicesResponseGoogle {
  constructor() {
    super(
      502,
      'Bad Gateway Network or server-side issue. May also indicate invalid headers.',
    );
  }
}

export class VoicesFailedUnknownErrorGoogle extends VoicesResponseGoogle {
  constructor(code: number, reason: string) {
    super(code, reason);
  }
}
