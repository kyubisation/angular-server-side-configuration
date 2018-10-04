import { lstatSync, readFileSync, readFile, writeFile } from 'fs';
import { promisify } from 'util';
import { walk } from './walk';
const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

/**
 * Discover and apply configuration via environment variables.
 */
export class EnvironmentVariablesConfiguration {

  private constructor(public readonly variables: string[]) { }

  /**
   * Searches for environment variable declarations in
   * files matched by root directory and file pattern.
   * 
   * @param root The root directory from which to search.
   * @param options Optional options for searching environment variables.
   * @param options.filePattern The file pattern in which environment
   *   variables should be searched (Defaults to /.js$/).
   * @param options.environmentVariablesDiscovery The function to discover
   *   environment variables in the matched files
   *   (Defaults to process.env.VARIABLE => VARIABLE).
   */
  static searchEnvironmentVariables(
    root: string,
    options: {
      filePattern?: RegExp,
      environmentVariablesDiscovery?: (fileContent: string) => string[],
    } = {}) {
    const filePattern = options.filePattern || /.js$/;
    const environmentVariablesDiscovery = options.environmentVariablesDiscovery
      || EnvironmentVariablesConfiguration.environmentVariablesDiscovery;
    const stat = lstatSync(root);
    if (!stat.isDirectory()) {
      throw new Error(`${root} is not a valid directory!`);
    }

    const environmentVariables = walk(root, filePattern)
      .map(f => readFileSync(f, 'utf8'))
      .map(f => environmentVariablesDiscovery(f))
      .reduce((current, next) => current.concat(next), [])
      .filter((v, i, a) => a.indexOf(v) === i);
    return new EnvironmentVariablesConfiguration(environmentVariables);
  }

  private static environmentVariablesDiscovery(fileContent: string) {
    return (fileContent.match(/process\s*\.\s*env\s*\.\s*[a-zA-Z0-9_]+/gm) || [])
      .map(m => m.split('.')[2].trim());
  }

  /**
   * Inserts the discovered enviornment variables into the matched files.
   * 
   * @param root The root directory from which to search insertion files.
   * @param options Optional options for insertion.
   * @param options.filePattern The file pattern in which the configuration should be inserted
   *   (Defaults to /index.html$/).
   * @param options.insertionRegex The replacement pattern, where the configuration should
   *   be inserted (Defaults to /<!--\s*CONFIG\s*-->/).
   */
  async insertAndSaveRecursively(
    root: string, options: { filePattern?: RegExp, insertionRegex?: RegExp } = {}) {
    const files = walk(root, options.filePattern || /index.html$/);
    for (const file of files) {
      await this.insertAndSave(file, options);
    }
  }

  /**
   * Inserts the discovered environment variables into the specified file.
   * 
   * @param file The file into which the environment variables should be inserted.
   * @param options Optional options for insertion.
   * @param options.insertionRegex The replacement pattern, where the configuration should
   *   be inserted (Defaults to /<!--\s*CONFIG\s*-->/).
   */
  async insertAndSave(file: string, options: { insertionRegex?: RegExp } = {}) {
    const fileContent = await this.apply(file, options);
    await writeFileAsync(file, fileContent, 'utf8');
  }

  /**
   * Inserts the discovered environment variables into the specified file content
   * without saving the file.
   * 
   * @param file The file to be read.
   * @param options Optional options for insertion.
   * @param options.insertionRegex The replacement pattern, where the configuration should
   *   be inserted (Defaults to /<!--\s*CONFIG\s*-->/).
   */
  async apply(file: string, options: { insertionRegex?: RegExp } = {}) {
    const insertionRegex = options.insertionRegex || /<!--\s*CONFIG\s*-->/;
    const fileContent = await readFileAsync(file, 'utf8');
    return fileContent.replace(insertionRegex, `<script>${this.generateIIFE()}</script>`);
  }

  /**
   * Generates the IIFE in which the environment variables are assigned to window.process.env.
   */
  generateIIFE() {
    const env = this.populateVariables();
    return `(function(self){self.process=${JSON.stringify({ env })};})(window)`;
  }

  /**
   * Generates an object, with the environment variable names being the key and
   * the actual values being the values.
   */
  populateVariables() {
    const variables: { [variable: string]: any } = {};
    for (const variable of this.variables) {
      variables[variable] = variable in process.env && process.env[variable] !== undefined
        ? process.env[variable] : null;
    }
    return variables;
  }
}