import { BaseProxyMapper } from '../../common/http/base_proxy.js';
import { VoicesNameOptionsAmazon } from './voices_name_options.js';

export class VoicesParamsAmazon {
  nameOptions: VoicesNameOptionsAmazon;
  httpProxy: BaseProxyMapper;

  constructor({
    nameOptions,
    httpProxy,
  }: {
    nameOptions?: VoicesNameOptionsAmazon;
    httpProxy?: BaseProxyMapper;
  } = {}) {
    this.nameOptions = nameOptions ?? new VoicesNameOptionsAmazon();
    this.httpProxy = httpProxy;
  }
}
