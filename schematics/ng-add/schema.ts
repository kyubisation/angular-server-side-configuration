export interface Schema {
  /** Name of the project. */
  project: string;
  variant: 'process' | 'NG_ENV';
  ngsscConfigurationFile: string;
  aotSupport: boolean;
}
