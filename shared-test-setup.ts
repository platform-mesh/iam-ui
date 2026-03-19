import crypto from 'crypto';
import { TextDecoder, TextEncoder } from 'util';
import 'zone.js';
import 'zone.js/testing';

Object.defineProperty(globalThis, 'crypto', {
  value: crypto.webcrypto,
});
globalThis.fetch = () => Promise.resolve({} as Response);

globalThis.TextEncoder =
  TextEncoder as unknown as typeof globalThis.TextEncoder;
globalThis.TextDecoder =
  TextDecoder as unknown as typeof globalThis.TextDecoder;

const consoleError = console.error;
console.error = function (error: unknown, ...errorData: unknown[]) {
  if (error?.toString().includes('Could not parse CSS stylesheet')) {
    return;
  }

  if (error?.toString().includes('Not implemented: navigation')) {
    return;
  }

  consoleError(error, errorData);
  throw 'a console error occurred';
};
