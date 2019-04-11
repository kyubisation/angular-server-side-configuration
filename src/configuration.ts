import { readFile, writeFile } from 'fs';
import { promisify } from 'util';

import { walk } from './common';
import { ApplyAndSaveRecursivelyOptions } from './models';

const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

/**
 * Discover and apply configuration.
 * @public
 */
export abstract class Configuration {

  /**
   * The directory. Defaults to current working directory.
   */
  directory = process.cwd();

  /**
   * The default pattern for files to have the environment variables inserted into.
   */
  readonly defaultInsertionFilePattern = '**/index.html';

  /**
   * An array of replacement functions.
   */
  readonly replacements: Array<(fileContent: string, fileName: string) => string> = [];

  /**
   * @param variables - Optional array of environment variable names to populate.
   */
  constructor(readonly variables: string[] = []) { }

  /**
   * Set the directory, where the files to be configured reside in.
   * Default is current working directory.
   * @param directory - The directory to work in.
   * @returns This instance.
   */
  setDirectory(directory: string) {
    this.directory = directory;
    return this;
  }

  /**
   * Replace the base href attribute for the file received through
   * applyTo, applyAndSaveTo or applyAndSaveRecursively.
   *
   * @param newBaseHref - The new base href.
   * @returns This instance.
   */
  replaceBaseHref(newBaseHref: string) {
    return this.replaceTagAttribute('base', 'href', newBaseHref);
  }

  /**
   * Replace the html lang attribute for the file received through
   * applyTo, applyAndSaveTo or applyAndSaveRecursively.
   *
   * @param newHtmlLang - The new base href.
   * @returns This instance.
   */
  replaceHtmlLang(newHtmlLang: string) {
    return this.replaceTagAttribute('html', 'lang', newHtmlLang);
  }

  /**
   * Replace the attribute value of a tag for the file received through
   * applyTo, applyAndSaveTo or applyAndSaveRecursively.
   *
   * @param tag - The tag, whose attribute value should be replaced.
   * @param attribute - The attribute, whose value should be replaced.
   * @param newValue - The new attribute value.
   * @returns This instance.
   */
  replaceTagAttribute(tag: string, attribute: string, newValue: string) {
    return this.replace(
      c => c.replace(
        new RegExp(`<${tag}[^>]*>`, 'gm'),
        m => m.replace(
          new RegExp(`(${attribute}=(")(.*?)"([\\s>/])|${attribute}=(')(.*?)'([\\s>/]))`, 'gm'),
          (...n: string[]) => `${attribute}=${n[2]}${newValue}${n[2]}${n[4]}`)));
  }

  /**
   * Add a replacement for the file received through applyTo, applyAndSaveTo or applyAndSaveRecursively.
   *
   * @param regex - A RegExp object or literal. The match or matches are replaced with replaceValue.
   * @param replaceValue - The value that replaces the substring matched by the regex parameter.
   * @returns This instance.
   */
  regexReplace(regex: RegExp, replaceValue: string) {
    return this.replace(c => c.replace(regex, replaceValue));
  }

  /**
   * Replace the placeholder with the populated variables wrapped in an IIFE inside a script tag.
   * @param placeholder - The placeholder to replace with the populated variables.
   *   (Defaults to &lt;!--CONFIG--&gt;.)
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
   * @param replacement - The replacement function.
   * @returns This instance.
   */
  replace(replacement: (fileContent: string, fileName: string) => string) {
    this.replacements.push(replacement);
    return this;
  }

  /**
   * Apply the replacements to the content of the matched files and save them asynchronously.
   * @param options - Options for applying replacements.
   * @returns A promise, which resolves to the matched files, after all matched files have had the
   *   replacements applied.
   */
  async applyAndSaveRecursively(options: ApplyAndSaveRecursivelyOptions = {}) {
    const directory = options.directory || this.directory;
    const files = walk(directory, options.filePattern || this.defaultInsertionFilePattern);
    await Promise.all(files.map(f => this.applyAndSaveTo(f)));
    return files;
  }

  /**
   * Apply the replacements to the content of the given file and save it asynchronously.
   * @param file - The HTML file to apply the replacements to.
   * @returns A promise, which resolves after the file has had the replacements applied.
   */
  async applyAndSaveTo(file: string) {
    const fileContent = await this.applyTo(file);
    await writeFileAsync(file, fileContent, 'utf8');
  }

  /**
   * Apply the replacements to the content of the given file and return the resulting content
   * as a promise.
   * @param file - The HTML file to apply the replacements to.
   * @returns A promise, which resolves to the file content with the replacements applied.
   */
  async applyTo(file: string) {
    const fileContent = await readFileAsync(file, 'utf8');
    return this.replacements.reduce((current, next) => next(current, file), fileContent);
  }

  /**
   * Generates the IIFE which the renders the populated environment variables.
   */
  generateIIFE() {
    const env = this.populateVariables();
    return this.renderIIFE(env);
  }

  /**
   * Generates an object, with the environment variable names being the key and
   * the actual values being the values.
   */
  populateVariables() {
    const resolveEnvironmentVariable = (name: string) =>
      name in process.env && process.env[name] !== undefined ? process.env[name] : null;
    return this.variables
      .reduce(
        (current, next) => ({ ...current, [next]: resolveEnvironmentVariable(next) }),
        {} as { [variable: string]: any });
  }

  /**
   * Render the IIFE
   */
  protected abstract renderIIFE(environmentVariables: { [variable: string]: any }): string;
}
