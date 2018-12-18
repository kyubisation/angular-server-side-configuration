import { lstatSync, readFileSync, readFile, writeFile } from 'fs';
import { promisify } from 'util';
import { deprecated, walk } from './common/index';
const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

const environmentVariablesDiscoveryFunction = (fileContent: string) =>
  (fileContent.match(/process\s*\.\s*env\s*\.\s*[a-zA-Z0-9_]+/gm) || [])
    .map(m => m.split('.')[2].trim());

/**
 * Discover and apply configuration via environment variables.
 */
export class EnvironmentVariablesConfiguration {

  /**
   * The directory. Defaults to current working directory.
   */
  directory = process.cwd();

  /**
   * The default pattern for files to have the environment variables inserted into.
   */
  readonly defaultInsertionFilePattern = /index.html$/;

  /**
   * @param variables Optional array of environment variable names to populate.
   * @param replacements Optional array of replacement functions.
   */
  constructor(
    public readonly variables: string[] = [],
    public readonly replacements: Array<(fileContent: string, fileName: string) => string> = [],
  ) { }

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
   * Set the directory, where the files to be configured reside in.
   * Default is current working directory.
   * @param directory The directory to work in.
   * @returns This instance.
   */
  setDirectory(directory: string) {
    this.directory = directory;
    return this;
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
    const directory = options.directory || this.directory;
    const filePattern = options.filePattern || /.js$/;
    const environmentVariablesDiscovery =
      options.environmentVariablesDiscovery || environmentVariablesDiscoveryFunction;
    const stat = lstatSync(directory);
    if (!stat.isDirectory()) {
      throw new Error(`${directory} is not a valid directory!`);
    }

    walk(directory, filePattern)
      .map(f => readFileSync(f, 'utf8'))
      .map(f => environmentVariablesDiscovery(f))
      .reduce((current, next) => current.concat(next), [])
      .filter((v, i, a) => a.indexOf(v) === i)
      .forEach(e => this.variables.push(e));
    return this;
  }

  /**
   * Replace the base href attribute for the file received through
   * applyTo, applyAndSaveTo or applyAndSaveRecursively.
   * 
   * @param newBaseHref The new base href.
   * @returns This instance.
   */
  replaceBaseHref(newBaseHref: string) {
    return this.replaceTagAttribute('base', 'href', newBaseHref);
  }

  /**
   * Replace the html lang attribute for the file received through
   * applyTo, applyAndSaveTo or applyAndSaveRecursively.
   * 
   * @param newHtmlLang The new base href.
   * @returns This instance.
   */
  replaceHtmlLang(newHtmlLang: string) {
    return this.replaceTagAttribute('html', 'lang', newHtmlLang);
  }

  /**
   * Replace the attribute value of a tag for the file received through
   * applyTo, applyAndSaveTo or applyAndSaveRecursively.
   * 
   * @param tag The tag, whose attribute value should be replaced.
   * @param attribute The attribute, whose value should be replaced.
   * @param newValue The new attribute value.
   * @returns This instance.
   */
  replaceTagAttribute(tag: string, attribute: string, newValue: string) {
    return this.replace(
      c => c.replace(
        new RegExp(`<${tag}[^>]*>`, 'gm'),
        m => m.replace(
          new RegExp(`(${attribute}=(")(.*?)"([\\s>/])|${attribute}=(')(.*?)'([\\s>/]))`, 'gm'),
          (...m: string[]) => `${attribute}=${m[2]}${newValue}${m[2]}${m[4]}`)));
  }

  /**
   * Add a replacement for the file received through applyTo, applyAndSaveTo or applyAndSaveRecursively.
   * 
   * @param regex A RegExp object or literal. The match or matches are replaced with replaceValue.
   * @param replaceValue The value that replaces the substring matched by the regex parameter.
   * @returns This instance.
   */
  regexReplace(regex: RegExp, replaceValue: string) {
    return this.replace(c => c.replace(regex, replaceValue));
  }

  /**
   * Replace the placeholder with the populated variables wrapped in an IIFE inside a script tag.
   * @param placeholder The placeholder to replace with the populated variables.
   *   (Defaults to <!--CONFIG-->.)
   * @returns This instance.
   */
  insertVariables(placeholder: string | RegExp = /<!--\s*CONFIG\s*-->/) {
    return this.replace(f => f.replace(placeholder, `<script>${this.generateIIFE()}</script>`));
  }

  /**
   * Insert the populated variables (wrapped in an IIFE inside a script tag) into the head tag.
   * Appends variables to title tag, or if not found, at the end of the head tag.
   * @returns This instance.
   */
  insertVariablesIntoHead() {
    return this.replace(
      f => f.includes('</title>')
        ? f.replace('</title>', `</title><script>${this.generateIIFE()}</script>`)
        : f.replace('</head>', `<script>${this.generateIIFE()}</script></head>`));
  }

  /**
   * Add a replacement function for the file received through applyTo, applyAndSaveTo or
   * applyAndSaveRecursively. The function receives the file content and the file name as
   * parameters and returns the file content with the replacement applied.
   * 
   * @param replacement The replacement function.
   * @returns This instance.
   */
  replace(replacement: (fileContent: string, fileName: string) => string) {
    this.replacements.push(replacement);
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

  /**
   * Apply the replacements to the content of the matched files and save them asynchronously.
   * @param options Optional options for applying replacements.
   * @param options.directory The root directory from which to search files.
   *   (Defaults to instance directory.)
   * @param options.filePattern The file pattern in which the configuration should be inserted
   *   (Defaults to /index.html$/).
   * @returns A promise, which resolves to the matched files, after all matched files have had the
   *   replacements applied.
   */
  async applyAndSaveRecursively(options: { directory?: string, filePattern?: RegExp } = {}) {
    const directory = options.directory || this.directory;
    const files = walk(directory, options.filePattern || this.defaultInsertionFilePattern);
    await Promise.all(files.map(f => this.applyAndSaveTo(f)));
    return files;
  }

  /**
   * Apply the replacements to the content of the given file and save it asynchronously.
   * @param file The HTML file to apply the replacements to.
   * @returns A promise, which resolves after the file has had the replacements applied.
   */
  async applyAndSaveTo(file: string) {
    const fileContent = await this.applyTo(file);
    await writeFileAsync(file, fileContent, 'utf8');
  }

  /**
   * Apply the replacements to the content of the given file and return the resulting content
   * as a promise.
   * @param file The HTML file to apply the replacements to.
   * @returns A promise, which resolves to the file content with the replacements applied.
   */
  async applyTo(file: string) {
    const fileContent = await readFileAsync(file, 'utf8');
    return this.replacements.reduce((current, next) => next(current, file), fileContent);
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
    const resolveEnvironmentVariable = (name: string) =>
      name in process.env && process.env[name] !== undefined ? process.env[name] : null;
    return this.variables.reduce((current, next) => Object.assign(current, { [next]: resolveEnvironmentVariable(next) }), {} as { [variable: string]: any });
  }
}