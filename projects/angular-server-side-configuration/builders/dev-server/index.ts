import { BuilderContext, createBuilder } from '@angular-devkit/architect';
import {
  DevServerBuilderOptions,
  DevServerBuilderOutput,
  executeDevServerBuilder,
  ExecutionTransformer,
} from '@angular-devkit/build-angular';
import { IndexHtmlTransform } from '@angular-devkit/build-angular/src/utils/index-file/index-html-generator';
import { WebpackLoggingCallback } from '@angular-devkit/build-webpack';
import webpack from 'webpack';
import { Observable } from 'rxjs';

import { buildNgssc, detectVariables, NgsscBuildSchema } from '../ngsscbuild/index';

export type NgsscDevServerBuilderOptions = DevServerBuilderOptions & NgsscBuildSchema;

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
