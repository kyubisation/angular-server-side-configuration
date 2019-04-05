/**
 * Options for searchEnvironmentVariables.
 * @public
 */
export interface SearchEnvironmentVariablesOptions {
  /**
   * The root directory from which to search.
   */
  directory?: string;
  /**
   * The file pattern in which environment variables should be searched (Defaults to /.js$/).
   */
  filePattern?: RegExp;
}
