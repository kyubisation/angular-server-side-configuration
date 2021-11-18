import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  projects: [
    '<rootDir>/src/jest.config.ts',
    '<rootDir>/projects/angular-server-side-configuration/jest.browser.config.ts',
    '<rootDir>/projects/angular-server-side-configuration/jest.node.config.ts',
  ],
  reporters: ['default', 'jest-junit'],
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.ts',
    // Exclude specs
    '!**/*.spec.ts',
    // Exclude jest configs
    '!**/*.config.ts',
    // Exclude app files
    '!**/main.ts',
    '!**/polyfills.ts',
    '!**/app.module.ts',
    '!**/environment.prod.ts',
  ],
  coverageReporters: ['cobertura', 'html'],
  coverageDirectory: 'coverage',
};
export default config;
