export interface Schema {
  additionalEnvironmentVariables: string;
  /** Name of the project. */
  project: string;
  variant: 'process' | 'NG_ENV';
  ngsscEnvironmentFile: string;
}
