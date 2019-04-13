import { readFile, writeFile } from 'fs';
import { promisify } from 'util';

import { walk } from './common';
import { DetectedVariables, TokenizedVariables } from './models';
import { VariableDetector } from './variable-detector';

const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

/**
 * Tokenize variables in a given file.
 * @public
 */
export class VariableTokenizer {
  private _detector = new VariableDetector();
  private _tokenCounter = 0;

  async tokenize(file: string): Promise<TokenizedVariables> {
    const fileContent = await readFileAsync(file, 'utf8');
    const detectedVariables = await this._detector.detect(fileContent);
    const tokenizedVariables: TokenizedVariables = {
      revert: async () => await writeFileAsync(file, fileContent, 'utf8'),
      variables: detectedVariables.variables
        .map(v => ({ ...v, token: `ngssc-token-${Date.now()}-${++this._tokenCounter}` })),
      variant: detectedVariables.variant,
    };
    const tokenizedFileContent = tokenizedVariables.variables
      .reduce(
        (current, next) => current.replace(next.expression, `"${next.token}" as any`),
        this._adaptImport(fileContent, detectedVariables));
    await writeFileAsync(file, tokenizedFileContent, 'utf8');
    return tokenizedVariables;
  }

  async untokenize(directory: string, variables: TokenizedVariables) {
    const files = walk(directory, /\.js$/);
    for (const file of files) {
      const fileContent = await readFileAsync(file, 'utf8');
      if (variables.variables.some(v => fileContent.includes(v.token))) {
        const newFileContent = variables.variables.reduce(
          (current, next) => current
            .replace(new RegExp(`"${next.token}"`, 'g'), next.expression)
            .replace(new RegExp(`"${next.token}`, 'g'), `(${next.expression}) + "`)
            .replace(new RegExp(`${next.token}"`, 'g'), `" + (${next.expression})`)
            .replace(new RegExp(`${next.token}`, 'g'), `" + (${next.expression}) + "`),
          fileContent);
        await writeFileAsync(file, newFileContent, 'utf8');
      }
    }
  }

  private _adaptImport(fileContent: string, detectedVariables: DetectedVariables) {
    if (detectedVariables.variant === 'process-env' || !detectedVariables.variantImport) {
      return fileContent;
    } else if (detectedVariables.variant === 'ng4-env') {
      return fileContent.replace(
        detectedVariables.variantImport, `import 'angular-server-side-configuration/ng4-env';`);
    } else {
      return fileContent.replace(
        detectedVariables.variantImport, `import 'angular-server-side-configuration/ng-env';`);
    }
  }
}
