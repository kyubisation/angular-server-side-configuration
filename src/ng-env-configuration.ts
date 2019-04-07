import { Configuration } from './configuration';

/**
 * Discover and apply configuration via environment variables discovered via NG_ENV usage.
 * @public
 */
export class NgEnvConfiguration extends Configuration {
  protected discoverVariables(fileContent: string): string[] {
    return (fileContent.match(/NG_ENV\s*\.\s*[a-zA-Z0-9_]+/gm) || [])
      .map(m => m.split('.')[1].trim());
  }

  protected renderIIFE(environmentVariables: { [variable: string]: any; }): string {
    return `(function(self){self.NG_ENV=${JSON.stringify(environmentVariables)};})(window)`;
  }
}
