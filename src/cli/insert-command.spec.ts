
import { randomBytes } from 'crypto';
import { mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import rimraf from 'rimraf';

import { MockLogger } from '../../test/mock-logger';
import {
  indexHtmlContent,
  indexHtmlContentWithInlineConfig,
  indexHtmlContentWithInvalidInlineConfig,
  indexHtmlContentWithoutConfig,
  temporaryFile,
  temporaryFiles,
} from '../../test/temporary-fs';
import { NgEnvConfiguration } from '../ng-env-configuration';
import { ProcessEnvConfiguration } from '../process-env-configuration';

import { InsertCommand } from './insert-command';

describe('cli insert', () => {
  const logger = new MockLogger();
  let root: string;

  beforeEach(() => {
    root = join(tmpdir(), randomBytes(20).toString('hex'));
    mkdirSync(root);
  });

  afterEach(() => {
    rimraf.sync(root);
  });

  it('should instantiate', () => {
    // tslint:disable-next-line: no-unused-expression
    new InsertCommand({ directory: root });
  });

  it('should fail due to missing ngssc.json', async () => {
    const command = new InsertCommand({ directory: root }, logger);
    await expect(command.execute()).rejects.toThrowError(/^Either missing or invalid ngssc.json in /);
  });

  it('should fail due to invalid directory', async () => {
    for (const directory of [join(root, 'directory-does-not-exist'), __filename]) {
      const command = new InsertCommand({ directory }, logger);
      await expect(command.execute()).rejects.toThrowError(/ is not a valid directory!/);
    }
  });

  it('should fail due to invalid variant', async () => {
    await temporaryFile(
      { content: JSON.stringify({ variant: 'FAILED' }), file: join(root, 'ngssc.json') },
      async () => {
        const command = new InsertCommand({ directory: root }, logger);
        await expect(command.execute()).rejects.toThrowError(/^Invalid variant /);
      });
  });

  it('should do nothing on no html files with --config-in-html', async () => {
    const command = new InsertCommand({ directory: root, configInHtml: true }, logger);
    await command.execute();
  });

  it('should do nothing with html files with missing or invalid configuration with --config-in-html', async () => {
    const [htmlContent, htmlContent2] = await temporaryFiles([
      { file: join(root, 'index.html'), content: indexHtmlContent },
      { file: join(root, 'index2.html'), content: indexHtmlContentWithInvalidInlineConfig },
    ],
      async () => {
        const command = new InsertCommand({ directory: root, configInHtml: true }, logger);
        await command.execute();
      });
    expect(htmlContent).toContain('<!--CONFIG-->');
    expect(htmlContent2).toContain('<!--CONFIG {"broken json","environmentVariables":["VALUE"]}-->');
  });

  it('should configure html with --config-in-html', async () => {
    const htmlContent = await temporaryFile(
      { file: join(root, 'index.html'), content: indexHtmlContentWithInlineConfig },
      async () => {
        const command = new InsertCommand({ directory: root, configInHtml: true }, logger);
        await command.execute();
      });
    expect(htmlContent).toContain(new ProcessEnvConfiguration(['VALUE']).generateIIFE());
  });

  it('should configure files with ngssc.json', async () => {
    const [htmlContent] = await temporaryFiles([
      { file: join(root, 'index.html'), content: indexHtmlContent },
      {
        content: JSON.stringify({ variant: 'NG_ENV', environmentVariables: ['VALUE'] }),
        file: join(root, 'ngssc.json'),
      },
    ], async () => {
      const command = new InsertCommand({ directory: root }, logger);
      await command.execute();
    });
    expect(htmlContent).toContain(new NgEnvConfiguration(['VALUE']).generateIIFE());
  });

  it('should configure non-recursively with ngssc.json', async () => {
    const [htmlContent] = await temporaryFiles([
      { file: join(root, 'index.html'), content: indexHtmlContentWithoutConfig },
      {
        content: JSON.stringify({
          environmentVariables: ['VALUE'],
          insertInHead: true,
          recursiveMatching: false,
          variant: 'NG_ENV',
        }),
        file: join(root, 'ngssc.json'),
      },
    ], async () => {
      const command = new InsertCommand({ directory: root }, logger);
      await command.execute();
    });
    expect(htmlContent).toContain(new NgEnvConfiguration(['VALUE']).generateIIFE());
  });

  it('should configure non-recursively with ngssc.json with file pattern', async () => {
    const [htmlContent] = await temporaryFiles([
      { file: join(root, 'main.html'), content: indexHtmlContentWithoutConfig },
      {
        content: JSON.stringify({
          environmentVariables: ['VALUE'],
          filePattern: 'main.html',
          insertInHead: true,
          recursiveMatching: false,
          variant: 'NG_ENV',
        }),
        file: join(root, 'ngssc.json'),
      },
    ], async () => {
      const command = new InsertCommand({ directory: root }, logger);
      await command.execute();
    });
    expect(htmlContent).toContain(new NgEnvConfiguration(['VALUE']).generateIIFE());
  });

  it('should do nothing with dry run and with ngssc.json', async () => {
    const [htmlContent] = await temporaryFiles([
      { file: join(root, 'index.html'), content: indexHtmlContent },
      {
        content: JSON.stringify({ variant: 'NG_ENV', environmentVariables: ['VALUE'] }),
        file: join(root, 'ngssc.json'),
      },
    ], async () => {
      const command = new InsertCommand({ directory: root, dry: true }, logger);
      await command.execute();
    });
    expect(htmlContent).toBe(indexHtmlContent);
  });
});
