import { dirname, join, normalize } from '@angular-devkit/core';
import {
  chain,
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import { InsertChange } from '@schematics/angular/utility/change';
import { getWorkspace, updateWorkspace } from '@schematics/angular/utility/workspace';
import type { FileReplacement } from '@angular-devkit/build-angular';
import { Schema } from './schema';

export function ngAdd(options: Schema): Rule {
  return chain([
    addNgsscTargetToWorkspace(options),
    addDescriptionToMainFile(options),
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

      const ngsscOptions = {
        additionalEnvironmentVariables: options.additionalEnvironmentVariables
          ? options.additionalEnvironmentVariables.split(',').map((e) => e.trim())
          : [],
      };

      if (options.experimentalBuilders) {
        const buildTarget = project.targets.get('build')!;
        buildTarget.builder = 'angular-server-side-configuration:browser';
        buildTarget.options = { ...buildTarget.options, ...ngsscOptions };

        const serveTarget = project.targets.get('serve')!;
        serveTarget.builder = 'angular-server-side-configuration:dev-server';

        const target = project.targets.get('ngsscbuild');
        if (target) {
          project.targets.delete('ngsscbuild');
        }

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
          ...ngsscOptions,
          browserTarget: `${options.project}:build`,
        },
        configurations: {
          production: {
            browserTarget: `${options.project}:build:production`,
          },
        },
      });
    });
}

function addDescriptionToMainFile(options: Schema): Rule {
  const noAppropriateInsertFileWarning =
    'Unable to resolve appropriate file to insert import. Please follow documentation.';
  return async (host: Tree, context: SchematicContext) => {
    const { project } = await resolveWorkspace(options, host);
    const buildTarget = project.targets.get('build')!;
    const mainFile = normalize((buildTarget?.options?.['main'] as string) ?? '');
    if (!mainFile) {
      context.logger.warn(noAppropriateInsertFileWarning);
      return;
    }

    const insertFile = [
      join(dirname(mainFile), 'environment.prod.ts'),
      join(dirname(mainFile), 'environment.ts'),
      join(dirname(mainFile), 'app/app.module.ts'),
      join(dirname(mainFile), 'app/app.component.ts'),
      mainFile,
    ].find((f) => host.exists(f));
    if (!insertFile) {
      context.logger.warn(noAppropriateInsertFileWarning);
      return;
    }
    const file = host.get(insertFile);
    if (!file) {
      context.logger.warn(noAppropriateInsertFileWarning);
      return;
    } else if (file.content.includes('angular-server-side-configuration')) {
      context.logger.info(
        `Skipping adding import to ${file.path}, since import was already detected.`
      );
      return;
    }

    const insertContent = `import 'angular-server-side-configuration/process';

/**
 * How to use angular-server-side-configuration:
 *
 * Use process.env['NAME_OF_YOUR_ENVIRONMENT_VARIABLE']
 *
 * const stringValue = process.env['STRING_VALUE'];
 * const stringValueWithDefault = process.env['STRING_VALUE'] || 'defaultValue';
 * const numberValue = Number(process.env['NUMBER_VALUE']);
 * const numberValueWithDefault = Number(process.env['NUMBER_VALUE'] || 10);
 * const booleanValue = process.env['BOOLEAN_VALUE'] === 'true';
 * const booleanValueInverted = process.env['BOOLEAN_VALUE_INVERTED'] !== 'false';
 * const complexValue = JSON.parse(process.env['COMPLEX_JSON_VALUE]);
 * 
 * Please note that process.env[variable] cannot be resolved. Please directly use strings.
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
    if (options.experimentalBuilders) {
      return;
    }

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
