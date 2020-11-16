import { createSourceFile, ImportDeclaration, Node, ScriptTarget, SyntaxKind } from 'typescript';

import { NgsscContext, Variant } from '../../models';

/**
 * Detect environment variables in given file.
 * @public
 */
export class VariableDetector {
  detect(fileContent: string): NgsscContext {
    const fileMetaData = createSourceFile('environment.ts', fileContent, ScriptTarget.ESNext, true);
    const { variant, variantImport } = this._detectVariant(fileMetaData);
    const variables =
      variant === 'process'
        ? this._findProcessEnvVariables(fileMetaData)
        : this._findNgEnvVariables(fileMetaData);
    return {
      variables: variables.sort((a, b) => b.variable.length - a.variable.length),
      variant,
      variantImport,
    };
  }

  private _detectVariant(node: Node): { variant: Variant; variantImport: string | undefined } {
    const variantImport = this._findNodesOfType<ImportDeclaration>(
      node,
      SyntaxKind.ImportDeclaration
    )
      .map((n) => n.getFullText().trim())
      .filter((n) => n.includes('angular-server-side-configuration'))[0];
    if (!variantImport || variantImport.match(/angular-server-side-configuration\/process/)) {
      return { variant: 'process', variantImport };
    }

    const variant: Variant | undefined = variantImport.match(
      /angular-server-side-configuration\/ng-env/
    )
      ? 'NG_ENV'
      : undefined;
    if (!variant) {
      throw new Error('Could not detect variant (expected either process or ng-env)');
    }
    return { variant, variantImport };
  }

  private _findProcessEnvVariables(node: Node): { variable: string; expression: string }[] {
    return this._findUsages(node, 'process')
      .sort((a, b) => b.parent.parent.getText().length - a.parent.parent.getText().length)
      .map((n) => ({
        expression: this._resolveExpression(n.parent),
        variable: n.parent.parent.getText().split('.')[2],
      }));
  }

  private _findNgEnvVariables(node: Node): { variable: string; expression: string }[] {
    return this._findUsages(node, 'NG_ENV')
      .filter(
        (n) => n.kind === SyntaxKind.Identifier && n.parent.kind !== SyntaxKind.ImportSpecifier
      )
      .sort((a, b) => b.parent.getText().length - a.parent.getText().length)
      .map((n) => ({
        expression: this._resolveExpression(n),
        variable: n.parent.getText().split('.')[1],
      }));
  }

  private _findNodesOfType<TNode extends Node>(node: Node, kind: number): TNode[] {
    return node
      .getChildren()
      .map((c) => this._findNodesOfType<TNode>(c, kind))
      .reduce(
        (current, next) => current.concat(...next),
        node.kind === kind ? [node as TNode] : []
      );
  }

  private _findUsages(node: Node, variant: string): Node[] {
    return node
      .getChildren()
      .map((c) => this._findUsages(c, variant))
      .reduce((current, next) => current.concat(next), node.getText() === variant ? [node] : []);
  }

  private _resolveExpression(node: Node) {
    while (true) {
      if (!SyntaxKind[node.parent.kind].endsWith('Expression')) {
        return node.getText();
      }

      node = node.parent;
    }
  }
}
