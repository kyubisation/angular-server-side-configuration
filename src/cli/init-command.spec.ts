
import { expect } from 'chai';
import { join } from 'path';

import { temporaryDirectory, temporaryFile, temporaryFiles } from '../../test/temporary-fs';
import { InitCommand } from './init-command';

describe('cli insert', () => {
  const root = join(__dirname, '..', '..', 'test', 'init-command');

  it('should fail due to missing package.json', async () => {
    const command = new InitCommand({ directory: root });
    await expect(command.execute()).to.eventually
      .rejectedWith('This command must be executed in a directory with a package.json!');
  });

  it('should fail due to missing environment file', async () => {
    const command = new InitCommand({ directory: root });
    const file = join(root, 'package.json');
    await temporaryFile({ file, content: packageTemplate }, async () => {
      await expect(command.execute()).to.eventually.rejected;
    });
  });

  it('should fail due to using both npm and yarn', async () => {
    const command = new InitCommand({ directory: root, npm: true, yarn: true });
    const file = join(root, 'package.json');
    await temporaryFile({ file, content: packageTemplate }, async () => {
      await expect(command.execute()).to.eventually.rejected;
    });
  });

  it('should default to cwd', () => {
    const command = new InitCommand({});
    expect((command as any)._directory).to.eq(process.cwd());
  });

  it('should initialize correctly', async function () {
    this.timeout(20000);
    const directory = join(root, 'tmp');
    for (const content of ['', environmentTemplate]) {
      await temporaryDirectory(directory, async () => {
        const command = new InitCommand({ directory, environmentFile: 'environment.prod.ts' });
        const packageJsonPath = join(directory, 'package.json');
        const environmentFilePath = join(directory, 'environment.prod.ts');
        const [packageJson, environmentFile] = await temporaryFiles([
          { file: packageJsonPath, content: packageTemplate },
          { file: environmentFilePath, content }
        ], async () => await command.execute());

        expect(packageJson).to.contain('"angular-server-side-configuration"');
        expect(environmentFile).to.contain(`import 'angular-server-side-configuration/process';`);
      });
    }
  });

  it('should initialize correctly with yarn', async function () {
    this.timeout(20000);
    const directory = join(root, 'tmp');
    await temporaryDirectory(directory, async () => {
      const command = new InitCommand({ directory, environmentFile: 'environment.prod.ts', yarn: true });
      const packageJsonPath = join(directory, 'package.json');
      const environmentFilePath = join(directory, 'environment.prod.ts');
      const [packageJson, environmentFile] = await temporaryFiles([
        { file: packageJsonPath, content: packageTemplate },
        { file: environmentFilePath, content: '' }
      ], async () => await command.execute());

      expect(packageJson).to.contain('"angular-server-side-configuration"');
      expect(environmentFile).to.contain(`import 'angular-server-side-configuration/process';`);
    });
  });
});

const packageTemplate = `
{
  "name": "test-project",
  "version": "1.1.0",
  "private": true
}`;

const environmentTemplate = `
import 'angular-server-side-configuration/process';

export const environment = {
  production: true
};
`;