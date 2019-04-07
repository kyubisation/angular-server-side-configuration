import { Variant } from './variant';

/**
 * Variable tokenization result.
 * @public
 */
export interface TokenizedVariables {
  variant: Variant;
  variables: Array<{ variable: string, expression: string, token: string }>;
  revert(): Promise<void>;
}
