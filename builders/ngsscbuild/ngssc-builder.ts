import { BuilderContext, Target, targetFromTargetString } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import { randomBytes } from 'crypto';
import { existsSync, readdir, readFile, unlink, writeFile } from 'fs';
import { basename, join } from 'path';
import { promisify } from 'util';

import { BrowserOptions, FileReplacements, Ngssc, NgsscContext } from '../../models';

import { Schema } from './schema';
import { TokenizeResult } from './tokenize-result';
import { VariableDetector } from './variable-detector';
import { VariableTokenizer } from './variable-tokenizer';

const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);
const unlinkAsync = promisify(unlink);
const readdirAsync = promisify(readdir);

export class NgsscBuilder {
  private _detector = new VariableDetector();
  private _tokenizer = new VariableTokenizer();
  private _browserTarget: Target;
  private _ngsscEnvironmentFile: string;
  private _tmpNgsscEnvironmentFile: string;
  private _tokenizeResult?: TokenizeResult;

  constructor(private _options: Schema, private _context: BuilderContext) {
    this._browserTarget = targetFromTargetString(_options.browserTarget);
    this._ngsscEnvironmentFile = join(_context.workspaceRoot, _options.ngsscEnvironmentFile);
    this._tmpNgsscEnvironmentFile = `${_options.ngsscEnvironmentFile}_${randomBytes(10).toString(
      'hex'
    )}.tmp`;
    this._context.addTeardown(() => this._removeTmpNgsscEnvironmentFile());
  }

  async run() {
    try {
      return await this._safeRun();
    } catch (e) {
      this._context.logger.error(e.toString());
      return process.exit(2);
    }
  }

  private async _safeRun() {
    const ngsscContext = await this._detectVariables();
    const rawOptions = await this._prepareBrowserOptions(ngsscContext);
    const browserTarget = this._browserTarget;
    const browserName = await this._context.getBuilderNameForTarget(browserTarget);
    const browserOptions = await this._context.validateOptions<BrowserOptions>(
      rawOptions,
      browserName
    );
    const scheduledTarget = await this._context.scheduleTarget(browserTarget, browserOptions);
    const result = await scheduledTarget.result;
    await this._buildNgsscJson(ngsscContext, browserOptions);
    await this._untokenize(browserOptions);
    await this._removeTmpNgsscEnvironmentFile();
    return result;
  }

  private async _detectVariables() {
    const fileContent = await readFileAsync(this._ngsscEnvironmentFile, 'utf8');
    const ngsscContext = await this._detector.detect(fileContent);
    this._context.logger.info(
      `ngssc: Detected variant '${ngsscContext.variant}' with variables ` +
        `'${ngsscContext.variables.map((v) => v.variable).join(', ')}'`
    );
    return ngsscContext;
  }

  private async _prepareBrowserOptions(ngsscContext: NgsscContext): Promise<JsonObject> {
    const rawBrowserOptions = await this._context.getTargetOptions(this._browserTarget);
    if (!this._options.aotSupport) {
      return rawBrowserOptions;
    }

    const tmpNgsscEnvironmentFilePath = join(
      this._context.workspaceRoot,
      this._tmpNgsscEnvironmentFile
    );
    const ngsscEnvironmentFileContent = await readFileAsync(this._ngsscEnvironmentFile, 'utf8');
    this._tokenizeResult = this._tokenizer.tokenize(ngsscEnvironmentFileContent, ngsscContext);
    await writeFileAsync(tmpNgsscEnvironmentFilePath, this._tokenizeResult.content, 'utf8');
    return {
      ...rawBrowserOptions,
      fileReplacements: this._buildFileReplacements(rawBrowserOptions),
    };
  }

  private _buildFileReplacements(rawBrowserOptions: JsonObject) {
    const fileReplacements: any[] = (
      ((rawBrowserOptions.fileReplacements as unknown) as FileReplacements) || []
    )
      .map((f) => ('with' in f ? { ...f } : { replace: f.src, with: f.replaceWith }))
      .filter((f) => f.with === this._options.ngsscEnvironmentFile)
      .map((f) => ({ replace: f.replace, with: this._tmpNgsscEnvironmentFile }));
    if (!fileReplacements.length) {
      throw new Error(
        `Expected a fileReplacements entry in the referenced browserTarget '${this._options.browserTarget}'` +
          `, which uses ${this._options.ngsscEnvironmentFile} as a replacement! (e.g. "fileReplacements": ` +
          `[{ "replace": "src/environments/environment.ts", "with": "${this._options.ngsscEnvironmentFile}" }])`
      );
    }

    return fileReplacements;
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

  private async _untokenize(browserOptions: BrowserOptions) {
    if (!this._tokenizeResult) {
      return;
    }

    const outputPath = join(this._context.workspaceRoot, browserOptions.outputPath);
    const files = await readdirAsync(outputPath);
    for (const file of files.filter((f) => f.endsWith('.js')).map((f) => join(outputPath, f))) {
      const fileContent = await readFileAsync(file, 'utf8');
      const newFileContent = this._tokenizeResult.untokenize(fileContent);
      if (fileContent !== newFileContent) {
        await writeFileAsync(file, newFileContent, 'utf8');
      }
    }
  }

  private async _removeTmpNgsscEnvironmentFile() {
    const tmpNgsscEnvironmentFilePath = join(
      this._context.workspaceRoot,
      this._tmpNgsscEnvironmentFile
    );
    if (existsSync(tmpNgsscEnvironmentFilePath)) {
      await unlinkAsync(tmpNgsscEnvironmentFilePath);
    }
  }
}
