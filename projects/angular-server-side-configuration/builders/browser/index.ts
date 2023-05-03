import { BuilderContext, createBuilder } from '@angular-devkit/architect';
import {
  BrowserBuilderOptions,
  BrowserBuilderOutput,
  executeBrowserBuilder,
  ExecutionTransformer,
} from '@angular-devkit/build-angular';
import { IndexHtmlTransform } from '@angular-devkit/build-angular/src/utils/index-file/index-html-generator';
import { WebpackLoggingCallback } from '@angular-devkit/build-webpack';
import { json } from '@angular-devkit/core';
import webpack from 'webpack';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { detectVariablesAndBuildNgsscJson, NgsscBuildSchema } from '../ngsscbuild/index';

export type NgsscBrowserBuilderOptions = BrowserBuilderOptions & NgsscBuildSchema;

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
  } = {}
): Observable<BrowserBuilderOutput> {
  return executeBrowserBuilder(options, context, transforms).pipe(
    switchMap(async (result) => {
      if (result.success) {
        await detectVariablesAndBuildNgsscJson(
          options,
          options,
          context,
          result.outputPaths.length > 1
        );
      }
      return result;
    })
  );
}

export default createBuilder<json.JsonObject & NgsscBrowserBuilderOptions>(
  ngsscBuildWebpackBrowser
);
