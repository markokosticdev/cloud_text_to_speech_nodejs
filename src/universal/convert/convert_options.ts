import { ConvertSsmlOptionsGoogle } from '../../google/convert/convert_ssml_options.js';
import { ConvertSsmlOptionsMicrosoft } from '../../microsoft/convert/convert_ssml_options.js';
import { ConvertSsmlOptionsAmazon } from '../../amazon/convert/convert_ssml_options.js';
import { ConvertTextOptionsGoogle } from '../../google/convert/convert_text_options.js';
import { ConvertTextOptionsMicrosoft } from '../../microsoft/convert/convert_text_options.js';
import { ConvertTextOptionsAmazon } from '../../amazon/convert/convert_text_options.js';
import { ParamOptionsUniversal } from '../common/param_options.js';

export class ConvertSsmlOptionsUniversal extends ParamOptionsUniversal<
  ConvertSsmlOptionsGoogle,
  ConvertSsmlOptionsMicrosoft,
  ConvertSsmlOptionsAmazon
> {}

export class ConvertTextOptionsUniversal extends ParamOptionsUniversal<
  ConvertTextOptionsGoogle,
  ConvertTextOptionsMicrosoft,
  ConvertTextOptionsAmazon
> {}
