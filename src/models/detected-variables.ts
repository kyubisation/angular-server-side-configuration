import { Variant } from './variant';

/**
 * Variable detection result.
 * @public
 */
export interface DetectedVariables {
  variant: Variant;
  variantImport: string | undefined;
  variables: Array<{ variable: string, expression: string }>;
}
