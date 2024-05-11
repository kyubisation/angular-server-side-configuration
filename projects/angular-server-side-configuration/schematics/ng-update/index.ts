import { basename } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { updateWorkspace } from '@schematics/angular/utility/workspace';

export function updateToV15(): Rule {
  return (_tree: Tree, context: SchematicContext) => {
    return updateWorkspace((workspace) => {
      context.logger.info(`Removing obsolete ngsscbuild entry 'ngsscEnvironmentFile'.`);
      workspace.projects.forEach((project, name) => {
        const ngsscbuild = project.targets.get('ngsscbuild');
        if (!ngsscbuild || !ngsscbuild.options) {
          return;
        }

        if ('ngsscEnvironmentFile' in ngsscbuild.options) {
          delete ngsscbuild.options['ngsscEnvironmentFile'];
          context.logger.info(` - Removed from ${name} ngsscbuild options`);
        }
        Object.keys(ngsscbuild.configurations || {})
          .filter((c) => 'ngsscEnvironmentFile' in ngsscbuild.configurations![c]!)
          .forEach((c) => {
            delete ngsscbuild.configurations![c]!['ngsscEnvironmentFile'];
            context.logger.info(` - Removed from ${name} ngsscbuild configuration ${c}`);
          });
      });
    });
  };
}

export function updateToV17(): Rule {
  return (_tree: Tree, context: SchematicContext) => {
    return updateWorkspace((workspace) => {
      context.logger.info(`Renaming 'browserTarget' to 'buildTarget'.`);
      workspace.projects.forEach((project, name) => {
        const ngsscbuild = project.targets.get('ngsscbuild');
        if (!ngsscbuild || !ngsscbuild.options) {
          return;
        }

        if ('browserTarget' in ngsscbuild.options) {
          ngsscbuild.options['buildTarget'] = ngsscbuild.options['browserTarget'];
          delete ngsscbuild.options['browserTarget'];
        }
        Object.keys(ngsscbuild.configurations || {})
          .filter((c) => 'browserTarget' in ngsscbuild.configurations![c]!)
          .forEach((c) => {
            ngsscbuild.configurations![c]!['buildTarget'] =
              ngsscbuild.configurations![c]!['browserTarget'];
            delete ngsscbuild.configurations![c]!['browserTarget'];
          });
      });
    });
  };
}

export function dockerfile(): Rule {
  return (tree: Tree) => {
    const downloadUrlRegexes = new Map<RegExp, string>()
      .set(
        /https:\/\/github.com\/kyubisation\/angular-server-side-configuration\/releases\/download\/v((0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?)/,
        'https://github.com/kyubisation/angular-server-side-configuration/releases/download/v',
      )
      .set(
        /https:\/\/bin.sbb.ch\/artifactory\/angular-server-side-configuration\/download\/v((0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?)/,
        'https://bin.sbb.ch/artifactory/angular-server-side-configuration/download/v',
      );
    const version = require('../../package.json').version;
    tree.visit((path, entry) => {
      if (basename(path).indexOf('Dockerfile') >= 0 && entry) {
        downloadUrlRegexes.forEach((downloadUrlTemplate, downloadUrlRegex) => {
          if (entry.content.toString().match(downloadUrlRegex)) {
            const content = entry.content
              .toString()
              .replace(
                new RegExp(downloadUrlRegex.source, 'g'),
                `${downloadUrlTemplate}${version}`,
              );
            tree.overwrite(path, content);
          }
        });
      }
    });
  };
}
