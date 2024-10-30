export class ParamOptionsUniversal<G, M, A> {
  google: G | undefined;
  microsoft: M | undefined;
  amazon: A | undefined;

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
