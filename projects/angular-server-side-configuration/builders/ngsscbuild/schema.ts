export interface Schema {
  additionalEnvironmentVariables: string[];
  browserTarget: string;
  filePattern: string | null;
  searchPattern?: string | null;
}
