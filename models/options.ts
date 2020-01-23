import { JsonObject } from '@angular-devkit/core';

export interface Options extends JsonObject {
  additionalEnvironmentVariables: string[];
  aotSupport: boolean;
  browserTarget: string;
  ngsscEnvironmentFile: string;
  filePattern: string | null;
}
