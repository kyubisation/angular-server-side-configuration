import type { Ngssc } from 'angular-server-side-configuration';

import { describeBuilder } from '../../../../modules/testing/builder/src';
import { Schema } from './schema';
import { ngsscBuild } from './index';

const APPLICATION_BUILDER_INFO = Object.freeze({
  name: 'angular-server-side-configuration:ngsscbuild',
  schemaPath: __dirname + '/schema.json',
});

const BASE_OPTIONS = Object.freeze<Schema>({
  buildTarget: 'app:build',
  browserTarget: 'app:build',
  additionalEnvironmentVariables: [],
  filePattern: 'index.html',
});

// Disabled, as the output is currently seemingly fixed to
// workspace root.
describeBuilder(ngsscBuild, APPLICATION_BUILDER_INFO, (harness) => {
  xit('should build with process variant', async () => {
    harness.useTarget('ngsscbuild', {
      ...BASE_OPTIONS,
    });

    const { result } = await harness.executeOnce();

    expect(result?.success).toBe(true);
    const ngssc = JSON.parse(harness.readFile('dist/browser/ngssc.json')) as Ngssc;
    expect(ngssc.variant).toEqual('process');
    expect(ngssc.filePattern).toEqual('index.html');
  });

  xit('should aggregate environment variables', async () => {
    const expected = 'OTHER_VARIABLE';
    harness.modifyFile('angular.json', (content) =>
      content.replace(
        '"additionalEnvironmentVariables": [],',
        `"additionalEnvironmentVariables": ["${expected}"],`,
      ),
    );
    harness.useTarget('ngsscbuild', {
      ...BASE_OPTIONS,
    });

    const { result } = await harness.executeOnce();

    expect(result?.success).toBe(true);
    const ngssc = JSON.parse(harness.readFile('dist/browser/ngssc.json')) as Ngssc;
    expect(ngssc.environmentVariables).toContain(expected);
  });

  xit('should write ngssc into dist/browser directory without SSR', async () => {
    harness.modifyFile('angular.json', (content) =>
      content.replace(
        /("server":\s+"src\/main.server.ts",|"prerender":\s+true,|"ssr":\s+\{\s+"entry":\s+"server.ts"\s+\})/g,
        '',
      ),
    );
    harness.useTarget('ngsscbuild', {
      ...BASE_OPTIONS,
    });

    const { result } = await harness.executeOnce();

    expect(result?.success).toBe(true);
    const ngssc = JSON.parse(harness.readFile('dist/browser/ngssc.json')) as Ngssc;
    expect(ngssc.variant).toEqual('process');
    expect(ngssc.filePattern).toEqual('index.html');
  });

  xit('should handle object outputPath', async () => {
    harness.modifyFile('angular.json', (content) =>
      content.replace(
        '"outputPath": "dist",',
        `"outputPath": { "base": "dist", "browser": "html" },`,
      ),
    );
    harness.useTarget('ngsscbuild', {
      ...BASE_OPTIONS,
    });

    const { result } = await harness.executeOnce();

    expect(result?.success).toBe(true);
    const ngssc = JSON.parse(harness.readFile('dist/browser/ngssc.json')) as Ngssc;
    expect(ngssc.variant).toEqual('process');
  });
});
