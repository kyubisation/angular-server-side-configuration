import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  displayName: 'ngssc-app',
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/../setup-jest.ts'],
};
export default config;
