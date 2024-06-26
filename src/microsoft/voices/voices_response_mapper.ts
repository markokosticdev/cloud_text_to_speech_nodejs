import { AxiosResponse } from 'axios';
import { BaseResponseMapper } from '../../common/http/base_response_mapper.js';
import { VoiceMicrosoft } from './voice_model.js';
import { Helpers } from '../../common/utils/helpers.js';
import {
  VoicesFailedBadGateWayMicrosoft,
  VoicesFailedBadRequestMicrosoft,
  VoicesFailedTooManyRequestsMicrosoft,
  VoicesFailedUnauthorizedMicrosoft,
  VoicesFailedUnknownErrorMicrosoft,
  VoicesSuccessMicrosoft,
} from './voices_responses.js';
import { VoiceNames } from '../../common/other/voice_names.js';
import { BaseResponse } from '../../common/http/base_response.js';

export class VoicesResponseMapperMicrosoft implements BaseResponseMapper {
  map(response: AxiosResponse): BaseResponse {
    switch (response.status) {
      case 200:
        const jsonData = response.data as Array<object>;

        let voices = jsonData.map((e) => VoiceMicrosoft.fromJson(e as never));

        voices = Helpers.removeVoiceDuplicates(voices);

        voices = Helpers.sortVoices(voices);

        voices = Helpers.mapVoiceNames(
          voices,
          VoiceNames.male,
          VoiceNames.female,
        );

        return new VoicesSuccessMicrosoft(voices);
      case 400:
        return new VoicesFailedBadRequestMicrosoft(response.statusText);
      case 401:
        return new VoicesFailedUnauthorizedMicrosoft();
      case 429:
        return new VoicesFailedTooManyRequestsMicrosoft();
      case 502:
        return new VoicesFailedBadGateWayMicrosoft();
      default:
        return new VoicesFailedUnknownErrorMicrosoft(
          response.status,
          response.statusText || JSON.stringify(response.data),
        );
    }
  }
}
