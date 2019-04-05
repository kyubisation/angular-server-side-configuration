import { envContent, envContentNg4Env, envContentNgEnv } from '../test/temporary-fs';

import { DetectedVariables } from './models/detected-variables';
import { VariableDetector } from './variable-detector';

describe('VariableDetector', () => {
  const expectedNgEnvVariables: { [variable: string]: string } = {
    API_BACKEND: `NG_ENV.API_BACKEND || 'http://example.com'`,
    NUMBER: `parseInt(NG_ENV.NUMBER || '')`,
    OMG: `NG_ENV.OMG || 'omg'`,
    PROD: `NG_ENV.PROD !== 'false'`,
    SIMPLE_VALUE: `NG_ENV.SIMPLE_VALUE`,
    TERNARY: `NG_ENV.TERNARY ? 'asdf' : 'qwer'`,
  };

  async function testNgEnvDetection(detector: VariableDetector, variant = 'ng-env') {
    const result = await detector.detect(
      variant === 'ng-env' ? envContentNgEnv : envContentNg4Env);
    expect(result.variant).toBe(variant);
    expect(result.variantImport).toBe(
      variant === 'ng-env'
        ? `import { NG_ENV } from 'angular-server-side-configuration/ng-env';`
        : `import { NG_ENV } from 'angular-server-side-configuration/ng4-env';`);
    expect(result.variables.length).toBe(6);
    for (const variable of Object.keys(expectedNgEnvVariables)) {
      expect(findVariableByName(result, variable)).toBe(expectedNgEnvVariables[variable]);
    }
  }

  function findVariableByName(result: DetectedVariables, variable: string) {
    return result.variables
      .filter(v => v.variable === variable)
      .map(v => v.expression)[0];
  }

  function setupDetectorWithTypeScriptVersion(version: string) {
    const detector = new VariableDetector();
    (detector as any)._typescript = import(`../test/detector/ts-versions/typescript-${version}/typescript`);
    return detector;
  }

  it('should detect process.env variables', async () => {
    const detector = new VariableDetector();
    const expectedVariables: { [variable: string]: string } = {
      API_BACKEND: `process.env.API_BACKEND || 'http://example.com'`,
      NUMBER: `parseInt(process.env.NUMBER || '')`,
      OMG: `process.env.OMG || 'omg'`,
      PROD: `process.env.PROD !== 'false'`,
      SIMPLE_VALUE: `process.env.SIMPLE_VALUE`,
      TERNARY: `process.env.TERNARY ? 'asdf' : 'qwer'`,
    };

    const result = await detector.detect(envContent);
    expect(result.variant).toBe('process-env');
    expect(result.variables.length).toBe(6);
    for (const variable of Object.keys(expectedVariables)) {
      expect(findVariableByName(result, variable)).toBe(expectedVariables[variable]);
    }
  });

  it('should detect NG_ENV variables with ng-env', async () => {
    const detector = new VariableDetector();
    await testNgEnvDetection(detector);
  });

  it('should detect NG_ENV variables with ng4-env', async () => {
    const detector = new VariableDetector();
    await testNgEnvDetection(detector, 'ng4-env');
  });

  it('should work with ts 3.2', async () => {
    const detector = setupDetectorWithTypeScriptVersion('3.2.4');
    await testNgEnvDetection(detector);
  });

  it('should work with ts 3.1', async () => {
    const detector = setupDetectorWithTypeScriptVersion('3.1.6');
    await testNgEnvDetection(detector);
  });

  it('should work with ts 3.0', async () => {
    const detector = setupDetectorWithTypeScriptVersion('3.0.3');
    await testNgEnvDetection(detector);
  });

  it('should work with ts 2.9', async () => {
    const detector = setupDetectorWithTypeScriptVersion('2.9.2');
    await testNgEnvDetection(detector);
  });

  it('should work with ts 2.8', async () => {
    const detector = setupDetectorWithTypeScriptVersion('2.8.4');
    await testNgEnvDetection(detector);
  });

  it('should work with ts 2.7', async () => {
    const detector = setupDetectorWithTypeScriptVersion('2.7.2');
    await testNgEnvDetection(detector);
  });
});
