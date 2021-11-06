import {
  BuilderContext,
  Target,
  targetFromTargetString,
  BuilderOutput,
} from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import { promises } from 'fs';
import { basename, join } from 'path';

import { Ngssc } from 'angular-server-side-configuration';

import { Schema } from './schema';
import { VariableDetector } from './variable-detector';
import { BrowserOptions } from './browser-options';
import { NgsscContext } from './ngssc-context';

const readFileAsync = promises.readFile;
const writeFileAsync = promises.writeFile;

export class NgsscBuilder {
  private _detector = new VariableDetector();
  private _browserTarget: Target;
  private _ngsscEnvironmentFile: string;

  constructor(private _options: Schema, private _context: BuilderContext) {
    this._browserTarget = targetFromTargetString(_options.browserTarget);
    this._ngsscEnvironmentFile = join(_context.workspaceRoot, _options.ngsscEnvironmentFile);
  }

  async run(): Promise<BuilderOutput> {
    try {
      return await this._safeRun();
    } catch (e) {
      return {
        success: false,
        error: `${e}`,
      };
    }
  }

  private async _safeRun() {
    const ngsscContext = await this._detectVariables();
    const rawOptions = await this._prepareBrowserOptions();
    const browserTarget = this._browserTarget;
    const browserName = await this._context.getBuilderNameForTarget(browserTarget);
    const browserOptions = await this._context.validateOptions<BrowserOptions>(
      rawOptions,
      browserName
    );
    const scheduledTarget = await this._context.scheduleTarget(browserTarget);
    const result = await scheduledTarget.result;
    await this._buildNgsscJson(ngsscContext, browserOptions);
    return result;
  }

  private async _detectVariables() {
    const fileContent = await readFileAsync(this._ngsscEnvironmentFile, 'utf8');
    const ngsscContext = this._detector.detect(fileContent);
    this._context.logger.info(
      `ngssc: Detected variant '${ngsscContext.variant}' with variables ` +
        `'${ngsscContext.variables.map((v) => v.variable).join(', ')}'`
    );
    return ngsscContext;
  }

  private async _prepareBrowserOptions(): Promise<JsonObject> {
    const rawBrowserOptions = await this._context.getTargetOptions(this._browserTarget);
    return rawBrowserOptions;
  }

  private async _buildNgsscJson(ngsscContext: NgsscContext, browserOptions: BrowserOptions) {
    const outputPath = join(this._context.workspaceRoot, browserOptions.outputPath);
    const ngssc: Ngssc = {
      environmentVariables: [
        ...ngsscContext.variables.map((m) => m.variable),
        ...(this._options.additionalEnvironmentVariables || []),
      ],
      filePattern: this._options.filePattern || basename(browserOptions.index),
      variant: ngsscContext.variant,
    };
    await writeFileAsync(join(outputPath, 'ngssc.json'), JSON.stringify(ngssc, null, 2), 'utf8');
  }
}
