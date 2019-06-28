import { JsonObject } from '@angular-devkit/core';

export interface BrowserOptions extends JsonObject {
  outputPath: string;
  index: string;
}
