import { BaseResponseMapper } from '../../common/http/base_response_mapper.js';
import { AxiosResponse } from 'axios';
import { BaseResponse } from '../../common/http/base_response.js';
import {
  AudioFailedBadGatewayMicrosoft,
  AudioFailedBadRequestMicrosoft,
  AudioFailedTooManyRequestMicrosoft,
  AudioFailedUnauthorizedMicrosoft,
  AudioFailedUnknownErrorMicrosoft,
  AudioFailedUnsupportedMicrosoft,
  AudioSuccessMicrosoft,
} from './audio_responses.js';

export class AudioResponseMapperMicrosoft implements BaseResponseMapper {
  map(response: AxiosResponse): BaseResponse {
    switch (response.status) {
      case 200:
        return new AudioSuccessMicrosoft(response.data);
      case 400:
        return new AudioFailedBadRequestMicrosoft(response.statusText);
      case 401:
        return new AudioFailedUnauthorizedMicrosoft();
      case 415:
        return new AudioFailedUnsupportedMicrosoft();
      case 429:
        return new AudioFailedTooManyRequestMicrosoft();
      case 502:
        return new AudioFailedBadGatewayMicrosoft();
      default:
        return new AudioFailedUnknownErrorMicrosoft(
          response.status,
          response.statusText || JSON.stringify(response.data),
        );
    }
  }
}
