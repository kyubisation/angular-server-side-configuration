import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { EOL } from 'os';
import { join, relative, resolve } from 'path';

import { Logger } from '../common';

/**
 * The init command to initialize a project with angular-server-side-configuration.
 * @public
 */
export class InitCommand {
  private _packagePath: string;
  private _environmentFile: string;
  private _directory: string;

  constructor(
    private _options: {
      directory?: string,
      environmentFile?: string,
      npm?: boolean,
      yarn?: boolean,
      processEnv?: boolean,
      ngEnv?: boolean,
    },
    private _logger = new Logger()) {
    this._directory = this._options.directory ? resolve(this._options.directory) : process.cwd();
    this._packagePath = join(this._directory, 'package.json');
    this._environmentFile = this._options.environmentFile
      ? resolve(this._directory, this._options.environmentFile)
      : join(this._directory, 'src', 'environments', 'environment.prod.ts');
  }

  async execute() {
    this._logger.log('ngssc: Initialize Configuration');
    this._validateOptions();
    this._initEnvironmentFile();
    this._installPackage();
  }

  private _validateOptions() {
    if (!existsSync(this._packagePath)) {
      throw new Error('This command must be executed in a directory with a package.json!');
    } else if (this._options.npm && this._options.yarn) {
      throw new Error('--npm and --yarn cannot be used at the same time!');
    } else if (this._options.processEnv && this._options.ngEnv) {
      throw new Error('--process-env and --ng-env cannot be used at the same time!');
    } else if (!existsSync(this._environmentFile)) {
      throw new Error(`Given file does not exist: ${this._environmentFile}`);
    }
  }

  private _initEnvironmentFile() {
    const content = readFileSync(this._environmentFile, 'utf8');
    if (content.includes('angular-server-side-configuration')) {
      this._logger.log(
        `Skipping initialization of ${relative(this._directory, this._environmentFile)}, since `
        + '\'angular-server-side-configuration\' is already being imported');
      return;
    }

    const importExpression = this._options.ngEnv
      ? `import { NG_ENV } from 'angular-server-side-configuration/ng-env';`
      : `import 'angular-server-side-configuration/process';`;
    const variant = this._options.ngEnv ? 'NG_ENV' : 'process.env';
    const newContent = `${importExpression}

/**
 * How to use angular-server-side-configuration:
 *
 * Use ${variant}.NAME_OF_YOUR_ENVIRONMENT_VARIABLE
 *
 * export const environment = {
 *   stringValue: ${variant}.STRING_VALUE,
 *   stringValueWithDefault: ${variant}.STRING_VALUE || 'defaultValue',
 *   numberValue: Number(${variant}.NUMBER_VALUE),
 *   numberValueWithDefault: Number(${variant}.NUMBER_VALUE || 10),
 *   booleanValue: Boolean(${variant}.BOOLEAN_VALUE),
 *   booleanValueInverted: ${variant}.BOOLEAN_VALUE_INVERTED !== 'false',
 * };
 */

${content}`
      .replace(/\r\n|\r|\n/g, EOL);
    writeFileSync(this._environmentFile, newContent, 'utf8');
    this._logger.log(`Initialized ${relative(this._directory, this._environmentFile)}`);
  }

  private _installPackage() {
    const command = this._options.yarn
      ? 'yarn add angular-server-side-configuration@latest'
      : 'npm install angular-server-side-configuration@latest --save';
    this._logger.log(command);
    execSync(command, { cwd: this._directory });
    this._logger.log('Finished installing package');
  }
}
