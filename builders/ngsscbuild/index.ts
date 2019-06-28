import { createBuilder } from '@angular-devkit/architect';

import { NgsscBuilder } from './ngssc-builder';

export default createBuilder(NgsscBuilder.build);
