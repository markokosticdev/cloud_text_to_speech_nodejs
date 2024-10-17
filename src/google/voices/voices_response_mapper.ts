import { AxiosResponse } from 'axios';
import { BaseResponseMapper } from '../../common/http/base_response_mapper.js';
import { VoiceGoogle } from './voices_model.js';
import { Helpers } from '../../common/utils/helpers.js';
import {
  VoicesFailedBadGateWayGoogle,
  VoicesFailedBadRequestGoogle,
  VoicesFailedTooManyRequestsGoogle,
  VoicesFailedUnauthorizedGoogle,
  VoicesFailedUnknownErrorGoogle,
  VoicesSuccessGoogle,
} from './voices_responses.js';
import { BaseResponse } from '../../common/http/base_response.js';
import { VoicesParamsGoogle } from './voices_params.js';

export class VoicesResponseMapperGoogle implements BaseResponseMapper {
  params: VoicesParamsGoogle;

  constructor(params: VoicesParamsGoogle) {
    this.params = params;
  }

  map(response: AxiosResponse): BaseResponse {
    switch (response.status) {
      case 200:
        const jsonData = response.data['voices'] as Array<object>;

        let voices = jsonData.map((e) => VoiceGoogle.fromJson(e as never));

        voices = Helpers.removeVoiceDuplicates(voices);

        voices = Helpers.sortVoices(voices);

        voices = Helpers.mapVoiceNames(voices, this.params.nameOptions);

        return new VoicesSuccessGoogle(voices);
      case 400:
        return new VoicesFailedBadRequestGoogle(response.statusText);
      case 401:
        return new VoicesFailedUnauthorizedGoogle();
      case 429:
        return new VoicesFailedTooManyRequestsGoogle();
      case 502:
        return new VoicesFailedBadGateWayGoogle();
      default:
        return new VoicesFailedUnknownErrorGoogle(
          response.status,
          response.statusText || JSON.stringify(response.data),
        );
    }
  }
}
