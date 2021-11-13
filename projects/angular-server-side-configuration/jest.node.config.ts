import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/../../setup-jest.ts'],
  testEnvironment: 'node',
  roots: ['<rootDir>/builders', '<rootDir>/schematics', '<rootDir>/src'],
};
export default config;
