import type { Config } from 'jest';
import presets from 'jest-preset-angular/presets';

const presetConfig = presets.createCjsPreset({
  isolatedModules: true,
});

const jestConfig: Config = {
  ...presetConfig,
  setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
  transformIgnorePatterns: ['/node_modules/?!@angular'],
  moduleNameMapper: {
    '^lodash-es(.*)': 'lodash',
    '@dxp/iam-lib': '<rootDir>/../lib/src/public-api.ts',
  },
};

export default jestConfig;
