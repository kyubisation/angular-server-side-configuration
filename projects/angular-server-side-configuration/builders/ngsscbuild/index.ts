import { lstatSync, promises, readdirSync } from 'fs';
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
  const ngsscContext = await detectVariables(context);
  const outputPath = join(context.workspaceRoot, browserOptions.outputPath);
  const ngssc = buildNgssc(ngsscContext, options, browserOptions, multiple);
  await writeFileAsync(join(outputPath, 'ngssc.json'), JSON.stringify(ngssc, null, 2), 'utf8');
}

export async function detectVariables(context: BuilderContext): Promise<NgsscContext> {
  const detector = new VariableDetector(context.logger);
  const typeScriptFiles = findTypeScriptFiles(context.workspaceRoot);
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
        `ngssc: Detected conflicting variants (${ngsscContext.variant} and ${innerNgsscContext.variant}) being used`
      );
    }
    ngsscContext.variables.push(
      ...innerNgsscContext.variables.filter((v) => !ngsscContext!.variables.includes(v))
    );
  }
  if (!ngsscContext) {
    return { variant: 'process', variables: [] };
  }

  context.logger.info(
    `ngssc: Detected variant '${ngsscContext.variant}' with variables ` +
      `'${ngsscContext.variables.join(', ')}'`
  );

  return ngsscContext;
}

function findTypeScriptFiles(root: string): string[] {
  const directory = root.replace(/\\/g, '/');
  return readdirSync(directory)
    .map((f) => `${directory}/${f}`)
    .map((f) => {
      const stat = lstatSync(f);
      if (stat.isDirectory()) {
        return findTypeScriptFiles(f);
      } else if (stat.isFile() && f.endsWith('.ts') && !f.endsWith('.spec.ts')) {
        return [f];
      } else {
        return [];
      }
    })
    .reduce((current, next) => current.concat(next), []);
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
