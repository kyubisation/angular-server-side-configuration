export interface Schema {
  additionalEnvironmentVariables: string;
  experimentalBuilders: boolean;
  /** Name of the project. */
  project: string;
  ngsscEnvironmentFile: string;
}
