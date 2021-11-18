import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  displayName: 'angular-server-side-configuration:node',
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/../../setup-jest.ts'],
  testEnvironment: 'node',
  roots: ['<rootDir>/builders', '<rootDir>/schematics', '<rootDir>/src'],
};
export default config;
