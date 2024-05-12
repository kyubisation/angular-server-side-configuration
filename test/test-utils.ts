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
import { BrowserBuilderOutput } from '@angular-devkit/build-angular';
import {
  Path,
  getSystemPath,
  join,
  json,
  normalize,
  schema,
  virtualFs,
  workspaces,
} from '@angular-devkit/core';
import { firstValueFrom } from 'rxjs';

// Default timeout for large specs is 2.5 minutes.
jasmine.DEFAULT_TIMEOUT_INTERVAL = 150000;

export const legacyWorkspaceRoot = join(normalize(__dirname), `hello-world-app/`);
export const legacyHost = new TestProjectHost(legacyWorkspaceRoot);
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

export async function browserBuild(
  architect: Architect,
  host: virtualFs.Host,
  target: Target,
  overrides?: json.JsonObject,
  scheduleOptions?: ScheduleOptions,
): Promise<BrowserBuildOutput> {
  const run = await architect.scheduleTarget(target, overrides, scheduleOptions);
  const output = (await run.result) as BrowserBuilderOutput;
  expect(output.success).toBe(true);

  if (!output.success) {
    await run.stop();

    return {
      output,
      files: {},
    };
  }

  const [{ path }] = output.outputs;
  expect(path).toBeTruthy();
  const outputPath = normalize(path);

  const fileNames = await firstValueFrom(host.list(outputPath));
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
        cache = firstValueFrom(host.read(join(outputPath, path))).then((content) =>
          virtualFs.fileBufferToString(content),
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
