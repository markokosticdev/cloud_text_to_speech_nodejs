import { AxiosResponse } from 'axios';
import { HttpResponseBase } from './http_response_base.js';

export interface BaseResponseMapper {
  map(response: AxiosResponse): HttpResponseBase;
}
