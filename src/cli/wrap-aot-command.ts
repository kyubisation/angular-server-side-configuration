import spawn from 'cross-spawn';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { Node } from 'typescript';
import { walk } from '../common';
import { CommandBase } from './command-base';

/**
 * The wrap-aot command to retain angular-server-side-configuration variables through AoT.
 * 
 * @public
 */
export class WrapAotCommand extends CommandBase {
  private readonly _environmentFile: string;
  private readonly _dist: string;
  private _tokenCounter = 0;

  constructor(private _options: {
    ngCommands: string[],
    directory: string,
    environmentFile?: string,
    dist?: string,
    processEnv?: boolean,
    ngEnv?: boolean,
  }) {
    super('Wrap AOT');
    this._environmentFile = _options.environmentFile
      ? resolve(this._options.directory, _options.environmentFile)
      : join(this._options.directory, 'src', 'environments', 'environment.prod.ts');
    this._dist = _options.dist
      ? resolve(this._options.directory, _options.dist)
      : join(this._options.directory, 'dist');
  }

  protected async _execute(): Promise<void> {
    this._validateOptions();
    const fileContent = readFileSync(this._environmentFile, 'utf8');
    const replacements = await this._createReplacements(fileContent);
    if (replacements.length) {
      this._log(`Detected ${replacements.length} usages (Temporarily replacing with tokens):`);
      replacements.forEach(r => this._log(`${r.replace}\n => ${r.token}`));
    }

    this._applyReplacements(fileContent, replacements);
    await this._spawnCommand();
    this._revertReplacements(fileContent, replacements);
  }

  private _validateOptions() {
    if (!this._options.ngCommands.length) {
      throw new Error('No command given to ngssc wrap-aot!');
    } else if (this._options.processEnv && this._options.ngEnv) {
      throw new Error('--process-env and --ng-env cannot be used at the same time!');
    } else if (!existsSync(this._environmentFile)) {
      throw new Error(`Given file does not exist: ${this._environmentFile}`);
    }
  }

  private async _createReplacements(fileContent: string) {
    try {
      const { createSourceFile, ScriptTarget, SyntaxKind } = await this._loadTypescript();
      const fileMetaData = createSourceFile(this._environmentFile, fileContent, ScriptTarget.ESNext, true);
      return this._resolveReplacements(fileMetaData, SyntaxKind)
        .map(replace => ({ replace, token: `ngssc-token-${Date.now()}-${++this._tokenCounter}` }));
    } catch (e) {
      throw new Error(
        'ngssc wrap-aot requires an installation of typescript!'
        + ' This is expected to be available in an angular project.');
    }
  }

  protected async _loadTypescript() {
    const { createSourceFile, ScriptTarget, SyntaxKind } = await import('typescript');
    return { createSourceFile, ScriptTarget, SyntaxKind };
  }

  private _resolveReplacements(node: Node, syntaxKind: { [key: number]: string }): string[] {
    if (this._options.ngEnv) {
      return this._findUsages(node, 'NG_ENV')
        .filter(n => !('importClause' in n.parent.parent.parent))
        .sort((a, b) => b.parent.getText().length - a.parent.getText().length)
        .map(node => this._resolveExpression(node, syntaxKind))
    } else {
      return this._findUsages(node, 'process')
        .sort((a, b) => b.parent.parent.getText().length - a.parent.parent.getText().length)
        .map(node => this._resolveExpression(node.parent, syntaxKind))
    }
  }

  private _findUsages(node: Node, variant: string): Node[] {
    if (node.getText() === variant) {
      return [node];
    } else if (!node.getChildren().length) {
      return [];
    } else {
      return node
        .getChildren()
        .map(c => this._findUsages(c, variant))
        .reduce((current, next) => current.concat(next));
    }
  }

  private _applyReplacements(fileContent: string, replacements: Array<{ replace: string, token: string }>) {
    const tokenizedContent = replacements
      .reduce((current, next) => current.replace(next.replace, `"${next.token}" as any`), fileContent);
    writeFileSync(this._environmentFile, tokenizedContent, 'utf8');
  }

  private _resolveExpression(node: Node, syntaxKind: { [key: number]: string }) {
    const ancestor = node.parent;
    const ancestorParent = ancestor.parent;
    const name = syntaxKind[ancestorParent.kind];
    return name.endsWith('Expression') ? ancestorParent.getText() : ancestor.getText();
  }

  protected async _spawnCommand(): Promise<void> {
    return await new Promise<void>(r => {
      const [ngCommand, ...args] = this._options.ngCommands;
      const command = spawn(ngCommand, args, { stdio: 'inherit' });
      command.on('close', () => r());
      command.on('error', () => r());
    });
  }

  private _revertReplacements(fileContent: string, replacements: Array<{ replace: string, token: string }>) {
    writeFileSync(this._environmentFile, fileContent, 'utf8');
    walk(this._dist, /.js$/g)
      .map(file => ({ file, content: readFileSync(file, 'utf8') }))
      .filter(f => replacements.some(r => f.content.includes(r.token)))
      .map(f => Object.assign(f, {
        content: replacements
          .reduce(
            (current, next) => current
              .replace(new RegExp(`"${next.token}"`, 'g'), next.replace)
              .replace(new RegExp(`"${next.token}`, 'g'), `(${next.replace}) + "`)
              .replace(new RegExp(`${next.token}"`, 'g'), `" + (${next.replace})`)
              .replace(new RegExp(`${next.token}`, 'g'), `" + (${next.replace}) + "`),
            f.content),
      }))
      .forEach(f => writeFileSync(f.file, f.content, 'utf8'));
  }
}
