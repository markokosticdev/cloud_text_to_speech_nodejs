import { AxiosResponse } from 'axios';
import { BaseResponseMapper } from '../../common/http/base_response_mapper.js';
import { VoiceAmazon } from './voices_model.js';
import { Helpers } from '../../common/utils/helpers.js';
import {
  VoicesFailedBadGateWayAmazon,
  VoicesFailedBadRequestAmazon,
  VoicesFailedTooManyRequestsAmazon,
  VoicesFailedUnauthorizedAmazon,
  VoicesFailedUnknownErrorAmazon,
  VoicesSuccessAmazon,
} from './voices_responses.js';
import { VoiceNames } from '../../common/voices/voices_names.js';
import { BaseResponse } from '../../common/http/base_response.js';

export class VoicesResponseMapperAmazon implements BaseResponseMapper {
  map(response: AxiosResponse): BaseResponse {
    switch (response.status) {
      case 200:
        const jsonData = response.data['Voices'] as Array<object>;

        let voices = jsonData.map((e) => VoiceAmazon.fromJson(e as never));

        voices = Helpers.removeVoiceDuplicates(voices);

        voices = Helpers.sortVoices(voices);

        voices = Helpers.mapVoiceNames(
          voices,
          VoiceNames.male,
          VoiceNames.female,
        );

        return new VoicesSuccessAmazon(voices);
      case 400:
        return new VoicesFailedBadRequestAmazon(response.statusText);
      case 401:
        return new VoicesFailedUnauthorizedAmazon();
      case 429:
        return new VoicesFailedTooManyRequestsAmazon();
      case 502:
        return new VoicesFailedBadGateWayAmazon();
      default:
        return new VoicesFailedUnknownErrorAmazon(
          response.status,
          response.statusText || JSON.stringify(response.data),
        );
    }
  }
}
