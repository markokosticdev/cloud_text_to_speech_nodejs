import { ConvertSsmlOptionsGoogle } from '../../google/convert/convert_ssml_options.js';
import { ConvertSsmlOptionsMicrosoft } from '../../microsoft/convert/convert_ssml_options.js';
import { ConvertSsmlOptionsAmazon } from '../../amazon/convert/convert_ssml_options.js';
import { ConvertTextOptionsGoogle } from '../../google/convert/convert_text_options.js';
import { ConvertTextOptionsMicrosoft } from '../../microsoft/convert/convert_text_options.js';
import { ConvertTextOptionsAmazon } from '../../amazon/convert/convert_text_options.js';

export class ConvertOptionsUniversal<G, M, A> {
  google: G;
  microsoft: M;
  amazon: A;

  constructor({
    google,
    microsoft,
    amazon,
  }: {
    google?: G;
    microsoft?: M;
    amazon?: A;
  } = {}) {
    this.google = google;
    this.microsoft = microsoft;
    this.amazon = amazon;
  }
}

export class ConvertSsmlOptionsUniversal extends ConvertOptionsUniversal<
  ConvertSsmlOptionsGoogle,
  ConvertSsmlOptionsMicrosoft,
  ConvertSsmlOptionsAmazon
> {}

export class ConvertTextOptionsUniversal extends ConvertOptionsUniversal<
  ConvertTextOptionsGoogle,
  ConvertTextOptionsMicrosoft,
  ConvertTextOptionsAmazon
> {}
