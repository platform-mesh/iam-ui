import type { Config } from 'jest';

const jestConfig: Config = {
  projects: [
    '<rootDir>/projects/lib',
    '<rootDir>/projects/ui',
    '<rootDir>/projects/wc',
  ],
  reporters: ['default', ['jest-junit', { outputName: 'TEST-frontend.xml' }]],
};

export default jestConfig;
