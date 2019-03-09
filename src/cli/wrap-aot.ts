import spawn from 'cross-spawn';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { Node } from 'typescript';
import { walk } from '../common';
import { CommandBase } from './command-base';

export class WrapAotCommand extends CommandBase {
  private readonly _ngCommand: string[];
  private readonly _directory: string;
  private readonly _environmentFile: string;
  private readonly _dist: string;
  private _tokenCounter = 0;

  constructor(options: {
    ngCommands: string[],
    directory: string,
    environmentFile?: string,
    dist?: string,
  }) {
    super('Wrap AOT');
    this._ngCommand = options.ngCommands;
    this._directory = options.directory;
    this._environmentFile = options.environmentFile
      ? resolve(this._directory, options.environmentFile)
      : join(this._directory, 'src', 'environments', 'environment.prod.ts');
    this._dist = options.dist
      ? resolve(this._directory, options.dist)
      : join(this._directory, 'dist');
  }

  protected async _execute(): Promise<void> {
    this._validateOptions();
    const fileContent = readFileSync(this._environmentFile, 'utf8');
    const replacements = await this._createReplacements(fileContent);
    this._applyReplacements(fileContent, replacements);
    await this._spawnCommand();
    this._revertReplacements(fileContent, replacements);
  }

  private _validateOptions() {
    if (!this._ngCommand.length) {
      throw new Error('No command given to ngssc wrap-aot!');
    } else if (!existsSync(this._environmentFile)) {
      throw new Error(`Given file does not exist: ${this._environmentFile}`);
    }
  }

  private async _createReplacements(fileContent: string) {
    try {
      const { createSourceFile, ScriptTarget, SyntaxKind } = await this._loadTypescript();
      const fileMetaData = createSourceFile(this._environmentFile, fileContent, ScriptTarget.ESNext, true);
      return this._resolveReplacements(fileMetaData)
        .sort((a, b) => b.parent.parent.getText().length - a.parent.parent.getText().length)
        .map(node => this._resolveExpression(node, SyntaxKind))
        .map(replace => ({ replace, token: `"ngssc-token-${Date.now()}-${++this._tokenCounter}"` }));
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

  private _resolveReplacements(node: Node): Node[] {
    if (node.getText() === 'process') {
      return [node];
    } else if (!node.getChildren().length) {
      return [];
    } else {
      return node
        .getChildren()
        .map(c => this._resolveReplacements(c))
        .reduce((current, next) => current.concat(next));
    }
  }

  private _applyReplacements(fileContent: string, replacements: Array<{ replace: string, token: string }>) {
    const tokenizedContent = replacements
      .reduce((current, next) => current.replace(next.replace, `${next.token} as any`), fileContent);
    writeFileSync(this._environmentFile, tokenizedContent, 'utf8');
  }

  private _resolveExpression(node: Node, syntaxKind: { [key: number]: string }) {
    const ancestor = node.parent.parent;
    const ancestorParent = ancestor.parent;
    const name = syntaxKind[ancestorParent.kind];
    return name.endsWith('Expression') ? ancestorParent.getText() : ancestor.getText();
  }

  protected async _spawnCommand(): Promise<void> {
    return await new Promise<void>(r => {
      const [ngCommand, ...args] = this._ngCommand;
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
          .reduce((current, next) => current.replace(new RegExp(next.token, 'g'), next.replace), f.content),
      }))
      .forEach(f => writeFileSync(f.file, f.content, 'utf8'));
  }
}
