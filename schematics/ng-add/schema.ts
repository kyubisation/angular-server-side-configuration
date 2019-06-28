export interface Schema {
  /** Name of the project. */
  project: string;
  variant: 'process' | 'NG_ENV';
  ngsscEnvironmentFile: string;
  aotSupport: boolean;
}
