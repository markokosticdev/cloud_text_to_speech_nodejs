import { HttpProxyMapperBase } from '../../common/http/http_proxy_base.js';
import { VoicesNameOptionsMicrosoft } from './voices_name_options.js';

export class VoicesParamsMicrosoft {
  nameOptions: VoicesNameOptionsMicrosoft;
  httpProxy: HttpProxyMapperBase;

  constructor({
    nameOptions,
    httpProxy,
  }: {
    nameOptions?: VoicesNameOptionsMicrosoft;
    httpProxy?: HttpProxyMapperBase;
  } = {}) {
    this.nameOptions = nameOptions ?? new VoicesNameOptionsMicrosoft();
    this.httpProxy = httpProxy;
  }
}
