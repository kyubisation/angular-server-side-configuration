import { type BuilderContext, createBuilder } from '@angular-devkit/architect';
import {
  type BrowserBuilderOptions,
  type BrowserBuilderOutput,
  executeBrowserBuilder,
  type ExecutionTransformer,
} from '@angular-devkit/build-angular';
import type { WebpackLoggingCallback } from '@angular-devkit/build-webpack';
import type { json } from '@angular-devkit/core';
import type webpack from 'webpack';
import type { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { detectVariablesAndBuildNgsscJson, NgsscBuildSchema } from '../ngsscbuild/index';

export type NgsscBrowserBuilderOptions = BrowserBuilderOptions & NgsscBuildSchema;
// Copied from https://github.com/angular/angular-cli/blob/main/packages/angular/build/src/utils/index-file/index-html-generator.ts
type IndexHtmlTransform = (content: string) => Promise<string>;

/**
 * Experimental wrapper of the @angular-devkit/build-angular:browser builder for ngssc.
 */
export function ngsscBuildWebpackBrowser(
  options: NgsscBrowserBuilderOptions,
  context: BuilderContext,
  transforms: {
    webpackConfiguration?: ExecutionTransformer<webpack.Configuration>;
    logging?: WebpackLoggingCallback;
    indexHtml?: IndexHtmlTransform;
  } = {},
): Observable<BrowserBuilderOutput> {
  context.logger.warn(`
The angular-server-side-configuration:browser builder is deprecated with no replacement.
Please create an issue at https://github.com/kyubisation/angular-server-side-configuration
if you need a angular-server-side-configuration:application builder.`);
  return executeBrowserBuilder(options, context, transforms).pipe(
    switchMap(async (result) => {
      if (result.success) {
        await detectVariablesAndBuildNgsscJson(
          options,
          options,
          context,
          result.outputPaths.length > 1,
        );
      }
      return result;
    }),
  );
}

export default createBuilder<json.JsonObject & NgsscBrowserBuilderOptions>(
  ngsscBuildWebpackBrowser,
);
