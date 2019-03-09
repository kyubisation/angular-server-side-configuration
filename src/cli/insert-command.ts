import { relative } from 'path';
import { walk } from '../common/walk';
import { ProcessEnvConfiguration } from '../process-env-configuration';
import { CommandBase } from './command-base';

export class InsertCommand extends CommandBase {
  private _configuration = new ProcessEnvConfiguration();

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
      this._configuration.setDirectory(this._options.directory);
    }
  }

  private _searchEnvironmentVariables() {
    if (this._options.search) {
      this._log(`Searching for environment variables in ${this._configuration.directory}`);
      this._configuration.searchEnvironmentVariables();
      this._log(`Found ${this._configuration.variables.join(', ')}`);
    }
  }

  private _addEnvironmentVariablesFromCommandLine() {
    if (Array.isArray(this._options.env)) {
      this._log(`Adding environment variables from command line: ${this._options.env.join(', ')}`);
      this._configuration.variables.push(...this._options.env);
    }
  }

  private _configureReplacement() {
    if (this._options.placeholder) {
      this._log(`Using placeholder ${this._options.placeholder}`);
      this._configuration.insertVariables(this._options.placeholder);
    } else if (this._options.head) {
      this._log('Inserting environment variables into <head>');
      this._configuration.insertVariablesIntoHead();
    } else {
      this._log('Using placeholder <!--CONFIG-->');
      this._configuration.insertVariables();
    }
  }

  private _logPopulatedEnvironmentVariables() {
    this._logValue('Populated environment variables:', this._configuration.populateVariables());
  }

  private async _insertEnvironmentVariables() {
    const files = this._options.dry
      ? walk(this._configuration.directory, this._configuration.defaultInsertionFilePattern)
      : await this._configuration.applyAndSaveRecursively();
    this._log(`\n${this._options.dry ? 'Insertion targets' : 'Inserted into'}:`);
    files
      .map(f => relative(this._configuration.directory, f))
      .forEach(f => this._log(f));
  }
}
