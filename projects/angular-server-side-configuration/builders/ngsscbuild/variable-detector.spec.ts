import { VariableDetector } from './variable-detector';

describe('VariableDetector', () => {
  const expectedEnvVariables = [
    'API_BACKEND',
    'INDEX_ACCESS',
    'INDEX_ACCESS2',
    'NUMBER',
    'OMG',
    'PROD',
    'SIMPLE_VALUE',
    'TERNARY',
  ];

  it('should detect process.env variables', () => {
    const detector = new VariableDetector();

    const result = detector.detect(envContent);
    expect(result.variant).toBe('process');
    expect(result.variables.length).toBe(8);
    expect(result.variables).toEqual(expectedEnvVariables);
  });

  it('should detect NG_ENV variables with ng-env', () => {
    const detector = new VariableDetector();
    const result = detector.detect(envContentNgEnv);
    expect(result.variant).toBe('NG_ENV');
    expect(result.variables.length).toBe(8);
    expect(result.variables).toEqual(expectedEnvVariables);
  });
});

const envContentNgEnv = `
import { NG_ENV } from 'angular-server-side-configuration/ng-env';

/**
 * How to use angular-server-side-configuration:
 *
 * Use NG_ENV.NAME_OF_YOUR_ENVIRONMENT_VARIABLE
 *
 * export const environment = {
 *   stringValue: NG_ENV.STRING_VALUE,
 *   stringValueWithDefault: NG_ENV.STRING_VALUE || 'defaultValue',
 *   numberValue: Number(NG_ENV.NUMBER_VALUE),
 *   numberValueWithDefault: Number(NG_ENV.NUMBER_VALUE || 10),
 *   booleanValue: Boolean(NG_ENV.BOOLEAN_VALUE),
 *   booleanValueInverted: NG_ENV.BOOLEAN_VALUE_INVERTED !== 'false',
 * };
 */

export const environment = {
  production: NG_ENV.PROD !== 'false',
  apiBackend: NG_ENV.API_BACKEND || 'http://example.com',
  ternary: NG_ENV.TERNARY ? 'asdf' : 'qwer',
  simpleValue: NG_ENV.SIMPLE_VALUE,
  something: {
    asdf: NG_ENV.OMG || 'omg',
    qwer: parseInt(NG_ENV.NUMBER || ''),
  },
  indexAccess: NG_ENV['INDEX_ACCESS'],
  indexAccess2: NG_ENV[\`INDEX_ACCESS2\`],
};
`;

const envContent = `
import 'angular-server-side-configuration/process';

/**
 * How to use angular-server-side-configuration:
 *
 * Use process.env.NAME_OF_YOUR_ENVIRONMENT_VARIABLE
 *
 * export const environment = {
 *   stringValue: process.env.STRING_VALUE,
 *   stringValueWithDefault: process.env.STRING_VALUE || 'defaultValue',
 *   numberValue: Number(process.env.NUMBER_VALUE),
 *   numberValueWithDefault: Number(process.env.NUMBER_VALUE || 10),
 *   booleanValue: Boolean(process.env.BOOLEAN_VALUE),
 *   booleanValueInverted: process.env.BOOLEAN_VALUE_INVERTED !== 'false',
 * };
 */

export const environment = {
  production: process.env.PROD !== 'false',
  apiBackend: process.env.API_BACKEND || 'http://example.com',
  ternary: process.env.TERNARY ? 'asdf' : 'qwer',
  simpleValue: process.env.SIMPLE_VALUE,
  something: {
    asdf: process.env.OMG || 'omg',
    qwer: parseInt(process.env.NUMBER || ''),
  },
  indexAccess: process.env['INDEX_ACCESS'],
  indexAccess2: process.env[\`INDEX_ACCESS2\`],
};
`;
