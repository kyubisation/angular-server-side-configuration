
import { join } from 'path';
import { temporaryDirectory, temporaryFile, temporaryFiles } from '../../test/temporary-fs';
import { InitCommand } from './init-command';

describe('cli insert', () => {
  console.log = () => void 0;
  const root = join(__dirname, '..', '..', 'test', 'init-command');

  it('should fail due to missing package.json', async () => {
    const command = new InitCommand({ directory: root });
    await expect(command.execute()).rejects
      .toThrow('This command must be executed in a directory with a package.json!');
  });

  it('should fail due to missing environment file', async () => {
    const command = new InitCommand({ directory: root });
    const file = join(root, 'package.json');
    await temporaryFile({ file, content: packageTemplate }, async () => {
      await expect(command.execute()).rejects.toBeInstanceOf(Error);
    });
  });

  it('should fail due to using both npm and yarn', async () => {
    const command = new InitCommand({ directory: root, npm: true, yarn: true });
    const file = join(root, 'package.json');
    await temporaryFile({ file, content: packageTemplate }, async () => {
      await expect(command.execute()).rejects.toBeInstanceOf(Error);
    });
  });

  it('should default to cwd', () => {
    const command = new InitCommand({});
    expect((command as any)._directory).toEqual(process.cwd());
  });

  it('should initialize correctly', async () => {
    const directory = join(root, 'tmp1');
    for (const content of ['', environmentTemplate]) {
      await temporaryDirectory(directory, async () => {
        const command = new InitCommand({ directory, environmentFile: 'environment.prod.ts' });
        const packageJsonPath = join(directory, 'package.json');
        const environmentFilePath = join(directory, 'environment.prod.ts');
        const [packageJson, environmentFile] = await temporaryFiles([
          { file: packageJsonPath, content: packageTemplate },
          { file: environmentFilePath, content },
        ], async () => await command.execute());

        expect(packageJson).toContain('"angular-server-side-configuration"');
        expect(environmentFile).toContain(`import 'angular-server-side-configuration/process';`);
      });
    }
  }, 20000);

  it('should initialize correctly with yarn', async () => {
    const directory = join(root, 'tmp2');
    await temporaryDirectory(directory, async () => {
      const command = new InitCommand({ directory, environmentFile: 'environment.prod.ts', yarn: true });
      const packageJsonPath = join(directory, 'package.json');
      const environmentFilePath = join(directory, 'environment.prod.ts');
      const [packageJson, environmentFile] = await temporaryFiles([
        { file: packageJsonPath, content: packageTemplate },
        { file: environmentFilePath, content: '' },
      ], async () => await command.execute());

      expect(packageJson).toContain('"angular-server-side-configuration"');
      expect(environmentFile).toContain(`import 'angular-server-side-configuration/process';`);
    });
  }, 20000);
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
