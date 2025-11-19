import type { Config } from 'jest';
import presets from 'jest-preset-angular/presets/index.js';

const presetConfig = presets.createCjsPreset();

const jestConfig: Config = {
  ...presetConfig,
  setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
  transformIgnorePatterns: ['/node_modules/?!@angular'],
  moduleNameMapper: {
    '^lodash-es(.*)': 'lodash',
    '\\.(css|scss)$': 'identity-obj-proxy',
  },
};

export default jestConfig;
