import { promises } from 'fs';
import { basename, join } from 'path';
import { BuilderContext, createBuilder, targetFromTargetString } from '@angular-devkit/architect';
import { json, JsonObject } from '@angular-devkit/core';
import { Ngssc } from 'angular-server-side-configuration';
import { BrowserBuilderOptions } from '@angular-devkit/build-angular';
import { Schema } from './schema';
import { VariableDetector } from './variable-detector';
import { NgsscContext } from './ngssc-context';

export type NgsscBuildSchema = Schema;

const readFileAsync = promises.readFile;
const writeFileAsync = promises.writeFile;

export async function ngsscBuild(options: NgsscBuildSchema, context: BuilderContext) {
  const browserTarget = targetFromTargetString(options.browserTarget);
  const rawBrowserOptions = await context.getTargetOptions(browserTarget);
  const browserName = await context.getBuilderNameForTarget(browserTarget);
  const browserOptions = await context.validateOptions<json.JsonObject & BrowserBuilderOptions>(
    rawBrowserOptions,
    browserName
  );
  const scheduledTarget = await context.scheduleTarget(browserTarget);
  const result = await scheduledTarget.result;
  await detectVariablesAndBuildNgsscJson(options, browserOptions, context);
  return result;
}

export async function detectVariablesAndBuildNgsscJson(
  options: NgsscBuildSchema,
  browserOptions: BrowserBuilderOptions,
  context: BuilderContext,
  multiple: boolean = false
) {
  const ngsscContext = await detectVariables(options, context);
  const outputPath = join(context.workspaceRoot, browserOptions.outputPath);
  const ngssc = buildNgssc(ngsscContext, options, browserOptions, multiple);
  await writeFileAsync(join(outputPath, 'ngssc.json'), JSON.stringify(ngssc, null, 2), 'utf8');
}

export async function detectVariables(
  options: NgsscBuildSchema,
  context: BuilderContext
): Promise<NgsscContext> {
  const environmentVariableFile = join(context.workspaceRoot, options.ngsscEnvironmentFile);
  const detector = new VariableDetector(context.logger);
  const fileContent = await readFileAsync(environmentVariableFile, 'utf8');
  const ngsscContext = detector.detect(fileContent);
  context.logger.info(
    `ngssc: Detected variant '${ngsscContext.variant}' with variables ` +
      `'${ngsscContext.variables.join(', ')}'`
  );
  if (ngsscContext.variant === 'NG_ENV') {
    context.logger.warn(
      'Variant NG_ENV is deprecated and will be removed with version 14. ' +
        'Please change usage to `process.env`.'
    );
  }

  return ngsscContext;
}

export function buildNgssc(
  ngsscContext: NgsscContext,
  options: NgsscBuildSchema,
  browserOptions?: BrowserBuilderOptions,
  multiple: boolean = false
): Ngssc {
  return {
    environmentVariables: [
      ...ngsscContext.variables,
      ...(options.additionalEnvironmentVariables || []),
    ],
    filePattern: options.filePattern || extractFilePattern(browserOptions?.index, multiple),
    variant: ngsscContext.variant,
  };
}

function extractFilePattern(index: BrowserBuilderOptions['index'] | undefined, multiple: boolean) {
  let result = '**/index.html';
  if (!index) {
    return result;
  } else if (typeof index === 'string') {
    result = basename(index);
  } else if (index.output) {
    result = basename(index.output);
  } else {
    result = basename(index.input);
  }
  return multiple && !result.startsWith('*') ? `**/${result}` : result;
}

export default createBuilder<NgsscBuildSchema & JsonObject>(ngsscBuild);
