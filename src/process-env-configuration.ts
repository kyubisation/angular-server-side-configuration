import { Configuration } from './configuration';

/**
 * Discover and apply configuration via environment variables discovered via process.env usage.
 * @public
 */
export class ProcessEnvConfiguration extends Configuration {
  protected renderIIFE(environmentVariables: { [variable: string]: any; }): string {
    return `(function(self){self.process=${JSON.stringify({ env: environmentVariables })};})(window)`;
  }
}
