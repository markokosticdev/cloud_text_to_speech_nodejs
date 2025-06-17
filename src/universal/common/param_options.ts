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
    this.google = google ?? this.defaultGoogle();
    this.microsoft = microsoft ?? this.defaultMicrosoft();
    this.amazon = amazon ?? this.defaultAmazon();
  }

  protected defaultGoogle(): G | undefined {
    return undefined;
  }

  protected defaultMicrosoft(): M | undefined {
    return undefined;
  }

  protected defaultAmazon(): A | undefined {
    return undefined;
  }
}
