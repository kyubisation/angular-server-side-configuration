import { readFile, statSync } from 'fs';
import { join, resolve } from 'path';
import { promisify } from 'util';

import { Logger, walk } from '../common';
import { Configuration } from '../configuration';
import { Ngssc } from '../models';
import { ConfigVariables } from '../models/config-variables';
import { NgEnvConfiguration } from '../ng-env-configuration';
import { ProcessEnvConfiguration } from '../process-env-configuration';

const readFileAsync = promisify(readFile);

/**
 * The insert command to insert environment variables into a file.
 * @public
 */
export class InsertCommand {
  private readonly _directory: string;
  private readonly _ngsscFile: string;
  private readonly _configInHtml: boolean;
  private readonly _dry: boolean;

  constructor(
    options: {
      directory: string,
      configInHtml?: boolean,
      head?: boolean,
      dry?: boolean,
    },
    private _logger = new Logger()) {
    this._directory = resolve(options.directory);
    this._ngsscFile = join(this._directory, 'ngssc.json');
    this._configInHtml = !!options.configInHtml;
    this._dry = !!options.dry;
  }

  async execute() {
    this._logger.log('ngssc: Environment Variables Insertion');
    if (this._dry) {
      this._logger.log('DRY RUN! Files will not be changed!');
    }
    this._validateConfig();
    if (this._configInHtml) {
      await this._configureHtmlFiles();
    } else {
      await this._configureWithNgssc();
    }
  }

  private _validateConfig() {
    try {
      if (!statSync(this._directory).isDirectory()) {
        throw new Error();
      }
    } catch (e) {
      throw new Error(`${this._directory} is not a valid directory!\n${e}`);
    }
  }

  private async _configureHtmlFiles() {
    const htmlFiles = walk(this._directory, /\.html$/);
    if (htmlFiles.length === 0) {
      this._logger.log(`No html files found in ${this._directory}`);
      return;
    }

    for (const htmlFile of htmlFiles) {
      const htmlContent = await readFileAsync(htmlFile, 'utf8');
      const match = htmlContent.match(/<!--\s*CONFIG\s*(\{[\w\W]*\})\s*-->/);
      if (!match || !match[1]) {
        this._logger.log(`No configuration found in ${htmlFile}`);
      } else {
        await this._applyHtmlConfiguration(htmlFile, match[1]);
      }
    }
  }

  private async _applyHtmlConfiguration(htmlFile: string, configMatch: string) {
    try {
      const config: ConfigVariables = JSON.parse(configMatch);
      const configuration = await this._createConfiguration(config)
        .insertVariables(/<!--\s*CONFIG\s*(\{[\w\W]*\})\s*-->/);
      this._logPopulatedEnvironmentVariables(htmlFile, config.variant, configuration);
      if (!this._dry) {
        await configuration.applyAndSaveTo(htmlFile);
      }
    } catch (e) {
      this._logger.log(`ERROR: Invalid configuration in ${htmlFile}!\n${e}`);
    }
  }

  private async _configureWithNgssc() {
    const config = await this._resolveNgsscConfiguration();
    const configuration = this._createConfiguration(config);
    this._logPopulatedEnvironmentVariables(this._ngsscFile, config.variant, configuration);
    if (config.insertInHead) {
      configuration.insertVariablesIntoHead();
    } else {
      configuration.insertVariables();
    }

    const files = walk(this._directory, config.filePattern || '**/index.html');
    this._logger.log(`Configuration will be inserted into ${files.join(', ')}`);
    if (this._dry) {
      this._logger.log(`Dry run. Nothing will be inserted.`);
    } else {
      for (const file of files) {
        await configuration.applyAndSaveTo(file);
      }
    }
  }

  private async _resolveNgsscConfiguration() {
    try {
      const ngsscContent = await readFileAsync(this._ngsscFile, 'utf8');
      return JSON.parse(ngsscContent) as Ngssc;
    } catch (e) {
      throw new Error(`Missing or invalid ngssc.json in ${this._directory}\n${e}`);
    }
  }

  private _createConfiguration(config: ConfigVariables) {
    if (config.variant === 'process' || !config.variant) {
      return new ProcessEnvConfiguration(config.environmentVariables)
        .setDirectory(this._directory);
    } else if (config.variant === 'NG_ENV') {
      return new NgEnvConfiguration(config.environmentVariables)
        .setDirectory(this._directory);
    } else {
      throw new Error(`Invalid variant ${config.variant}`);
    }
  }

  private _logPopulatedEnvironmentVariables(source: string, variant: string, configuration: Configuration) {
    this._logger.log(`Populated environment variables (Variant: ${variant}, ${source})`);
    const variables = configuration.populateVariables();
    Object
      .keys(variables)
      .forEach(v => this._logger.log(`  ${v}: ${variables[v]}`));
  }
}
