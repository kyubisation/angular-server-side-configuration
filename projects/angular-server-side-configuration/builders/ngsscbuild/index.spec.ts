import { Architect } from '@angular-devkit/architect';
import { TestProjectHost } from '@angular-devkit/architect/testing';
import { normalize, virtualFs } from '@angular-devkit/core';

import { Ngssc } from 'angular-server-side-configuration';

import { applicationHost, createArchitect, legacyHost } from '../../../../test/test-utils';

describe('Ngssc Builder', () => {
  const targetSpec = { project: 'app', target: 'ngsscbuild' };
  let architect: Architect | undefined;

  async function runNgsscbuild(host: TestProjectHost) {
    architect = (await createArchitect(host.root(), host)).architect;

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

  function readNgsscJson(host: TestProjectHost, ngsscPath = 'dist/ngssc.json'): Ngssc {
    const content = virtualFs.fileBufferToString(host.scopedSync().read(normalize(ngsscPath)));

    return JSON.parse(content);
  }

  describe('@angular-devkit/build-angular:browser', () => {
    beforeEach(async () => {
      architect = undefined;
      await legacyHost.initialize().toPromise();
    });
    afterEach(async () => legacyHost.restore().toPromise());

    it('should build with process variant', async () => {
      const output = await runNgsscbuild(legacyHost);

      expect(output.success).toBe(true);

      const ngssc = readNgsscJson(legacyHost);
      expect(ngssc.variant).toEqual('process');
      expect(ngssc.filePattern).toEqual('index.html');
    });

    it('should aggregate environment variables', async () => {
      const expected = 'OTHER_VARIABLE';
      legacyHost.replaceInFile(
        'angular.json',
        '"additionalEnvironmentVariables": [],',
        `"additionalEnvironmentVariables": ["${expected}"],`,
      );
      const output = await runNgsscbuild(legacyHost);

      expect(output.success).toBe(true);

      const ngssc = readNgsscJson(legacyHost);
      expect(ngssc.environmentVariables).toContain(expected);
    });
  });

  describe('@angular-devkit/build-angular:application', () => {
    beforeEach(async () => {
      architect = undefined;
      await applicationHost.initialize().toPromise();
    });
    afterEach(async () => applicationHost.restore().toPromise());

    it('should build with process variant', async () => {
      const output = await runNgsscbuild(applicationHost);

      expect(output.success).toBe(true);

      const ngssc = readNgsscJson(applicationHost);
      expect(ngssc.variant).toEqual('process');
      expect(ngssc.filePattern).toEqual('**/index{.,.server.}html');
    });

    it('should aggregate environment variables', async () => {
      const expected = 'OTHER_VARIABLE';
      applicationHost.replaceInFile(
        'angular.json',
        '"additionalEnvironmentVariables": [],',
        `"additionalEnvironmentVariables": ["${expected}"],`,
      );
      const output = await runNgsscbuild(applicationHost);

      expect(output.success).toBe(true);

      const ngssc = readNgsscJson(applicationHost);
      expect(ngssc.environmentVariables).toContain(expected);
    });

    it('should write ngssc into dist/browser directory without SSR', async () => {
      applicationHost.replaceInFile(
        'angular.json',
        /("server":\s+"src\/main.server.ts",|"prerender":\s+true,|"ssr":\s+\{\s+"entry":\s+"server.ts"\s+\})/g,
        '',
      );
      const output = await runNgsscbuild(applicationHost);

      expect(output.success).toBe(true);

      const ngssc = readNgsscJson(applicationHost, 'dist/browser/ngssc.json');
      expect(ngssc.variant).toEqual('process');
      expect(ngssc.filePattern).toEqual('index.html');
    });
  });
});
