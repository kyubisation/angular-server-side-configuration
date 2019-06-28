import { Architect } from '@angular-devkit/architect';
import { TestingArchitectHost, TestLogger } from '@angular-devkit/architect/testing';
import { schema } from '@angular-devkit/core';
import { mkdirSync, mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import rimraf from 'rimraf';

import { envContent } from '../../test/temporary-fs';

describe('Ngssc Builder', () => {
  let tmpDir: string;
  let architect: Architect;
  let architectHost: TestingArchitectHost;

  beforeEach(async () => {
    const registry = new schema.CoreSchemaRegistry();
    registry.addPostTransform(schema.transforms.addUndefinedDefaults);

    tmpDir = mkdtempSync(join(tmpdir(), 'ngssc-'));
    mkdirSync(join(tmpDir, 'dist'));
    writeFileSync(join(tmpDir, 'environment.prod.ts'), envContent, 'utf8');
    // TestingArchitectHost() takes workspace and current directories.
    // Since we don't use those, both are the same in this case.
    architectHost = new TestingArchitectHost(tmpDir, tmpDir);
    architect = new Architect(architectHost, registry);

    // This will either take a Node package name, or a path to the directory
    // for the package.json file.
    await architectHost.addBuilderFromPackage('../../../..');
    await architectHost.addBuilderFromPackage('..');
  });

  afterEach(() => {
    rimraf.sync(tmpDir);
  });

  it('should ', async () => {
    // Create a logger that keeps an array of all messages that were logged.
    const logger = new TestLogger('ngssc');

    architectHost.addTarget(
      { project: 'dummy', target: 'build' },
      '@angular-devkit/architect:true',
      {
        fileReplacements: [{ replace: 'dummy', with: 'environment.prod.ts' }],
        index: 'src/index.html',
        outputPath: 'dist',
      });
    // A "run" can have multiple outputs, and contains progress information.
    const run = await architect.scheduleBuilder('angular-server-side-configuration:build-angular', {
      aotSupport: true,
      browserTarget: 'dummy:build',
      ngsscConfigurationFile: 'environment.prod.ts',
    }, { logger });  // We pass the logger for checking later.

    // The "result" member (of type BuilderOutput) is the next output.
    const output = await run.result;

    // Stop the builder from running. This stops Architect from keeping
    // the builder-associated states in memory, since builders keep waiting
    // to be scheduled.
    await run.stop();

    // Expect that it succeeded.
    expect(output.success).toBe(true);
    expect(logger.includes('ngssc')).toBeTruthy();
  });
});
