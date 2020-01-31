import { Architect } from '@angular-devkit/architect';
import { TestingArchitectHost, TestLogger } from '@angular-devkit/architect/testing';
import { JsonObject, schema } from '@angular-devkit/core';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { Ngssc } from '../../models';
import { envContent } from '../../test/temporary-fs';

import { Schema } from './schema';

describe('Ngssc Builder', () => {
  let tmpDir: string;
  let distDir: string;
  let architect: Architect;
  let architectHost: TestingArchitectHost;
  let logger: TestLogger;
  const buildConfig = {
    fileReplacements: [{ replace: 'dummy', with: 'environment.prod.ts' }],
    index: 'src/index.html',
    outputPath: 'dist',
  };

  beforeEach(async () => {
    const registry = new schema.CoreSchemaRegistry();
    registry.addPostTransform(schema.transforms.addUndefinedDefaults);

    tmpDir = mkdtempSync(join(tmpdir(), 'ngssc-'));
    writeFileSync(join(tmpDir, 'environment.prod.ts'), envContent, 'utf8');
    distDir = join(tmpDir, 'dist');
    mkdirSync(distDir);
    writeFileSync(join(distDir, 'main.js'), '', 'utf8');
    architectHost = new TestingArchitectHost(tmpDir, tmpDir);
    architect = new Architect(architectHost, registry);

    // This will either take a Node package name, or a path to the directory
    // for the package.json file.
    await architectHost.addBuilderFromPackage('../../../..');
    await architectHost.addBuilderFromPackage('..');

    // Create a logger that keeps an array of all messages that were logged.
    logger = new TestLogger('ngssc');
  });

  function addDummyBuildTarget(config: any = buildConfig) {
    architectHost.addTarget(
      { project: 'dummy', target: 'build' },
      '@angular-devkit/architect:true',
      config);
  }

  async function runNgsscbuild(options: Schema & JsonObject) {
    // A "run" can have multiple outputs, and contains progress information.
    const run = await architect.scheduleBuilder(
      'angular-server-side-configuration:ngsscbuild', options, { logger });

    // The "result" member (of type BuilderOutput) is the next output.
    const output = await run.result;

    // Stop the builder from running. This stops Architect from keeping
    // the builder-associated states in memory, since builders keep waiting
    // to be scheduled.
    await run.stop();
    return output;
  }

  it('should fail with aotSupport and no fileReplacements', async () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation((() => { throw new Error(); }) as any);
    addDummyBuildTarget({});
    try {
      await runNgsscbuild({
        additionalEnvironmentVariables: [],
        aotSupport: true,
        browserTarget: 'dummy:build',
        filePattern: '',
        ngsscEnvironmentFile: 'environment.prod.ts',
      });
      fail();
      // tslint:disable-next-line: no-empty
    } catch { }
    expect(mockExit).toHaveBeenCalledWith(2);
  });

  it('should build with process variant', async () => {
    addDummyBuildTarget();
    const output = await runNgsscbuild({
      additionalEnvironmentVariables: [],
      aotSupport: false,
      browserTarget: 'dummy:build',
      filePattern: '',
      ngsscEnvironmentFile: 'environment.prod.ts',
    });

    expect(output.success).toBe(true);
    expect(logger.includes('ngssc')).toBeTruthy();
    const ngssc: Ngssc = JSON.parse(readFileSync(join(distDir, 'ngssc.json'), 'utf8'));
    expect(ngssc.variant).toEqual('process');
    expect(ngssc.filePattern).toEqual('index.html');
  });

  it('should aggregate environment variables', async () => {
    const expected = 'OTHER_VARIABLE';
    addDummyBuildTarget();
    const output = await runNgsscbuild({
      additionalEnvironmentVariables: [expected],
      aotSupport: false,
      browserTarget: 'dummy:build',
      filePattern: '',
      ngsscEnvironmentFile: 'environment.prod.ts',
    });

    expect(output.success).toBe(true);
    expect(logger.includes('ngssc')).toBeTruthy();
    const ngssc: Ngssc = JSON.parse(readFileSync(join(distDir, 'ngssc.json'), 'utf8'));
    expect(ngssc.environmentVariables).toContain(expected);
  });

  it('should build with aotSupport and process variant', async () => {
    addDummyBuildTarget();
    const output = await runNgsscbuild({
      additionalEnvironmentVariables: [],
      aotSupport: true,
      browserTarget: 'dummy:build',
      filePattern: '',
      ngsscEnvironmentFile: 'environment.prod.ts',
    });

    expect(output.success).toBe(true);
    expect(logger.includes('ngssc')).toBeTruthy();
    const ngssc: Ngssc = JSON.parse(readFileSync(join(distDir, 'ngssc.json'), 'utf8'));
    expect(ngssc.variant).toEqual('process');
    expect(ngssc.filePattern).toEqual('index.html');
  });
});
