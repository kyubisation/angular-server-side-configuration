import { ImportDeclaration, Node } from 'typescript';

import { DetectedVariables, Variant } from './models';

/**
 * Detect environment variables in given file.
 * @public
 */
export class VariableDetector {
  private _typescript = import('typescript');

  async detect(fileContent: string): Promise<DetectedVariables> {
    const { createSourceFile, ScriptTarget } = await this._typescript;
    const fileMetaData = createSourceFile('environment.ts', fileContent, ScriptTarget.ESNext, true);
    const { variant, variantImport } = await this._detectVariant(fileMetaData);
    const variables = variant === 'process-env'
      ? await this._findProcessEnvVariables(fileMetaData)
      : await this._findNgEnvVariables(fileMetaData);
    return {
      variables: variables.sort((a, b) => b.variable.length - a.variable.length),
      variant,
      variantImport,
    };
  }

  private async _detectVariant(node: Node): Promise<{ variant: Variant, variantImport: string | undefined }> {
    const { SyntaxKind } = await this._typescript;
    const variantImport = this._findNodesOfType<ImportDeclaration>(node, SyntaxKind.ImportDeclaration)
      .map(n => n.getFullText().trim())
      .filter(n => n.includes('angular-server-side-configuration'))[0];
    if (!variantImport || variantImport.match(/angular-server-side-configuration\/process/)) {
      return { variant: 'process-env', variantImport };
    }

    const variant = variantImport.match(/angular-server-side-configuration\/(ng4-env|ng-env)/)![1] as Variant;
    return { variant, variantImport };
  }

  private async _findProcessEnvVariables(node: Node): Promise<Array<{ variable: string, expression: string }>> {
    return this._findUsages(node, 'process')
      .sort((a, b) => b.parent.parent.getText().length - a.parent.parent.getText().length)
      .reduce(async (current, next) => (await current)
        .concat({
          expression: await this._resolveExpression(next.parent),
          variable: next.parent.parent.getText().split('.')[2],
        }),
        Promise.resolve<Array<{ variable: string, expression: string }>>([]));
  }

  private async _findNgEnvVariables(node: Node): Promise<Array<{ variable: string, expression: string }>> {
    const { SyntaxKind } = await this._typescript;
    return this._findUsages(node, 'NG_ENV')
      .filter(n => n.kind === SyntaxKind.Identifier && n.parent.kind !== SyntaxKind.ImportSpecifier)
      .sort((a, b) => b.parent.getText().length - a.parent.getText().length)
      .reduce(async (current, next) => (await current)
        .concat({
          expression: await this._resolveExpression(next),
          variable: next.parent.getText().split('.')[1],
        }),
        Promise.resolve<Array<{ variable: string, expression: string }>>([]));
  }

  private _findNodesOfType<TNode extends Node>(node: Node, kind: number): TNode[] {
    return node
      .getChildren()
      .map(c => this._findNodesOfType<TNode>(c, kind))
      .reduce((current, next) => current.concat(...next), node.kind === kind ? [node as TNode] : []);
  }

  private _findUsages(node: Node, variant: string): Node[] {
    return node
      .getChildren()
      .map(c => this._findUsages(c, variant))
      .reduce((current, next) => current.concat(next), node.getText() === variant ? [node] : []);
  }

  private async _resolveExpression(node: Node) {
    const { SyntaxKind } = await this._typescript;
    while (true) {
      if (!SyntaxKind[node.parent.kind].endsWith('Expression')) {
        return node.getText();
      }

      node = node.parent;
    }
  }
}
