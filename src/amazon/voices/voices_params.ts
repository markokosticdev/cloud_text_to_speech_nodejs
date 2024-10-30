import { HttpProxyMapperBase } from '../../common/http/http_proxy_base.js';
import { VoicesNameOptionsAmazon } from './voices_name_options.js';

export class VoicesParamsAmazon {
  nameOptions: VoicesNameOptionsAmazon;
  httpProxy: HttpProxyMapperBase;

  constructor({
    nameOptions,
    httpProxy,
  }: {
    nameOptions?: VoicesNameOptionsAmazon;
    httpProxy?: HttpProxyMapperBase;
  } = {}) {
    this.nameOptions = nameOptions ?? new VoicesNameOptionsAmazon();
    this.httpProxy = httpProxy;
  }
}
