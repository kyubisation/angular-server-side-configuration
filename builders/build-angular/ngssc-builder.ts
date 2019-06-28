import { BuilderContext, BuilderOutput, Target, targetFromTargetString } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import { randomBytes } from 'crypto';
import { existsSync, readdir, readFile, unlink, writeFile } from 'fs';
import { basename, join } from 'path';
import { promisify } from 'util';

import { BrowserOptions, FileReplacements, Ngssc, NgsscContext, Options } from './models';
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
  private _ngsscConfigurationFile: string;
  private _tmpNgsscConfigurationFile: string;
  private _tokenizeResult?: TokenizeResult;

  constructor(
    private _options: Options,
    private _context: BuilderContext,
  ) {
    this._browserTarget = targetFromTargetString(_options.browserTarget);
    this._ngsscConfigurationFile = join(_context.workspaceRoot, _options.ngsscConfigurationFile);
    this._tmpNgsscConfigurationFile = `${_options.ngsscConfigurationFile}_${randomBytes(10).toString('hex')}.tmp`;
  }

  static async build(options: Options, context: BuilderContext): Promise<BuilderOutput> {
    return await new NgsscBuilder(options, context).run();
  }

  async run() {
    const ngsscContext = await this._detectVariables();
    const rawOptions = await this._prepareBrowserOptions(ngsscContext);
    const browserTarget = targetFromTargetString(this._options.browserTarget);
    const browserName = await this._context.getBuilderNameForTarget(browserTarget);
    const browserOptions = await this._context.validateOptions<BrowserOptions>(rawOptions, browserName);
    const scheduledTarget = await this._context.scheduleTarget(browserTarget, browserOptions);
    const result = await scheduledTarget.result;
    await this._buildNgsscJson(ngsscContext, browserOptions);
    await this._untokenize(browserOptions);
    await this._removeTmpNgsscConfigurationFile();
    return result;
  }

  private async _detectVariables() {
    const fileContent = await readFileAsync(this._ngsscConfigurationFile, 'utf8');
    const ngsscContext = await this._detector.detect(fileContent);
    this._context.logger.info(
      `ngssc: Detected variant '${ngsscContext.variant}' with variables ` +
      `'${ngsscContext.variables.map(v => v.variable).join(', ')}'`);
    return ngsscContext;
  }

  private async _prepareBrowserOptions(ngsscContext: NgsscContext): Promise<JsonObject> {
    const rawBrowserOptions = await this._context.getTargetOptions(this._browserTarget);
    if (!this._options.aotSupport) {
      return rawBrowserOptions;
    }

    const tmpNgsscConfigurationFilePath = join(this._context.workspaceRoot, this._tmpNgsscConfigurationFile);
    const ngsscConfigurationFileContent = await readFileAsync(this._ngsscConfigurationFile, 'utf8');
    this._tokenizeResult = this._tokenizer.tokenize(ngsscConfigurationFileContent, ngsscContext);
    await writeFileAsync(tmpNgsscConfigurationFilePath, this._tokenizeResult.content, 'utf8');
    return { ...rawBrowserOptions, fileReplacements: this._buildFileReplacements(rawBrowserOptions) };
  }

  private _buildFileReplacements(rawBrowserOptions: JsonObject) {
    const fileReplacements: any[] =
      (rawBrowserOptions.fileReplacements as unknown as FileReplacements || [])
        .map(f => 'with' in f ? { ...f } : { replace: f.src, with: f.replaceWith })
        .filter(f => f.with === this._options.ngsscConfigurationFile)
        .map(f => ({ replace: f.replace, with: this._tmpNgsscConfigurationFile }));
    if (!fileReplacements.length) {
      throw new Error(
        `Expected a fileReplacements entry in the referenced browserTarget '${this._options.browserTarget}'` +
        `, which uses ${this._options.ngsscConfigurationFile} as a replacement! (e.g. "fileReplacements": ` +
        `[{ "replace": "src/environments/environment.ts", "with": "${this._options.ngsscConfigurationFile}" }])`);
    }

    return fileReplacements;
  }

  private async _buildNgsscJson(ngsscContext: NgsscContext, browserOptions: BrowserOptions) {
    const outputPath = join(this._context.workspaceRoot, browserOptions.outputPath);
    const ngssc: Ngssc = {
      environmentVariables: ngsscContext.variables.map(m => m.variable),
      filePattern: basename(browserOptions.index),
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
    for (const file of files
      .filter(f => f.endsWith('.js'))
      .map(f => join(outputPath, f))) {
      const fileContent = await readFileAsync(file, 'utf8');
      const newFileContent = this._tokenizeResult.untokenize(fileContent);
      if (fileContent !== newFileContent) {
        await writeFileAsync(file, newFileContent, 'utf8');
      }
    }
  }

  private async _removeTmpNgsscConfigurationFile() {
    const tmpNgsscConfigurationFilePath = join(this._context.workspaceRoot, this._tmpNgsscConfigurationFile);
    if (existsSync(tmpNgsscConfigurationFilePath)) {
      await unlinkAsync(tmpNgsscConfigurationFilePath);
    }
  }
}
