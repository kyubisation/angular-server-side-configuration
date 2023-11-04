import { promises } from 'fs';
import { basename, join } from 'path';
import { BuilderContext, createBuilder, targetFromTargetString } from '@angular-devkit/architect';
import { BrowserBuilderOptions } from '@angular-devkit/build-angular';
import { json, JsonObject } from '@angular-devkit/core';
import { Ngssc } from 'angular-server-side-configuration';
import { glob } from 'glob';
import { Schema } from './schema';
import { VariableDetector } from './variable-detector';
import { NgsscContext } from './ngssc-context';

export type NgsscBuildSchema = Schema;

const readFileAsync = promises.readFile;
const writeFileAsync = promises.writeFile;

export async function ngsscBuild(options: NgsscBuildSchema, context: BuilderContext) {
  const buildTarget = targetFromTargetString(options.buildTarget || options.browserTarget);
  const rawBrowserOptions = await context.getTargetOptions(buildTarget);
  const browserName = await context.getBuilderNameForTarget(buildTarget);
  const browserOptions = await context.validateOptions<json.JsonObject & BrowserBuilderOptions>(
    rawBrowserOptions,
    browserName,
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

  await detectVariablesAndBuildNgsscJson(options, browserOptions, context);
  return result;
}

export async function detectVariablesAndBuildNgsscJson(
  options: NgsscBuildSchema,
  browserOptions: BrowserBuilderOptions,
  context: BuilderContext,
  multiple: boolean = false,
) {
  const ngsscContext = await detectVariables(context, options.searchPattern);
  const outputPath = join(context.workspaceRoot, browserOptions.outputPath);
  const ngssc = buildNgssc(ngsscContext, options, browserOptions, multiple);
  await writeFileAsync(join(outputPath, 'ngssc.json'), JSON.stringify(ngssc, null, 2), 'utf8');
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
  const typeScriptFiles = await glob(searchPattern || defaultSearchPattern, {
    absolute: true,
    cwd: context.workspaceRoot,
    ignore: ['**/node_modules/**', '**/*.spec.ts', '**/*.d.ts'],
  });
  let ngsscContext: NgsscContext | null = null;
  for (const file of typeScriptFiles) {
    const fileContent = await readFileAsync(file, 'utf8');
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
  browserOptions?: BrowserBuilderOptions,
  multiple: boolean = false,
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
