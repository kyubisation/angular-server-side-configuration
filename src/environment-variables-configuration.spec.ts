import { expect } from 'chai';
import { join } from 'path';

import { indexHtmlContent, temporaryFile, temporaryFiles } from '../test/temporary-fs';
import { EnvironmentVariablesConfiguration } from './environment-variables-configuration';

describe('EnvironmentVariablesConfiguration', () => {
  const root = join(__dirname, '..', 'test', 'environment-variables-configuration');

  it('should throw on missing directory', () => {
    const missingDirectory = join(root, 'missing-directory');
    expect(
      () => EnvironmentVariablesConfiguration.searchEnvironmentVariables(missingDirectory))
      .to.throw(Error);
  });

  it('should throw on invalid directory', async () => {
    const invalidDirectory = join(root, 'index.html');
    await temporaryFile({ file: invalidDirectory, content: indexHtmlContent }, async () => {
      expect(
        () => EnvironmentVariablesConfiguration.searchEnvironmentVariables(invalidDirectory))
        .to.throw(Error);
    });
  });

  it('should find TEST and TEST2', () => {
    const envVariables = EnvironmentVariablesConfiguration.searchEnvironmentVariables(root);
    expect(envVariables.variables).eql(['TEST', 'TEST2']);
  });

  it('should find nothing', () => {
    const envVariables = EnvironmentVariablesConfiguration.searchEnvironmentVariables(join(root, 'nothing'));
    expect(envVariables.variables).to.be.empty;
  });

  it('should populate variables from process.env', () => {
    const expected = {
      TEST: 'test',
      TEST2: null,
    };
    process.env.TEST = expected.TEST;
    const envVariables = new EnvironmentVariablesConfiguration(Object.keys(expected));
    expect(envVariables.populateVariables()).eql(expected);
  });

  it('should apply the environment variables without modifying the file', async () => {
    const file = join(root, 'index.html');
    const envVariables = new EnvironmentVariablesConfiguration(['TEST', 'TEST2']);
    const content = await temporaryFile({ file, content: indexHtmlContent }, async () => {
      const appliedContent = await envVariables.apply(file);
      expect(appliedContent).to.contain(envVariables.generateIIFE());
    });
    expect(content).not.to.contain(envVariables.generateIIFE());
  });

  it('should insert the environment variables into the file', async () => {
    const file = join(root, 'index.html');
    const envVariables = new EnvironmentVariablesConfiguration(['TEST', 'TEST2']);
    const content = await temporaryFile({ file, content: indexHtmlContent }, async () => {
      await envVariables.insertAndSave(file);
    });
    expect(content).to.contain(envVariables.generateIIFE());
  });

  it('should insert the environment variables into all files', async () => {
    const files = ['index.html', join('de', 'index.html'), join('en', 'index.html')]
      .map(f => ({ file: join(root, f), content: indexHtmlContent }));
    const envVariables = new EnvironmentVariablesConfiguration(['TEST', 'TEST2']);
    const contents = await temporaryFiles(files, async () => {
      await envVariables.insertAndSaveRecursively(root);
    });
    contents.forEach(c => expect(c).to.contain(envVariables.generateIIFE()));
  });

  it('should replace html lang attribute', async () => {
    const file = join(root, 'index.html');
    const envVariables = new EnvironmentVariablesConfiguration(['TEST', 'TEST2']);
    const content = await temporaryFile({ file, content: indexHtmlContent }, async () => {
      await envVariables
        .replaceHtmlLang('de')
        .insertAndSave(file);
    });
    expect(content).to.contain('<html lang="de">');
  });

  it('should replace the base href attribute', async () => {
    const file = join(root, 'index.html');
    const envVariables = new EnvironmentVariablesConfiguration(['TEST', 'TEST2']);
    const content = await temporaryFile({ file, content: indexHtmlContent }, async () => {
      await envVariables
        .replaceBaseHref('/de/')
        .insertAndSave(file);
    });
    expect(content).to.contain('<base href="/de/">');
  });

  it('should replace regex match', async () => {
    const file = join(root, 'index.html');
    const envVariables = new EnvironmentVariablesConfiguration(['TEST', 'TEST2']);
    const newTitle = '<title>Regex</title>';
    const content = await temporaryFile({ file, content: indexHtmlContent }, async () => {
      await envVariables
        .regexReplace(/<title>[a-zA-Z0-9]+<\/title>/g, newTitle)
        .insertAndSave(file);
    });
    expect(content).to.contain(newTitle);
  });

  it('should set the directory', () => {
    const envVariables = new EnvironmentVariablesConfiguration();
    expect(envVariables.directory).not.to.eq(root);
    expect(envVariables.setDirectory(root).directory).to.eq(root);
  });

  it('should find TEST and TEST2 (instance method)', () => {
    const envVariables = new EnvironmentVariablesConfiguration()
      .setDirectory(root)
      .searchEnvironmentVariables();
    expect(envVariables.variables).eql(['TEST', 'TEST2']);
  });

  it('should replace placeholder', async () => {
    const file = join(root, 'index.html');
    const envVariables = new EnvironmentVariablesConfiguration(['TEST', 'TEST2'])
      .insertVariables();
    const content = await temporaryFile({ file, content: indexHtmlContent }, async () => {
      await envVariables.applyAndSaveTo(file);
    });
    expect(content).to.contain(envVariables.generateIIFE());
  });

  it('should replace custom placeholder', async () => {
    const file = join(root, 'index.html');
    const envVariables = new EnvironmentVariablesConfiguration(['TEST', 'TEST2'])
      .insertVariables('<!--CONFIG-->');
    const content = await temporaryFile({ file, content: indexHtmlContent }, async () => {
      await envVariables.applyAndSaveTo(file);
    });
    expect(content).to.contain(envVariables.generateIIFE());
  });

  it('should insert IIFE into head', async () => {
    const file = join(root, 'index.html');
    const envVariables = new EnvironmentVariablesConfiguration(['TEST', 'TEST2'])
      .insertVariablesIntoHead();
    const content = await temporaryFile({ file, content: indexHtmlContent }, async () => {
      await envVariables.applyAndSaveTo(file);
    });
    expect(content).to.contain(`</title><script>${envVariables.generateIIFE()}</script>`);
  });

  it('should insert IIFE at end of head', async () => {
    const file = join(root, 'index.html');
    const envVariables = new EnvironmentVariablesConfiguration(['TEST', 'TEST2'])
      .insertVariablesIntoHead();
    const htmlContent = `<html><head></head><body></body></html>`;
    const content = await temporaryFile({ file, content: htmlContent }, async () => {
      await envVariables.applyAndSaveTo(file);
    });
    expect(content).to.contain(`<script>${envVariables.generateIIFE()}</script></head>`);
  });

  it('should insert the environment variables into all files', async () => {
    const files = ['index.html', join('de', 'index.html'), join('en', 'index.html')]
      .map(f => ({ file: join(root, f), content: indexHtmlContent }));
    const envVariables = new EnvironmentVariablesConfiguration(['TEST', 'TEST2'])
      .setDirectory(root)
      .insertVariables();
    const contents = await temporaryFiles(files, async () => {
      await envVariables.applyAndSaveRecursively();
    });
    contents.forEach(c => expect(c).to.contain(envVariables.generateIIFE()));
  });
});

