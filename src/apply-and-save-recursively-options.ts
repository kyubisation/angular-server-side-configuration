/**
 * Options for applyAndSaveRecursively
 * 
 * @public
 */
export interface ApplyAndSaveRecursivelyOptions {
  /**
   * The root directory from which to search files. (Defaults to instance directory.)
   */
  directory?: string;
  /**
   * The file pattern in which the configuration should be inserted
   *   (Defaults to /index.html$/).
   */
  filePattern?: RegExp;
}