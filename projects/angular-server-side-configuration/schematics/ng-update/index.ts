import { basename, Path } from '@angular-devkit/core';
import { chain, FileEntry, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getWorkspace, updateWorkspace } from '@schematics/angular/utility/workspace';

import { Ngssc, Variant } from 'angular-server-side-configuration';
import { ngAdd } from '../ng-add/index';

const NGSSC_JSON_PATH = '/ngssc.json';

export function updateToV8(): Rule {
  return async (tree: Tree) => {
    const ngssc = tryReadNgsscJson(tree);
    const variant = findAndPatchVariantFromFiles(tree);
    const workspace = await getWorkspace(tree);
    const projects = Array.from(workspace.projects.keys());

    return chain([
      ...projects.map((project) =>
        ngAdd({
          additionalEnvironmentVariables: (ngssc.environmentVariables || []).join(','),
          ngsscEnvironmentFile: 'src/environments/environment.prod.ts',
          project,
        })
      ),
      removeNgsscJson(),
      checkNgsscUsageInScripts(),
    ]);
  };
}

export function updateToV9(): Rule {
  return (_tree: Tree, context: SchematicContext) => {
    return updateWorkspace((workspace) => {
      context.logger.info(
        `Removing ngsscbuild entry 'aotSupport', since it is no longer necessary for Ivy.`
      );
      workspace.projects.forEach((project, name) => {
        const ngsscbuild = project.targets.get('ngsscbuild');
        if (!ngsscbuild || !ngsscbuild.options) {
          return;
        }

        if ('aotSupport' in ngsscbuild.options) {
          delete ngsscbuild.options['aotSupport'];
          context.logger.info(` - Removed from ${name} ngsscbuild options`);
        }
        Object.keys(ngsscbuild.configurations || {})
          .filter((c) => 'aotSupport' in ngsscbuild.configurations![c]!)
          .forEach((c) => {
            delete ngsscbuild.configurations![c]!['aotSupport'];
            context.logger.info(` - Removed from ${name} ngsscbuild configuration ${c}`);
          });
      });
    });
  };
}

export function dockerfile(): Rule {
  return (tree: Tree) => {
    const downloadUrlRegex =
      /https:\/\/github.com\/kyubisation\/angular-server-side-configuration\/releases\/download\/v((0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?)/;
    const version = require('../../package.json').version;
    tree.visit((path, entry) => {
      if (
        basename(path).indexOf('Dockerfile') >= 0 &&
        entry &&
        entry.content.toString().match(downloadUrlRegex)
      ) {
        const content = entry.content
          .toString()
          .replace(
            new RegExp(downloadUrlRegex.source, 'g'),
            `https://github.com/kyubisation/angular-server-side-configuration/releases/download/v${version}`
          );
        tree.overwrite(path, content);
      }
    });
  };
}

function tryReadNgsscJson(tree: Tree): Partial<Ngssc> {
  const ngssc = tree.read(NGSSC_JSON_PATH);
  return ngssc ? JSON.parse(ngssc.toString('utf8')) : {};
}

function findAndPatchVariantFromFiles(tree: Tree): Variant {
  let variant: Variant = 'process';
  const ngEnv4Import = 'angular-server-side-configuration/ng-env4';
  const ngEnvImport = 'angular-server-side-configuration/ng-env';
  tree.visit((path: Path, entry?: Readonly<FileEntry> | null) => {
    if (path.endsWith('.ts') && entry) {
      const content = entry.content.toString('utf8');
      if (content.includes(ngEnv4Import)) {
        const newContent = content.replace(ngEnv4Import, ngEnvImport);
        tree.overwrite(path, newContent);
        variant = 'NG_ENV';
      } else if (content.includes(ngEnvImport)) {
        variant = 'NG_ENV';
      }
    }
  });

  return variant;
}

function removeNgsscJson() {
  return (tree: Tree, context: SchematicContext) => {
    if (tree.exists(NGSSC_JSON_PATH)) {
      tree.delete(NGSSC_JSON_PATH);
      context.logger.info('Removed legacy ngssc.json');
    }
  };
}

function checkNgsscUsageInScripts() {
  return async (tree: Tree, context: SchematicContext) => {
    const packageJson = tree.read('/package.json');
    if (!packageJson) {
      return;
    }

    const pkg = JSON.parse(packageJson.toString('utf8'));
    const ngsscUsedInScripts = Object.keys(pkg.scripts || {}).some((k) =>
      pkg.scripts[k].includes('ngssc ')
    );
    if (!ngsscUsedInScripts) {
      return;
    }

    const workspace = await getWorkspace(tree);
    const projectName = Array.from(workspace.projects.keys())[0];
    context.logger.info('Please remove the ngssc usage from your scripts.');
    context.logger.info(
      `To run the ngssc build, run the command \`ng run ${projectName}:ngsscbuild:production\`.`
    );
  };
}
