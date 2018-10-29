import { lstatSync, readFileSync, readFile, writeFile } from 'fs';
import { promisify } from 'util';
import { walk } from './walk';
const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

/**
 * Discover and apply configuration via environment variables.
 */
export class EnvironmentVariablesConfiguration {

  constructor(
    public readonly variables: string[],
    public readonly replacements: Array<(fileContent: string, fileName: string) => string> = [],
  ) { }

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
   * Changes the location to find scripts and stylesheets
   * @param deployUrl The new deploy url
   */
  replaceDeployUrl(deployUrl: string) {
    const srcRegex = /(src=)(")(runtime|scripts|main|polyfills)/gm;
    const hrefRegex = /(href=)(")(styles)/gm;
    const replace = '$1$2' + deployUrl + '$3';
    this.regexReplace(srcRegex, replace);
    this.regexReplace(hrefRegex, replace);
    return this;
  }

  /**
   * Replace the base href attribute for the file received through
   * apply, insertAndSave or insertAndSaveRecursively.
   * 
   * @param newBaseHref The new base href.
   * @returns This instance.
   */
  replaceBaseHref(newBaseHref: string) {
    return this.replaceTagAttribute('base', 'href', newBaseHref);
  }

  /**
   * Replace the html lang attribute for the file received through
   * apply, insertAndSave or insertAndSaveRecursively.
   * 
   * @param newHtmlLang The new base href.
   * @returns This instance.
   */
  replaceHtmlLang(newHtmlLang: string) {
    return this.replaceTagAttribute('html', 'lang', newHtmlLang);
  }

  /**
   * Replace the attribute value of a tag for the file received through
   * apply, insertAndSave or insertAndSaveRecursively.
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
   * Add a replacement for the file received through apply, insertAndSave or insertAndSaveRecursively.
   * 
   * @param regex A RegExp object or literal. The match or matches are replaced with replaceValue.
   * @param replaceValue The value that replaces the substring matched by the regex parameter.
   * @returns This instance.
   */
  regexReplace(regex: RegExp, replaceValue: string) {
    return this.replace(c => c.replace(regex, replaceValue));
  }

  /**
   * Add a replacement function for the file received through apply, insertAndSave or
   * insertAndSaveRecursively. The function receives the file content and the file name as
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
   *   inserted to all matched files.
   */
  async insertAndSaveRecursively(
    root: string, options: { filePattern?: RegExp, insertionRegex?: RegExp } = {}) {
    const files = walk(root, options.filePattern || /index.html$/);
    for (const file of files) {
      await this.insertAndSave(file, options);
    }
  }

  /**
   * Inserts the discovered environment variables as an IIFE
   * wrapped in a script tag into the specified file and applies added replacements.
   * 
   * @param file The file into which the environment variables should be inserted.
   * @param options Optional options for insertion.
   * @param options.insertionRegex The replacement pattern, where the configuration should
   *   be inserted (Defaults to /<!--\s*CONFIG\s*-->/).
   * @returns A promise, which resolves after the enivornment variables have been saved to the given file.
   */
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
   */
  async apply(file: string, options: { insertionRegex?: RegExp } = {}) {
    const insertionRegex = options.insertionRegex || /<!--\s*CONFIG\s*-->/;
    const fileContent = await readFileAsync(file, 'utf8');
    return this.replacements
      .concat(c => c.replace(insertionRegex, `<script>${this.generateIIFE()}</script>`))
      .reduce((current, next) => next(current, file), fileContent);
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
