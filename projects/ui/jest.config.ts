import type { Config } from 'jest';
import presets from 'jest-preset-angular/presets/index.js';

const presetConfig = presets.createCjsPreset();

const jestConfig: Config = {
  ...presetConfig,
  setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
  transformIgnorePatterns: ['/node_modules/?!@angular'],
  moduleNameMapper: {
    '^lodash-es(.*)': 'lodash',
    '@platform-mesh/iam-lib': '<rootDir>/../lib/src/public-api.ts',
  },
};

export default jestConfig;
