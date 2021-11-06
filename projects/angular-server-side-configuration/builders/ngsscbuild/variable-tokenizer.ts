import { NgsscContext } from '../../models';

import { TokenizeResult } from './tokenize-result';

/**
 * Tokenize variables in a given file.
 * @public
 */
export class VariableTokenizer {
  private _tokenCounter = 0;

  tokenize(sourceContent: string, ngsscContext: NgsscContext): TokenizeResult {
    const tokenizedVariables = ngsscContext.variables.map((v) => ({
      ...v,
      token: `ngssc-token-${++this._tokenCounter}-${Date.now()}`,
    }));
    const tokenizedFileContent = tokenizedVariables.reduce(
      (current, next) => current.replace(next.expression, `"${next.token}" as any`),
      this._adaptImport(sourceContent, ngsscContext)
    );
    return new TokenizeResult(tokenizedFileContent, tokenizedVariables);
  }

  private _adaptImport(fileContent: string, ngsscContext: NgsscContext) {
    return ngsscContext.variant === 'process' || !ngsscContext.variantImport
      ? fileContent
      : fileContent.replace(
          ngsscContext.variantImport,
          `import 'angular-server-side-configuration/ng-env';`
        );
  }
}
