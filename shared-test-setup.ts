import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
import { TextDecoder, TextEncoder } from 'util';

setupZoneTestEnv();
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const consoleError = console.error;
console.error = function (error: unknown, ...errorData: unknown[]) {
  consoleError(error, errorData);
  throw 'a console error occurred';
};
