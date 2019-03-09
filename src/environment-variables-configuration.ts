import { readFile, writeFile } from 'fs';
import { promisify } from 'util';
import { deprecated, walk } from './common/index';
import { Configuration } from './configuration';
const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

/**
 * Discover and apply configuration via environment variables.
 * @deprecated Use ProcessEnvConfiguration instead.
 */
export class EnvironmentVariablesConfiguration extends Configuration {

  private environmentVariablesDiscoveryFunction = (fileContent: string) =>
    (fileContent.match(/process\s*\.\s*env\s*\.\s*[a-zA-Z0-9_]+/gm) || [])
      .map(m => m.split('.')[2].trim());

  /**
   * @param variables Optional array of environment variable names to populate.
   * @param replacements Optional array of replacement functions.
   */
  constructor(
    variables?: string[],
    replacements: Array<(fileContent: string, fileName: string) => string> = [],
  ) {
    super(variables);
    this.replacements.push(...replacements);
  }

  /**
   * Searches for environment variable declarations in
   * files matched by file pattern, starting from given directory.
   *
   * @param directory The root directory from which to search.
   * @param options Optional options for searching environment variables.
   * @param options.filePattern The file pattern in which environment
   *   variables should be searched (Defaults to /.js$/).
   * @param options.environmentVariablesDiscovery The function to discover
   *   environment variables in the matched files
   *   (Defaults to process.env.VARIABLE => VARIABLE).
   * @deprecated Static searchEnvironmentVariables is deprecated. Use the instance method instead.
   */
  @deprecated('Use the instance method instead.')
  static searchEnvironmentVariables(
    directory: string,
    options: {
      filePattern?: RegExp,
      environmentVariablesDiscovery?: (fileContent: string) => string[],
    } = {}) {
    return new EnvironmentVariablesConfiguration()
      .searchEnvironmentVariables({ ...options, directory });
  }

  /**
   * Searches for environment variable declarations in
   * files matched by file pattern, starting from given directory.
   *
   * @param options Optional options for searching environment variables.
   * @param options.directory The root directory from which to search.
   * @param options.filePattern The file pattern in which environment
   *   variables should be searched (Defaults to /.js$/).
   * @param options.environmentVariablesDiscovery The function to discover
   *   environment variables in the matched files
   *   (Defaults to process.env.VARIABLE => VARIABLE).
   * @returns This instance.
   */
  searchEnvironmentVariables(options: {
    directory?: string,
    filePattern?: RegExp,
    environmentVariablesDiscovery?: (fileContent: string) => string[],
  } = {}) {
    if (options.environmentVariablesDiscovery) {
      this.environmentVariablesDiscoveryFunction = options.environmentVariablesDiscovery;
    }
    super.searchEnvironmentVariables(options);
    return this;
  }

  /**
   * Inserts the discovered enviornment variables as an IIFE
   * wrapped in a script tag into the matched files and applies added replacements.
   *
   * @param root The root directory from which to search insertion files.
   * @param options Optional options for insertion.
   * @param options.filePattern The file pattern in which the configuration should be inserted
   *   (Defaults to /index.html$/).
   * @param options.insertionRegex The replacement pattern, where the configuration should
   *   be inserted (Defaults to /<!--\s*CONFIG\s*-->/).
   * @returns A promise, which resolves after the environment variables have been
   *   inserted into all matched files. The promise resolves to an array of the matched files.
   * @deprecated Use insertVariables or insertVariablesIntoHead and applyAndSaveRecursively instead.
   */
  @deprecated('Use insertVariables or insertVariablesIntoHead and applyAndSaveRecursively instead.')
  async insertAndSaveRecursively(
    root: string, options: { filePattern?: RegExp, insertionRegex?: RegExp } = {}) {
    const files = walk(root, options.filePattern || /index.html$/);
    await Promise.all(files.map(f => this.insertAndSave(f, options)));
    return files;
  }

  /**
   * Inserts the discovered environment variables as an IIFE
   * wrapped in a script tag into the specified file and applies added replacements.
   *
   * @param file The file into which the environment variables should be inserted.
   * @param options Optional options for insertion.
   * @param options.insertionRegex The replacement pattern, where the configuration should
   *   be inserted (Defaults to /<!--\s*CONFIG\s*-->/).
   * @returns A promise, which resolves after the enivornment variables have been saved to the
   *   given file.
   * @deprecated Use insertVariables or insertVariablesIntoHead and applyAndSaveTo instead.
   */
  @deprecated('Use insertVariables or insertVariablesIntoHead and applyAndSaveTo instead.')
  async insertAndSave(file: string, options: { insertionRegex?: RegExp } = {}) {
    const fileContent = await this.apply(file, options);
    await writeFileAsync(file, fileContent, 'utf8');
  }

  /**
   * Inserts the discovered environment variables as an IIFE wrapped in a script tag
   * into the specified file content and applies added replacements without saving the file.
   *
   * @param file The file to be read.
   * @param options Optional options for insertion.
   * @param options.insertionRegex The replacement pattern, where the configuration should
   *   be inserted (Defaults to /<!--\s*CONFIG\s*-->/).
   * @returns A promise, which resolves to the file content with the environment variables inserted.
   * @deprecated Use insertVariables or insertVariablesIntoHead and applyTo instead.
   */
  @deprecated('Use insertVariables or insertVariablesIntoHead and applyTo instead.')
  async apply(file: string, options: { insertionRegex?: RegExp } = {}) {
    const insertionRegex = options.insertionRegex || /<!--\s*CONFIG\s*-->/;
    const fileContent = await readFileAsync(file, 'utf8');
    return this.replacements
      .concat(c => c.replace(insertionRegex, `<script>${this.generateIIFE()}</script>`))
      .reduce((current, next) => next(current, file), fileContent);
  }

  protected discoverVariables(fileContent: string): string[] {
    return this.environmentVariablesDiscoveryFunction(fileContent);
  }

  protected renderIIFE(environmentVariables: { [variable: string]: any; }): string {
    return `(function(self){self.process=${JSON.stringify({ env: environmentVariables })};})(window)`;
  }
}
