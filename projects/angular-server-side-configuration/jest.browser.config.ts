import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  displayName: 'angular-server-side-configuration:browser',
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/../../setup-jest.ts'],
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/ng-env', '<rootDir>/process'],
};
export default config;
