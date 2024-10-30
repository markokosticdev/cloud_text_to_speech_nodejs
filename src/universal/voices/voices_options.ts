import { VoicesNameOptionsGoogle } from '../../google/voices/voices_name_options.js';
import { VoicesNameOptionsMicrosoft } from '../../microsoft/voices/voices_name_options.js';
import { VoicesNameOptionsAmazon } from '../../amazon/voices/voices_name_options.js';
import { ParamOptionsUniversal } from '../common/param_options.js';
import { HttpProxyMapperBase } from '../../common/http/http_proxy_base.js';

export class VoicesNameOptionsUniversal extends ParamOptionsUniversal<
  VoicesNameOptionsGoogle,
  VoicesNameOptionsMicrosoft,
  VoicesNameOptionsAmazon
> {}

export class HttpProxyMapperOptionsUniversal extends ParamOptionsUniversal<
  HttpProxyMapperBase,
  HttpProxyMapperBase,
  HttpProxyMapperBase
> {}
