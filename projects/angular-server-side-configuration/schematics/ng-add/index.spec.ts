import { join } from 'path';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Schema as ApplicationOptions, Style } from '@schematics/angular/application/schema';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';

const workspaceOptions: WorkspaceOptions = {
  name: 'workspace',
  newProjectRoot: 'projects',
  version: '20.0.0',
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
    appTree = await runner.runExternalSchematic(
      '@schematics/angular',
      'workspace',
      workspaceOptions,
    );
    appTree = await runner.runExternalSchematic(
      '@schematics/angular',
      'application',
      appOptions,
      appTree,
    );
  });

  async function assertAppliedConfig(
    tree: UnitTestTree,
    importString = `import 'angular-server-side-configuration/process';`,
  ) {
    const workspace = await getWorkspace(tree);
    expect(workspace.projects.get(appOptions.name)!.targets.get('ngsscbuild')!.builder).toBe(
      'angular-server-side-configuration:ngsscbuild',
    );

    const environmentContent = tree.readContent('projects/dummy/src/app/app.config.ts');
    expect(environmentContent).toContain(importString);

    const indexContent = tree.readContent(htmlPath);
    expect(indexContent).toContain('<!--CONFIG-->');

    const packageJson = JSON.parse(tree.readContent('package.json'));
    expect(packageJson.scripts['build:ngssc']).toContain(':ngsscbuild:production');
  }

  it('should fail with missing package.json', async () => {
    appTree.delete('package.json');
    try {
      await runner.runSchematic('ng-add', { project: appOptions.name }, appTree);
      fail();
      // tslint:disable-next-line: no-empty
    } catch {}
  });

  it('should fail with missing index.html', async () => {
    appTree.delete(htmlPath);
    try {
      await runner.runSchematic('ng-add', { project: appOptions.name }, appTree);
      fail();
      // tslint:disable-next-line: no-empty
    } catch {}
  });

  it('should add ngssc content to correct files', async () => {
    const tree = await runner.runSchematic('ng-add', { project: appOptions.name }, appTree);
    await assertAppliedConfig(tree);
  });

  it('should add ngssc content to correct files and split additional environment variables', async () => {
    const expected = 'OTHER_VARIABLES,OTHER_VARIABLES2';
    const tree = await runner.runSchematic(
      'ng-add',
      { project: appOptions.name, additionalEnvironmentVariables: expected },
      appTree,
    );
    await assertAppliedConfig(tree);
    const workspace = await getWorkspace(tree);
    expect(
      JSON.stringify(
        workspace.projects.get(appOptions.name)!.targets.get('ngsscbuild')!.options![
          'additionalEnvironmentVariables'
        ],
      ),
    ).toEqual(JSON.stringify(expected.split(',')));
  });

  it('should add ngssc content to correct files, with missing title tag', async () => {
    const htmlContent = appTree.readContent(htmlPath);
    appTree.overwrite(htmlPath, htmlContent.replace(/<title>[^<]+<\/title>/, ''));
    const tree = await runner.runSchematic('ng-add', { project: appOptions.name }, appTree);
    await assertAppliedConfig(tree);
  });

  it('should skip adding content when run twice', async () => {
    const initialTree = await runner.runSchematic('ng-add', { project: appOptions.name }, appTree);
    const logs: string[] = [];
    runner.logger.subscribe((m) => logs.push(m.message));
    await runner.runSchematic('ng-add', { project: appOptions.name }, initialTree);

    expect(logs.filter((l) => l.includes('Skipping')).length).toBe(4);
  });
});
