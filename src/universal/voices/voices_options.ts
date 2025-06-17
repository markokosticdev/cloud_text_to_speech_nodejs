import { VoicesNameOptionsGoogle } from '../../google/voices/voices_name_options.js';
import { VoicesNameOptionsMicrosoft } from '../../microsoft/voices/voices_name_options.js';
import { VoicesNameOptionsAmazon } from '../../amazon/voices/voices_name_options.js';
import { ParamOptionsUniversal } from '../common/param_options.js';
import { HttpProxyMapperBase } from '../../common/http/http_proxy_base.js';

export class VoicesNameOptionsUniversal extends ParamOptionsUniversal<
  VoicesNameOptionsGoogle,
  VoicesNameOptionsMicrosoft,
  VoicesNameOptionsAmazon
> {
  protected defaultGoogle(): VoicesNameOptionsGoogle | undefined {
    return new VoicesNameOptionsGoogle();
  }

  protected defaultMicrosoft(): VoicesNameOptionsMicrosoft | undefined {
    return new VoicesNameOptionsMicrosoft();
  }

  protected defaultAmazon(): VoicesNameOptionsAmazon | undefined {
    return new VoicesNameOptionsAmazon();
  }
}

export class HttpProxyMapperOptionsUniversal extends ParamOptionsUniversal<
  HttpProxyMapperBase,
  HttpProxyMapperBase,
  HttpProxyMapperBase
> {}
