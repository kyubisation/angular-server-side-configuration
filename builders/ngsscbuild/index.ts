import { BuilderContext, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';

import { NgsscBuilder } from './ngssc-builder';
import { Schema } from './schema';

export { Schema as NgsscBuildSchema } from './schema';

export async function ngsscBuild(options: Schema, context: BuilderContext) {
  return await new NgsscBuilder(options, context).run();
}

export default createBuilder<Schema & JsonObject>(ngsscBuild);
