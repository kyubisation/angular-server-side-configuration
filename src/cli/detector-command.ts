import spawn from 'cross-spawn';
import { readFile, readFileSync, writeFile } from 'fs';
import { join, resolve } from 'path';
import { promisify } from 'util';

import { Logger, walk } from '../common';
import { Ngssc } from '../models';
import { ConfigVariables } from '../models/config-variables';
import { VariableDetector } from '../variable-detector';
import { VariableTokenizer } from '../variable-tokenizer';
const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

/**
 * Command to detect and optionally tokenize variables.
 * @public
 */
export class DetectorCommand {
  private readonly _ngCommand: string[];
  private readonly _dist: string;
  private readonly _environmentFile: string;
  private readonly _config: Ngssc;
  private readonly _htmlFilePattern: string;
  private readonly _insertInHead: boolean;
  private readonly _embedInHtml: boolean;
  private readonly _wrapAot: boolean;

  constructor(
    options: {
      ngCommand: string[],
      dist?: string,
      environmentFile?: string,
      htmlFilePattern?: string,
      insertInHead?: boolean,
      embedInHtml?: boolean,
      config?: string,
      wrapAot?: boolean,
    },
    private _logger = new Logger()) {
    this._ngCommand = options.ngCommand;
    this._dist = resolve(options.dist || 'dist');
    this._environmentFile = resolve(options.environmentFile || 'src/environments/environment.prod.ts');
    this._config = options.config
      ? JSON.parse(readFileSync(resolve(options.config), 'utf8'))
      : { variant: 'process', environmentVariables: [] };
    this._htmlFilePattern = options.htmlFilePattern || this._config.filePattern || '**/index.html';
    this._insertInHead = options.insertInHead !== undefined ? options.insertInHead : !!this._config.insertInHead;
    this._embedInHtml = !!options.embedInHtml;
    this._wrapAot = !!options.wrapAot;
  }

  async execute(): Promise<void> {
    this._logger.log(`ngssc: Detect used environment variables`);
    if (this._wrapAot) {
      await this._tokenizeVariables();
    } else {
      await this._detectVariables();
    }
  }

  private async _tokenizeVariables() {
    const tokenizer = new VariableTokenizer();
    const tokenizedVariables = await tokenizer.tokenize(this._environmentFile);
    this._logVariables(tokenizedVariables);
    try {
      await this._spawnCommand();
      await tokenizer.untokenize(this._dist, tokenizedVariables);
      await this._createNgsscJsonOrEmbedVariables({
        environmentVariables: tokenizedVariables.variables.map(v => v.variable),
        variant: tokenizedVariables.variant === 'process-env' ? 'process' : 'NG_ENV',
      });
    } finally {
      await tokenizedVariables.revert();
    }
  }

  private async _detectVariables() {
    const detector = new VariableDetector();
    const fileContent = await readFileAsync(this._environmentFile, 'utf8');
    const detectedVariables = await detector.detect(fileContent);
    this._logVariables(detectedVariables);
    await this._spawnCommand();
    await this._createNgsscJsonOrEmbedVariables({
      environmentVariables: detectedVariables.variables.map(v => v.variable),
      variant: detectedVariables.variant === 'process-env' ? 'process' : 'NG_ENV',
    });
  }

  private _logVariables(variables: { variant: string, variables: Array<{ variable: string }> }) {
    if (variables.variables.length) {
      const joinedVariables = variables.variables
        .map(v => v.variable)
        .join(', ');
      this._logger.log(`Found variables (with variant ${variables.variant}): ${joinedVariables}`);
    } else {
      this._logger.log(`No variables were found in ${this._environmentFile}.`);
    }
  }

  private async _spawnCommand(): Promise<void> {
    return await new Promise<void>((r, reject) => {
      const [command, ...args] = this._ngCommand;
      const spawnedCommand = spawn(command, args, { stdio: 'inherit' });
      spawnedCommand.on('close', () => r());
      spawnedCommand.on('error', () => reject());
    })
      .catch(() => {
        throw new Error(`Command '${this._ngCommand.join(' ')}' failed`);
      });
  }

  private async _createNgsscJsonOrEmbedVariables(configVariables: ConfigVariables) {
    if (this._embedInHtml) {
      await this._embedVariables(configVariables);
    } else {
      await this._createNgsscJson(configVariables);
    }
  }

  private async _embedVariables(configVariables: ConfigVariables) {
    const htmlFiles = walk(this._dist, this._htmlFilePattern);
    if (!htmlFiles.length) {
      throw new Error(`No files found with pattern ${this._htmlFilePattern} in ${this._dist}`);
    }

    this._logger.log(['Embedding config into:', ...htmlFiles].join('\n'));
    for (const htmlFile of htmlFiles) {
      try {
        const htmlContent = await readFileAsync(htmlFile, 'utf8');
        const newHtmlContent = this._insertConfigInHtml(htmlFile, htmlContent, configVariables);
        await writeFileAsync(htmlFile, newHtmlContent, 'utf8');
      } catch (e) {
        throw new Error(`Failed to embed variables in ${htmlFile}`);
      }
    }
  }

  private _insertConfigInHtml(htmlFile: string, htmlContent: string, config: ConfigVariables) {
    if (/<!--\s*CONFIG\s*(\{[\w\W]*\})\s*-->/.test(htmlContent)) {
      this._logger.log(`Skipped ${htmlFile}, since it already has an embedded configuration.`);
      return htmlContent;
    } else if (/<!--\s*CONFIG\s*-->/.test(htmlContent)) {
      return htmlContent.replace(/<!--\s*CONFIG\s*-->/, `<!--CONFIG ${JSON.stringify(config)} -->`);
    } else if (htmlContent.includes('</title>')) {
      return htmlContent.replace('</title>', `</title><!--CONFIG ${JSON.stringify(config)} -->`);
    } else if (htmlContent.includes('</head>')) {
      return htmlContent.replace('</head>', `<!--CONFIG ${JSON.stringify(config)} --></head>`);
    } else {
      throw new Error('Failed to embed configuration');
    }
  }

  private async _createNgsscJson(config: ConfigVariables) {
    const file = join(this._dist, 'ngssc.json');
    const ngssc: Ngssc = {
      ...this._config,
      environmentVariables: [...this._config.environmentVariables, ...config.environmentVariables],
      filePattern: this._htmlFilePattern,
      insertInHead: this._insertInHead,
      variant: config.variant,
    };
    await writeFileAsync(file, JSON.stringify(ngssc, null, 2), 'utf8');
  }
}
