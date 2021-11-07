import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { Architect } from '@angular-devkit/architect';
import { TestingArchitectHost } from '@angular-devkit/architect/testing';
import { JsonObject, schema } from '@angular-devkit/core';
import { Logger } from '@angular-devkit/core/src/logger';

import { Ngssc } from 'angular-server-side-configuration';

import { Schema } from './schema';

describe('Ngssc Builder', () => {
  let tmpDir: string;
  let distDir: string;
  let architect: Architect;
  let architectHost: TestingArchitectHost;
  let logger: Logger;
  let logs: string[];
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
    await architectHost.addBuilderFromPackage(
      '../../../../projects/angular-server-side-configuration'
    );
    await architectHost.addBuilderFromPackage('..');

    logs = [];
    logger = new Logger('ngssc');
    logger.subscribe((m) => logs.push(m.message));
  });

  function addDummyBuildTarget(config: any = buildConfig) {
    architectHost.addTarget(
      { project: 'dummy', target: 'build' },
      '@angular-devkit/architect:true',
      config
    );
  }

  async function runNgsscbuild(options: Schema & JsonObject) {
    // A "run" can have multiple outputs, and contains progress information.
    const run = await architect.scheduleBuilder(
      'angular-server-side-configuration:ngsscbuild',
      options,
      { logger }
    );

    // The "result" member (of type BuilderOutput) is the next output.
    const output = await run.result;

    // Stop the builder from running. This stops Architect from keeping
    // the builder-associated states in memory, since builders keep waiting
    // to be scheduled.
    await run.stop();
    return output;
  }

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
    expect(logs.some((l) => l.includes('ngssc'))).toBeTruthy();
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
    expect(logs.some((l) => l.includes('ngssc'))).toBeTruthy();
    const ngssc: Ngssc = JSON.parse(readFileSync(join(distDir, 'ngssc.json'), 'utf8'));
    expect(ngssc.environmentVariables).toContain(expected);
  });
});

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
  }
};
`;
