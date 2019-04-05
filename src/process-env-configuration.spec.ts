import { join } from 'path';

import { indexHtmlContent, temporaryFile } from '../test/temporary-fs';

import { ProcessEnvConfiguration } from './process-env-configuration';

describe('ProcessEnvConfiguration', () => {
  // tslint:disable-next-line: no-console
  console.log = () => void 0;
  const root = join(__dirname, '..', 'test', 'environment-variables-configuration');

  it('should find TEST and TEST2', () => {
    const envVariables = new ProcessEnvConfiguration()
      .searchEnvironmentVariables({ directory: root });
    expect(envVariables.variables).toEqual(['TEST', 'TEST2']);
  });

  it('should find nothing', () => {
    const envVariables = new ProcessEnvConfiguration()
      .searchEnvironmentVariables({ directory: join(root, 'nothing') });
    expect(envVariables.variables).toEqual([]);
  });

  it('should insert the environment variables into the file', async () => {
    const file = join(root, 'index.html');
    const envVariables = new ProcessEnvConfiguration(['TEST', 'TEST2']);
    const content = await temporaryFile({ file, content: indexHtmlContent }, async () => {
      await envVariables
        .insertVariables()
        .applyAndSaveTo(file);
    });
    expect(content).toContain(envVariables.generateIIFE());
  });
});
