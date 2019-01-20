import { mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import rimraf from 'rimraf';

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

export async function temporaryDirectory(directory: string, action: () => Promise<any>): Promise<void> {
  mkdirSync(directory);
  await action();
  await new Promise((resolve, reject) => rimraf(directory, e => e ? reject(e) : resolve()));
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

export const environmentProdContent = `
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
