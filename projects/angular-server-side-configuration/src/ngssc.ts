/**
 * Model for ngssc.json.
 * @public
 */
export interface Ngssc {
  /** The ngssc variant. */
  variant: Variant;
  /** The environment variables to insert. */
  environmentVariables: string[];
  /** Pattern for files that should have variables inserted. */
  filePattern?: string;
}

/**
 * Available angular-server-side-configuration variants.
 * @public
 */
export type Variant = 'process' | 'global' | 'NG_ENV';
