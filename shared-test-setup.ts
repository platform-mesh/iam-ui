import { global } from '@apollo/client/utilities/globals';
import crypto from 'crypto';
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
import { TextDecoder, TextEncoder } from 'util';

Object.defineProperty(globalThis, 'crypto', {
  value: crypto.webcrypto,
});
global.fetch = () => Promise.resolve({} as Response);

setupZoneTestEnv();
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as unknown as typeof globalThis.TextDecoder;
