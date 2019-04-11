import { Configuration } from './configuration';

/**
 * Discover and apply configuration via environment variables discovered via NG_ENV usage.
 * @public
 */
export class NgEnvConfiguration extends Configuration {
  protected renderIIFE(environmentVariables: { [variable: string]: any; }): string {
    return `(function(self){self.NG_ENV=${JSON.stringify(environmentVariables)};})(window)`;
  }
}
