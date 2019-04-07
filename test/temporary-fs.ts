import { readFileSync, unlinkSync, writeFileSync } from 'fs';

export async function temporaryFile(
  file: { file: string, content: string }, action: () => Promise<any>): Promise<string> {
  return (await temporaryFiles([file], action))[0];
}

export async function temporaryFiles(
  files: Array<{ file: string, content: string }>, action: () => Promise<any>): Promise<string[]> {
  files.forEach(f => writeFileSync(f.file, f.content, 'utf8'));
  await action();
  const contents = files.map(f => readFileSync(f.file, 'utf8'));
  files.forEach(f => unlinkSync(f.file));
  return contents;
}

export const indexHtmlContent = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Test</title>
  <base href="/">

  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
<link rel="stylesheet" href="styles.34c57ab7888ec1573f9c.css"><!--CONFIG--></head>
<body>
  <aria-root></aria-root>
<script type="text/javascript" src="runtime.a66f828dca56eeb90e02.js"></script>
<script type="text/javascript" src="polyfills.b55409616db62255773a.js"></script>
<script type="text/javascript" src="main.9f14237bc2ddea0bb62d.js"></script></body>
</html>
`;

export const indexHtmlContentWithInlineConfig = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Test</title>
  <base href="/">

  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
<link rel="stylesheet" href="styles.34c57ab7888ec1573f9c.css">
<!--CONFIG {"variant":"process","environmentVariables":["VALUE"]}--></head>
<body>
  <aria-root></aria-root>
<script type="text/javascript" src="runtime.a66f828dca56eeb90e02.js"></script>
<script type="text/javascript" src="polyfills.b55409616db62255773a.js"></script>
<script type="text/javascript" src="main.9f14237bc2ddea0bb62d.js"></script></body>
</html>
`;

export const indexHtmlContentWithInvalidInlineConfig = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Test</title>
  <base href="/">

  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
<link rel="stylesheet" href="styles.34c57ab7888ec1573f9c.css">
<!--CONFIG {"broken json","environmentVariables":["VALUE"]}--></head>
<body>
  <aria-root></aria-root>
<script type="text/javascript" src="runtime.a66f828dca56eeb90e02.js"></script>
<script type="text/javascript" src="polyfills.b55409616db62255773a.js"></script>
<script type="text/javascript" src="main.9f14237bc2ddea0bb62d.js"></script></body>
</html>
`;

export const indexHtmlContentWithoutConfig = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Test</title>
  <base href="/">

  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
<link rel="stylesheet" href="styles.34c57ab7888ec1573f9c.css"></head>
<body>
  <aria-root></aria-root>
<script type="text/javascript" src="runtime.a66f828dca56eeb90e02.js"></script>
<script type="text/javascript" src="polyfills.b55409616db62255773a.js"></script>
<script type="text/javascript" src="main.9f14237bc2ddea0bb62d.js"></script></body>
</html>
`;

export const indexHtmlContentWithoutTitle = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <base href="/">

  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
<link rel="stylesheet" href="styles.34c57ab7888ec1573f9c.css"></head>
<body>
  <aria-root></aria-root>
<script type="text/javascript" src="runtime.a66f828dca56eeb90e02.js"></script>
<script type="text/javascript" src="polyfills.b55409616db62255773a.js"></script>
<script type="text/javascript" src="main.9f14237bc2ddea0bb62d.js"></script></body>
</html>
`;

export const indexHtmlContentWithoutHead = `<!doctype html>
<html lang="en">
<body>
  <aria-root></aria-root>
<script type="text/javascript" src="runtime.a66f828dca56eeb90e02.js"></script>
<script type="text/javascript" src="polyfills.b55409616db62255773a.js"></script>
<script type="text/javascript" src="main.9f14237bc2ddea0bb62d.js"></script></body>
</html>
`;

export const envContent = `
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
  }
};
`;

export const envContentNgEnv = `
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
  }
};
`;

export const envContentNg4Env = `
import { NG_ENV } from 'angular-server-side-configuration/ng4-env';

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
  }
};
`;
