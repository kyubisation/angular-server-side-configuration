
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
  production: "ngssc-token-1552222276363-5" as any,
  apiBackend: "ngssc-token-1552222276363-2" as any,
  ternary: "ngssc-token-1552222276363-3" as any,
  simpleValue: "ngssc-token-1552222276363-1" as any,
  something: {
    asdf: "ngssc-token-1552222276363-6" as any,
    qwer: parseInt("ngssc-token-1552222276363-4" as any),
  }
};
