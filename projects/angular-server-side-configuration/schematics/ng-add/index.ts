import { join, normalize } from '@angular-devkit/core';
import {
  chain,
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import { InsertChange } from '@schematics/angular/utility/change';
import { getWorkspace, updateWorkspace } from '@schematics/angular/utility/workspace';

import { Schema } from './schema';

export function ngAdd(options: Schema): Rule {
  return chain([
    addNgsscTargetToWorkspace(options),
    addImportAndDescriptionToEnvironmentFile(options),
    addNgsscToPackageScripts(options),
    addPlaceholderToIndexHtml(options),
  ]);
}

function addNgsscTargetToWorkspace(options: Schema): Rule {
  return (_host: Tree, context: SchematicContext) =>
    updateWorkspace((workspace) => {
      const project = workspace.projects.get(options.project);
      if (!project) {
        return;
      }

      const target = project.targets.get('ngsscbuild');
      if (target) {
        context.logger.info(
          `Skipping adding ngsscbuild target to angular.json, as it already exists in project ${options.project}.`
        );
        return;
      }

      project.targets.add({
        name: 'ngsscbuild',
        builder: 'angular-server-side-configuration:ngsscbuild',
        options: {
          additionalEnvironmentVariables: options.additionalEnvironmentVariables
            ? options.additionalEnvironmentVariables.split(',').map((e) => e.trim())
            : [],
          browserTarget: `${options.project}:build`,
          ngsscEnvironmentFile: options.ngsscEnvironmentFile,
        },
        configurations: {
          production: {
            browserTarget: `${options.project}:build:production`,
          },
        },
      });
    });
}

function addImportAndDescriptionToEnvironmentFile(options: Schema): Rule {
  return async (host: Tree, context: SchematicContext) => {
    const { project } = await resolveWorkspace(options, host);
    const normalizedPath = join(normalize(project.root), options.ngsscEnvironmentFile);
    const file = host.get(normalizedPath);
    if (!file) {
      throw new SchematicsException(`${normalizedPath} does not exist!`);
    } else if (file.content.includes('angular-server-side-configuration')) {
      context.logger.info(
        `Skipping adding import to ${file.path}, since import was already detected.`
      );
      return;
    }

    const importExpression =
      options.variant === 'NG_ENV'
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

    const insertion = new InsertChange(file.path, 0, insertContent);
    const recorder = host.beginUpdate(file.path);
    recorder.insertLeft(insertion.pos, insertion.toAdd);
    host.commitUpdate(recorder);
  };
}

function addNgsscToPackageScripts(options: Schema): Rule {
  return (host: Tree, context: SchematicContext) => {
    const pkgPath = '/package.json';
    const buffer = host.read(pkgPath);
    if (buffer === null) {
      throw new SchematicsException('Could not find package.json');
    }

    const pkg = { scripts: {}, ...JSON.parse(buffer.toString()) };
    if ('build:ngssc' in pkg.scripts) {
      context.logger.info(`Skipping adding script to package.json, as it already exists.`);
      return;
    }

    pkg.scripts['build:ngssc'] = `ng run ${options.project}:ngsscbuild:production`;
    host.overwrite(pkgPath, JSON.stringify(pkg, null, 2));
  };
}

function addPlaceholderToIndexHtml(options: Schema): Rule {
  return async (host: Tree, context: SchematicContext) => {
    const { project } = await resolveWorkspace(options, host);
    const build = project.targets.get('build');
    if (!build) {
      throw new SchematicsException(`Expected a build target in project ${options.project}!`);
    }

    const indexPath = (build.options?.['index'] as string) || 'src/index.html';
    const indexHtml = host.get(indexPath);
    if (!indexHtml) {
      throw new SchematicsException(`Expected index html ${indexPath} to exist!`);
    }

    const indexHtmlContent = indexHtml.content.toString();
    if (/<!--\s*CONFIG\s*-->/.test(indexHtmlContent)) {
      context.logger.info(
        `Skipping adding placeholder to ${indexHtml.path}, as it already contains it.`
      );
      return;
    }

    const insertIndex = indexHtmlContent.includes('</title>')
      ? indexHtmlContent.indexOf('</title>') + 9
      : indexHtmlContent.indexOf('</head>');
    const insertion = new InsertChange(indexHtml.path, insertIndex, '  <!--CONFIG-->\n');
    const recorder = host.beginUpdate(indexHtml.path);
    recorder.insertLeft(insertion.pos, insertion.toAdd);
    host.commitUpdate(recorder);
  };
}

async function resolveWorkspace(options: Schema, host: Tree) {
  const workspace = await getWorkspace(host);
  const project = workspace.projects.get(options.project);
  if (!project) {
    throw new SchematicsException(`Project ${options.project} not found!`);
  }

  return { workspace, project };
}
