import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Schema as ApplicationOptions, Style } from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import { join } from 'path';

const workspaceOptions: WorkspaceOptions = {
  name: 'workspace',
  newProjectRoot: 'projects',
  version: '6.0.0',
};

const appOptions: ApplicationOptions = {
  inlineStyle: false,
  inlineTemplate: false,
  name: 'dummy',
  routing: false,
  skipPackageJson: false,
  skipTests: false,
  style: Style.Css,
};

describe('ng-update', () => {
  const collectionPath = join(__dirname, '../migration.json');
  const envPath = 'projects/dummy/src/environments/environment.prod.ts';
  const htmlPath = 'projects/dummy/src/index.html';
  let runner: SchematicTestRunner;
  let appTree: UnitTestTree;

  beforeEach(async () => {
    runner = new SchematicTestRunner('schematics', collectionPath);
    appTree = await runner
      .runExternalSchematicAsync('@schematics/angular', 'workspace', workspaceOptions)
      .toPromise();
    appTree = await runner
      .runExternalSchematicAsync('@schematics/angular', 'application', appOptions, appTree)
      .toPromise();
  });

  function assertAppliedConfig(
    tree: UnitTestTree, importString = `import 'angular-server-side-configuration/process';`) {
    const angularJson = JSON.parse(tree.readContent('angular.json'));
    expect(angularJson.projects.dummy.architect.ngsscbuild.builder)
      .toBe('angular-server-side-configuration:ngsscbuild');

    const environmentContent = tree.readContent(envPath);
    expect(environmentContent).toContain(importString);

    const indexContent = tree.readContent(htmlPath);
    expect(indexContent).toContain('<!--CONFIG-->');

    const packageJson = JSON.parse(tree.readContent('package.json'));
    expect(packageJson.scripts['build:ngssc']).toContain(':ngsscbuild:production');
  }

  it('should add ngssc content to correct files', async () => {
    const tree = await runner
      .runSchematicAsync('migration-v8', {}, appTree)
      .toPromise();
    assertAppliedConfig(tree);
  });

  it('should migrate ng-env4 import', async () => {
    const envContent = appTree.read(envPath)!.toString('utf8');
    appTree.overwrite(
      envPath,
      envContent.replace(
        /^/, `import { NG_ENV } from 'angular-server-side-configuration/ng-env4';\n`));
    const tree = await runner
      .runSchematicAsync('migration-v8', {}, appTree)
      .toPromise();
    assertAppliedConfig(tree, `import { NG_ENV } from 'angular-server-side-configuration/ng-env';`);
  });

  it('should detect ng-env variant', async () => {
    const envContent = appTree.read(envPath)!.toString('utf8');
    appTree.overwrite(
      envPath,
      envContent.replace(
        /^/, `import { NG_ENV } from 'angular-server-side-configuration/ng-env';\n`));
    const tree = await runner
      .runSchematicAsync('migration-v8', {}, appTree)
      .toPromise();
    assertAppliedConfig(tree, `import { NG_ENV } from 'angular-server-side-configuration/ng-env';`);
  });

  it('should detect and remove ngssc.json', async () => {
    const expected = 'OTHER_VARIABLES';
    appTree.create('/ngssc.json', JSON.stringify({ environmentVariables: [expected] }));
    const tree = await runner
      .runSchematicAsync('migration-v8', {}, appTree)
      .toPromise();
    assertAppliedConfig(tree);
    const angularJson = JSON.parse(tree.readContent('angular.json'));
    expect(angularJson.projects.dummy.architect.ngsscbuild.options.additionalEnvironmentVariables)
      .toEqual([expected]);
    expect(appTree.exists('/ngssc.json')).toBeFalsy();
  });

  it('should detect ngssc usage in package.json', async () => {
    const packageJsonPath = '/package.json';
    const pkg = JSON.parse(appTree.read(packageJsonPath)!.toString('utf8'));
    pkg.scripts = { ...pkg.scripts, 'build:ngssc': 'ngssc ng build' };
    appTree.overwrite(packageJsonPath, JSON.stringify(pkg));
    const logs: string[] = [];
    runner.logger.subscribe(m => logs.push(m.message));
    await runner
      .runSchematicAsync('migration-v8', {}, appTree)
      .toPromise();
    expect(logs.some(l => l.includes('Please remove the ngssc usage from your scripts.')))
      .toBeTruthy();
  });

  it('should not fail when no scripts are defined in package.json', async () => {
    const packageJsonPath = '/package.json';
    const pkg = JSON.parse(appTree.read(packageJsonPath)!.toString('utf8'));
    delete pkg.scripts;
    appTree.overwrite(packageJsonPath, JSON.stringify(pkg));
    await runner
      .runSchematicAsync('migration-v8', {}, appTree)
      .toPromise();
  });
});
