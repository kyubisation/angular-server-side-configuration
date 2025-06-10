/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Architect, BuilderOutput, ScheduleOptions, Target } from '@angular-devkit/architect';
import { WorkspaceNodeModulesArchitectHost } from '@angular-devkit/architect/node';
import { TestProjectHost, TestingArchitectHost } from '@angular-devkit/architect/testing';
import {
  Path,
  PathFragment,
  getSystemPath,
  join,
  json,
  normalize,
  schema,
  virtualFs,
  workspaces,
} from '@angular-devkit/core';

// Default timeout for large specs is 2.5 minutes.
jasmine.DEFAULT_TIMEOUT_INTERVAL = 150000;

export const applicationWorkspaceRoot = join(normalize(__dirname), `ng-application-app/`);
export const applicationHost = new TestProjectHost(applicationWorkspaceRoot);
export const outputPath: Path = normalize('dist');

export const browserTargetSpec = { project: 'app', target: 'build' };
export const devServerTargetSpec = { project: 'app', target: 'serve' };
export const extractI18nTargetSpec = { project: 'app', target: 'extract-i18n' };
export const karmaTargetSpec = { project: 'app', target: 'test' };
export const tslintTargetSpec = { project: 'app', target: 'lint' };
export const protractorTargetSpec = { project: 'app-e2e', target: 'e2e' };

export async function createArchitect(workspaceRoot: Path, host: TestProjectHost) {
  const registry = new schema.CoreSchemaRegistry();
  registry.addPostTransform(schema.transforms.addUndefinedDefaults);
  const workspaceSysPath = getSystemPath(workspaceRoot);

  const { workspace } = await workspaces.readWorkspace(
    workspaceSysPath,
    workspaces.createWorkspaceHost(host),
  );
  const architectHost = new TestingArchitectHost(
    workspaceSysPath,
    workspaceSysPath,
    new WorkspaceNodeModulesArchitectHost(workspace, workspaceSysPath),
  );
  await architectHost.addBuilderFromPackage('..');
  await architectHost.addBuilderFromPackage('../../../../dist/angular-server-side-configuration');
  const architect = new Architect(architectHost, registry);

  return {
    workspace,
    architectHost,
    architect,
  };
}

export interface BrowserBuildOutput {
  output: BuilderOutput;
  files: { [file: string]: Promise<string> };
}

const firstValueFrom = <T>(observable: any): Promise<T> =>
  new Promise((resolve, reject) => {
    observable.subscribe({
      next: (value: any) => resolve(value),
      error: (err: any) => reject(err),
      complete: () => {},
    });
  });

export async function browserBuild(
  architect: Architect,
  host: virtualFs.Host,
  target: Target,
  overrides?: json.JsonObject,
  scheduleOptions?: ScheduleOptions,
): Promise<BrowserBuildOutput> {
  const run = await architect.scheduleTarget(target, overrides, scheduleOptions);
  const output = (await run.result) as BuilderOutput;
  expect(output.success).toBe(true);

  if (!output.success) {
    await run.stop();

    return {
      output,
      files: {},
    };
  }

  const [{ path }] = output['outputs'];
  expect(path).toBeTruthy();
  const outputPath = normalize(path);

  const fileNames = await firstValueFrom<PathFragment[]>(host.list(outputPath));
  const files = fileNames.reduce((acc: { [name: string]: Promise<string> }, path) => {
    let cache: Promise<string> | null = null;
    Object.defineProperty(acc, path, {
      enumerable: true,
      get() {
        if (cache) {
          return cache;
        }
        if (!fileNames.includes(path)) {
          return Promise.reject('No file named ' + path);
        }
        cache = firstValueFrom<virtualFs.FileBuffer>(host.read(join(outputPath, path))).then(
          (content) => virtualFs.fileBufferToString(content),
        );

        return cache;
      },
    });

    return acc;
  }, {});

  await run.stop();

  return {
    output,
    files,
  };
}
