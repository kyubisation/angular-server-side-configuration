/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Architect, BuilderOutput } from '@angular-devkit/architect';
import { WorkspaceNodeModulesArchitectHost } from '@angular-devkit/architect/node';
import { TestProjectHost, TestingArchitectHost } from '@angular-devkit/architect/testing';
import { Path, getSystemPath, join, normalize, schema, workspaces } from '@angular-devkit/core';

// Default timeout for large specs is 2.5 minutes.
jasmine.DEFAULT_TIMEOUT_INTERVAL = 150000;

export const workspaceRoot = join(normalize(__dirname), `hello-world-app/`);
export const host = new TestProjectHost(workspaceRoot);
export const outputPath: Path = normalize('dist');

export const browserTargetSpec = { project: 'app', target: 'build' };
export const devServerTargetSpec = { project: 'app', target: 'serve' };
export const extractI18nTargetSpec = { project: 'app', target: 'extract-i18n' };
export const karmaTargetSpec = { project: 'app', target: 'test' };
export const tslintTargetSpec = { project: 'app', target: 'lint' };
export const protractorTargetSpec = { project: 'app-e2e', target: 'e2e' };

export async function createArchitect(workspaceRoot: Path) {
  const registry = new schema.CoreSchemaRegistry();
  registry.addPostTransform(schema.transforms.addUndefinedDefaults);
  const workspaceSysPath = getSystemPath(workspaceRoot);

  const { workspace } = await workspaces.readWorkspace(
    workspaceSysPath,
    workspaces.createWorkspaceHost(host)
  );
  const architectHost = new TestingArchitectHost(
    workspaceSysPath,
    workspaceSysPath,
    new WorkspaceNodeModulesArchitectHost(workspace, workspaceSysPath)
  );
  await architectHost.addBuilderFromPackage('..');
  //require('ts-node').register(require('../projects/angular-server-side-configuration/builders/tsconfig.json'));
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
