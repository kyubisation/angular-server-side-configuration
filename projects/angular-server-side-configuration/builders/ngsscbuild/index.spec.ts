import { Architect } from '@angular-devkit/architect';
import { TestProjectHost } from '@angular-devkit/architect/testing';
import { normalize, virtualFs } from '@angular-devkit/core';

import type { Ngssc } from 'angular-server-side-configuration';

import { applicationHost, browserBuild, createArchitect } from '../../../../test/test-utils';

describe('Ngssc Builder', () => {
  const targetSpec = { project: 'app', target: 'ngsscbuild' };
  let architect: Architect | undefined;

  describe('@angular-devkit/build-angular:application', () => {
    beforeEach(async () => {
      await applicationHost.initialize().toPromise();
      architect = undefined;
    });
    afterEach(async () => applicationHost.restore().toPromise());

    async function runNgsscbuild() {
      architect = (await createArchitect(applicationHost.root(), applicationHost)).architect;

      // A "run" can have multiple outputs, and contains progress information.
      const run = await architect!.scheduleTarget(targetSpec);

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

    it('should build with process variant', async () => {
      const output = await runNgsscbuild();

      expect(output.success).toBe(true);

      const ngssc = readNgsscJson(applicationHost, 'dist/browser/ngssc.json');
      expect(ngssc.variant).toEqual('process');
      expect(ngssc.filePattern).toEqual('index.html');
    });

    it('should aggregate environment variables', async () => {
      const expected = 'OTHER_VARIABLE';
      applicationHost.replaceInFile(
        'angular.json',
        '"additionalEnvironmentVariables": [],',
        `"additionalEnvironmentVariables": ["${expected}"],`,
      );
      const output = await runNgsscbuild();

      expect(output.success).toBe(true);

      const ngssc = readNgsscJson(applicationHost, 'dist/browser/ngssc.json');
      expect(ngssc.environmentVariables).toContain(expected);
    });

    it('should write ngssc into dist/browser directory without SSR', async () => {
      applicationHost.replaceInFile(
        'angular.json',
        /("server":\s+"src\/main.server.ts",|"prerender":\s+true,|"ssr":\s+\{\s+"entry":\s+"server.ts"\s+\})/g,
        '',
      );
      const output = await runNgsscbuild();

      expect(output.success).toBe(true);

      const ngssc = readNgsscJson(applicationHost, 'dist/browser/ngssc.json');
      expect(ngssc.variant).toEqual('process');
      expect(ngssc.filePattern).toEqual('index.html');
    });

    it('should handle object outputPath', async () => {
      applicationHost.replaceInFile(
        'angular.json',
        '"outputPath": "dist",',
        `"outputPath": { "base": "dist", "browser": "html" },`,
      );
      const output = await runNgsscbuild();

      expect(output.success).toBe(true);

      const ngssc = readNgsscJson(applicationHost, 'dist/html/ngssc.json');
      expect(ngssc.variant).toEqual('process');
    });
  });
});
