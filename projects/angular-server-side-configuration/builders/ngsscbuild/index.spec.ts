import { Architect } from '@angular-devkit/architect';
import { normalize, virtualFs } from '@angular-devkit/core';

import { Ngssc } from 'angular-server-side-configuration';

import { createArchitect, host } from '../../../../test/test-utils';

describe('Ngssc Builder', () => {
  const targetSpec = { project: 'app', target: 'ngsscbuild' };
  let architect: Architect | undefined;

  beforeEach(async () => {
    architect = undefined;
    await host.initialize().toPromise();
  });
  afterEach(async () => host.restore().toPromise());

  async function runNgsscbuild() {
    architect = (await createArchitect(host.root())).architect;

    // A "run" can have multiple outputs, and contains progress information.
    const run = await architect.scheduleTarget(targetSpec);

    // The "result" member (of type BuilderOutput) is the next output.
    const output = await run.result;

    // Stop the builder from running. This stops Architect from keeping
    // the builder-associated states in memory, since builders keep waiting
    // to be scheduled.
    await run.stop();
    return output;
  }

  function readNgsscJson(): Ngssc {
    const content = virtualFs.fileBufferToString(
      host.scopedSync().read(normalize('dist/ngssc.json')),
    );

    return JSON.parse(content);
  }

  it('should build with process variant', async () => {
    const output = await runNgsscbuild();

    expect(output.success).toBe(true);

    const ngssc = readNgsscJson();
    expect(ngssc.variant).toEqual('process');
    expect(ngssc.filePattern).toEqual('index.html');
  });

  it('should aggregate environment variables', async () => {
    const expected = 'OTHER_VARIABLE';
    host.replaceInFile(
      'angular.json',
      '"additionalEnvironmentVariables": [],',
      `"additionalEnvironmentVariables": ["${expected}"],`,
    );
    const output = await runNgsscbuild();

    expect(output.success).toBe(true);

    const ngssc = readNgsscJson();
    expect(ngssc.environmentVariables).toContain(expected);
  });
});
