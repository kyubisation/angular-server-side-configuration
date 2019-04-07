import { randomBytes } from 'crypto';
import { mkdirSync, readFileSync, statSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import rimraf from 'rimraf';

import { MockLogger } from '../../test/mock-logger';
import {
  envContent,
  envContentNgEnv,
  indexHtmlContent,
  indexHtmlContentWithInlineConfig,
  indexHtmlContentWithoutConfig,
  indexHtmlContentWithoutHead,
  indexHtmlContentWithoutTitle,
  temporaryFile,
  temporaryFiles,
} from '../../test/temporary-fs';

import { DetectorCommand } from './detector-command';

describe('cli detector', () => {
  const logger = new MockLogger();
  let root: string;
  let dist: string;
  let environmentFile: string;
  let ngsscFile: string;
  let indexHtmlFile: string;

  beforeEach(() => {
    root = join(tmpdir(), randomBytes(20).toString('hex'));
    mkdirSync(root);
    dist = join(root, 'dist');
    mkdirSync(dist);
    environmentFile = join(root, 'environment.prod.ts');
    ngsscFile = join(dist, 'ngssc.json');
    indexHtmlFile = join(dist, 'index.html');
  });

  afterEach(() => {
    rimraf.sync(root);
  });

  it('should instantiate', () => {
    // tslint:disable-next-line: no-unused-expression
    new DetectorCommand({ ngCommand: [] });
  });

  it('should fail with broken command', async () => {
    const command = new DetectorCommand(
      { ngCommand: ['broken_command'], environmentFile, dist }, logger);
    await temporaryFile({ file: environmentFile, content: envContent }, async () => {
      await expect(command.execute()).rejects.toThrow(/^Command /);
    });

    expect(() => statSync(ngsscFile)).toThrow();
  });

  it('should fail and revert tokenized variables with broken command', async () => {
    const command = new DetectorCommand(
      { ngCommand: ['broken_command'], environmentFile, dist, wrapAot: true }, logger);
    const environmentContent = await temporaryFile({ file: environmentFile, content: envContent }, async () => {
      await expect(command.execute()).rejects.toThrow(/^Command /);
    });

    expect(() => statSync(ngsscFile)).toThrow();
    expect(environmentContent).not.toContain('ngssc-token-');
  });

  it('should detect variables and write ngssc.json', async () => {
    const configurations: { [variant: string]: string } = {
      NG_ENV: envContentNgEnv,
      process: envContent,
    };
    for (const variant of Object.keys(configurations)) {
      const command = new DetectorCommand(
        { ngCommand: ['npm', 'version'], environmentFile, dist }, logger);
      await temporaryFile({ file: environmentFile, content: configurations[variant] }, async () => {
        await command.execute();
      });

      const ngssc = JSON.parse(readFileSync(ngsscFile, 'utf8'));
      expect(ngssc.variant).toBe(variant);
      expect(ngssc.environmentVariables)
        .toEqual(['SIMPLE_VALUE', 'API_BACKEND', 'TERNARY', 'NUMBER', 'PROD', 'OMG']);
      expect(ngssc.filePattern).toBe('index.html');
      expect(ngssc.recursiveMatching).toBe(true);
      unlinkSync(ngsscFile);
    }
  });

  it('should detect no variables and write ngssc.json', async () => {
    const content = `
    export const environment = {};
    `;
    const command = new DetectorCommand(
      { ngCommand: ['npm', 'version'], environmentFile, dist }, logger);
    await temporaryFile({ file: environmentFile, content }, async () => {
      await command.execute();
    });

    const ngssc = JSON.parse(readFileSync(ngsscFile, 'utf8'));
    expect(ngssc.variant).toBe('process');
    expect(ngssc.environmentVariables)
      .toEqual([]);
    expect(ngssc.filePattern).toBe('index.html');
    expect(ngssc.recursiveMatching).toBe(true);
    unlinkSync(ngsscFile);
  });

  it('should tokenize variables and embed data', async () => {
    const configurations = [
      { variant: 'NG_ENV', env: envContentNgEnv, html: indexHtmlContent },
      { variant: 'NG_ENV', env: envContentNgEnv, html: indexHtmlContentWithoutConfig },
      { variant: 'NG_ENV', env: envContentNgEnv, html: indexHtmlContentWithoutTitle },
      { variant: 'process', env: envContent, html: indexHtmlContent },
    ];
    for (const { variant, env, html } of configurations) {
      const command = new DetectorCommand(
        { dist, embedInHtml: true, environmentFile, ngCommand: ['npm', 'version'], wrapAot: true }, logger);
      const [htmlContent] = await temporaryFiles([
        { file: indexHtmlFile, content: html },
        { file: environmentFile, content: env },
      ], async () => {
        await command.execute();
      });

      const match = htmlContent.match(/<!--\s*CONFIG\s*(\{[\w\W]*\})\s*-->/);
      expect(match).not.toBeNull();
      const config = JSON.parse(match![1]);
      expect(config.variant).toBe(variant);
      expect(config.environmentVariables)
        .toEqual(['SIMPLE_VALUE', 'API_BACKEND', 'TERNARY', 'NUMBER', 'PROD', 'OMG']);
    }
  });

  it('should detect variables and find no files to embed the config', async () => {
    const command = new DetectorCommand(
      { dist, embedInHtml: true, environmentFile, ngCommand: ['npm', 'version'] }, logger);
    await temporaryFile({ file: environmentFile, content: envContentNgEnv }, async () => {
      await expect(command.execute()).rejects.toThrow(/^No files with name /);
    });
  });

  it('should detect variables and fail to embed the config', async () => {
    const command = new DetectorCommand(
      { dist, embedInHtml: true, environmentFile, ngCommand: ['npm', 'version'], noRecursiveMatching: true }, logger);
    await temporaryFile({ file: environmentFile, content: envContentNgEnv }, async () => {
      await expect(command.execute()).rejects.toThrow(/^Failed to embed variables in /);
    });
  });

  it('should detect variables and fail to embed the config', async () => {
    const command = new DetectorCommand(
      { dist, embedInHtml: true, environmentFile, ngCommand: ['npm', 'version'], noRecursiveMatching: true }, logger);
    await temporaryFiles([
      { file: indexHtmlFile, content: indexHtmlContentWithoutHead },
      { file: environmentFile, content: envContentNgEnv },
    ], async () => {
      await expect(command.execute()).rejects.toThrow(/^Failed to embed variables in /);
    });
  });

  it('should detect variables and skip embedding the config', async () => {
    const command = new DetectorCommand(
      { dist, embedInHtml: true, environmentFile, ngCommand: ['npm', 'version'], noRecursiveMatching: true }, logger);
    const [htmlContent] = await temporaryFiles([
      { file: indexHtmlFile, content: indexHtmlContentWithInlineConfig },
      { file: environmentFile, content: envContentNgEnv },
    ], async () => {
      await command.execute();
    });

    const match = htmlContent.match(/<!--\s*CONFIG\s*(\{[\w\W]*\})\s*-->/);
    expect(match).not.toBeNull();
    const config = JSON.parse(match![1]);
    expect(config.variant).toBe('process');
    expect(config.environmentVariables).toEqual(['VALUE']);
  });
});
