import { Variant } from './variant';

/**
 * The context for ngssc.
 * @public
 */
export interface NgsscContext {
  variant: Variant;
  variantImport: string | undefined;
  variables: { variable: string, expression: string }[];
}
