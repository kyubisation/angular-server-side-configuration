import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  projects: [
    '<rootDir>/src/jest.config.ts',
    '<rootDir>/projects/angular-server-side-configuration/jest.browser.config.ts',
    '<rootDir>/projects/angular-server-side-configuration/jest.node.config.ts',
  ],
  reporters: ['default', 'jest-junit'],
  collectCoverage: true,
  collectCoverageFrom: ['**/*.ts', '!**/*.spec.ts'],
  coverageReporters: ['cobertura', 'html'],
  coverageDirectory: 'coverage',
};
export default config;
