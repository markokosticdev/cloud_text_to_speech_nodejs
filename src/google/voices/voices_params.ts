import { HttpProxyMapperBase } from '../../common/http/http_proxy_base.js';
import { VoicesNameOptionsGoogle } from './voices_name_options.js';

export class VoicesParamsGoogle {
  nameOptions: VoicesNameOptionsGoogle;
  httpProxy: HttpProxyMapperBase;

  constructor({
    nameOptions,
    httpProxy,
  }: {
    nameOptions?: VoicesNameOptionsGoogle;
    httpProxy?: HttpProxyMapperBase;
  } = {}) {
    this.nameOptions = nameOptions ?? new VoicesNameOptionsGoogle();
    this.httpProxy = httpProxy;
  }
}
