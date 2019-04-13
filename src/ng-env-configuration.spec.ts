import { join } from 'path';

import { indexHtmlContent, temporaryFile } from '../test/temporary-fs';

import { NgEnvConfiguration } from './ng-env-configuration';

describe('NgEnvConfiguration', () => {
  const root = join(__dirname, '..', 'test', 'environment-variables-configuration');

  it('should insert the environment variables into the file', async () => {
    const file = join(root, 'index.html');
    const envVariables = new NgEnvConfiguration(['NGTEST', 'NGTEST2']);
    const content = await temporaryFile({ file, content: indexHtmlContent }, async () => {
      await envVariables
        .insertVariables()
        .applyAndSaveTo(file);
    });
    expect(content).toContain(envVariables.generateIIFE());
  });
});
