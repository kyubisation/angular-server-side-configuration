import type { Variant } from 'angular-server-side-configuration';

/** The context for ngssc. */
export interface NgsscContext {
  variant: Variant;
  variables: string[];
}
