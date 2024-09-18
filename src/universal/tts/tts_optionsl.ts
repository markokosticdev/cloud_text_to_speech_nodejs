export class TtsOptionsUniversal<G , M, A> {
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
    this.microsoft =microsoft;
    this.amazon = amazon;
  }
}
