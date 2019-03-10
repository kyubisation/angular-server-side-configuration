import { Configuration } from './configuration';

/**
 * Discover and apply configuration via environment variables discovered via process.env usage.
 * 
 * @public
 */
export class ProcessEnvConfiguration extends Configuration {
  protected discoverVariables(fileContent: string): string[] {
    return (fileContent.match(/process\s*\.\s*env\s*\.\s*[a-zA-Z0-9_]+/gm) || [])
      .map(m => m.split('.')[2].trim());
  }

  protected renderIIFE(environmentVariables: { [variable: string]: any; }): string {
    return `(function(self){self.process=${JSON.stringify({ env: environmentVariables })};})(window)`;
  }
}
