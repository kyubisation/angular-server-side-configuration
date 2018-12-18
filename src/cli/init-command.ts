import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { EOL } from 'os';
import { join, relative, resolve } from 'path';
import { CommandBase } from './command-base';

export class InitCommand extends CommandBase {
  private _packagePath: string;
  private _environmentFile: string;
  private _directory: string;

  constructor(private _options: {
    directory?: string,
    environmentFile?: string,
    npm?: boolean,
    yarn?: boolean
  }) {
    super('Initialize Configuration');
    this._directory = this._options.directory ? resolve(this._options.directory) : process.cwd();
    this._packagePath = join(this._directory, 'package.json');
    this._environmentFile = this._options.environmentFile
      ? resolve(this._directory, this._options.environmentFile)
      : join(this._directory, 'src', 'environments', 'environment.prod.ts');
  }

  protected async _execute() {
    this._validateOptions();
    this._initEnvironmentFile();
    this._installPackage();
  }

  private _validateOptions() {
    if (!existsSync(this._packagePath)) {
      throw new Error('This command must be executed in a directory with a package.json!');
    } else if (this._options.npm && this._options.yarn) {
      throw new Error('Do not use --npm and --yarn at the same time!')
    } else if (!existsSync(this._environmentFile)) {
      throw new Error(`Given file does not exist: ${this._environmentFile}`);
    }
  }

  private _initEnvironmentFile() {
    const content = readFileSync(this._environmentFile, 'utf8');
    if (content.includes('angular-server-side-configuration/process')) {
      this._log(
        `Skipping initialization of ${relative(this._directory, this._environmentFile)}, since `
        + '\'angular-server-side-configuration/process\' is already being imported');
      return;
    }

    const newContent = `import 'angular-server-side-configuration/process';

/**
 * How to use angular-server-side-configuration:
 * 
 * Use process.env.NAME_OF_YOUR_ENVIRONMENT_VARIABLE
 * 
 * export const environment = {
 *   stringValue: process.env.STRING_VALUE,
 *   stringValueWithDefault: process.env.STRING_VALUE || 'defaultValue',
 *   numberValue: Number(process.env.NUMBER_VALUE),
 *   numberValueWithDefault: Number(process.env.NUMBER_VALUE || 10),
 *   booleanValue: Boolean(process.env.BOOLEAN_VALUE),
 *   booleanValueInverted: process.env.BOOLEAN_VALUE_INVERTED !== 'false',
 * };
 */

${content}`
      .replace(/\r\n|\r|\n/g, EOL);
    writeFileSync(this._environmentFile, newContent, 'utf8');
    this._log(`Initialized ${relative(this._directory, this._environmentFile)}`);
  }

  private _installPackage() {
    const command = this._options.yarn
      ? 'yarn add angular-server-side-configuration@latest'
      : 'npm install angular-server-side-configuration@latest --save';
    this._log(command);
    execSync(command, { cwd: this._directory });
    this._log('Finished installing package');
  }
}
