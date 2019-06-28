import { chain, noop, Rule, SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import { InsertChange } from '@schematics/angular/utility/change';
import { getWorkspace, updateWorkspace } from '@schematics/angular/utility/config';
import { ProjectType, WorkspaceProject } from '@schematics/angular/utility/workspace-models';

import { Schema } from './schema';

export default function(options: Schema): Rule {
  return chain([
    addNgsscTargetToWorkspace(options),
    addImportAndDescriptionToEnvironmentFile(options),
    addNgsscToPackageScripts(options),
    addPlaceholderToIndexHtml(options),
  ]);
}

function addNgsscTargetToWorkspace(options: Schema) {
  return (host: Tree, context: SchematicContext) => {
    const { workspace, projectName, architect } = resolveWorkspace(options, host);
    if ('build-ngssc' in architect) {
      context.logger.info(
        `Skipping adding build-ngssc target to angular.json, as it already exists in project ${projectName}.`);
      return noop();
    }

    architect['build-ngssc'] = {
      builder: 'angular-server-side-configuration:build-angular',
      options: {
        aotSupport: options.aotSupport,
        browserTarget: `${projectName}:build`,
        ngsscConfigurationFile: options.ngsscConfigurationFile,
      },
      // tslint:disable-next-line: object-literal-sort-keys
      configurations: {
        production: {
          browserTarget: `${projectName}:build:production`,
        },
      },
    };
    return updateWorkspace(workspace);
  };
}

function addImportAndDescriptionToEnvironmentFile(options: Schema) {
  return (host: Tree, context: SchematicContext) => {
    const file = host.get(options.ngsscConfigurationFile);
    if (!file) {
      throw new SchematicsException(`${options.ngsscConfigurationFile} does not exist!`);
    } else if (file.content.includes('angular-server-side-configuration')) {
      context.logger.info(
        `Skipping adding import to ${options.ngsscConfigurationFile}, since import was already detected.`);
      return;
    }

    const importExpression = options.variant === 'NG_ENV'
      ? `import { NG_ENV } from 'angular-server-side-configuration/ng-env';`
      : `import 'angular-server-side-configuration/process';`;
    const variant = options.variant === 'NG_ENV' ? 'NG_ENV' : 'process.env';
    const insertContent = `${importExpression}

/**
 * How to use angular-server-side-configuration:
 *
 * Use ${variant}.NAME_OF_YOUR_ENVIRONMENT_VARIABLE
 *
 * export const environment = {
 *   stringValue: ${variant}.STRING_VALUE,
 *   stringValueWithDefault: ${variant}.STRING_VALUE || 'defaultValue',
 *   numberValue: Number(${variant}.NUMBER_VALUE),
 *   numberValueWithDefault: Number(${variant}.NUMBER_VALUE || 10),
 *   booleanValue: Boolean(${variant}.BOOLEAN_VALUE),
 *   booleanValueInverted: ${variant}.BOOLEAN_VALUE_INVERTED !== 'false',
 * };
 */

`;

    const insertion = new InsertChange(options.ngsscConfigurationFile, 0, insertContent);
    const recorder = host.beginUpdate(options.ngsscConfigurationFile);
    recorder.insertLeft(insertion.pos, insertion.toAdd);
    host.commitUpdate(recorder);
  };
}

function addNgsscToPackageScripts(options: Schema) {
  return (host: Tree, context: SchematicContext) => {
    const { projectName } = resolveWorkspace(options, host);
    const pkgPath = '/package.json';
    const buffer = host.read(pkgPath);
    if (buffer === null) {
      throw new SchematicsException('Could not find package.json');
    }

    const pkg = JSON.parse(buffer.toString());
    if ('build:ngssc' in pkg.scripts) {
      context.logger.info(`Skipping adding script to package.json, as it already exists.`);
      return;
    }

    pkg.scripts['build:ngssc'] = `ng run ${projectName}:build-ngssc:production`;
    host.overwrite(pkgPath, JSON.stringify(pkg, null, 2));
  };
}

function addPlaceholderToIndexHtml(options: Schema) {
  return (host: Tree, context: SchematicContext) => {
    const { architect, projectName } = resolveWorkspace(options, host);
    const build = architect.build;
    if (!build) {
      throw new SchematicsException(`Expected a build target in project ${projectName}!`);
    }

    const indexHtml = host.get(build.options.index || 'src/index.html');
    if (!indexHtml) {
      throw new SchematicsException(`Expected index html ${indexHtml} to exist!`);
    }

    const indexHtmlContent = indexHtml.content.toString();
    if (/<!--\s*CONFIG\s*-->/.test(indexHtmlContent)) {
      context.logger.info(`Skipping adding placeholder to ${indexHtml.path}, as it already contains it.`);
      return;
    }

    const insertIndex = indexHtmlContent.includes('</title>')
      ? indexHtmlContent.indexOf('</title>') + 9 : indexHtmlContent.indexOf('</head>');
    const insertion = new InsertChange(options.ngsscConfigurationFile, insertIndex, '  <!--CONFIG-->\n');
    const recorder = host.beginUpdate(indexHtml.path);
    recorder.insertLeft(insertion.pos, insertion.toAdd);
    host.commitUpdate(recorder);
  };
}

function resolveWorkspace(options: Schema, host: Tree) {
  const workspace = getWorkspace(host);
  const projectName = options.project || workspace.defaultProject || Object.keys(workspace.projects)[0];
  const { architect } = workspace.projects[projectName] as WorkspaceProject<ProjectType.Application>;
  if (!architect) {
    throw new SchematicsException(`Expected project ${projectName} to have an architect section!`);
  }

  return { workspace, projectName, architect };
}
