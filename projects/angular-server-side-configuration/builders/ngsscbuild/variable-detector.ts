import {
  createSourceFile,
  forEachChild,
  isElementAccessExpression,
  isIdentifier,
  isPropertyAccessExpression,
  isStringLiteralLike,
  Node,
  ScriptTarget,
  isImportDeclaration,
} from 'typescript';
import { Variant } from 'angular-server-side-configuration';
import { logging } from '@angular-devkit/core';
import { NgsscContext } from './ngssc-context';

/** Detect environment variables in given file. */
export class VariableDetector {
  constructor(private _logger?: logging.LoggerApi) {}

  detect(fileContent: string): NgsscContext {
    const sourceFile = createSourceFile('environment.ts', fileContent, ScriptTarget.ESNext, true);
    let variant: Variant = 'process';
    const ngEnvVariables: string[] = [];
    const processVariables: string[] = [];
    iterateNodes(sourceFile, (node) => {
      if (
        isImportDeclaration(node) &&
        node.moduleSpecifier.getText().match(/angular-server-side-configuration\/ng-env/)
      ) {
        variant = 'NG_ENV';
      } else if (!isIdentifier(node)) {
        return;
      }
      if (node.getText() === 'NG_ENV') {
        const variable = this._extractVariable(node, (n) => n.parent);
        if (variable) {
          ngEnvVariables.push(variable);
        }
      } else if (node.getText() === 'process') {
        const variable = this._extractVariable(node, (n) => n.parent.parent);
        if (variable) {
          processVariables.push(variable);
        }
      }
    });
    if (ngEnvVariables.length && processVariables.length) {
      this._logger?.warn(
        `Detected both process.env.* and NG_ENV.* variables with selected variant ${variant}. Only the variables matching the current variant will be used.`,
      );
    }
    const variables = (variant === 'process' ? processVariables : ngEnvVariables).sort();
    return { variables, variant };
  }

  private _extractVariable(node: Node, resolveRoot: (n: Node) => Node) {
    if (!isPropertyAccessExpression(node.parent) && !isElementAccessExpression(node.parent)) {
      return undefined;
    }
    const root: Node = resolveRoot(node);
    if (isPropertyAccessExpression(root)) {
      return root.name.getText();
    }
    if (isElementAccessExpression(root) && isStringLiteralLike(root.argumentExpression)) {
      return root.argumentExpression.getText().replace(/['"`]/g, '');
    }

    this._logger?.warn(
      `Unable to resolve variable from ${node.getText()}. Please use direct assignment.`,
    );
    return undefined;
  }
}

function iterateNodes(node: Node, action: (node: Node) => void) {
  action(node);
  forEachChild(node, (n) => iterateNodes(n, action));
}
