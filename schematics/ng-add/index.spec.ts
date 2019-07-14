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

describe('ng-add', () => {
  const collectionPath = join(__dirname, '../collection.json');
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

    const environmentContent = tree.readContent('projects/dummy/src/environments/environment.prod.ts');
    expect(environmentContent).toContain(importString);

    const indexContent = tree.readContent(htmlPath);
    expect(indexContent).toContain('<!--CONFIG-->');

    const packageJson = JSON.parse(tree.readContent('package.json'));
    expect(packageJson.scripts['build:ngssc']).toContain(':ngsscbuild:production');
  }

  it('should fail with wrong environment file path', async () => {
    try {
      await runner
        .runSchematicAsync('ng-add', { ngsscEnvironmentFile: 'wrong.path' }, appTree)
        .toPromise();
      fail();
      // tslint:disable-next-line: no-empty
    } catch { }
  });

  it('should fail with missing package.json', async () => {
    appTree.delete('package.json');
    try {
      await runner
        .runSchematicAsync('ng-add', {}, appTree)
        .toPromise();
      fail();
      // tslint:disable-next-line: no-empty
    } catch { }
  });

  it('should fail with missing index.html', async () => {
    appTree.delete(htmlPath);
    try {
      await runner
        .runSchematicAsync('ng-add', {}, appTree)
        .toPromise();
      fail();
      // tslint:disable-next-line: no-empty
    } catch { }
  });

  it('should add ngssc content to correct files', async () => {
    const tree = await runner
      .runSchematicAsync('ng-add', {}, appTree)
      .toPromise();
    assertAppliedConfig(tree);
  });

  it('should add ngssc content to correct files and split additional environment variables', async () => {
    const expected = 'OTHER_VARIABLES,OTHER_VARIABLES2';
    const tree = await runner
      .runSchematicAsync('ng-add', { additionalEnvironmentVariables: expected }, appTree)
      .toPromise();
    assertAppliedConfig(tree);
    const angularJson = JSON.parse(tree.readContent('angular.json'));
    expect(angularJson.projects.dummy.architect.ngsscbuild.options.additionalEnvironmentVariables)
      .toEqual(expected.split(','));
  });

  it('should add ngssc content to correct files, with missing title tag', async () => {
    const htmlContent = appTree.readContent(htmlPath);
    appTree.overwrite(htmlPath, htmlContent.replace(/<title>[^<]+<\/title>/, ''));
    const tree = await runner
      .runSchematicAsync('ng-add', {}, appTree)
      .toPromise();
    assertAppliedConfig(tree);
  });

  it('should skip adding content when run twice', async () => {
    const initialTree = await runner
      .runSchematicAsync('ng-add', {}, appTree)
      .toPromise();
    const logs: string[] = [];
    runner.logger.subscribe(m => logs.push(m.message));
    await runner
      .runSchematicAsync('ng-add', {}, initialTree)
      .toPromise();

    expect(logs.filter(l => l.includes('Skipping')).length).toBe(4);
  });

  it('should add ngssc content with variant NG_ENV to correct files', async () => {
    const tree = await runner
      .runSchematicAsync('ng-add', { variant: 'NG_ENV' }, appTree)
      .toPromise();
    assertAppliedConfig(tree, `import { NG_ENV } from 'angular-server-side-configuration/ng-env';`);
  });
});
