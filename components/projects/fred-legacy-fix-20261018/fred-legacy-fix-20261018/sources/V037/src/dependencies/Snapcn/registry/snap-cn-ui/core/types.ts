// FredTalk 2.5 distribution: fred-legacy-fix-20261018
export interface Step<S extends string = string> {
  at: number;
  state: S;
  duration?: number;
}
