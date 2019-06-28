import { envContent, envContentNgEnv } from '../../test/temporary-fs';

import { NgsscContext } from './models/ngssc-context';
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

  function findVariableByName(result: NgsscContext, variable: string) {
    return result.variables
      .filter(v => v.variable === variable)
      .map(v => v.expression)[0];
  }

  it('should detect process.env variables', () => {
    const detector = new VariableDetector();
    const expectedVariables: { [variable: string]: string } = {
      API_BACKEND: `process.env.API_BACKEND || 'http://example.com'`,
      NUMBER: `parseInt(process.env.NUMBER || '')`,
      OMG: `process.env.OMG || 'omg'`,
      PROD: `process.env.PROD !== 'false'`,
      SIMPLE_VALUE: `process.env.SIMPLE_VALUE`,
      TERNARY: `process.env.TERNARY ? 'asdf' : 'qwer'`,
    };

    const result = detector.detect(envContent);
    expect(result.variant).toBe('process');
    expect(result.variables.length).toBe(6);
    for (const variable of Object.keys(expectedVariables)) {
      expect(findVariableByName(result, variable)).toBe(expectedVariables[variable]);
    }
  });

  it('should detect NG_ENV variables with ng-env', () => {
    const detector = new VariableDetector();
    const result = detector.detect(envContentNgEnv);
    expect(result.variant).toBe('NG_ENV');
    expect(result.variantImport).toBe(`import { NG_ENV } from 'angular-server-side-configuration/ng-env';`);
    expect(result.variables.length).toBe(6);
    for (const variable of Object.keys(expectedNgEnvVariables)) {
      expect(findVariableByName(result, variable)).toBe(expectedNgEnvVariables[variable]);
    }
  });

  it('should fail variant detection with wrong import', () => {
    const detector = new VariableDetector();
    expect(() => detector.detect(`import 'angular-server-side-configuration/failure';`)).toThrow();
  });
});
