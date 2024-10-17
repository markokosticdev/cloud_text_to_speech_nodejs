import { VoicesNameOptionsGoogle } from '../../google/voices/voices_name_options.js';
import { VoicesNameOptionsMicrosoft } from '../../microsoft/voices/voices_name_options.js';
import { VoicesNameOptionsAmazon } from '../../amazon/voices/voices_name_options.js';

export class VoicesOptionsUniversal<G, M, A> {
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

export class VoicesNameOptionsUniversal extends VoicesOptionsUniversal<
  VoicesNameOptionsGoogle,
  VoicesNameOptionsMicrosoft,
  VoicesNameOptionsAmazon
> {}
