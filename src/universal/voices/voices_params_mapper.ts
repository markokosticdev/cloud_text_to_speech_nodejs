import { VoicesParamsUniversal } from './voices_params.js';
import { VoicesParamsGoogle } from '../../google/voices/voices_params.js';
import { VoicesParamsMicrosoft } from '../../microsoft/voices/voices_params.js';
import { VoicesParamsAmazon } from '../../amazon/voices/voices_params.js';

export class VoicesParamsMapper {
  static toGoogle(universalParams: VoicesParamsUniversal): VoicesParamsGoogle {
    return new VoicesParamsGoogle({
      nameOptions: universalParams.nameOptions.google,
      httpProxy: universalParams.httpProxy,
    });
  }

  static toMicrosoft(
    universalParams: VoicesParamsUniversal,
  ): VoicesParamsMicrosoft {
    return new VoicesParamsMicrosoft({
      nameOptions: universalParams.nameOptions.microsoft,
      httpProxy: universalParams.httpProxy,
    });
  }

  static toAmazon(universalParams: VoicesParamsUniversal): VoicesParamsAmazon {
    return new VoicesParamsAmazon({
      nameOptions: universalParams.nameOptions.amazon,
      httpProxy: universalParams.httpProxy,
    });
  }
}
