import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { Ngssc, Variant } from '../models';
import { indexHtmlContent, indexHtmlContentWithoutConfig, indexHtmlContentWithoutTitle } from '../test/temporary-fs';

import { insert } from './insert';

describe('insert', () => {
  let directory: string = '';
  let subdirectories: string[];
  const ngssc: Ngssc = { environmentVariables: ['TEST', 'TEST2'], filePattern: 'index.html', variant: 'process' };
  const envTestContent = 'TESTCONTENT';
  const iife =
    // tslint:disable-next-line: max-line-length
    `<script>(function(self){self.process=${JSON.stringify({ env: { TEST: envTestContent, TEST2: null } })};})(window)</script>`;
  const ngEnvIife =
    `<script>(function(self){self.NG_ENV=${JSON.stringify({ TEST: envTestContent, TEST2: null })};})(window)</script>`;

  function createFiles(variant: Variant = 'process') {
    const innerNgssc: Ngssc = { ...ngssc, variant };
    writeFileSync(join(directory, 'de/index.html'), indexHtmlContent, 'utf8');
    writeFileSync(join(directory, 'en/index.html'), indexHtmlContentWithoutConfig, 'utf8');
    writeFileSync(join(directory, 'fr/index.html'), indexHtmlContentWithoutTitle, 'utf8');
    writeFileSync(join(directory, 'de/ngssc.json'), JSON.stringify(innerNgssc), 'utf8');
    writeFileSync(join(directory, 'en/ngssc.json'), JSON.stringify(innerNgssc), 'utf8');
    writeFileSync(join(directory, 'fr/ngssc.json'), JSON.stringify({ ...innerNgssc, filePattern: undefined }), 'utf8');
  }

  beforeEach(() => {
    // tslint:disable-next-line: no-console
    console.log = () => void 0;
    process.env.TEST = envTestContent;
    directory = mkdtempSync(join(tmpdir(), 'insert'));
    subdirectories = ['de', 'en', 'fr'].map(d => join(directory, d));
    subdirectories.forEach(d => mkdirSync(d));
  });

  it('should throw on missing ngssc.json', () => {
    expect(() => insert()).toThrow();
  });

  it('should do nothing with dry run', () => {
    createFiles();
    insert({ directory, recursive: true, dryRun: true });
    for (const file of subdirectories.map(d => join(d, 'index.html'))) {
      expect(readFileSync(file, 'utf8')).not.toContain(iife);
    }
  });

  it('should insert into html with root ngssc.json', () => {
    createFiles();
    writeFileSync(
      join(directory, 'ngssc.json'),
      JSON.stringify({ ...ngssc, filePattern: '**/index.html' }),
      'utf8');
    insert({ directory });
    for (const file of subdirectories.map(d => join(d, 'index.html'))) {
      expect(readFileSync(file, 'utf8')).toContain(iife);
    }
  });

  it('should inserte into html with recursive true', () => {
    createFiles();
    insert({ directory, recursive: true });
    for (const file of subdirectories.map(d => join(d, 'index.html'))) {
      expect(readFileSync(file, 'utf8')).toContain(iife);
    }
  });

  it('should do nothing on no html files', () => {
    writeFileSync(join(directory, 'ngssc.json'), JSON.stringify(ngssc), 'utf8');
    insert({ directory });
  });

  it('should inserte into html with recursive true and variant NG_ENV', () => {
    createFiles('NG_ENV');
    insert({ directory, recursive: true });
    for (const file of subdirectories.map(d => join(d, 'index.html'))) {
      expect(readFileSync(file, 'utf8')).toContain(ngEnvIife);
    }
  });
});
