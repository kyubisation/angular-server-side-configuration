import { type BuilderContext, createBuilder } from '@angular-devkit/architect';
import {
  type DevServerBuilderOptions,
  type DevServerBuilderOutput,
  executeDevServerBuilder,
  type ExecutionTransformer,
} from '@angular-devkit/build-angular';
import type { WebpackLoggingCallback } from '@angular-devkit/build-webpack';
import type webpack from 'webpack';
import type { Observable } from 'rxjs';

import { buildNgssc, detectVariables, type NgsscBuildSchema } from '../ngsscbuild/index';

export type NgsscDevServerBuilderOptions = DevServerBuilderOptions & NgsscBuildSchema;
// Copied from https://github.com/angular/angular-cli/blob/main/packages/angular/build/src/utils/index-file/index-html-generator.ts
type IndexHtmlTransform = (content: string) => Promise<string>;

/**
 * Ngssc wrapper for the Angular Webpack development server builder.
 * @param options Dev Server options.
 * @param context The build context.
 * @param transforms A map of transforms that can be used to hook into some logic (such as
 *     transforming webpack configuration before passing it to webpack).
 *
 * @experimental Direct usage of this function is considered experimental.
 */
export function ngsscServeWebpackBrowser(
  options: NgsscDevServerBuilderOptions,
  context: BuilderContext,
  transforms: {
    webpackConfiguration?: ExecutionTransformer<webpack.Configuration>;
    logging?: WebpackLoggingCallback;
    indexHtml?: IndexHtmlTransform;
  } = {},
): Observable<DevServerBuilderOutput> {
  context.logger.warn(`
The angular-server-side-configuration:dev-server builder is deprecated with no replacement.
Please create an issue at https://github.com/kyubisation/angular-server-side-configuration
if you need a angular-server-side-configuration:application builder.`);
  transforms.indexHtml = async (content: string) => {
    const ngsscContext = await detectVariables(context, options.searchPattern);
    const ngssc = buildNgssc(ngsscContext, options);
    const populatedVariables = populateVariables(ngssc.environmentVariables);
    context.logger.info(
      `Populated environment variables (Variant: ${ngssc.variant})\n${Object.entries(
        populatedVariables,
      ).map(([key, value]) => `  ${key}: ${value}`)}`,
    );
    const iife = generateIife(ngssc.variant, populatedVariables);
    return insertIife(content, iife);
  };
  return executeDevServerBuilder(options, context, transforms);
}

function populateVariables(variables: string[]) {
  const populatedVariables: { [key: string]: string | null } = {};
  variables.forEach(
    (v) => (populatedVariables[v] = v in process.env ? process.env[v] || '' : null),
  );
  return populatedVariables;
}

function generateIife(
  variant: 'process' | 'global' | 'NG_ENV',
  populatedVariables: { [key: string]: string | null },
) {
  const iife =
    variant === 'NG_ENV'
      ? `(function(self){self.NG_ENV=${JSON.stringify(populatedVariables)};})(window)`
      : `(function(self){self.process=${JSON.stringify({ env: populatedVariables })};})(window)`;
  return `<!--ngssc--><script>${iife}</script><!--/ngssc-->`;
}

function insertIife(fileContent: string, iife: string) {
  if (/<!--ngssc-->[\w\W]*<!--\/ngssc-->/.test(fileContent)) {
    return fileContent.replace(/<!--ngssc-->[\w\W]*<!--\/ngssc-->/, iife);
  } else if (/<!--\s*CONFIG\s*-->/.test(fileContent)) {
    return fileContent.replace(/<!--\s*CONFIG\s*-->/, iife);
  } else if (fileContent.includes('</title>')) {
    return fileContent.replace('</title>', `</title>${iife}`);
  } else {
    return fileContent.replace('</head>', `${iife}</head>`);
  }
}

export default createBuilder<NgsscDevServerBuilderOptions, DevServerBuilderOutput>(
  ngsscServeWebpackBrowser,
);
