import {
  HttpProxyMapperOptionsUniversal,
  VoicesNameOptionsUniversal,
} from './voices_options.js';
import { VoicesNameOptionsGoogle } from '../../google/voices/voices_name_options.js';
import { VoicesNameOptionsMicrosoft } from '../../microsoft/voices/voices_name_options.js';
import { VoicesNameOptionsAmazon } from '../../amazon/voices/voices_name_options.js';

export class VoicesParamsUniversal {
  nameOptions: VoicesNameOptionsUniversal;
  httpProxy: HttpProxyMapperOptionsUniversal;

  constructor({
    nameOptions,
    httpProxy,
  }: {
    nameOptions?: VoicesNameOptionsUniversal;
    httpProxy?: HttpProxyMapperOptionsUniversal;
  }) {
    this.nameOptions =
      nameOptions ??
      new VoicesNameOptionsUniversal({
        google: new VoicesNameOptionsGoogle(),
        microsoft: new VoicesNameOptionsMicrosoft(),
        amazon: new VoicesNameOptionsAmazon(),
      });
    this.httpProxy = httpProxy;
  }
}
