import { BaseProxyMapper } from '../../common/http/base_proxy.js';
import { VoicesNameOptionsGoogle } from './voices_name_options.js';

export class VoicesParamsGoogle {
  nameOptions: VoicesNameOptionsGoogle;
  httpProxy: BaseProxyMapper;

  constructor({
    nameOptions,
    httpProxy,
  }: {
    nameOptions?: VoicesNameOptionsGoogle;
    httpProxy?: BaseProxyMapper;
  } = {}) {
    this.nameOptions = nameOptions ?? new VoicesNameOptionsGoogle();
    this.httpProxy = httpProxy;
  }
}
