import { BuilderContext, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';

import { NgsscBuilder } from './ngssc-builder';
import { Schema } from './schema';

export { Schema as NgsscBuildSchema } from './schema';
export default createBuilder<Schema & JsonObject>(
  async (options: Schema, context: BuilderContext) =>
    await new NgsscBuilder(options, context).run());
