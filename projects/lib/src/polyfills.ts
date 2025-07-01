/* eslint-disable */
// solution taken from https://github.com/ReactiveX/rxjs/issues/5409
if (!(Symbol as any).observable) {
  (Symbol as any).observable = Symbol('Symbol.observable polyfill');
}
