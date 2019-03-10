import { join } from 'path';
import { indexHtmlContent, temporaryFile, temporaryFiles } from '../test/temporary-fs';
import { Configuration } from './configuration';

describe('Configuration', () => {
  console.log = () => void 0;
  const root = join(__dirname, '..', 'test', 'environment-variables-configuration');
  
  class MockConfiguration extends Configuration {
    protected discoverVariables(fileContent: string): string[] {
      throw new Error('Method not implemented.');
    }
    protected renderIIFE(environmentVariables: { [variable: string]: any; }): string {
      return '1dZ5dzWGBV7Z0bdRpBUcQlrij0PqdC3lYBqY90ZZWacLIztxUV';
    }
  }

  it('should throw on missing directory', () => {
    const missingDirectory = join(root, 'missing-directory');
    const config = new MockConfiguration()
      .setDirectory(missingDirectory);
    expect(() => config.searchEnvironmentVariables())
      .toThrow(/no such file or directory/);
  });

  it('should throw on invalid directory', async () => {
    const invalidDirectory = join(root, 'index.html');
    const config = new MockConfiguration()
      .setDirectory(invalidDirectory);
    await temporaryFile({ file: invalidDirectory, content: indexHtmlContent }, async () => {
      expect(() => config.searchEnvironmentVariables())
        .toThrow(/is not a valid directory!/);
    });
  });

  it('should populate variables from process.env', () => {
    const expected = {
      TEST: 'test',
      TEST2: null,
    };
    process.env.TEST = expected.TEST;
    const envVariables = new MockConfiguration(Object.keys(expected));
    expect(envVariables.populateVariables()).toEqual(expected);
  });

  it('should apply the environment variables without modifying the file', async () => {
    const file = join(root, 'index.html');
    const envVariables = new MockConfiguration(['TEST', 'TEST2'])
      .insertVariables();
    const content = await temporaryFile({ file, content: indexHtmlContent }, async () => {
      const appliedContent = await envVariables.applyTo(file);
      expect(appliedContent).toContain(envVariables.generateIIFE());
    });
    expect(content).not.toContain(envVariables.generateIIFE());
  });

  it('should replace html lang attribute', async () => {
    const file = join(root, 'index.html');
    const envVariables = new MockConfiguration(['TEST', 'TEST2']);
    const content = await temporaryFile({ file, content: indexHtmlContent }, async () => {
      await envVariables
        .replaceHtmlLang('de')
        .insertVariables()
        .applyAndSaveTo(file);
    });
    expect(content).toContain('<html lang="de">');
  });

  it('should replace the base href attribute', async () => {
    const file = join(root, 'index.html');
    const envVariables = new MockConfiguration(['TEST', 'TEST2']);
    const content = await temporaryFile({ file, content: indexHtmlContent }, async () => {
      await envVariables
        .replaceBaseHref('/de/')
        .insertVariables()
        .applyAndSaveTo(file);
    });
    expect(content).toContain('<base href="/de/">');
  });

  it('should replace regex match', async () => {
    const file = join(root, 'index.html');
    const envVariables = new MockConfiguration(['TEST', 'TEST2']);
    const newTitle = '<title>Regex</title>';
    const content = await temporaryFile({ file, content: indexHtmlContent }, async () => {
      await envVariables
        .regexReplace(/<title>[a-zA-Z0-9]+<\/title>/g, newTitle)
        .insertVariables()
        .applyAndSaveTo(file);
    });
    expect(content).toContain(newTitle);
  });

  it('should set the directory', () => {
    const envVariables = new MockConfiguration();
    expect(envVariables.directory).not.toEqual(root);
    expect(envVariables.setDirectory(root).directory).toEqual(root);
  });

  it('should replace placeholder', async () => {
    const file = join(root, 'index.html');
    const envVariables = new MockConfiguration(['TEST', 'TEST2'])
      .insertVariables();
    const content = await temporaryFile({ file, content: indexHtmlContent }, async () => {
      await envVariables.applyAndSaveTo(file);
    });
    expect(content).toContain(envVariables.generateIIFE());
  });

  it('should replace custom placeholder', async () => {
    const file = join(root, 'index.html');
    const envVariables = new MockConfiguration(['TEST', 'TEST2'])
      .insertVariables('<!--CONFIG-->');
    const content = await temporaryFile({ file, content: indexHtmlContent }, async () => {
      await envVariables.applyAndSaveTo(file);
    });
    expect(content).toContain(envVariables.generateIIFE());
  });

  it('should insert IIFE into head', async () => {
    const file = join(root, 'index.html');
    const envVariables = new MockConfiguration(['TEST', 'TEST2'])
      .insertVariablesIntoHead();
    const content = await temporaryFile({ file, content: indexHtmlContent }, async () => {
      await envVariables.applyAndSaveTo(file);
    });
    expect(content).toContain(`</title><script>${envVariables.generateIIFE()}</script>`);
  });

  it('should insert IIFE at end of head', async () => {
    const file = join(root, 'index.html');
    const envVariables = new MockConfiguration(['TEST', 'TEST2'])
      .insertVariablesIntoHead();
    const htmlContent = `<html><head></head><body></body></html>`;
    const content = await temporaryFile({ file, content: htmlContent }, async () => {
      await envVariables.applyAndSaveTo(file);
    });
    expect(content).toContain(`<script>${envVariables.generateIIFE()}</script></head>`);
  });

  it('should insert the environment variables into all files', async () => {
    const files = ['index.html', join('de', 'index.html'), join('en', 'index.html')]
      .map(f => ({ file: join(root, f), content: indexHtmlContent }));
    const envVariables = new MockConfiguration(['TEST', 'TEST2'])
      .setDirectory(root)
      .insertVariables();
    const contents = await temporaryFiles(files, async () => {
      await envVariables.applyAndSaveRecursively();
    });
    contents.forEach(c => expect(c).toContain(envVariables.generateIIFE()));
  });
});
