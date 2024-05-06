import { BaseResponseMapper } from '../../common/http/base_response_mapper.js';
import { AxiosResponse } from 'axios';
import { BaseResponse } from '../../common/http/base_response.js';
import {
  AudioFailedBadGatewayAmazon,
  AudioFailedBadRequestAmazon,
  AudioFailedTooManyRequestAmazon,
  AudioFailedUnauthorizedAmazon,
  AudioFailedUnknownErrorAmazon,
  AudioFailedUnsupportedAmazon,
  AudioSuccessAmazon,
} from './audio_responses.js';

export class AudioResponseMapperAmazon implements BaseResponseMapper {
  map(response: AxiosResponse): BaseResponse {
    switch (response.status) {
      case 200:
        return new AudioSuccessAmazon(response.data);
      case 400:
        return new AudioFailedBadRequestAmazon(response.statusText);
      case 401:
        return new AudioFailedUnauthorizedAmazon();
      case 415:
        return new AudioFailedUnsupportedAmazon();
      case 429:
        return new AudioFailedTooManyRequestAmazon();
      case 502:
        return new AudioFailedBadGatewayAmazon();
      default:
        return new AudioFailedUnknownErrorAmazon(
          response.status,
          response.statusText || JSON.stringify(response.data),
        );
    }
  }
}
