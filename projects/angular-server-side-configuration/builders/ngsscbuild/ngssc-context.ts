import { Variant } from 'angular-server-side-configuration';

/**
 * The context for ngssc.
 * @public
 */
export interface NgsscContext {
  variant: Variant;
  variantImport: string | undefined;
  variables: { variable: string; expression: string }[];
}
