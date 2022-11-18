import { join } from 'path';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Schema as ApplicationOptions, Style } from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import { updateWorkspace } from '@schematics/angular/utility/workspace';

const workspaceOptions: WorkspaceOptions = {
  name: 'workspace',
  newProjectRoot: 'projects',
  version: '15.0.0',
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
  let runner: SchematicTestRunner;
  let appTree: UnitTestTree;

  beforeEach(async () => {
    runner = new SchematicTestRunner('migrations', collectionPath);
    appTree = await runner
      .runExternalSchematicAsync('@schematics/angular', 'workspace', workspaceOptions)
      .toPromise();
    appTree = await runner
      .runExternalSchematicAsync('@schematics/angular', 'application', appOptions, appTree)
      .toPromise();
  });

  it('should remove ngsscEnvironmentFile on v9 update', async () => {
    runner.registerCollection('schematics', join(__dirname, '../collection.json'));
    const tree = await runner
      .runExternalSchematicAsync('schematics', 'ng-add', { project: appOptions.name }, appTree)
      .toPromise();
    await updateWorkspace((workspace) => {
      workspace.projects.get(appOptions.name)!.targets.get('ngsscbuild')!.options![
        'ngsscEnvironmentFile'
      ] = 'projects/dummy/src/environments/environment.prod.ts';
    })(tree, undefined as any);
    const migratedTree = await runner.runSchematicAsync('migration-v15', {}, tree).toPromise();
    const angularJson = JSON.parse(migratedTree.readContent('angular.json'));
    expect(
      'ngsscEnvironmentFile' in angularJson.projects[appOptions.name].architect.ngsscbuild.options
    ).toBeFalse();
  });

  it('should update Dockerfile', async () => {
    appTree.create(
      'Dockerfile',
      `
FROM nginx:alpine
ADD https://github.com/kyubisation/angular-server-side-configuration/releases/download/v9.0.1/ngssc_64bit /usr/sbin/ngssc
RUN chmod +x /usr/sbin/ngssc
COPY dist /usr/share/nginx/html
COPY start.sh start.sh
RUN chmod +x ./start.sh
CMD ["./start.sh"]
`
    );
    const tree = await runner.runSchematicAsync('dockerfile', {}, appTree).toPromise();

    const dockerfileContent = tree.read('Dockerfile')!.toString();
    const version = require('../../package.json').version;
    expect(dockerfileContent).toContain(
      `https://github.com/kyubisation/angular-server-side-configuration/releases/download/v${version}/ngssc_64bit`
    );
  });
});
