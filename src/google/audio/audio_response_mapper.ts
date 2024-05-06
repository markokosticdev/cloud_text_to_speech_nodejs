import { BaseResponseMapper } from '../../common/http/base_response_mapper.js';
import { AxiosResponse } from 'axios';
import { BaseResponse } from '../../common/http/base_response.js';
import {
  AudioFailedBadGatewayGoogle,
  AudioFailedBadRequestGoogle,
  AudioFailedTooManyRequestGoogle,
  AudioFailedUnauthorizedGoogle,
  AudioFailedUnknownErrorGoogle,
  AudioFailedUnsupportedGoogle,
  AudioSuccessGoogle,
} from './audio_responses.js';

export class AudioResponseMapperGoogle implements BaseResponseMapper {
  map(response: AxiosResponse): BaseResponse {
    switch (response.status) {
      case 200:
        const audioContent: string = response.data.audioContent;
        const bodyBytes: Uint8Array = Buffer.from(audioContent, 'base64');
        return new AudioSuccessGoogle(bodyBytes);
      case 400:
        return new AudioFailedBadRequestGoogle(response.statusText);
      case 401:
        return new AudioFailedUnauthorizedGoogle();
      case 415:
        return new AudioFailedUnsupportedGoogle();
      case 429:
        return new AudioFailedTooManyRequestGoogle();
      case 502:
        return new AudioFailedBadGatewayGoogle();
      default:
        return new AudioFailedUnknownErrorGoogle(
          response.status,
          response.statusText || JSON.stringify(response.data),
        );
    }
  }
}
