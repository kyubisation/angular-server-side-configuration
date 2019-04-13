/**
 * Configuration variables for writing to ngssc.json or into html.
 * @public
 */
export interface ConfigVariables {
  /** The ngssc variant. */
  variant: 'process' | 'NG_ENV';
  /** The environment variables to insert. */
  environmentVariables: string[];
}
