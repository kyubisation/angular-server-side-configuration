import { JsonObject } from '@angular-devkit/core';

export interface Options extends JsonObject {
  aotSupport: boolean;
  browserTarget: string;
  ngsscConfigurationFile: string;
}
