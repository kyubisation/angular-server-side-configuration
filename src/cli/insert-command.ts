import { relative } from 'path';
import { walk } from '../common/walk';
import { EnvironmentVariablesConfiguration } from '../environment-variables-configuration';
import { CommandBase } from './command-base';

export class InsertCommand extends CommandBase {
  private _envVariables = new EnvironmentVariablesConfiguration();

  constructor(private _options: {
    search?: boolean,
    dry?: boolean,
    directory?: string,
    env?: string[],
    placeholder?: string,
    head?: boolean,
  }) {
    super('Environment Variables Insertion');
  }

  protected async _execute() {
    this._validateConfig();
    this._dryMessage();
    this._configureDirectory();
    this._searchEnvironmentVariables();
    this._addEnvironmentVariablesFromCommandLine();
    this._configureReplacement();
    this._logPopulatedEnvironmentVariables();
    await this._insertEnvironmentVariables();
  }

  private _validateConfig() {
    if (this._options.placeholder && this._options.head) {
      throw new Error('--placeholder and --head cannot be used at the same time!');
    }
  }

  private _dryMessage() {
    if (this._options.dry) {
      this._log('DRY RUN! Files will not be changed!');
    }
  }

  private _configureDirectory() {
    if (this._options.directory) {
      this._envVariables.setDirectory(this._options.directory);
    }
  }

  private _searchEnvironmentVariables() {
    if (this._options.search) {
      this._log(`Searching for environment variables in ${this._envVariables.directory}`);
      this._envVariables.searchEnvironmentVariables();
      this._log(`Found ${this._envVariables.variables.join(', ')}`);
    }
  }

  private _addEnvironmentVariablesFromCommandLine() {
    if (Array.isArray(this._options.env)) {
      this._log(`Adding environment variables from command line: ${this._options.env.join(', ')}`);
      this._envVariables.variables.push(...this._options.env);
    }
  }

  private _configureReplacement() {
    if (this._options.placeholder) {
      this._log(`Using placeholder ${this._options.placeholder}`);
      this._envVariables.insertVariables(this._options.placeholder);
    } else if (this._options.head) {
      this._log('Inserting environment variables into <head>');
      this._envVariables.insertVariablesIntoHead();
    } else {
      this._log('Using placeholder <!--CONFIG-->');
      this._envVariables.insertVariables();
    }
  }

  private _logPopulatedEnvironmentVariables() {
    this._logValue('Populated environment variables:', this._envVariables.populateVariables());
  }

  private async _insertEnvironmentVariables() {
    const files = this._options.dry
      ? walk(this._envVariables.directory, this._envVariables.defaultInsertionFilePattern)
      : await this._envVariables.applyAndSaveRecursively();
    this._log(`\n${this._options.dry ? 'Insertion targets' : 'Inserted into'}:`);
    files
      .map(f => relative(this._envVariables.directory, f))
      .forEach(f => console.log(f));
  }
}
