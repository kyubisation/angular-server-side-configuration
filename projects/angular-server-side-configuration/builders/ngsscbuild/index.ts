import { existsSync, readFileSync, writeFileSync } from 'fs';
import { basename, join } from 'path';
import { BuilderContext, createBuilder, targetFromTargetString } from '@angular-devkit/architect';
import { ApplicationBuilderOptions, BrowserBuilderOptions } from '@angular-devkit/build-angular';
import { json, JsonObject } from '@angular-devkit/core';
import { Ngssc } from 'angular-server-side-configuration';
import * as glob from 'glob';
import { Schema } from './schema';
import { VariableDetector } from './variable-detector';
import { NgsscContext } from './ngssc-context';

export type NgsscBuildSchema = Schema;
type BuilderOptions = ApplicationBuilderOptions | BrowserBuilderOptions;
type ApplicationBuilderVariant = undefined | 'browser-only' | 'server';

export async function ngsscBuild(options: NgsscBuildSchema, context: BuilderContext) {
  const buildTarget = targetFromTargetString(options.buildTarget || options.browserTarget);
  const rawBuilderOptions = await context.getTargetOptions(buildTarget);
  const builderName = await context.getBuilderNameForTarget(buildTarget);
  const builderOptions = await context.validateOptions<json.JsonObject & BuilderOptions>(
    rawBuilderOptions,
    builderName,
  );
  const scheduledTarget = await context.scheduleTarget(buildTarget);
  const result = await scheduledTarget.result;
  if (!result.success) {
    const buildConfig = buildTarget.configuration ? `:${buildTarget.configuration}` : '';
    context.logger.warn(
      `ngssc: Failed build of ${buildTarget.app}:${buildTarget.target}${buildConfig}. Skipping ngssc build.`,
    );
    return result;
  }

  await detectVariablesAndBuildNgsscJson(
    options,
    builderOptions,
    context,
    false,
    builderName !== '@angular-devkit/build-angular:application'
      ? undefined
      : 'server' in builderOptions && builderOptions.server
      ? 'server'
      : 'browser-only',
  );

  return result;
}

export async function detectVariablesAndBuildNgsscJson(
  options: NgsscBuildSchema,
  builderOptions: BuilderOptions,
  context: BuilderContext,
  multiple: boolean = false,
  applicationBuilderVariant: ApplicationBuilderVariant = undefined,
) {
  const ngsscContext = await detectVariables(context, options.searchPattern);
  let outputPath = join(context.workspaceRoot, builderOptions.outputPath);
  const ngssc = buildNgssc(
    ngsscContext,
    options,
    builderOptions,
    multiple,
    applicationBuilderVariant,
  );

  const browserOutputPath = join(outputPath, 'browser');
  if (applicationBuilderVariant === 'browser-only' && existsSync(browserOutputPath)) {
    outputPath = browserOutputPath;
  }
  writeFileSync(join(outputPath, 'ngssc.json'), JSON.stringify(ngssc, null, 2), 'utf8');
}

export async function detectVariables(
  context: BuilderContext,
  searchPattern?: string | null,
): Promise<NgsscContext> {
  const projectName = context.target && context.target.project;
  if (!projectName) {
    throw new Error('The builder requires a target.');
  }

  const projectMetadata = await context.getProjectMetadata(projectName);
  const sourceRoot = projectMetadata.sourceRoot as string | undefined;
  const defaultSearchPattern = sourceRoot
    ? `${sourceRoot}/**/environments/environment*.ts`
    : '**/environments/environment*.ts';

  const detector = new VariableDetector(context.logger);
  const typeScriptFiles = await glob.glob(searchPattern || defaultSearchPattern, {
    absolute: true,
    cwd: context.workspaceRoot,
    ignore: ['**/node_modules/**', '**/*.spec.ts', '**/*.d.ts'],
  });
  let ngsscContext: NgsscContext | null = null;
  for (const file of typeScriptFiles) {
    const fileContent = readFileSync(file, 'utf8');
    const innerNgsscContext = detector.detect(fileContent);
    if (!innerNgsscContext.variables.length) {
      continue;
    } else if (!ngsscContext) {
      ngsscContext = innerNgsscContext;
      continue;
    }
    if (ngsscContext.variant !== innerNgsscContext.variant) {
      context.logger.info(
        `ngssc: Detected conflicting variants (${ngsscContext.variant} and ${innerNgsscContext.variant}) being used`,
      );
    }
    ngsscContext.variables.push(
      ...innerNgsscContext.variables.filter((v) => !ngsscContext!.variables.includes(v)),
    );
  }
  if (!ngsscContext) {
    return { variant: 'process', variables: [] };
  }

  context.logger.info(
    `ngssc: Detected variant '${ngsscContext.variant}' with variables ` +
      `'${ngsscContext.variables.join(', ')}'`,
  );

  return ngsscContext;
}

export function buildNgssc(
  ngsscContext: NgsscContext,
  options: NgsscBuildSchema,
  builderOptions?: BuilderOptions,
  multiple: boolean = false,
  applicationBuilderVariant: ApplicationBuilderVariant = undefined,
): Ngssc {
  return {
    environmentVariables: [
      ...ngsscContext.variables,
      ...(options.additionalEnvironmentVariables || []),
    ],
    filePattern:
      options.filePattern ||
      extractFilePattern(builderOptions, multiple, applicationBuilderVariant),
    variant: ngsscContext.variant,
  };
}

function extractFilePattern(
  builderOptions: BuilderOptions | undefined,
  multiple: boolean,
  applicationBuilderVariant: ApplicationBuilderVariant = undefined,
) {
  if (builderOptions && applicationBuilderVariant === 'server') {
    return '**/index{.,.server.}html';
  }

  const index = builderOptions?.index;
  let result = '**/index.html';
  if (!index || typeof index === 'boolean') {
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
