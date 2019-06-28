import { Variant } from './variant';

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
