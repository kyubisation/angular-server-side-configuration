import { writeFileSync, unlinkSync, readFileSync, mkdirSync } from 'fs';
import rimraf from 'rimraf';

export async function temporaryFile(file: { file: string, content: string }, action: () => Promise<any>): Promise<string> {
  return (await temporaryFiles([file], action))[0];
}

export async function temporaryFiles(files: { file: string, content: string }[], action: () => Promise<any>): Promise<string[]> {
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
