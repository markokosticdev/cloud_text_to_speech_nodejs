import { BaseProxyMapper } from '../../common/http/base_proxy.js';
import { VoicesNameOptionsMicrosoft } from './voices_name_options.js';

export class VoicesParamsMicrosoft {
  nameOptions: VoicesNameOptionsMicrosoft;
  httpProxy: BaseProxyMapper;

  constructor({
    nameOptions,
    httpProxy,
  }: {
    nameOptions?: VoicesNameOptionsMicrosoft;
    httpProxy?: BaseProxyMapper;
  } = {}) {
    this.nameOptions = nameOptions ?? new VoicesNameOptionsMicrosoft();
    this.httpProxy = httpProxy;
  }
}
