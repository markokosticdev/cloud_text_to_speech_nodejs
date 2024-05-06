import { AxiosResponse } from 'axios';
import { BaseResponse } from './base_response.js';

export interface BaseResponseMapper {
  map(response: AxiosResponse): BaseResponse;
}
