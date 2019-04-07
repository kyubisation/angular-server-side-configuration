import { ConfigVariables } from './config-variables';

/**
 * Model for ngssc.json.
 * @public
 */
export interface Ngssc extends ConfigVariables {
  /** Pattern for files that should have variables inserted. */
  filePattern?: string;
  /** Whether to recursively look for files matching filePattern. */
  recursiveMatching?: boolean;
  /** Whether to insert the variables in the head tag or try to replace \<!--CONFIG--\> */
  insertInHead?: boolean;
}
