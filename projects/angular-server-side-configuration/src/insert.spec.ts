import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { Ngssc, Variant } from './ngssc';
import { insert } from './insert';

describe('insert', () => {
  let directory: string = '';
  let subdirectories: string[];
  const ngssc: Ngssc = {
    environmentVariables: ['TEST', 'TEST2'],
    filePattern: 'index.html',
    variant: 'process',
  };
  const envTestContent = 'TESTCONTENT';
  const iife =
    // tslint:disable-next-line: max-line-length
    `<script>(function(self){self.process=${JSON.stringify({
      env: { TEST: envTestContent, TEST2: null },
    })};})(window)</script>`;
  const ngEnvIife = `<script>(function(self){self.NG_ENV=${JSON.stringify({
    TEST: envTestContent,
    TEST2: null,
  })};})(window)</script>`;

  function createFiles(variant: Variant = 'process') {
    const innerNgssc: Ngssc = { ...ngssc, variant };
    writeFileSync(join(directory, 'de/index.html'), indexHtmlContent, 'utf8');
    writeFileSync(join(directory, 'en/index.html'), indexHtmlContentWithoutConfig, 'utf8');
    writeFileSync(join(directory, 'fr/index.html'), indexHtmlContentWithoutTitle, 'utf8');
    writeFileSync(join(directory, 'de/ngssc.json'), JSON.stringify(innerNgssc), 'utf8');
    writeFileSync(join(directory, 'en/ngssc.json'), JSON.stringify(innerNgssc), 'utf8');
    writeFileSync(
      join(directory, 'fr/ngssc.json'),
      JSON.stringify({ ...innerNgssc, filePattern: undefined }),
      'utf8'
    );
  }

  beforeEach(() => {
    // tslint:disable-next-line: no-console
    console.log = () => void 0;
    process.env['TEST'] = envTestContent;
    directory = mkdtempSync(join(tmpdir(), 'insert'));
    subdirectories = ['de', 'en', 'fr'].map((d) => join(directory, d));
    subdirectories.forEach((d) => mkdirSync(d));
  });

  it('should throw on missing ngssc.json', () => {
    expect(() => insert()).toThrow();
  });

  it('should do nothing with dry run', () => {
    createFiles();
    insert({ directory, recursive: true, dryRun: true });
    for (const file of subdirectories.map((d) => join(d, 'index.html'))) {
      expect(readFileSync(file, 'utf8')).not.toContain(iife);
    }
  });

  it('should insert into html with root ngssc.json', () => {
    createFiles();
    writeFileSync(
      join(directory, 'ngssc.json'),
      JSON.stringify({ ...ngssc, filePattern: '**/index.html' }),
      'utf8'
    );
    insert({ directory });
    for (const file of subdirectories.map((d) => join(d, 'index.html'))) {
      expect(readFileSync(file, 'utf8')).toContain(iife);
    }
  });

  it('should insert into html with recursive true', () => {
    createFiles();
    insert({ directory, recursive: true });
    for (const file of subdirectories.map((d) => join(d, 'index.html'))) {
      expect(readFileSync(file, 'utf8')).toContain(iife);
    }
  });

  it('should insert idempotent', () => {
    createFiles();
    insert({ directory, recursive: true });
    for (const file of subdirectories.map((d) => join(d, 'index.html'))) {
      expect(readFileSync(file, 'utf8')).toContain(iife);
    }

    const test2Value = 'test2';
    process.env['TEST2'] = test2Value;
    const changedIife =
      // tslint:disable-next-line: max-line-length
      `<script>(function(self){self.process=${JSON.stringify({
        env: { TEST: envTestContent, TEST2: test2Value },
      })};})(window)</script>`;
    insert({ directory, recursive: true });
    for (const file of subdirectories.map((d) => join(d, 'index.html'))) {
      expect(readFileSync(file, 'utf8')).not.toContain(iife);
      expect(readFileSync(file, 'utf8')).toContain(changedIife);
    }
    delete process.env['TEST2'];
  });

  it('should do nothing on no html files', () => {
    writeFileSync(join(directory, 'ngssc.json'), JSON.stringify(ngssc), 'utf8');
    insert({ directory });
  });

  it('should insert into html with recursive true and variant NG_ENV', () => {
    createFiles('NG_ENV');
    insert({ directory, recursive: true });
    for (const file of subdirectories.map((d) => join(d, 'index.html'))) {
      expect(readFileSync(file, 'utf8')).toContain(ngEnvIife);
    }
  });
});

const indexHtmlContent = `<!doctype html>
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

const indexHtmlContentWithoutConfig = `<!doctype html>
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

const indexHtmlContentWithoutTitle = `<!doctype html>
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
