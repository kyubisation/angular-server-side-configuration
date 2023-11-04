export interface Schema {
  additionalEnvironmentVariables: string[];
  /** @deprecated Use buildTarget instead. */
  browserTarget: string;
  buildTarget: string;
  filePattern: string | null;
  searchPattern?: string | null;
}
