import { Variant } from './variant';

/**
 * The context for ngssc.
 * @public
 */
export interface NgsscContext {
  variant: Variant;
  variantImport: string | undefined;
  variables: Array<{ variable: string, expression: string }>;
}
