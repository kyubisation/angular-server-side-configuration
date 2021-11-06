export interface Schema {
  additionalEnvironmentVariables: string[];
  aotSupport: boolean;
  browserTarget: string;
  ngsscEnvironmentFile: string;
  filePattern: string | null;
}
