import { BuilderContext, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';

import { Options } from '../../models';

import { NgsscBuilder } from './ngssc-builder';

export default createBuilder<Options & JsonObject>(
  async (options: Options, context: BuilderContext) =>
    await new NgsscBuilder(options, context).run());
